import { useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import Biography from "../components/Biography";

const AboutUs = () => {
  // Every route shared the one <title> from index.html; set it per page.
  useEffect(() => {
    document.title = "About Us · Care Medical Institute";
  }, []);

  return (
    <>
      <Hero
        title="About Care Medical Institute"
        imageUrl="/about.png"
        showActions={false}
      />

      <Biography imageUrl="/whoweare.png" />

      <section className="bg-teal-800 px-4 py-14">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Ready to see a specialist?
            </h2>
            <p className="mt-2 text-teal-100">
              Book online and our front desk will confirm your slot.
            </p>
          </div>
          <Link
            to="/appointment"
            className="shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-teal-800
              shadow-sm transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2
              focus-visible:ring-white focus-visible:ring-offset-2
              focus-visible:ring-offset-teal-800"
          >
            Book an appointment
          </Link>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
