import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../context/AppContext";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

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

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm transition " +
  "focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50";

const Register = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  useEffect(() => {
    document.title = "Create an Account · Care Medical Institute";
  }, []);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updateDigits = (field, maxLength) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value.replace(/\D/g, "").slice(0, maxLength),
    }));

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/user/patient/register`,
        form,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
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
    <div className="bg-slate-50 px-4 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Register once to book appointments across all our departments.
            </p>
          </div>

          <form onSubmit={handleRegistration} className="mt-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  className={fieldClass}
                  type="text"
                  autoComplete="given-name"
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
                  autoComplete="family-name"
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
                  autoComplete="email"
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
                  <span className="inline-flex select-none items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-600">
                    +91
                  </span>
                  <input
                    id="phone"
                    className={`${fieldClass} rounded-l-none`}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
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
                  autoComplete="bday"
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
                <label className={labelClass} htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    className={`${fieldClass} pr-11`}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={update("password")}
                    minLength={8}
                    required
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3.5
                      text-slate-400 transition hover:text-slate-600 focus:outline-none
                      focus-visible:ring-2 focus-visible:ring-teal-600/30"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Your details are used only to manage your appointments and medical
              records at Care Medical Institute.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white
                shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2
                focus-visible:ring-teal-600 focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link
              to="/login"
              className="font-semibold text-teal-700 transition hover:text-teal-800"
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
