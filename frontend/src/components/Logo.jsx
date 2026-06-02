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

// Hard-coded rather than a Tailwind class: this same value is duplicated in
// public/favicon.svg, which is a standalone file with no access to the theme.
const ACCENT = "#0D9488";

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
    <rect width="32" height="32" rx="8" fill={ACCENT} />
    <g
      fill="none"
      stroke="#ffffff"
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
