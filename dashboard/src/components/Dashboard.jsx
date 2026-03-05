import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const STATUSES = ["Pending", "Accepted", "Rejected"];

const STATUS_STYLES = {
  Pending: "border-amber-300 bg-amber-50 text-amber-800",
  Accepted: "border-teal-300 bg-teal-50 text-teal-800",
  Rejected: "border-rose-300 bg-rose-50 text-rose-800",
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
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
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
          axios.get(`${API_BASE}/appointment/getall`, {
            withCredentials: true,
          }),
          axios.get(`${API_BASE}/user/doctors`, { withCredentials: true }),
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
      const { data } = await axios.put(
        `${API_BASE}/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
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
    <section className="min-h-screen bg-slate-50 px-4 py-8 md:pl-28">
      <div className="mx-auto w-full max-w-6xl">
        {/* Welcome + stats */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <img
              src="/doc.png"
              alt=""
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Welcome back,</p>
              <h1 className="truncate text-xl font-semibold text-slate-900">
                {adminName || "Admin"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Care Medical Institute
              </p>
            </div>
          </div>

          <StatCard
            label="Total appointments"
            value={loading ? "—" : appointments.length}
            tone="text-slate-900"
          />
          <StatCard
            label="Pending approval"
            value={loading ? "—" : pendingCount}
            tone={pendingCount > 0 ? "text-amber-600" : "text-slate-900"}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatCard
            label="Registered doctors"
            value={doctorCount === null ? "—" : doctorCount}
            tone="text-teal-700"
          />
          <StatCard
            label="Accepted appointments"
            value={
              loading
                ? "—"
                : appointments.filter((a) => a.status === "Accepted").length
            }
            tone="text-teal-700"
          />
        </div>

        {/* Appointments table */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Appointments
            </h2>
          </div>

          {loadError ? (
            <p className="px-6 py-10 text-center text-sm text-rose-700">
              {loadError}
            </p>
          ) : loading ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              Loading appointments…
            </p>
          ) : appointments.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500">
              No appointments booked yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Patient</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Doctor</th>
                    <th className="px-6 py-3 font-semibold">Department</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Visited</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {`${appointment.firstName} ${appointment.lastName}`}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatDate(appointment.appointment_date)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {appointment.doctor
                          ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {appointment.department}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          aria-label={`Status for ${appointment.firstName} ${appointment.lastName}`}
                          className={`rounded-lg border px-2.5 py-1.5 text-sm font-medium transition
                            focus:outline-none focus:ring-2 focus:ring-teal-600/30
                            disabled:opacity-60 ${
                              STATUS_STYLES[appointment.status] ||
                              "border-slate-300 bg-white text-slate-700"
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
                            className="text-xl text-teal-600"
                            title="Visited"
                          />
                        ) : (
                          <AiFillCloseCircle
                            className="text-xl text-slate-400"
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
