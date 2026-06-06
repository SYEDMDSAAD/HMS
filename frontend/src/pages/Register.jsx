import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Input,
  NumericInput,
  PasswordInput,
  PhoneInput,
  Select,
} from "@uc/ui";
import { Context, api } from "@uc/client";

const GENDERS = ["Male", "Female", "Other"];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  aadhaar: "",
  dob: "",
  gender: "",
  password: "",
};

const today = () => new Date().toISOString().split("T")[0];

const Register = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  useEffect(() => {
    document.title = "Create an Account · UC Healthcare";
  }, []);

  // The controls hand back the value, not the event — and the digit-only
  // filtering that used to need a second helper now lives in NumericInput and
  // PhoneInput.
  const update = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/user/patient/register", form, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(data.message);
      setForm(initialForm);
      setIsAuthenticated(true);
      navigateTo("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not create your account. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="bg-ink-50 px-4 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-e1 sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Register once to book appointments across all our departments.
            </p>
          </div>

          <form onSubmit={handleRegistration} className="mt-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="First name"
                autoComplete="given-name"
                placeholder="Ananya"
                value={form.firstName}
                onValueChange={update("firstName")}
                minLength={3}
                required
                disabled={submitting}
              />

              <Input
                label="Last name"
                autoComplete="family-name"
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
                autoComplete="email"
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
                autoComplete="bday"
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

            <p className="mt-6 text-xs text-ink-500">
              Your details are used only to manage your appointments and medical
              records at UC Healthcare.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-lg bg-accent-700 px-6 py-3 text-sm font-semibold text-white
                shadow-e1 transition hover:bg-accent-800 focus:outline-none focus-visible:ring-2
                focus-visible:ring-accent-600 focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-accent-700 transition hover:text-accent-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
