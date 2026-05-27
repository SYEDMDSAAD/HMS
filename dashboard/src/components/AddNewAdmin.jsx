import { useContext, useState } from "react";
import { Context } from "../context/AppContext";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../lib/api";

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

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm transition " +
  "focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50";

const AddNewAdmin = () => {
  const { isAuthenticated } = useContext(Context);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Keep only digits, so a pasted "+91 98765 43210" or "9876-543-210" still
  // arrives at the API in the shape the schema expects.
  const updateDigits = (field, maxLength) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value.replace(/\D/g, "").slice(0, maxLength),
    }));

  const handleAddNewAdmin = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/user/admin/addnew", form, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success(data.message);
      setForm(initialForm);
      navigateTo("/");
    } catch (error) {
      // error.response is undefined when the request never reached the server.
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
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-8 flex flex-col items-center text-center">
            <img src="/logo.png" alt="Care Medical Institute" className="h-14" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
              Add New Admin
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Admins can manage doctors, appointments and patient enquiries.
            </p>
          </header>

          <form onSubmit={handleAddNewAdmin} noValidate={false}>
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

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-lg bg-teal-700 px-6 py-3
                  text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800
                  focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2
                  disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Adding admin…" : "Add new admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddNewAdmin;
