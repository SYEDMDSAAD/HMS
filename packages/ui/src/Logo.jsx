/**
 * UC Healthcare brand mark and lockup.
 *
 * The monogram is drawn as SVG paths, not SVG <text>. <text> resolves against
 * whatever font the viewer happens to have, so the mark would render
 * differently on every platform — fine for body copy, not for a logo.
 *
 * The wordmark beside it is real HTML text: it inherits the app font, stays
 * selectable, and screen readers announce it as text rather than as an image
 * with alt copy. It also inherits `color`, so it works on light and dark
 * surfaces without a second asset.
 *
 * This replaces /logo.png, which was a 4239x2252 PNG (4.8MB) rendered at 40px
 * and also served as the favicon.
 */

// The mark is painted from --color-accent-600, a fixed ramp step rather than a
// semantic token: a logo has to be the same colour in light and dark, and only
// the semantic tokens swap.
//
// The same value is duplicated as a literal in public/favicon.svg, which is a
// standalone file with no access to the theme. packages/theme/tokens.css calls
// that out at the definition, so the two do not drift.

export const LogoMark = ({ className = "h-9 w-9", title }) => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    // Decorative when it sits next to the wordmark; labelled when it stands
    // alone, as it does in the dashboard's collapsed icon rail.
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : "true"}
  >
    {title && <title>{title}</title>}
    <rect width="32" height="32" rx="8" className="fill-accent-600" />
    <g
      fill="none"
      className="stroke-white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* U */}
      <path d="M6 10v6.5a3.5 3.5 0 0 0 7 0V10" />
      {/* C — an open ring, broken toward the right */}
      <path d="M25.18 11.82a4.5 4.5 0 1 0 0 6.36" />
    </g>
  </svg>
);

const SIZES = {
  sm: { mark: "h-7 w-7", text: "text-base" },
  md: { mark: "h-9 w-9", text: "text-lg" },
  lg: { mark: "h-11 w-11", text: "text-xl" },
};

export const Logo = ({ size = "md", className = "" }) => {
  const { mark, text } = SIZES[size] ?? SIZES.md;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`${mark} shrink-0`} />
      {/* No text colour on purpose — inherits from the surface it sits on. */}
      <span className={`${text} whitespace-nowrap font-medium tracking-tight`}>
        <span className="font-bold">UC</span> Healthcare
      </span>
    </span>
  );
};
