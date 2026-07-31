import { useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DoctorSchedule from "./components/DoctorSchedule";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import Sidebar from "./components/Sidebar";
import AddNewAdmin from "./components/AddNewAdmin";
import "./App.css";
import { Button, Toaster } from "@uc/ui";
import { Context, api } from "@uc/client";

const NotFound = () => (
  <section className="flex min-h-screen items-center justify-center px-4 md:pl-28">
    <div className="text-center">
      <p className="text-sm font-semibold text-accent-text">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-fg-subtle">
        That page does not exist in the dashboard.
      </p>
      <Button as={Link} to="/" size="md" className="mt-6">
        Back to dashboard
      </Button>
    </div>
  </section>
);

const App = () => {
  const { isAuthenticated, setIsAuthenticated, user, setUser } =
    useContext(Context);
  // Until /admin/me answers we do not know whether there is a session, and
  // guessing "logged out" bounces a signed-in admin to the login screen on
  // every page refresh.
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Two staff roles share this app and each has its own cookie, so the
    // session check asks both. Sequential rather than Promise.any: an admin
    // should not have a doctor lookup fired at them on every page load, and the
    // common case answers on the first request.
    const fetchUser = async () => {
      for (const path of ["/user/admin/me", "/user/doctor/me"]) {
        try {
          const { data } = await api.get(path);
          setIsAuthenticated(true);
          setUser(data.user);
          setCheckingSession(false);
          return;
        } catch {
          // Not this role — try the next.
        }
      }
      setIsAuthenticated(false);
      setUser({});
      setCheckingSession(false);
    };
    fetchUser();
  }, [isAuthenticated, setIsAuthenticated, setUser]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-accent-solid"
            role="status"
            aria-label="Loading"
          />
          <p className="text-sm text-fg-subtle">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Sidebar />
      <main>
        <Routes>
        {/* One route, two homes. A doctor signing in lands on their schedule;
            an admin lands on the appointments desk. */}
        <Route
          path="/"
          element={user?.role === "Doctor" ? <DoctorSchedule /> : <Dashboard />}
        />
        <Route path="/schedule" element={<DoctorSchedule />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/addnew" element={<AddNewDoctor />} />
        <Route path="/admin/addnew" element={<AddNewAdmin />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/doctors" element={<Doctors />} />
        {/* Legacy path — the sidebar used to link here. */}
        <Route path="/admin/me" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster />
    </Router>
  );
};

export default App;
