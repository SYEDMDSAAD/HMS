import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { MdEventAvailable } from "react-icons/md";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
  SkeletonGroup,
  StatusPill,
  notify,
} from "@uc/ui";
import { Context, api } from "@uc/client";

const today = () => new Date().toISOString().split("T")[0];

const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/**
 * A doctor's own schedule.
 *
 * This closes the gap where a third of the domain model had no interface at
 * all: doctors existed as records an admin created, could not sign in, and
 * could not see who was coming to see them.
 *
 * Scoped to one day rather than showing everything, because that is the
 * question a doctor actually has — "who is coming today" — and a list of every
 * appointment they will ever have answers it worse.
 */
const DoctorSchedule = () => {
  const { isAuthenticated, user } = useContext(Context);

  const [date, setDate] = useState(today);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    document.title = "My Schedule · UC Healthcare";
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data } = await api.get("/appointment/doctor/mine", {
          params: { date },
        });
        if (!cancelled) setAppointments(data.appointments || []);
      } catch (error) {
        if (cancelled) return;
        setAppointments([]);
        setLoadError(
          error.response?.data?.message ||
            "Could not load your schedule. Please refresh."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, date]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleComplete = async (appointment) => {
    setCompletingId(appointment._id);
    try {
      const { data } = await api.patch(
        `/appointment/doctor/${appointment._id}/complete`
      );
      setAppointments((previous) =>
        previous.map((a) => (a._id === appointment._id ? data.appointment : a))
      );
      notify.success(data.message);
    } catch (error) {
      notify.apiError(error, "Could not update that appointment.");
    } finally {
      setCompletingId(null);
    }
  };

  const doctorName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <section className="min-h-screen bg-surface-muted px-4 py-8 md:pl-28">
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader
          level={1}
          className="mb-6"
          eyebrow="My schedule"
          title={doctorName ? `Dr. ${doctorName}` : "My schedule"}
          description={user?.doctorDepartment}
          actions={
            <Input
              label={null}
              type="date"
              aria-label="Schedule date"
              value={date}
              onValueChange={setDate}
            />
          }
        />

        {loadError ? (
          <Alert tone="danger" live>
            {loadError}
          </Alert>
        ) : loading ? (
          <SkeletonGroup label="Loading your schedule…">
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, row) => (
                <Card key={row}>
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="mt-3 h-4 w-1/2" />
                </Card>
              ))}
            </div>
          </SkeletonGroup>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={MdEventAvailable}
            title="Nothing booked for this day"
            description="Appointments patients book with you appear here, in order."
          />
        ) : (
          <ul className="space-y-3">
            {appointments.map((appointment) => (
              <li key={appointment._id}>
                <Card className="sm:flex sm:items-center sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* The time leads: a schedule is read down the clock, not
                          down the patient names. */}
                      <span className="text-base font-semibold tabular-nums text-fg">
                        {formatTime(appointment.startsAt)}
                      </span>
                      <StatusPill status={appointment.status} />
                    </div>
                    <p className="mt-2 text-sm text-fg">
                      {appointment.firstName} {appointment.lastName}
                    </p>
                    <p className="mt-0.5 text-sm text-fg-subtle">
                      {appointment.department}
                      {appointment.hasVisited ? " · returning patient" : ""}
                    </p>
                  </div>

                  {/* Only an accepted appointment can be completed — the server
                      enforces that too, and this keeps the button from being a
                      promise the API then breaks. */}
                  {appointment.status === "Accepted" && (
                    <div className="mt-4 shrink-0 sm:mt-0">
                      <Button
                        size="sm"
                        onClick={() => handleComplete(appointment)}
                        loading={completingId === appointment._id}
                        loadingText="Saving…"
                      >
                        Mark complete
                      </Button>
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default DoctorSchedule;
