import { useContext, useEffect, useState } from "react";
import { Context } from "../context/AppContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { api } from "../lib/api";

const STATUSES = ["Pending", "Accepted", "Rejected"];

const STATUS_STYLES = {
  Pending: "border-warning-300 bg-warning-50 text-warning-800",
  Accepted: "border-accent-300 bg-accent-50 text-accent-800",
  Rejected: "border-danger-300 bg-danger-50 text-danger-800",
};

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

const StatCard = ({ label, value, tone }) => (
  <div className="rounded-2xl border border-line bg-white p-6 shadow-e1">
    <p className="text-sm font-medium text-ink-500">{label}</p>
    <p className={`mt-2 text-4xl font-semibold tracking-tight ${tone}`}>
      {value}
    </p>
  </div>
);

const Dashboard = () => {
  const { isAuthenticated, admin } = useContext(Context);

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
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not update the appointment. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  const adminName = [admin?.firstName, admin?.lastName]
    .filter(Boolean)
    .join(" ");
  const pendingCount = appointments.filter((a) => a.status === "Pending")
    .length;

  return (
    <section className="min-h-screen bg-ink-50 px-4 py-8 md:pl-28">
      <div className="mx-auto w-full max-w-6xl">
        {/* Welcome + stats */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="flex items-center gap-5 rounded-2xl border border-line bg-white p-6 shadow-e1 lg:col-span-1">
            <img
              src="/doc.png"
              alt=""
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-ink-200"
            />
            <div className="min-w-0">
              <p className="text-sm text-ink-500">Welcome back,</p>
              <h1 className="truncate text-xl font-semibold text-ink-900">
                {adminName || "Admin"}
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                UC Healthcare
              </p>
            </div>
          </div>

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

        {/* Appointments table */}
        <div className="mt-8 rounded-2xl border border-line bg-white shadow-e1">
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-lg font-semibold text-ink-900">
              Appointments
            </h2>
          </div>

          {loadError ? (
            <p className="px-6 py-10 text-center text-sm text-danger-700">
              {loadError}
            </p>
          ) : loading ? (
            <p className="px-6 py-10 text-center text-sm text-ink-500">
              Loading appointments…
            </p>
          ) : appointments.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-ink-500">
              No appointments booked yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Patient</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Doctor</th>
                    <th className="px-6 py-3 font-semibold">Department</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Visited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-ink-50">
                      <td className="px-6 py-4 font-medium text-ink-900">
                        {`${appointment.firstName} ${appointment.lastName}`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-ink-600">
                        {formatDate(appointment.appointment_date)}
                      </td>
                      <td className="px-6 py-4 text-ink-600">
                        {appointment.doctor
                          ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-ink-600">
                        {appointment.department}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          aria-label={`Status for ${appointment.firstName} ${appointment.lastName}`}
                          className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium transition
                            focus:outline-none focus:ring-2 focus:ring-accent-600/30
                            disabled:opacity-60 ${
                              STATUS_STYLES[appointment.status] ||
                              "border-line-control bg-white text-ink-700"
                            }`}
                          value={appointment.status}
                          disabled={updatingId === appointment._id}
                          onChange={(e) =>
                            handleUpdateStatus(appointment._id, e.target.value)
                          }
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {appointment.hasVisited ? (
                          <GoCheckCircleFill
                            className="text-xl text-accent-600"
                            title="Visited"
                          />
                        ) : (
                          <AiFillCloseCircle
                            className="text-xl text-ink-400"
                            title="Not visited"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
