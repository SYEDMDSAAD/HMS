import { useContext, useState } from "react";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { AiFillMessage } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaUserDoctor, FaXmark } from "react-icons/fa6";
import { MdAddModerator } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";
import { NavLink, useNavigate } from "react-router-dom";
import { Logo, LogoMark, notify } from "@uc/ui";
import { Context, api } from "@uc/client";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: TiHome, end: true },
  { to: "/doctors", label: "Doctors", icon: FaUserDoctor },
  { to: "/doctor/addnew", label: "Add Doctor", icon: IoPersonAddSharp },
  { to: "/admin/addnew", label: "Add Admin", icon: MdAddModerator },
  { to: "/messages", label: "Messages", icon: AiFillMessage },
];

const railLink = ({ isActive }) =>
  `group relative flex h-12 w-12 items-center justify-center rounded-xl transition
   focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
     isActive
       ? "bg-accent-700 text-white shadow-e1"
       : "text-fg-subtle hover:bg-surface-muted hover:text-accent-text"
   }`;

const panelLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-accent-700 text-white"
      : "text-fg-muted hover:bg-surface-muted hover:text-accent-text"
  }`;

const Sidebar = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigateTo = useNavigate();

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // POST, not GET — a state-changing endpoint reachable by GET can be
      // triggered by any third-party page.
      const { data } = await api.post("/user/admin/logout", {});
      notify.success(data.message);
    } catch (error) {
      notify.apiError(error, "Could not log out. Please try again.");
    } finally {
      // Clear local session either way: if the cookie was already expired the
      // request fails, and leaving the UI "logged in" would trap the user.
      setLoggingOut(false);
      setOpen(false);
      setIsAuthenticated(false);
      navigateTo("/login");
    }
  };

  // Nothing to navigate when signed out — the login screen is standalone.
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Desktop icon rail */}
      <nav
        aria-label="Dashboard navigation"
        className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col items-center gap-2
          border-r border-line bg-surface py-6 md:flex"
      >
        <LogoMark className="mb-4 h-9 w-9" title="UC Healthcare" />

        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={railLink} title={label}>
            <Icon className="text-xl" aria-hidden="true" />
            <span className="sr-only">{label}</span>
            {/* Hover tooltip, since an icon on its own is ambiguous. */}
            <span
              className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap
                rounded-md bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white
                group-hover:block"
            >
              {label}
            </span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Log out"
          className="group relative mt-auto flex h-12 w-12 items-center justify-center rounded-xl
            text-fg-subtle transition hover:bg-danger-50 hover:text-danger-700
            focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500
            disabled:opacity-50"
        >
          <RiLogoutBoxFill className="text-xl" aria-hidden="true" />
          <span className="sr-only">Log out</span>
          <span
            className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap
              rounded-md bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white
              group-hover:block"
          >
            Log out
          </span>
        </button>
      </nav>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-xl
          border border-line bg-surface text-fg-muted shadow-e1 transition
          hover:bg-surface-muted focus:outline-none focus-visible:ring-2
          focus-visible:ring-focus md:hidden"
      >
        <GiHamburgerMenu />
      </button>

      {/* Mobile slide-over */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink-900/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            aria-label="Dashboard navigation"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col
              border-r border-line bg-surface p-4 shadow-e3"
          >
            <div className="mb-6 flex items-center justify-between">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-subtle
                  transition hover:bg-surface-muted focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-focus"
              >
                <FaXmark />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={panelLink}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="text-lg" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium
                text-danger-700 transition hover:bg-danger-50 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-danger-500 disabled:opacity-50"
            >
              <RiLogoutBoxFill className="text-lg" aria-hidden="true" />
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

export default Sidebar;
