import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { MdEventNote } from "react-icons/md";
import {
  Alert,
  Card,
  EmptyState,
  PageHeader,
  Select,
  Skeleton,
  SkeletonGroup,
  StatusPill,
  Table,
  notify,
} from "@uc/ui";
import { Context, api } from "@uc/client";

const STATUSES = ["Pending", "Accepted", "Rejected"];

// appointment_date is stored as a plain "YYYY-MM-DD" string, so parse
// defensively and fall back to showing it raw rather than crashing.
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Flat, not raised. These are supporting figures; the appointments table is
// the thing on this page, and it cannot read as primary if five tiles above it
// float at the same height.
const StatCard = ({ label, value, tone }) => (
  <Card elevation="flat">
    <p className="text-sm font-medium text-fg-subtle">{label}</p>
    <p className={`mt-2 text-4xl font-semibold tracking-tight ${tone}`}>
      {value}
    </p>
  </Card>
);

const Dashboard = () => {
  const { isAuthenticated, user } = useContext(Context);

  const [appointments, setAppointments] = useState([]);
  const [doctorCount, setDoctorCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [appointmentsRes, doctorsRes] = await Promise.all([
          api.get("/appointment/getall"),
          api.get("/user/doctors"),
        ]);
        setAppointments(appointmentsRes.data.appointments || []);
        setDoctorCount((doctorsRes.data.doctors || []).length);
      } catch (error) {
        setAppointments([]);
        // Distinguish "nothing booked yet" from "we could not load anything".
        setLoadError(
          error.response?.data?.message ||
            "Could not load dashboard data. Please refresh."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId);
    try {
      const { data } = await api.put(`/appointment/update/${appointmentId}`, {
        status,
      });
      // Prefer the document the server returned over patching local state by hand.
      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment._id === appointmentId
            ? data.appointment || { ...appointment, status }
            : appointment
        )
      );
      notify.success(data.message);
    } catch (error) {
      notify.apiError(error, "Could not update the appointment. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  const adminName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");
  const pendingCount = appointments.filter((a) => a.status === "Pending")
    .length;

  return (
    <section className="min-h-screen bg-ink-50 px-4 py-8 md:pl-28">
      <div className="mx-auto w-full max-w-6xl">
        {/* Welcome + stats */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card elevation="flat" className="flex items-center gap-5 lg:col-span-1">
            <img
              src="/doc.png"
              alt=""
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-line"
            />
            <PageHeader
              level={1}
              size="sm"
              className="min-w-0"
              eyebrow="Welcome back,"
              title={adminName || "Admin"}
              description="UC Healthcare"
            />
          </Card>

          <StatCard
            label="Total appointments"
            value={loading ? "—" : appointments.length}
            tone="text-ink-900"
          />
          <StatCard
            label="Pending approval"
            value={loading ? "—" : pendingCount}
            tone={pendingCount > 0 ? "text-warning-600" : "text-ink-900"}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatCard
            label="Registered doctors"
            value={doctorCount === null ? "—" : doctorCount}
            tone="text-accent-700"
          />
          <StatCard
            label="Accepted appointments"
            value={
              loading
                ? "—"
                : appointments.filter((a) => a.status === "Accepted").length
            }
            tone="text-accent-700"
          />
        </div>

        {/* Appointments table — the one raised surface on this page */}
        <Card className="mt-8" padded={false}>
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-lg font-semibold text-fg">Appointments</h2>
          </div>

          {loadError ? (
            <div className="p-6">
              <Alert tone="danger" live>
                {loadError}
              </Alert>
            </div>
          ) : loading ? (
            <SkeletonGroup label="Loading appointments…" className="p-6">
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, row) => (
                  <div key={row} className="flex gap-4">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/6" />
                    <Skeleton className="h-5 w-1/5" />
                    <Skeleton className="h-5 w-1/5" />
                    <Skeleton className="h-5 w-1/12" />
                  </div>
                ))}
              </div>
            </SkeletonGroup>
          ) : appointments.length === 0 ? (
            <EmptyState
              icon={MdEventNote}
              className="border-0 shadow-none"
              title="No appointments booked yet"
              description="Bookings made from the patient website land here for you to accept or reject."
            />
          ) : (
            <Table
              caption="Patient appointments"
              rows={appointments}
              columns={[
                {
                  key: "patient",
                  header: "Patient",
                  className: "font-medium text-fg",
                  render: (a) => `${a.firstName} ${a.lastName}`,
                },
                {
                  key: "date",
                  header: "Date",
                  className: "whitespace-nowrap text-fg-muted",
                  render: (a) => formatDate(a.appointment_date),
                },
                {
                  key: "doctor",
                  header: "Doctor",
                  className: "text-fg-muted",
                  render: (a) =>
                    a.doctor
                      ? `Dr. ${a.doctor.firstName} ${a.doctor.lastName}`
                      : "—",
                },
                {
                  key: "department",
                  header: "Department",
                  className: "text-fg-muted",
                  render: (a) => a.department,
                },
                {
                  key: "status",
                  header: "Status",
                  // The pill shows the current state at a glance; the select
                  // beneath it is how you change it. Previously the select was
                  // both, which meant the status was only legible once you had
                  // learned that a coloured dropdown was a status.
                  render: (a) => (
                    <div className="flex flex-col items-start gap-1.5">
                      <StatusPill status={a.status} />
                      <Select
                        label={null}
                        aria-label={`Change status for ${a.firstName} ${a.lastName}`}
                        options={STATUSES}
                        value={a.status}
                        disabled={updatingId === a._id}
                        onValueChange={(status) =>
                          handleUpdateStatus(a._id, status)
                        }
                        className="w-auto px-2.5 py-1 text-xs"
                      />
                    </div>
                  ),
                },
                {
                  key: "visited",
                  header: "Visited",
                  render: (a) =>
                    a.hasVisited ? (
                      <GoCheckCircleFill
                        className="text-xl text-success-600"
                        title="Visited"
                      />
                    ) : (
                      <AiFillCloseCircle
                        className="text-xl text-fg-subtle"
                        title="Not visited"
                      />
                    ),
                },
              ]}
            />
          )}
        </Card>

      </div>
    </section>
  );
};

export default Dashboard;
