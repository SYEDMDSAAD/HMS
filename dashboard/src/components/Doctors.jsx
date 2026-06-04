import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import { Context, api } from "@uc/client";

// 9876543210 -> +91 98765 43210
const formatPhone = (phone) => {
  if (!phone) return "—";
  const digits = String(phone).replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};

const Doctors = () => {
  const { isAuthenticated } = useContext(Context);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data } = await api.get("/user/doctors");
        setDoctors(data.doctors || []);
      } catch (error) {
        setDoctors([]);
        setLoadError(
          error.response?.data?.message ||
            "Could not load doctors. Please refresh."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="min-h-screen bg-ink-50 px-4 py-8 md:pl-28">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Doctors
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {loading
              ? "Loading…"
              : `${doctors.length} ${
                  doctors.length === 1 ? "doctor" : "doctors"
                } registered at UC Healthcare`}
          </p>
        </header>

        {loadError ? (
          <div className="rounded-2xl border border-danger-200 bg-danger-50 px-6 py-10 text-center text-sm text-danger-700">
            {loadError}
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-ink-500">
            Loading doctors…
          </div>
        ) : doctors.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink-900">
              No doctors registered yet
            </p>
            <p className="mt-1 text-sm text-ink-500">
              Add one from the sidebar to make them bookable by patients.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <article
                key={doctor._id}
                className="flex flex-col items-center rounded-2xl border border-line bg-white p-6 text-center shadow-e1 transition hover:shadow-e2"
              >
                <img
                  src={doctor.docAvatar?.url || "/docHolder.jpg"}
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  onError={(e) => {
                    e.currentTarget.src = "/docHolder.jpg";
                  }}
                  className="h-24 w-24 rounded-full object-cover ring-1 ring-ink-200"
                />

                <h2 className="mt-4 text-base font-semibold text-ink-900">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h2>

                <span className="mt-2 inline-flex items-center rounded-full bg-accent-50 px-3 py-1 text-xs font-medium text-accent-800 ring-1 ring-inset ring-accent-200">
                  {doctor.doctorDepartment || "Unassigned"}
                </span>

                <dl className="mt-5 w-full space-y-2.5 text-left text-sm">
                  <div className="flex items-center gap-2.5 text-ink-600">
                    <MdEmail className="shrink-0 text-ink-400" />
                    <dd className="min-w-0 truncate" title={doctor.email}>
                      {doctor.email}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2.5 text-ink-600">
                    <FaPhone className="shrink-0 text-ink-400" />
                    <dd>{formatPhone(doctor.phone)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-ink-100 pt-2.5 text-ink-600">
                    <dt className="text-ink-500">Gender</dt>
                    <dd>{doctor.gender || "—"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Doctors;
