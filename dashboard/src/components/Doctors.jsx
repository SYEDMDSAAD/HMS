import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { MdEmail, MdPersonAddAlt1 } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import {
  Alert,
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
  SkeletonGroup,
} from "@uc/ui";
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
    <section className="min-h-screen bg-surface-muted px-4 py-8 md:pl-28">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader
          level={1}
          className="mb-6"
          title="Doctors"
          description={
            loading
              ? "Loading…"
              : `${doctors.length} ${
                  doctors.length === 1 ? "doctor" : "doctors"
                } registered at UC Healthcare`
          }
        />

        {loadError ? (
          <Alert tone="danger" live>
            {loadError}
          </Alert>
        ) : loading ? (
          <SkeletonGroup label="Loading doctors…">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, card) => (
                <Card key={card} className="flex flex-col items-center">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="mt-4 h-5 w-2/3" />
                  <Skeleton className="mt-2 h-5 w-1/3 rounded-full" />
                  <Skeleton className="mt-5 h-3.5 w-full" />
                  <Skeleton className="mt-2 h-3.5 w-4/5" />
                </Card>
              ))}
            </div>
          </SkeletonGroup>
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={MdPersonAddAlt1}
            title="No doctors registered yet"
            description="Add one from the sidebar to make them bookable by patients."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card
                as="article"
                key={doctor._id}
                interactive
                className="flex flex-col items-center text-center"
              >
                <Avatar
                  name={`${doctor.firstName} ${doctor.lastName}`}
                  src={doctor.docAvatar?.url}
                  size="xl"
                />

                <h2 className="mt-4 text-base font-semibold text-fg">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h2>

                <span className="mt-2 inline-flex items-center rounded-full bg-accent-tint px-3 py-1 text-xs font-medium text-accent-text ring-1 ring-inset ring-accent-600/25">
                  {doctor.doctorDepartment || "Unassigned"}
                </span>

                <dl className="mt-5 w-full space-y-2.5 text-left text-sm">
                  <div className="flex items-center gap-2.5 text-fg-muted">
                    <MdEmail className="shrink-0 text-fg-subtle" />
                    <dd className="min-w-0 truncate" title={doctor.email}>
                      {doctor.email}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2.5 text-fg-muted">
                    <FaPhone className="shrink-0 text-fg-subtle" />
                    <dd>{formatPhone(doctor.phone)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-line pt-2.5 text-fg-muted">
                    <dt className="text-fg-subtle">Gender</dt>
                    <dd>{doctor.gender || "—"}</dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Doctors;
