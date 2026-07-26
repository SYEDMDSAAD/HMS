import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { MdEventBusy } from "react-icons/md";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  StatusPill,
  notify,
} from "@uc/ui";
import { Context, api } from "@uc/client";

const formatWhen = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * A patient's own bookings.
 *
 * This page is the gap the diagnosis opened with: a patient could book an
 * appointment and then never see it again. Everything they had was a toast that
 * disappeared after four seconds.
 */
const MyAppointments = () => {
  const { isAuthenticated } = useContext(Context);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "My Appointments · UC Healthcare";
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data } = await api.get("/appointment/mine");
        setAppointments(data.appointments || []);
      } catch (error) {
        setLoadError(
          error.response?.data?.message ||
            "Could not load your appointments. Please refresh."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleCancel = async () => {
    if (!cancelling || busy) return;
    setBusy(true);
    try {
      const { data } = await api.patch(
        `/appointment/mine/${cancelling._id}/cancel`
      );
      // Prefer the document the server returned over patching by hand.
      setAppointments((previous) =>
        previous.map((a) => (a._id === cancelling._id ? data.appointment : a))
      );
      notify.success(data.message);
      setCancelling(null);
    } catch (error) {
      notify.apiError(error, "Could not cancel that appointment.");
    } finally {
      setBusy(false);
    }
  };

  // Cancelling is only offered where the server would allow it, so the button
  // is not a promise the API then breaks.
  const isCancellable = (appointment) =>
    ["Pending", "Accepted"].includes(appointment.status) &&
    new Date(appointment.startsAt).getTime() > Date.now();

  return (
    <section className="bg-surface-muted px-4 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader
          level={1}
          size="lg"
          className="mb-8"
          title="My appointments"
          description="Every booking on your record, and where each one has got to."
          actions={
            <Button as={Link} to="/appointment" size="md">
              Book an appointment
            </Button>
          }
        />

        {loadError ? (
          <Alert tone="danger" live>
            {loadError}
          </Alert>
        ) : loading ? (
          <SkeletonGroup label="Loading your appointments…">
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, card) => (
                <Card key={card}>
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="mt-3 h-4 w-1/2" />
                </Card>
              ))}
            </div>
          </SkeletonGroup>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={MdEventBusy}
            title="No appointments yet"
            description="When you book a consultation it will appear here, with its status."
            action={
              <Button as={Link} to="/appointment" size="md">
                Book your first appointment
              </Button>
            }
          />
        ) : (
          <ul className="space-y-4">
            {appointments.map((appointment) => (
              <li key={appointment._id}>
                <Card className="sm:flex sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-base font-semibold text-fg">
                        {appointment.department}
                      </h2>
                      <StatusPill status={appointment.status} />
                    </div>
                    <p className="mt-2 text-sm text-fg-muted">
                      {appointment.doctor
                        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                        : "Doctor to be assigned"}
                    </p>
                    <p className="mt-1 text-sm text-fg-subtle">
                      {formatWhen(appointment.startsAt)} IST
                    </p>
                  </div>

                  {isCancellable(appointment) && (
                    <div className="mt-4 shrink-0 sm:mt-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCancelling(appointment)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cancelling frees the slot for someone else, and there is no undo — so
          it asks, rather than firing on a single click of a small button. */}
      <Modal
        open={Boolean(cancelling)}
        onClose={() => !busy && setCancelling(null)}
        title="Cancel this appointment?"
        description={
          cancelling
            ? `${cancelling.department} · ${formatWhen(cancelling.startsAt)}`
            : undefined
        }
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCancelling(null)}
              disabled={busy}
            >
              Keep it
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleCancel}
              loading={busy}
              loadingText="Cancelling…"
            >
              Cancel appointment
            </Button>
          </>
        }
      >
        <p className="text-sm text-fg-muted">
          The time will be released for another patient. You will need to book
          again if you change your mind.
        </p>
      </Modal>
    </section>
  );
};

export default MyAppointments;
