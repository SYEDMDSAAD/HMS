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

import { BookingSteps } from "./BookingSteps.jsx";

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

const STEPS = ["Department", "Doctor", "Time", "Your details", "Confirm"];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  aadhaarLast4: "",
  dob: "",
  gender: "",
  appointmentDate: "",
  startsAt: "",
  department: "",
  doctorId: "",
  address: "",
  hasVisited: false,
};

const today = () => new Date().toISOString().split("T")[0];

// Slots are UTC instants and must be shown in the hospital's zone, not the
// browser's — a patient booking from abroad should see the time they will
// actually be seen at, not that instant translated into their own morning.
const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (value) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

/**
 * Booking, as five steps rather than one wall.
 *
 * The previous version put thirteen fields in a single card and asked for all
 * of them at once, including a department and a doctor that constrain each
 * other. Splitting it is not decoration: each step asks one question, and the
 * answer narrows the next, so a patient is never staring at a doctor list for a
 * department they have not chosen.
 *
 * Steps are checked on the way forward, so a missing field is named before the
 * summary rather than after the final submit.
 */
const AppointmentForm = () => {
  const { isAuthenticated } = useContext(Context);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [doctors, setDoctors] = useState([]);
  const [doctorsError, setDoctorsError] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsConfigured, setSlotsConfigured] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(null);

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
  // either changes.
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

  const availableSlots = useMemo(
    () => slots.filter((slot) => slot.available),
    [slots]
  );

  const selectedDoctor = doctors.find((d) => d._id === form.doctorId);

  const update = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Each of these invalidates everything chosen after it.
  const chooseDepartment = (department) =>
    setForm((prev) => ({ ...prev, department, doctorId: "", startsAt: "" }));
  const chooseDoctor = (doctorId) =>
    setForm((prev) => ({ ...prev, doctorId, startsAt: "" }));
  const chooseDate = (appointmentDate) =>
    setForm((prev) => ({ ...prev, appointmentDate, startsAt: "" }));

  /** What stops a step advancing, or null when it may. */
  const blockedBecause = (index) => {
    if (index === 0 && !form.department) return "Choose a department.";
    if (index === 1 && !form.doctorId) return "Choose a doctor.";
    if (index === 2 && !form.startsAt) return "Choose a consultation time.";
    if (index === 3) {
      const missing = [
        ["firstName", "first name"],
        ["lastName", "last name"],
        ["email", "email"],
        ["phone", "mobile number"],
        ["dob", "date of birth"],
        ["gender", "gender"],
        ["address", "address"],
      ].find(([field]) => !String(form[field] || "").trim());
      if (missing) return `Please add your ${missing[1]}.`;
    }
    return null;
  };

  const goNext = () => {
    const blocked = blockedBecause(step);
    if (blocked) {
      notify.error(blocked);
      return;
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/appointment/post", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        aadhaarLast4: form.aadhaarLast4,
        dob: form.dob,
        gender: form.gender,
        startsAt: form.startsAt,
        department: form.department,
        doctor_firstName: selectedDoctor?.firstName,
        doctor_lastName: selectedDoctor?.lastName,
        hasVisited: form.hasVisited,
        address: form.address,
      });
      notify.success(data.message);
      setBooked(data.appointment);
    } catch (error) {
      // 409 means the slot went while this patient was filling the form. Send
      // them back to the time step with fresh slots rather than leaving them on
      // a summary describing a booking that cannot happen.
      if (error?.response?.status === 409) {
        notify.error(error.response.data.message);
        setForm((prev) => ({ ...prev, startsAt: "" }));
        setStep(2);
      } else {
        notify.apiError(
          error,
          "Could not book your appointment. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (booked) {
    return (
      <section className="bg-canvas px-4 py-16">
        <div className="mx-auto w-full max-w-2xl">
          <Card className="text-center sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-success-700">
              Booked
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-fg">
              We have your appointment
            </h2>
            <p className="mt-3 text-fg-muted">
              {formatDate(form.appointmentDate)} at {formatTime(booked.startsAt)}{" "}
              with Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName},{" "}
              {form.department}.
            </p>
            <p className="mt-3 text-sm text-fg-subtle">
              Our front desk confirms every request personally. You will see the
              status change on your appointments page.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button as={Link} to="/appointments">
                View my appointments
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setBooked(null);
                  setForm(initialForm);
                  setStep(0);
                }}
              >
                Book another
              </Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-canvas px-4 py-16">
      <div className="mx-auto w-full max-w-3xl">
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

        <BookingSteps steps={STEPS} current={step} />

        <Card as="form" onSubmit={handleSubmit} className="sm:p-8">
          {step === 0 && (
            <Select
              label="Which department do you need?"
              placeholder="Select department"
              options={DEPARTMENTS}
              value={form.department}
              onValueChange={chooseDepartment}
              hint="Not sure? Choose General Medicine and we will refer you."
            />
          )}

          {step === 1 && (
            <Select
              label="Which doctor?"
              placeholder={
                departmentDoctors.length === 0
                  ? "No doctors in this department yet"
                  : "Select doctor"
              }
              options={departmentDoctors.map((doctor) => ({
                value: doctor._id,
                label: `Dr. ${doctor.firstName} ${doctor.lastName}`,
              }))}
              value={form.doctorId}
              onValueChange={chooseDoctor}
              hint={`${form.department} · ${departmentDoctors.length} available`}
              disabled={departmentDoctors.length === 0}
            />
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Input
                label="Which day?"
                type="date"
                value={form.appointmentDate}
                onValueChange={chooseDate}
                min={today()}
              />

              <Select
                label="Consultation time"
                placeholder={
                  !form.appointmentDate
                    ? "Choose a day first"
                    : slotsLoading
                    ? "Loading times…"
                    : !slotsConfigured
                    ? "This doctor has no consultation hours set yet"
                    : availableSlots.length === 0
                    ? "No free times on this day"
                    : "Select a time"
                }
                options={availableSlots.map((slot) => ({
                  value: slot.startsAt,
                  label: formatTime(slot.startsAt),
                }))}
                value={form.startsAt}
                onValueChange={update("startsAt")}
                hint={
                  availableSlots.length > 0
                    ? `${availableSlots.length} free · times are IST`
                    : undefined
                }
                disabled={
                  slotsLoading ||
                  !form.appointmentDate ||
                  availableSlots.length === 0
                }
              />
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="First name"
                autoComplete="given-name"
                placeholder="Ananya"
                value={form.firstName}
                onValueChange={update("firstName")}
                minLength={3}
              />
              <Input
                label="Last name"
                autoComplete="family-name"
                placeholder="Sharma"
                value={form.lastName}
                onValueChange={update("lastName")}
                minLength={3}
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="ananya.sharma@example.in"
                value={form.email}
                onValueChange={update("email")}
              />
              <PhoneInput value={form.phone} onValueChange={update("phone")} />
              <Input
                label="Date of birth"
                type="date"
                autoComplete="bday"
                value={form.dob}
                onValueChange={update("dob")}
                max={today()}
              />
              <Select
                label="Gender"
                placeholder="Select gender"
                options={GENDERS}
                value={form.gender}
                onValueChange={update("gender")}
              />
              <NumericInput
                label="Aadhaar"
                optional
                hint="Last 4 digits only, so the front desk can match your card"
                maxLength={4}
                value={form.aadhaarLast4}
                onValueChange={update("aadhaarLast4")}
                pattern="[0-9]{4}"
              />
              <Textarea
                label="Address"
                fieldClassName="sm:col-span-2"
                rows={3}
                placeholder="House / street, area, city, state, PIN code"
                value={form.address}
                onValueChange={update("address")}
              />
              <Checkbox
                className="sm:col-span-2"
                label="I have visited UC Healthcare before"
                checked={form.hasVisited}
                onCheckedChange={(hasVisited) =>
                  setForm((prev) => ({ ...prev, hasVisited }))
                }
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-fg">
                Check these details
              </h2>
              <dl className="mt-5 divide-y divide-line text-sm">
                {[
                  ["Department", form.department],
                  [
                    "Doctor",
                    selectedDoctor
                      ? `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`
                      : "—",
                  ],
                  ["Date", formatDate(form.appointmentDate)],
                  ["Time", `${formatTime(form.startsAt)} IST`],
                  ["Name", `${form.firstName} ${form.lastName}`],
                  ["Email", form.email],
                  ["Mobile", `+91 ${form.phone}`],
                  ["Address", form.address],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-4 py-3">
                    <dt className="w-32 shrink-0 text-fg-subtle">{label}</dt>
                    <dd className="min-w-0 break-words text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || submitting}
            >
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" size="md" onClick={goNext}>
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                size="md"
                loading={submitting}
                loadingText="Booking…"
              >
                Confirm booking
              </Button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AppointmentForm;
