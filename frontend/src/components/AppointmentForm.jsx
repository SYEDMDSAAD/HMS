import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Input,
  notify,
  NumericInput,
  PhoneInput,
  Select,
  Textarea,
} from "@uc/ui";
import { Context, api } from "@uc/client";

// Must stay in step with DEPARTMENTS in backend/models/appointmentSchema.js.
const DEPARTMENTS = [
  "General Medicine",
  "Pediatrics",
  "Orthopedics",
  "Cardiology",
  "Neurology",
  "Oncology",
  "Radiology",
  "Physical Therapy",
  "Dermatology",
  "Gynaecology",
  "Dentistry",
  "Psychiatry",
  "ENT",
];

const GENDERS = ["Male", "Female", "Other"];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  aadhaar: "",
  dob: "",
  gender: "",
  appointmentDate: "",
  // The chosen slot, as the ISO instant the API returns. The date above only
  // narrows which slots to fetch; this is what actually gets booked.
  startsAt: "",
  department: "",
  doctorId: "",
  address: "",
  hasVisited: false,
};

const today = () => new Date().toISOString().split("T")[0];

// Slots arrive as UTC instants and must be shown in the hospital's zone, not
// the browser's — a patient booking from abroad should see the time they will
// actually be seen at, not that instant translated into their own morning.
const formatSlot = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });

const AppointmentForm = () => {
  const { isAuthenticated } = useContext(Context);

  const [form, setForm] = useState(initialForm);
  const [doctors, setDoctors] = useState([]);
  const [doctorsError, setDoctorsError] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsConfigured, setSlotsConfigured] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      // The original had no try/catch at all, so a failed request became an
      // unhandled rejection and the picker stayed silently empty.
      try {
        const { data } = await api.get("/user/doctors");
        setDoctors(data.doctors || []);
      } catch (error) {
        setDoctorsError(
          error.response?.data?.message ||
            "Could not load our doctors right now. Please refresh the page."
        );
      }
    };
    fetchDoctors();
  }, []);

  // Slots depend on both the doctor and the day, so this refetches whenever
  // either changes — and clears the previous pick, which belonged to a
  // different doctor or a different date.
  useEffect(() => {
    if (!form.doctorId || !form.appointmentDate) {
      setSlots([]);
      return undefined;
    }

    let cancelled = false;
    setSlotsLoading(true);

    api
      .get("/appointment/availability", {
        params: { doctorId: form.doctorId, date: form.appointmentDate },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setSlots(data.slots || []);
        setSlotsConfigured(data.configured !== false);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });

    // A slow response for a doctor the patient has already moved away from
    // must not overwrite the slots for the one they are looking at now.
    return () => {
      cancelled = true;
    };
  }, [form.doctorId, form.appointmentDate]);

  const departmentDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.doctorDepartment === form.department),
    [doctors, form.department]
  );

  // The API returns every slot the doctor works with an `available` flag, so
  // that a future step can show taken times greyed out rather than hiding them.
  // Until then only the bookable ones are offered.
  const availableSlots = useMemo(
    () => slots.filter((slot) => slot.available),
    [slots]
  );

  // The controls hand back the value, not the event — and the digit-only
  // filtering that used to need a second helper now lives in NumericInput and
  // PhoneInput.
  const update = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleDepartmentChange = (department) =>
    // Clear the doctor and the slot too — both belonged to another department.
    setForm((prev) => ({ ...prev, department, doctorId: "", startsAt: "" }));

  // Changing the doctor or the day invalidates the chosen time.
  const handleDoctorChange = (doctorId) =>
    setForm((prev) => ({ ...prev, doctorId, startsAt: "" }));

  const handleDateChange = (appointmentDate) =>
    setForm((prev) => ({ ...prev, appointmentDate, startsAt: "" }));

  const handleAppointment = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const doctor = doctors.find((entry) => entry._id === form.doctorId);
    if (!doctor) {
      notify.error("Please select a doctor.");
      return;
    }
    if (!form.startsAt) {
      notify.error("Please choose a consultation time.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(
        "/appointment/post",
        {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          aadhaar: form.aadhaar,
          dob: form.dob,
          gender: form.gender,
          startsAt: form.startsAt,
          department: form.department,
          doctor_firstName: doctor.firstName,
          doctor_lastName: doctor.lastName,
          hasVisited: form.hasVisited,
          address: form.address,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      notify.success(data.message);
      setForm(initialForm);
    } catch (error) {
      notify.apiError(error, "Could not book your appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-canvas px-4 py-16">
      <div className="mx-auto w-full max-w-4xl">
        {!isAuthenticated && (
          <Alert tone="warning" className="mb-6">
            Please{" "}
            <Link to="/login" className="font-semibold underline">
              sign in
            </Link>{" "}
            before booking so we can attach the appointment to your record.
          </Alert>
        )}

        {doctorsError && (
          <Alert tone="danger" live className="mb-6">
            {doctorsError}
          </Alert>
        )}

        <Card as="form" onSubmit={handleAppointment} className="sm:p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="First name"
              placeholder="Ananya"
              value={form.firstName}
              onValueChange={update("firstName")}
              minLength={3}
              required
              disabled={submitting}
            />

            <Input
              label="Last name"
              placeholder="Sharma"
              value={form.lastName}
              onValueChange={update("lastName")}
              minLength={3}
              required
              disabled={submitting}
            />

            <Input
              label="Email"
              type="email"
              placeholder="ananya.sharma@example.in"
              value={form.email}
              onValueChange={update("email")}
              required
              disabled={submitting}
            />

            <PhoneInput
              value={form.phone}
              onValueChange={update("phone")}
              required
              disabled={submitting}
            />

            <NumericInput
              label="Aadhaar number"
              hint="12 digits, as printed on the card"
              maxLength={12}
              value={form.aadhaar}
              onValueChange={update("aadhaar")}
              pattern="[2-9][0-9]{11}"
              title="12-digit Aadhaar number"
              required
              disabled={submitting}
            />

            <Input
              label="Date of birth"
              type="date"
              value={form.dob}
              onValueChange={update("dob")}
              max={today()}
              required
              disabled={submitting}
            />

            <Select
              label="Gender"
              placeholder="Select gender"
              options={GENDERS}
              value={form.gender}
              onValueChange={update("gender")}
              required
              disabled={submitting}
            />

            <Input
              label="Preferred date"
              type="date"
              value={form.appointmentDate}
              onValueChange={handleDateChange}
              min={today()}
              required
              disabled={submitting}
            />

            <Select
              label="Department"
              placeholder="Select department"
              options={DEPARTMENTS}
              value={form.department}
              onValueChange={handleDepartmentChange}
              required
              disabled={submitting}
            />

            <Select
              label="Doctor"
              // The empty option carries the reason the list is empty, which is
              // the only place a patient will look for it.
              placeholder={
                !form.department
                  ? "Select a department first"
                  : departmentDoctors.length === 0
                  ? "No doctors in this department yet"
                  : "Select doctor"
              }
              options={departmentDoctors.map((doctor) => ({
                value: doctor._id,
                label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
              }))}
              value={form.doctorId}
              onValueChange={handleDoctorChange}
              required
              disabled={submitting || !form.department}
            />

            <Select
              label="Consultation time"
              // The placeholder is the only place a patient will look for why
              // the list is empty, so it carries the reason rather than sitting
              // there blank.
              placeholder={
                !form.doctorId || !form.appointmentDate
                  ? "Choose a doctor and date first"
                  : slotsLoading
                  ? "Loading times…"
                  : !slotsConfigured
                  ? "This doctor has no consultation hours set yet"
                  : availableSlots.length === 0
                  ? "No free times on this date"
                  : "Select a time"
              }
              options={availableSlots.map((slot) => ({
                value: slot.startsAt,
                label: formatSlot(slot.startsAt),
              }))}
              value={form.startsAt}
              onValueChange={update("startsAt")}
              hint={
                availableSlots.length > 0
                  ? `${availableSlots.length} free · times are IST`
                  : undefined
              }
              required
              disabled={
                submitting ||
                slotsLoading ||
                availableSlots.length === 0
              }
            />

            <Textarea
              label="Address"
              fieldClassName="sm:col-span-2"
              rows={4}
              placeholder="House / street, area, city, state, PIN code"
              value={form.address}
              onValueChange={update("address")}
              required
              disabled={submitting}
            />
          </div>

          <Checkbox
            className="mt-6"
            label="I have visited UC Healthcare before"
            checked={form.hasVisited}
            onCheckedChange={(hasVisited) =>
              setForm((prev) => ({ ...prev, hasVisited }))
            }
            disabled={submitting}
          />

          <div className="mt-8">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              loading={submitting}
              loadingText="Booking appointment…"
            >
              Get appointment
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AppointmentForm;
