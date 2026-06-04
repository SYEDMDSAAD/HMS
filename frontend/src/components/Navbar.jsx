import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaXmark } from "react-icons/fa6";
import { toast } from "react-toastify";
import { Logo } from "@uc/ui";
import { Context, api } from "@uc/client";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/appointment", label: "Appointment" },
  { to: "/about", label: "About Us" },
];

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-accent-700" : "text-ink-600 hover:text-accent-700"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `rounded-lg px-4 py-3 text-sm font-medium transition ${
    isActive ? "bg-accent-50 text-accent-700" : "text-ink-700 hover:bg-ink-100"
  }`;

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigateTo = useNavigate();

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // POST — the backend route is POST-only so a third-party page cannot
      // force a logout with an <img> tag.
      const { data } = await api.post("/user/patient/logout", {});
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not log out. Please try again."
      );
    } finally {
      // Clear local session either way — if the cookie already expired the
      // request fails, and staying "logged in" would trap the user.
      setLoggingOut(false);
      setOpen(false);
      setIsAuthenticated(false);
      navigateTo("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3"
      >
        <Link to="/" className="shrink-0" aria-label="UC Healthcare home">
          <Logo size="md" />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-line-control px-5 py-2 text-sm font-semibold
                text-ink-700 transition hover:bg-ink-50 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2
                disabled:opacity-60"
            >
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-accent-700 px-5 py-2 text-sm font-semibold text-white
                transition hover:bg-accent-800 focus:outline-none focus-visible:ring-2
                focus-visible:ring-accent-600 focus-visible:ring-offset-2"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700
            transition hover:bg-ink-100 focus:outline-none focus-visible:ring-2
            focus-visible:ring-accent-600 md:hidden"
        >
          {open ? <FaXmark /> : <GiHamburgerMenu />}
        </button>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-line bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={mobileLinkClass}
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-2 rounded-lg border border-line-control px-4 py-3 text-sm font-semibold
                  text-ink-700 transition hover:bg-ink-50 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-accent-600 disabled:opacity-60"
              >
                {loggingOut ? "Logging out…" : "Logout"}
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg bg-accent-700 px-4 py-3 text-center text-sm font-semibold
                  text-white transition hover:bg-accent-800 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-accent-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
