import { useState } from "react";
import { toast } from "react-toastify";
import { Input, PhoneInput, Textarea } from "@uc/ui";
import { api } from "@uc/client";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

const MessageForm = () => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleMessage = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const { data } = await api.post("/message/send", form, {
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
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-700">
            Get in touch
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Send Us a Message
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-600">
            Questions about a department, a report or your visit? Write to us and
            our team will get back to you.
          </p>
        </div>

        <form
          onSubmit={handleMessage}
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

            <Textarea
              label="Message"
              fieldClassName="sm:col-span-2"
              rows={6}
              placeholder="How can we help?"
              // As the field's hint rather than loose text beneath it, so
              // aria-describedby points at it — the 2000 limit used to be
              // visible only to people who could see it.
              hint={
                <span className="block text-right">
                  {form.message.length}/2000
                </span>
              }
              value={form.message}
              onValueChange={update("message")}
              minLength={10}
              maxLength={2000}
              required
              disabled={submitting}
            />
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-accent-700 px-6 py-3 text-sm font-semibold text-white
                shadow-e1 transition hover:bg-accent-800 focus:outline-none focus-visible:ring-2
                focus-visible:ring-accent-600 focus-visible:ring-offset-2
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
