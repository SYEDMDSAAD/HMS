/**
 * The one button.
 *
 * Nine call sites had their own six-line class string, and they had already
 * drifted: some used `focus:ring`, some `focus-visible:ring`, one had no
 * disabled style, and the ring offset was hard-coded to white so it would have
 * cut a white notch out of a dark page.
 *
 * `as` makes it polymorphic — a "Book an appointment" control that navigates is
 * a link, not a button, and should stay one for middle-click, copy-link and
 * screen-reader semantics, while still looking identical.
 */

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold " +
  "transition focus:outline-none focus-visible:ring-2 focus-visible:ring-focus " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS = {
  primary: "bg-accent-solid text-accent-on-solid shadow-e1 hover:bg-accent-solid-hover",
  secondary:
    "border border-line-control bg-surface text-fg shadow-e1 hover:bg-surface-muted",
  // No border and no fill until hovered: for the third-priority action in a
  // group, where a second outlined button would compete with the real one.
  ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
  danger: "bg-danger-600 text-white shadow-e1 hover:bg-danger-700",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

const Spinner = () => (
  <span
    aria-hidden="true"
    className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current
      border-t-transparent opacity-70"
  />
);

export const Button = ({
  as: Component = "button",
  variant = "primary",
  size = "lg",
  loading = false,
  loadingText,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...rest
}) => {
  const isButton = Component === "button";

  return (
    <Component
      // A <button> inside a <form> submits unless told otherwise, and that has
      // bitten this codebase before — see the password toggle.
      {...(isButton ? { type: rest.type || "button" } : null)}
      // aria-busy is what tells a screen reader the control is working. The
      // spinner alone says nothing.
      aria-busy={loading || undefined}
      disabled={isButton ? disabled || loading : undefined}
      className={[
        BASE,
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.lg,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading && <Spinner />}
      {loading && loadingText ? loadingText : children}
    </Component>
  );
};
