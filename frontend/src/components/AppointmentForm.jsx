import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Context } from "../context/AppContext";
import { api } from "../lib/api";

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

const labelClass = "block text-sm font-medium text-ink-700 mb-1.5";
const fieldClass =
  "w-full rounded-lg border border-line-control bg-white px-3.5 py-2.5 text-ink-900 " +
  "placeholder:text-fg-placeholder shadow-e1 transition " +
  "focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 " +
  "disabled:cursor-not-allowed disabled:bg-ink-50";

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

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updateDigits = (field, maxLength) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value.replace(/\D/g, "").slice(0, maxLength),
    }));

  const handleDepartmentChange = (e) =>
    // Clear the doctor too — the previous pick belongs to another department.
    setForm((prev) => ({ ...prev, department: e.target.value, doctorId: "" }));

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
            <div>
              <label className={labelClass} htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                className={fieldClass}
                type="text"
                placeholder="Ananya"
                value={form.firstName}
                onChange={update("firstName")}
                minLength={3}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                className={fieldClass}
                type="text"
                placeholder="Sharma"
                value={form.lastName}
                onChange={update("lastName")}
                minLength={3}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={fieldClass}
                type="email"
                placeholder="ananya.sharma@example.in"
                value={form.email}
                onChange={update("email")}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="phone">
                Mobile number
              </label>
              <div className="flex">
                <span className="inline-flex select-none items-center rounded-l-lg border border-r-0 border-line-control bg-ink-50 px-3 text-sm text-ink-600">
                  +91
                </span>
                <input
                  id="phone"
                  className={`${fieldClass} rounded-l-none`}
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={updateDigits("phone", 10)}
                  pattern="[6-9][0-9]{9}"
                  title="10-digit Indian mobile number starting with 6-9"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="aadhaar">
                Aadhaar number
              </label>
              <input
                id="aadhaar"
                className={fieldClass}
                type="text"
                inputMode="numeric"
                placeholder="12 digits"
                value={form.aadhaar}
                onChange={updateDigits("aadhaar", 12)}
                pattern="[2-9][0-9]{11}"
                title="12-digit Aadhaar number"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="dob">
                Date of birth
              </label>
              <input
                id="dob"
                className={fieldClass}
                type="date"
                value={form.dob}
                onChange={update("dob")}
                max={today()}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                className={fieldClass}
                value={form.gender}
                onChange={update("gender")}
                required
                disabled={submitting}
              >
                <option value="">Select gender</option>
                {GENDERS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="appointmentDate">
                Preferred date
              </label>
              <input
                id="appointmentDate"
                className={fieldClass}
                type="date"
                value={form.appointmentDate}
                onChange={update("appointmentDate")}
                min={today()}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="department">
                Department
              </label>
              <select
                id="department"
                className={fieldClass}
                value={form.department}
                onChange={handleDepartmentChange}
                required
                disabled={submitting}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="doctorId">
                Doctor
              </label>
              <select
                id="doctorId"
                className={fieldClass}
                value={form.doctorId}
                onChange={update("doctorId")}
                required
                disabled={submitting || !form.department}
              >
                <option value="">
                  {!form.department
                    ? "Select a department first"
                    : departmentDoctors.length === 0
                    ? "No doctors in this department yet"
                    : "Select doctor"}
                </option>
                {departmentDoctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                className={fieldClass}
                rows={4}
                placeholder="House / street, area, city, state, PIN code"
                value={form.address}
                onChange={update("address")}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <input
              id="hasVisited"
              type="checkbox"
              className="h-4 w-4 rounded border-line-control text-accent-700 focus:ring-accent-600"
              checked={form.hasVisited}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hasVisited: e.target.checked }))
              }
              disabled={submitting}
            />
            <label htmlFor="hasVisited" className="text-sm text-ink-700">
              I have visited UC Healthcare before
            </label>
          </div>

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
