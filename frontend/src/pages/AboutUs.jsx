import { useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Biography from "../components/Biography";

const AboutUs = () => {
  // Every route shared the one <title> from index.html; set it per page.
  useEffect(() => {
    document.title = "About Us · UC Healthcare";
  }, []);

  return (
    <>
      <Hero
        eyebrow="About us"
        title="A hospital built around the people in it"
        description="Thirteen departments, an emergency room that never closes, and a front desk that answers the phone."
        showActions={false}
        showHighlights={false}
      />

      <Biography />

      {/* The one inverted band on the site. It is the closing call to action,
          and being the only dark surface is what makes it read as one. */}
      <section className="bg-accent-900 px-4 py-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Ready to see a specialist?
            </h2>
            <p className="mt-2 text-accent-100">
              Book online and our front desk will confirm your slot.
            </p>
          </div>
          <Link
            to="/appointment"
            // Not <Button>: on an accent-900 band the button's own focus-ring
            // offset colour would be wrong, and the inverted fill is specific
            // to this one placement.
            className="shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-accent-900
              shadow-e1 transition hover:bg-accent-50 focus:outline-none focus-visible:ring-2
              focus-visible:ring-white focus-visible:ring-offset-2
              focus-visible:ring-offset-accent-900"
          >
            Book an appointment
          </Link>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
