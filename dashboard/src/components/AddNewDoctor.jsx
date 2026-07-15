import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Logo,
  notify,
  NumericInput,
  PasswordInput,
  PhoneInput,
  Select,
} from "@uc/ui";
import { Context, api } from "@uc/client";

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

const AddNewDoctor = () => {
  const { isAuthenticated } = useContext(Context);

  const [form, setForm] = useState(initialForm);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  // The controls hand back the value, not the event — and the digit-only
  // filtering that used to need a second helper now lives in NumericInput and
  // PhoneInput.
  const update = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    // Cancelling the file picker fires change with an empty list.
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      notify.error("Avatar must be a PNG, JPEG or WEBP image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      notify.error("Avatar must be 5MB or smaller.");
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
      notify.error("Please choose a profile photo for the doctor.");
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

      notify.success(data.message);
      setForm(initialForm);
      setAvatar(null);
      setAvatarPreview("");
      navigateTo("/doctors");
    } catch (error) {
      notify.apiError(error, "Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="min-h-screen bg-surface-muted px-4 py-10 md:pl-28">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="sm:p-8">
          <header className="mb-8 flex flex-col items-center text-center">
            <Logo size="lg" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg">
              Register a New Doctor
            </h1>
            <p className="mt-1.5 text-sm text-fg-subtle">
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
                  className="h-40 w-40 rounded-full border-4 border-surface object-cover shadow-e2 ring-1 ring-line"
                />
                <label
                  className="mt-4 cursor-pointer rounded-lg border border-accent-solid px-4 py-2 text-sm
                    font-medium text-accent-text transition hover:bg-accent-tint
                    focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2"
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
                <p className="mt-2 text-center text-xs text-fg-subtle">
                  PNG, JPEG or WEBP · up to 5MB
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Input
                  label="First name"
                  placeholder="Rohan"
                  value={form.firstName}
                  onValueChange={update("firstName")}
                  minLength={3}
                  required
                  disabled={submitting}
                />

                <Input
                  label="Last name"
                  placeholder="Iyer"
                  value={form.lastName}
                  onValueChange={update("lastName")}
                  minLength={3}
                  required
                  disabled={submitting}
                />

                <Input
                  label="Email"
                  fieldClassName="sm:col-span-2"
                  type="email"
                  placeholder="rohan.iyer@example.in"
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
                  max={new Date().toISOString().split("T")[0]}
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

                <Select
                  label="Department"
                  placeholder="Select department"
                  options={DEPARTMENTS}
                  value={form.doctorDepartment}
                  onValueChange={update("doctorDepartment")}
                  required
                  disabled={submitting}
                />

                <PasswordInput
                  hint="At least 8 characters"
                  autoComplete="new-password"
                  value={form.password}
                  onValueChange={update("password")}
                  minLength={8}
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                type="submit"
                className="w-full sm:w-auto"
                loading={submitting}
                loadingText="Registering doctor…"
              >
                Register new doctor
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default AddNewDoctor;
