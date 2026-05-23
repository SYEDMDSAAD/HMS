import { useContext, useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Directory is lowercase "pages" — the old "./Pages/..." specifiers resolved on
// case-insensitive filesystems but failed the build on Linux and in CI.
import Home from "./pages/Home";
import Appointment from "./pages/Appointment";
import AboutUs from "./pages/AboutUs";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { Context } from "./main";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const NotFound = () => {
  useEffect(() => {
    document.title = "Page Not Found · Care Medical Institute";
  }, []);

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold text-teal-700">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-slate-600">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-teal-700 px-6 py-3
            text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800
            focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600
            focus-visible:ring-offset-2"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
};

const App = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  // Until /patient/me answers we do not know whether there is a session.
  // Rendering before then makes the navbar flash "Login" for a signed-in user.
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/user/patient/me`, {
          withCredentials: true,
        });
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-700"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
      <ToastContainer position="top-center" theme="light" />
    </Router>
  );
};

export default App;
