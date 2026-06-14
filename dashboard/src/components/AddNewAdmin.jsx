import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ,
  Input,
  Logo,
  notify,
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

const AddNewAdmin = () => {
  const { isAuthenticated } = useContext(Context);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const navigateTo = useNavigate();

  // The controls hand back the value, not the event. Digit-only filtering —
  // so a pasted "+91 98765 43210" still arrives in the shape the schema
  // expects — moved into NumericInput and PhoneInput.
  const update = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAddNewAdmin = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/user/admin/addnew", form, {
        headers: { "Content-Type": "application/json" },
      });
      notify.success(data.message);
      setForm(initialForm);
      navigateTo("/");
    } catch (error) {
      // error.response is undefined when the request never reached the server.
      notify.apiError(error, "Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="min-h-screen bg-ink-50 px-4 py-10 md:pl-28">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-e1 sm:p-8">
          <header className="mb-8 flex flex-col items-center text-center">
            <Logo size="lg" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink-900">
              Add New Admin
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">
              Admins can manage doctors, appointments and patient enquiries.
            </p>
          </header>

          <form onSubmit={handleAddNewAdmin} noValidate={false}>
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

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center rounded-lg bg-accent-700 px-6 py-3
                  text-sm font-semibold text-white shadow-e1 transition hover:bg-accent-800
                  focus:outline-none focus:ring-2 focus:ring-accent-600 focus:ring-offset-2
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
