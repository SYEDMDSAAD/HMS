import { useContext, useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
// Directory is lowercase "pages" — the old "./Pages/..." specifiers resolved on
// case-insensitive filesystems but failed the build on Linux and in CI.
import Home from "./pages/Home";
import MyAppointments from "./pages/MyAppointments";
import Appointment from "./pages/Appointment";
import AboutUs from "./pages/AboutUs";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { Button, Toaster } from "@uc/ui";
import { Context, api } from "@uc/client";

const NotFound = () => {
  useEffect(() => {
    document.title = "Page Not Found · UC Healthcare";
  }, []);

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold text-accent-text">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">
          Page not found
        </h1>
        <p className="mt-3 text-fg-muted">
          The page you are looking for does not exist or has moved.
        </p>
        <Button as={Link} to="/" size="md" className="mt-6">
        Back to home
      </Button>
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
        const { data } = await api.get("/user/patient/me");
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
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-accent-solid"
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
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
        <Route path="/appointments" element={<MyAppointments />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster />
    </Router>
  );
};

export default App;
