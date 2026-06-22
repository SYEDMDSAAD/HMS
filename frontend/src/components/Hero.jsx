import { Link } from "react-router-dom";
import { FaClock, FaUserDoctor } from "react-icons/fa6";
import { MdLocalHospital } from "react-icons/md";
import { Button } from "@uc/ui";

const HIGHLIGHTS = [
  { icon: FaClock, label: "Emergency care", detail: "Open 24×7, every day" },
  { icon: FaUserDoctor, label: "13 departments", detail: "Consultants on site" },
  { icon: MdLocalHospital, label: "Lab and imaging", detail: "Results in-house" },
];

/**
 * The page-opening block.
 *
 * Typographic, not illustrated. It used to be half filled by a 3D cartoon
 * doctor — the single clearest sign the site came from a template, and one of
 * four unrelated art styles the public pages were carrying between them. With
 * no real photography of the hospital available, type and space do the work;
 * that is a deliberate art direction, not a gap waiting to be filled with more
 * stock.
 *
 * `imageUrl` is the exception the policy allows: one real, full-bleed
 * photograph of the actual hospital, if and when there is one. Pass it and the
 * hero switches to a dark-scrim treatment. Nothing passes it today — do not
 * point it at stock imagery, which would put the site straight back where it
 * started.
 */
const Hero = ({
  eyebrow,
  title,
  description,
  imageUrl,
  showActions = true,
  showHighlights = true,
}) => {
  const onImage = Boolean(imageUrl);

  return (
    <section
      className={`relative isolate overflow-hidden px-4 ${
        onImage ? "bg-ink-950" : "bg-canvas"
      }`}
    >
      {onImage && (
        <>
          <img
            src={imageUrl}
            alt=""
            // Decorative: the headline above already says what this is, and a
            // description of the photograph would only be read out in the way.
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          {/* A scrim, not an opacity fade on the image itself — text contrast
              has to be predictable regardless of what the photo looks like. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950/90 via-ink-950/70 to-ink-950/40"
          />
        </>
      )}

      <div
        className={`mx-auto w-full max-w-3xl py-20 sm:py-24 ${
          onImage ? "text-white" : ""
        }`}
      >
        {eyebrow && (
          <p
            className={`text-sm font-semibold uppercase tracking-wider ${
              onImage ? "text-accent-300" : "text-accent-text"
            }`}
          >
            {eyebrow}
          </p>
        )}

        {/* The measure is capped rather than left to the container: a headline
            running the full width of a 1440px viewport is unreadable, and that
            is what the old two-column layout was accidentally preventing. */}
        <h1
          className={`mt-4 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight
            sm:text-5xl lg:text-6xl ${onImage ? "text-white" : "text-fg"}`}
        >
          {title}
        </h1>

        {description && (
          <p
            className={`mt-6 max-w-xl text-lg leading-relaxed ${
              onImage ? "text-ink-200" : "text-fg-muted"
            }`}
          >
            {description}
          </p>
        )}

        {showActions && (
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button as={Link} to="/appointment">
              Book an appointment
            </Button>
            <Button as={Link} to="/about" variant="secondary">
              About the hospital
            </Button>
          </div>
        )}
      </div>

      {showHighlights && (
        <div
          className={`mx-auto w-full max-w-3xl border-t pb-16 pt-10 ${
            onImage ? "border-white/20" : "border-line"
          }`}
        >
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    onImage
                      ? "bg-white/10 text-accent-300"
                      : "bg-accent-tint text-accent-text"
                  }`}
                >
                  <Icon aria-hidden="true" />
                </span>
                <div>
                  <dt
                    className={`text-sm font-semibold ${
                      onImage ? "text-white" : "text-fg"
                    }`}
                  >
                    {label}
                  </dt>
                  <dd
                    className={`mt-0.5 text-sm ${
                      onImage ? "text-ink-300" : "text-fg-subtle"
                    }`}
                  >
                    {detail}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
};

export default Hero;
