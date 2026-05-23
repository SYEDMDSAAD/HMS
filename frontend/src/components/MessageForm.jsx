import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm transition " +
  "focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50";

const MessageForm = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const updateDigits = (field, maxLength) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value.replace(/\D/g, "").slice(0, maxLength),
    }));

  const handleMessage = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API_BASE}/message/send`, form, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      toast.success(data.message);
      setForm(initialForm);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not send your message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
            Get in touch
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Send Us a Message
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">
            Questions about a department, a report or your visit? Write to us and
            our team will get back to you.
          </p>
        </div>

        <form
          onSubmit={handleMessage}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="msgFirstName">
                First name
              </label>
              <input
                id="msgFirstName"
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
              <label className={labelClass} htmlFor="msgLastName">
                Last name
              </label>
              <input
                id="msgLastName"
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
              <label className={labelClass} htmlFor="msgEmail">
                Email
              </label>
              <input
                id="msgEmail"
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
              <label className={labelClass} htmlFor="msgPhone">
                Mobile number
              </label>
              <div className="flex">
                <span className="inline-flex select-none items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-600">
                  +91
                </span>
                <input
                  id="msgPhone"
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

            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="msgMessage">
                Message
              </label>
              <textarea
                id="msgMessage"
                className={fieldClass}
                rows={6}
                placeholder="How can we help?"
                value={form.message}
                onChange={update("message")}
                minLength={10}
                maxLength={2000}
                required
                disabled={submitting}
              />
              <p className="mt-1.5 text-right text-xs text-slate-500">
                {form.message.length}/2000
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white
                shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2
                focus-visible:ring-teal-600 focus-visible:ring-offset-2
                disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Sending…" : "Send message"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default MessageForm;
