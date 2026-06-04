import { useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import AddNewDoctor from "./components/AddNewDoctor";
import Messages from "./components/Messages";
import Doctors from "./components/Doctors";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import AddNewAdmin from "./components/AddNewAdmin";
import "./App.css";
import { Context, api } from "@uc/client";

const NotFound = () => (
  <section className="flex min-h-screen items-center justify-center px-4 md:pl-28">
    <div className="text-center">
      <p className="text-sm font-semibold text-accent-700">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        That page does not exist in the dashboard.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-accent-700 px-5 py-2.5
          text-sm font-semibold text-white transition hover:bg-accent-800
          focus:outline-none focus:ring-2 focus:ring-accent-600 focus:ring-offset-2"
      >
        Back to dashboard
      </Link>
    </div>
  </section>
);

const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  // Until /admin/me answers we do not know whether there is a session, and
  // guessing "logged out" bounces a signed-in admin to the login screen on
  // every page refresh.
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/user/admin/me");
        setIsAuthenticated(true);
        setUser(data.user);
      } catch {
        setIsAuthenticated(false);
        setUser({});
      } finally {
        setCheckingSession(false);
      }
    };
    fetchUser();
  }, [isAuthenticated, setIsAuthenticated, setUser]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-accent-solid"
            role="status"
            aria-label="Loading"
          />
          <p className="text-sm text-ink-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Sidebar />
      <main>
        <Routes>
        <Route path="/" element={<Dashboard />} />
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
      <ToastContainer position="top-center" theme="light" />
    </Router>
  );
};

export default App;
