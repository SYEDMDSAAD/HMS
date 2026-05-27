import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../context/AppContext";
import { api } from "../lib/api";

// Must stay in step with DEPARTMENTS in backend/models/appointmentSchema.js —
// the schema enum rejects anything not on that list.
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

// Mirrors the backend: allowedFormats in userController + the 5MB
// express-fileupload limit in app.js.
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  aadhaar: "",
  dob: "",
  gender: "",
  password: "",
  doctorDepartment: "",
};

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm transition " +
  "focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50";

const AddNewDoctor = () => {
  const { isAuthenticated } = useContext(Context);

  const [form, setForm] = useState(initialForm);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updateDigits = (field, maxLength) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value.replace(/\D/g, "").slice(0, maxLength),
    }));

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    // Cancelling the file picker fires change with an empty list.
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Avatar must be a PNG, JPEG or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Avatar must be 5MB or smaller.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setAvatar(file);
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewDoctor = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!avatar) {
      toast.error("Please choose a profile photo for the doctor.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value)
      );
      formData.append("docAvatar", avatar);

      const { data } = await api.post("/user/doctor/addnew", formData);

      toast.success(data.message);
      setForm(initialForm);
      setAvatar(null);
      setAvatarPreview("");
      navigateTo("/doctors");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not reach the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-10 md:pl-28">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-8 flex flex-col items-center text-center">
            <img src="/logo.png" alt="Care Medical Institute" className="h-14" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              Register a New Doctor
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Doctors appear in the patient booking form for their department.
            </p>
          </header>

          <form onSubmit={handleAddNewDoctor}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <img
                  src={avatarPreview || "/docHolder.jpg"}
                  alt="Doctor avatar preview"
                  className="h-40 w-40 rounded-full border-4 border-white object-cover shadow-md ring-1 ring-slate-200"
                />
                <label
                  className="mt-4 cursor-pointer rounded-lg border border-teal-700 px-4 py-2 text-sm
                    font-medium text-teal-700 transition hover:bg-teal-50
                    focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2"
                >
                  {avatar ? "Change photo" : "Choose photo"}
                  <input
                    type="file"
                    className="sr-only"
                    accept={ALLOWED_TYPES.join(",")}
                    onChange={handleAvatar}
                    disabled={submitting}
                  />
                </label>
                <p className="mt-2 text-center text-xs text-slate-500">
                  PNG, JPEG or WEBP · up to 5MB
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="firstName">
                    First name
                  </label>
                  <input
                    id="firstName"
                    className={fieldClass}
                    type="text"
                    placeholder="Rohan"
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
                    placeholder="Iyer"
                    value={form.lastName}
                    onChange={update("lastName")}
                    minLength={3}
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    className={fieldClass}
                    type="email"
                    placeholder="rohan.iyer@example.in"
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
                    <span className="inline-flex select-none items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-600">
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
                    max={new Date().toISOString().split("T")[0]}
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
                  <label className={labelClass} htmlFor="doctorDepartment">
                    Department
                  </label>
                  <select
                    id="doctorDepartment"
                    className={fieldClass}
                    value={form.doctorDepartment}
                    onChange={update("doctorDepartment")}
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
                  <label className={labelClass} htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    className={fieldClass}
                    type="password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={update("password")}
                    minLength={8}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-lg bg-teal-700 px-6 py-3
                  text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800
                  focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2
                  disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Registering doctor…" : "Register new doctor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddNewDoctor;
