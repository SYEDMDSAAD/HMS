import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { MdEventNote } from "react-icons/md";
import {
  Alert,
  Avatar,
  Button,
  Card,
  EmptyState,
  Input,
  notify,
  PageHeader,
  Select,
  Skeleton,
  SkeletonGroup,
  StatusPill,
  Table,
} from "@uc/ui";
import { Context, api } from "@uc/client";

const STATUSES = ["Pending", "Accepted", "Rejected", "Cancelled", "Completed"];

const SORTS = [
  { value: "soonest", label: "Soonest first" },
  { value: "latest", label: "Latest first" },
  { value: "newest", label: "Recently booked" },
  { value: "oldest", label: "Booked earliest" },
];

// startsAt is a real instant now, so it carries a time as well as a date, and
// both are shown in the hospital's zone rather than the admin's browser zone —
// a doctor's 09:00 slot must read as 09:00 on the front desk's screen wherever
// that screen happens to be.
//
// Still defensive: appointments migrated from the old bare-date field, or any
// that predate the migration, may have nothing here.
const formatSlot = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  // Query state. `search` is what the box holds; `debouncedSearch` is what the
  // server has been asked for — typing "Ananya" should be one request, not six.
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("soonest");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1); // a new search starts at the beginning, not on page 4
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [appointmentsRes, doctorsRes] = await Promise.all([
          api.get("/appointment/getall", {
            params: {
              page,
              limit: 20,
              sort,
              ...(status ? { status } : {}),
              ...(debouncedSearch ? { search: debouncedSearch } : {}),
            },
          }),
          api.get("/user/doctors"),
        ]);
        if (cancelled) return;
        setAppointments(appointmentsRes.data.appointments || []);
        setPages(appointmentsRes.data.pages || 1);
        setTotal(appointmentsRes.data.total || 0);
        setDoctorCount((doctorsRes.data.doctors || []).length);
      } catch (error) {
        if (cancelled) return;
        setAppointments([]);
        // Distinguish "nothing booked yet" from "we could not load anything".
        setLoadError(
          error.response?.data?.message ||
            "Could not load dashboard data. Please refresh."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    // Typing quickly can leave several requests in flight; only the newest may
    // write, or the table flickers back to an older result set.
    return () => {
      cancelled = true;
    };
  }, [page, sort, status, debouncedSearch]);

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
    <section className="min-h-screen bg-surface-muted px-4 py-8 md:pl-28">
      <div className="mx-auto w-full max-w-6xl">
        {/* Welcome + stats */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card elevation="flat" className="flex items-center gap-5 lg:col-span-1">
            <Avatar name={adminName} size="lg" />
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
            value={loading ? "—" : total}
            tone="text-fg"
          />
          <StatCard
            label="Pending on this page"
            value={loading ? "—" : pendingCount}
            tone={pendingCount > 0 ? "text-warning-600" : "text-fg"}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatCard
            label="Registered doctors"
            value={doctorCount === null ? "—" : doctorCount}
            tone="text-accent-text"
          />
          <StatCard
            label="Accepted on this page"
            value={
              loading
                ? "—"
                : appointments.filter((a) => a.status === "Accepted").length
            }
            tone="text-accent-text"
          />
        </div>

        {/* Appointments table — the one raised surface on this page */}
        <Card className="mt-8" padded={false}>
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-lg font-semibold text-fg">Appointments</h2>
            <p className="mt-1 text-sm text-fg-subtle">
              {loading ? "Loading…" : `${total} matching`}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                label={null}
                type="search"
                placeholder="Search patient, email, phone or doctor"
                value={search}
                onValueChange={setSearch}
                aria-label="Search appointments"
              />
              <Select
                label={null}
                aria-label="Filter by status"
                placeholder="All statuses"
                options={STATUSES}
                value={status}
                onValueChange={(next) => {
                  setStatus(next);
                  setPage(1);
                }}
              />
              <Select
                label={null}
                aria-label="Sort appointments"
                options={SORTS}
                value={sort}
                onValueChange={(next) => {
                  setSort(next);
                  setPage(1);
                }}
              />
            </div>
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
                  header: "Date & time",
                  className: "whitespace-nowrap text-fg-muted",
                  render: (a) => formatSlot(a.startsAt),
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
                        // No width override here on purpose: `w-auto` would
                        // collide with the `w-full` inside controlClass, and
                        // which one wins is decided by Tailwind's output order,
                        // not by the order they are written.
                        className="px-2.5 py-1 text-xs"
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

          {!loading && !loadError && pages > 1 && (
            <div className="flex items-center justify-between gap-4 border-t border-line px-6 py-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              {/* aria-live, so a screen reader hears the page change — the
                  table contents updating below is silent otherwise. */}
              <p aria-live="polite" className="text-sm text-fg-subtle">
                Page {page} of {pages}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((current) => Math.min(pages, current + 1))}
                disabled={page >= pages}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};

export default Dashboard;
