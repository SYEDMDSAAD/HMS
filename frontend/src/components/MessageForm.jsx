import { useState } from "react";
import {
  Button,
  Card,
  Input,
  notify,
  PageHeader,
  PhoneInput,
  Textarea,
} from "@uc/ui";
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
      notify.success(data.message);
      setForm(initialForm);
    } catch (error) {
      notify.apiError(error, "Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader
          className="mb-8"
          align="center"
          size="lg"
          eyebrow="Get in touch"
          title="Send Us a Message"
          description="Questions about a department, a report or your visit? Write to us and our team will get back to you."
        />

        <Card as="form" onSubmit={handleMessage} className="sm:p-8">
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
            <Button
              type="submit"
              className="w-full sm:w-auto"
              loading={submitting}
              loadingText="Sending…"
            >
              Send message
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MessageForm;
