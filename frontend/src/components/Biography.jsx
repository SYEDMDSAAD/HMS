import { PageHeader } from "@uc/ui";

// Placeholder figures — replace with the hospital's real numbers before launch.
const STATS = [
  { value: "2004", label: "Serving since" },
  { value: "13", label: "Specialities" },
  { value: "50+", label: "Doctors" },
  { value: "24×7", label: "Emergency care" },
];

/**
 * The "who we are" section.
 *
 * The image is gone. It was a 3D illustration of a man sitting on a suitcase
 * beside two chat bubbles — nothing to do with a hospital, in a yellow-and-blue
 * palette that fought the accent, and captioned "The care team at UC
 * Healthcare", which was not true of it.
 *
 * The prose is the substance here, so the layout now gives it a readable
 * measure and lets the stats band carry the visual weight instead.
 */
const Biography = () => (
  <section className="bg-canvas px-4 py-16 sm:py-20">
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <PageHeader
          size="lg"
          eyebrow="Who we are"
          title="Compassionate care, close to home"
        />

        {/* max-w-prose rather than the column width: 45–75 characters is where
            body copy stays comfortable, and a 1440px column is well past it. */}
        <div className="max-w-prose space-y-4 text-fg-muted">
          <p>
            UC Healthcare is a multi-speciality hospital built around a simple
            idea: good healthcare should be thorough, affordable and easy to
            reach. From routine check-ups to complex procedures, our teams work
            together so that patients and their families are never left guessing
            about what comes next.
          </p>
          <p>
            Our consultants practise across thirteen departments — including
            cardiology, orthopaedics, paediatrics, gynaecology and general
            medicine — supported by an in-house diagnostics lab, imaging, and an
            emergency department that never closes.
          </p>
          <p>
            Appointments can be booked online in under a minute, and our front
            desk confirms every request personally. We also help patients with
            insurance paperwork and cashless claims, so treatment is never
            delayed by formalities.
          </p>
        </div>
      </div>

      <dl className="mt-14 grid grid-cols-2 gap-8 border-t border-line pt-10 sm:grid-cols-4">
        {STATS.map(({ value, label }) => (
          <div key={label}>
            <dt className="text-3xl font-semibold tracking-tight text-accent-text sm:text-4xl">
              {value}
            </dt>
            <dd className="mt-1.5 text-sm text-fg-subtle">{label}</dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default Biography;
