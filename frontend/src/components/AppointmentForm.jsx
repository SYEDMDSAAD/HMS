import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  Checkbox,
  Input,
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
  department: "",
  doctorId: "",
  address: "",
  hasVisited: false,
};

const today = () => new Date().toISOString().split("T")[0];

const AppointmentForm = () => {
  const { isAuthenticated } = useContext(Context);

  const [form, setForm] = useState(initialForm);
  const [doctors, setDoctors] = useState([]);
  const [doctorsError, setDoctorsError] = useState("");
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

  const departmentDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.doctorDepartment === form.department),
    [doctors, form.department]
  );

  // The controls hand back the value, not the event — and the digit-only
  // filtering that used to need a second helper now lives in NumericInput and
  // PhoneInput.
  const update = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleDepartmentChange = (department) =>
    // Clear the doctor too — the previous pick belongs to another department.
    setForm((prev) => ({ ...prev, department, doctorId: "" }));

  const handleAppointment = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const doctor = doctors.find((entry) => entry._id === form.doctorId);
    if (!doctor) {
      toast.error("Please select a doctor.");
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
          appointment_date: form.appointmentDate,
          department: form.department,
          doctor_firstName: doctor.firstName,
          doctor_lastName: doctor.lastName,
          hasVisited: form.hasVisited,
          address: form.address,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      toast.success(data.message);
      setForm(initialForm);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not book your appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-ink-50 px-4 py-16">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink-900">
            Book an Appointment
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-600">
            Choose a department and doctor, and our front desk will confirm your
            slot shortly.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="mb-6 rounded-xl border border-warning-200 bg-warning-50 px-5 py-4 text-sm text-warning-900">
            Please{" "}
            <Link to="/login" className="font-semibold underline">
              sign in
            </Link>{" "}
            before booking so we can attach the appointment to your record.
          </div>
        )}

        {doctorsError && (
          <div className="mb-6 rounded-xl border border-danger-200 bg-danger-50 px-5 py-4 text-sm text-danger-800">
            {doctorsError}
          </div>
        )}

        <form
          onSubmit={handleAppointment}
          className="rounded-2xl border border-line bg-white p-6 shadow-e1 sm:p-8"
        >
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
              onValueChange={update("appointmentDate")}
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
              onValueChange={update("doctorId")}
              required
              disabled={submitting || !form.department}
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
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-accent-700 px-6 py-3 text-sm font-semibold text-white
                shadow-e1 transition hover:bg-accent-800 focus:outline-none focus:ring-2
                focus:ring-accent-600 focus:ring-offset-2 disabled:cursor-not-allowed
                disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Booking appointment…" : "Get appointment"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AppointmentForm;
