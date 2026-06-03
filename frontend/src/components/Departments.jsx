import { Link } from "react-router-dom";

// Order and names match DEPARTMENTS in backend/models/appointmentSchema.js.
// imageUrl is null where no artwork exists yet — those cards fall back to a
// lettered tile rather than a broken image.
const DEPARTMENTS = [
  {
    name: "General Medicine",
    description: "Everyday illnesses, check-ups and referrals.",
    imageUrl: null,
  },
  {
    name: "Pediatrics",
    description: "Newborn, child and adolescent health.",
    imageUrl: "/departments/pedia.jpg",
  },
  {
    name: "Orthopedics",
    description: "Bones, joints, fractures and sports injuries.",
    imageUrl: "/departments/ortho.jpg",
  },
  {
    name: "Cardiology",
    description: "Heart and vascular care.",
    imageUrl: "/departments/cardio.jpg",
  },
  {
    name: "Neurology",
    description: "Brain, spine and nervous system.",
    imageUrl: "/departments/neuro.jpg",
  },
  {
    name: "Oncology",
    description: "Cancer diagnosis and treatment.",
    imageUrl: "/departments/onco.jpg",
  },
  {
    name: "Radiology",
    description: "X-ray, ultrasound, CT and MRI imaging.",
    imageUrl: "/departments/radio.jpg",
  },
  {
    name: "Physical Therapy",
    description: "Rehabilitation and mobility recovery.",
    imageUrl: "/departments/therapy.jpg",
  },
  {
    name: "Dermatology",
    description: "Skin, hair and nail conditions.",
    imageUrl: "/departments/derma.jpg",
  },
  {
    name: "Gynaecology",
    description: "Women's health, pregnancy and maternity.",
    imageUrl: null,
  },
  {
    name: "Dentistry",
    description: "Dental check-ups, fillings and oral surgery.",
    imageUrl: null,
  },
  {
    name: "Psychiatry",
    description: "Mental health assessment and counselling.",
    imageUrl: null,
  },
  {
    name: "ENT",
    description: "Ear, nose, throat and hearing care.",
    imageUrl: "/departments/ent.jpg",
  },
];

const Departments = () => {
  return (
    <section className="bg-ink-50 px-4 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-700">
            Our departments
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Thirteen specialities under one roof
          </h2>
          <p className="mt-4 text-ink-600">
            Book a consultation with any of our departments and our front desk
            will confirm your slot.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map(({ name, description, imageUrl }) => (
            <li key={name}>
              <Link
                to="/appointment"
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line
                  bg-white shadow-e1 transition hover:-translate-y-0.5 hover:shadow-e2
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600
                  focus-visible:ring-offset-2"
              >
                <div className="aspect-[16/10] overflow-hidden bg-accent-50">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`${name} department`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center bg-gradient-to-br
                        from-accent-600 to-accent-800"
                      aria-hidden="true"
                    >
                      <span className="text-4xl font-semibold text-white/90">
                        {name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-ink-900 group-hover:text-accent-700">
                    {name}
                  </h3>
                  <p className="mt-1.5 text-sm text-ink-600">{description}</p>
                  <span className="mt-4 text-sm font-medium text-accent-700">
                    Book appointment →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Departments;
