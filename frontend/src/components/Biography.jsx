import React from "react";

// Placeholder figures — replace with the hospital's real numbers before launch.
const STATS = [
  { value: "2004", label: "Serving since" },
  { value: "13", label: "Specialities" },
  { value: "50+", label: "Doctors" },
  { value: "24×7", label: "Emergency care" },
];

const Biography = ({ imageUrl }) => {
  return (
    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <img
            src={imageUrl}
            alt="The care team at Care Medical Institute"
            loading="lazy"
            className="w-full rounded-2xl object-cover shadow-sm ring-1 ring-slate-200"
          />
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-700">
            Who we are
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Compassionate care, close to home
          </h2>

          <div className="mt-6 space-y-4 text-slate-600">
            <p>
              Care Medical Institute is a multi-speciality hospital built around
              a simple idea: good healthcare should be thorough, affordable and
              easy to reach. From routine check-ups to complex procedures, our
              teams work together so that patients and their families are never
              left guessing about what comes next.
            </p>
            <p>
              Our consultants practise across thirteen departments — including
              cardiology, orthopaedics, paediatrics, gynaecology and general
              medicine — supported by an in-house diagnostics lab, imaging, and
              an emergency department that never closes.
            </p>
            <p>
              Appointments can be booked online in under a minute, and our front
              desk confirms every request personally. We also help patients with
              insurance paperwork and cashless claims, so treatment is never
              delayed by formalities.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-200 pt-8 sm:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <dt className="text-2xl font-semibold text-teal-700">
                  {value}
                </dt>
                <dd className="mt-1 text-sm text-slate-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Biography;
