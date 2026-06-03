import { Link } from "react-router-dom";
import { FaClock, FaUserDoctor } from "react-icons/fa6";
import { MdLocalHospital } from "react-icons/md";

const HIGHLIGHTS = [
  { icon: FaClock, label: "Emergency care, 24×7" },
  { icon: FaUserDoctor, label: "Consultants across 13 departments" },
  { icon: MdLocalHospital, label: "In-house lab and imaging" },
];

const Hero = ({ title, imageUrl, showActions = true }) => {
  return (
    <section className="bg-white px-4 pb-14 pt-12 sm:pt-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-ink-600">
            UC Healthcare brings specialists, diagnostics and emergency
            services together in one place. Book a consultation online and our
            front desk will confirm your slot — no queueing, no paperwork before
            you arrive.
          </p>

          {showActions && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/appointment"
                className="inline-flex items-center justify-center rounded-lg bg-accent-700 px-6 py-3
                  text-sm font-semibold text-white shadow-e1 transition hover:bg-accent-800
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600
                  focus-visible:ring-offset-2"
              >
                Book an appointment
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-lg border border-line-control
                  bg-white px-6 py-3 text-sm font-semibold text-ink-700 shadow-e1 transition
                  hover:bg-ink-50 focus:outline-none focus-visible:ring-2
                  focus-visible:ring-accent-600 focus-visible:ring-offset-2"
              >
                About the hospital
              </Link>
            </div>
          )}

          <ul className="mt-10 space-y-3 border-t border-line pt-8">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-ink-700">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-700">
                  <Icon aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <img
            src={imageUrl}
            alt=""
            className="w-full rounded-2xl object-cover shadow-e1 ring-1 ring-ink-200"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
