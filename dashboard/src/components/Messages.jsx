import { useContext, useEffect, useState } from "react";
import { Context } from "../context/AppContext";
import { Navigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import { api } from "../lib/api";

// 9876543210 -> +91 98765 43210
const formatPhone = (phone) => {
  if (!phone) return "—";
  const digits = String(phone).replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

// Pinned to IST so the timestamp reads the same regardless of where the
// server or the admin's machine is set.
const formatReceived = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
};

const Messages = () => {
  const { isAuthenticated } = useContext(Context);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data } = await api.get("/message/getall");
        setMessages(data.messages || []);
      } catch (error) {
        setMessages([]);
        setLoadError(
          error.response?.data?.message ||
            "Could not load messages. Please refresh."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="min-h-screen bg-ink-50 px-4 py-8 md:pl-28">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Patient Enquiries
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {loading
              ? "Loading…"
              : `${messages.length} ${
                  messages.length === 1 ? "message" : "messages"
                } from the website contact form`}
          </p>
        </header>

        {loadError ? (
          <div className="rounded-2xl border border-danger-200 bg-danger-50 px-6 py-10 text-center text-sm text-danger-700">
            {loadError}
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-ink-500">
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink-900">No messages yet</p>
            <p className="mt-1 text-sm text-ink-500">
              Enquiries sent from the website contact form will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {messages.map((message) => {
              const received = formatReceived(message.createdAt);
              return (
                <article
                  key={message._id}
                  className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-e1 transition hover:shadow-e2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-base font-semibold text-ink-900">
                      {message.firstName} {message.lastName}
                    </h2>
                    {received && (
                      <time className="shrink-0 text-xs text-ink-400">
                        {received}
                      </time>
                    )}
                  </div>

                  <p className="mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-ink-700">
                    {message.message}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-ink-100 pt-4 text-sm">
                    <a
                      href={`mailto:${message.email}`}
                      className="inline-flex min-w-0 items-center gap-2 text-ink-600 transition hover:text-accent-700"
                    >
                      <MdEmail className="shrink-0 text-ink-400" />
                      <span className="truncate">{message.email}</span>
                    </a>
                    <a
                      href={`tel:+91${String(message.phone || "").slice(-10)}`}
                      className="inline-flex items-center gap-2 text-ink-600 transition hover:text-accent-700"
                    >
                      <FaPhone className="shrink-0 text-ink-400" />
                      {formatPhone(message.phone)}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Messages;
