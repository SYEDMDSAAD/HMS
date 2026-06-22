import { Link } from "react-router-dom";
import { Card, PageHeader } from "@uc/ui";

/**
 * The department index.
 *
 * Typographic, with no artwork at all. The grid previously ran three visual
 * languages at once — 3D-rendered organs on bokeh backgrounds, other renders in
 * a different style, and flat teal tiles holding a single letter where no image
 * existed. Mixed-source imagery is the clearest tell of a template, and the
 * lettered fallbacks made the inconsistency structural: four of the thirteen
 * could never match the rest.
 *
 * What a patient actually needs from this grid is to find their speciality and
 * click it. Type does that better than a rendered heart does, it treats all
 * thirteen identically, and it removed 3.6MB of images from the page.
 *
 * Order and names match DEPARTMENTS in backend/models/appointmentSchema.js.
 */
const DEPARTMENTS = [
  { name: "General Medicine", description: "Everyday illnesses, check-ups and referrals." },
  { name: "Pediatrics", description: "Newborn, child and adolescent health." },
  { name: "Orthopedics", description: "Bones, joints, fractures and sports injuries." },
  { name: "Cardiology", description: "Heart and vascular care." },
  { name: "Neurology", description: "Brain, spine and nervous system." },
  { name: "Oncology", description: "Cancer diagnosis and treatment." },
  { name: "Radiology", description: "X-ray, ultrasound, CT and MRI imaging." },
  { name: "Physical Therapy", description: "Rehabilitation and mobility recovery." },
  { name: "Dermatology", description: "Skin, hair and nail conditions." },
  { name: "Gynaecology", description: "Women's health, pregnancy and maternity." },
  { name: "Dentistry", description: "Dental check-ups, fillings and oral surgery." },
  { name: "Psychiatry", description: "Mental health assessment and counselling." },
  { name: "ENT", description: "Ear, nose, throat and hearing care." },
];

const Departments = () => (
  <section className="bg-surface-muted px-4 py-16 sm:py-20">
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        className="mb-10 max-w-2xl"
        size="lg"
        eyebrow="Our departments"
        title="Thirteen specialities under one roof"
        description="Book a consultation with any of our departments and our front desk will confirm your slot."
      />

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map(({ name, description }, index) => (
          <li key={name}>
            <Card
              as={Link}
              to="/appointment"
              interactive
              className="group flex h-full flex-col focus:outline-none
                focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2
                focus-visible:ring-offset-canvas"
            >
              {/* The index is the only ornament, and it is aria-hidden — it
                  numbers the grid for the eye, it does not name anything. */}
              <span
                aria-hidden="true"
                className="text-xs font-semibold tabular-nums text-fg-subtle"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="mt-3 text-lg font-semibold tracking-tight text-fg transition group-hover:text-accent-text">
                {name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">
                {description}
              </p>

              <span className="mt-5 text-sm font-medium text-accent-text">
                Book appointment{" "}
                <span aria-hidden="true" className="inline-block transition group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Departments;
