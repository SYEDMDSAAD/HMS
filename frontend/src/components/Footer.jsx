import React from "react";
import { Link } from "react-router-dom";
import { FaLocationDot, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

// PLACEHOLDER CONTACT DETAILS — replace all of these with the hospital's real
// address, phone numbers and email before this goes live.
const CONTACT = {
  phone: "+91 40 4567 8900",
  emergency: "+91 40 4567 8911",
  email: "info@caremedical.in",
  address: [
    "Plot 42, Road No. 12",
    "Banjara Hills, Hyderabad",
    "Telangana 500034",
  ],
};

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/appointment", label: "Book Appointment" },
  { to: "/about", label: "About Us" },
];

const OPD_HOURS = [
  { day: "Monday – Friday", time: "9:00 AM – 8:00 PM" },
  { day: "Saturday", time: "9:00 AM – 5:00 PM" },
  { day: "Sunday", time: "10:00 AM – 1:00 PM" },
];

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img
              src="/logo.png"
              alt="Care Medical Institute"
              className="h-12"
            />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              A multi-speciality hospital offering thirteen departments,
              in-house diagnostics and round-the-clock emergency care.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Quick Links
            </h2>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-slate-600 transition hover:text-teal-700"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* OPD hours */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              OPD Hours
            </h2>
            <ul className="mt-4 space-y-2.5">
              {OPD_HOURS.map(({ day, time }) => (
                <li key={day} className="text-sm">
                  <span className="block text-slate-900">{day}</span>
                  <span className="text-slate-600">{time}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800 ring-1 ring-inset ring-teal-200">
              Emergency open 24×7
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <FaPhone
                  className="mt-1 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <span>
                  <a
                    href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                    className="text-slate-600 transition hover:text-teal-700"
                  >
                    {CONTACT.phone}
                  </a>
                  <span className="block text-slate-500">
                    Emergency:{" "}
                    <a
                      href={`tel:${CONTACT.emergency.replace(/\s/g, "")}`}
                      className="transition hover:text-teal-700"
                    >
                      {CONTACT.emergency}
                    </a>
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MdEmail
                  className="mt-1 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="break-all text-slate-600 transition hover:text-teal-700"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <FaLocationDot
                  className="mt-1 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <address className="not-italic text-slate-600">
                  {CONTACT.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Care Medical Institute. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
