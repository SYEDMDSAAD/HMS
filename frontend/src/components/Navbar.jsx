import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaXmark } from "react-icons/fa6";
import { Button, Logo, notify } from "@uc/ui";
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
      notify.success(data.message);
    } catch (error) {
      notify.apiError(error, "Could not log out. Please try again.");
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
            <Button
              variant="secondary"
              size="md"
              onClick={handleLogout}
              loading={loggingOut}
              loadingText="Logging out…"
            >
              Logout
            </Button>
          ) : (
            // A control that navigates stays a link, so middle-click and
            // "copy link address" keep working. Button only lends it the look.
            <Button as={Link} to="/login" size="md">
              Login
            </Button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-fg-muted
            transition hover:bg-surface-muted focus:outline-none focus-visible:ring-2
            focus-visible:ring-focus md:hidden"
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
              <Button
                variant="secondary"
                className="mt-2"
                onClick={handleLogout}
                loading={loggingOut}
                loadingText="Logging out…"
              >
                Logout
              </Button>
            ) : (
              <Button
                as={Link}
                to="/login"
                className="mt-2"
                onClick={() => setOpen(false)}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
