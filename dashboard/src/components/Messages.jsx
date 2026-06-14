import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { MdEmail, MdMarkEmailUnread } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import {
  Alert,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  SkeletonText,
} from "@uc/ui";
import { Context, api } from "@uc/client";

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
        <PageHeader
          level={1}
          className="mb-6"
          title="Patient Enquiries"
          description={
            loading
              ? "Loading…"
              : `${messages.length} ${
                  messages.length === 1 ? "message" : "messages"
                } from the website contact form`
          }
        />

        {loadError ? (
          <Alert tone="danger" live>
            {loadError}
          </Alert>
        ) : loading ? (
          <SkeletonGroup label="Loading messages…">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {Array.from({ length: 4 }, (_, card) => (
                <Card key={card}>
                  <Skeleton className="h-5 w-1/3" />
                  <SkeletonText className="mt-4" lines={3} />
                </Card>
              ))}
            </div>
          </SkeletonGroup>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MdMarkEmailUnread}
            title="No messages yet"
            description="Enquiries sent from the website contact form will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {messages.map((message) => {
              const received = formatReceived(message.createdAt);
              return (
                <Card as="article" key={message._id} className="flex flex-col">
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
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Messages;
