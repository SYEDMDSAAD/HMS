import React, { useContext, useEffect, useState } from "react";
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
import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./components/Sidebar";
import AddNewAdmin from "./components/AddNewAdmin";
import "./App.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const NotFound = () => (
  <section className="flex min-h-screen items-center justify-center px-4 md:pl-28">
    <div className="text-center">
      <p className="text-sm font-semibold text-teal-700">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        That page does not exist in the dashboard.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-teal-700 px-5 py-2.5
          text-sm font-semibold text-white transition hover:bg-teal-800
          focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
      >
        Back to dashboard
      </Link>
    </div>
  </section>
);

const App = () => {
  const { isAuthenticated, setIsAuthenticated, setAdmin } = useContext(Context);
  // Until /admin/me answers we do not know whether there is a session, and
  // guessing "logged out" bounces a signed-in admin to the login screen on
  // every page refresh.
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/user/admin/me`, {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setAdmin(data.user);
      } catch {
        setIsAuthenticated(false);
        setAdmin({});
      } finally {
        setCheckingSession(false);
      }
    };
    fetchUser();
  }, [isAuthenticated, setIsAuthenticated, setAdmin]);

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700"
            role="status"
            aria-label="Loading"
          />
          <p className="text-sm text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Sidebar />
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
      <ToastContainer position="top-center" theme="light" />
    </Router>
  );
};

export default App;
