/* The one description of what a form control looks like.
 *
 * This string used to exist as a `fieldClass` constant in seven component
 * files. They were identical, which meant they were also seven places to forget
 * when a token changed — and exactly one of them had drifted (the dashboard's
 * copy carried a disabled style the others did not).
 *
 * Written in semantic tokens only, so controls are already correct under
 * <html data-theme="dark"> without a second set of classes.
 */

export const controlClass = ({ invalid = false, className = "" } = {}) =>
  [
    "w-full rounded-lg border bg-surface px-3.5 py-2.5 text-fg shadow-e1",
    "transition placeholder:text-fg-placeholder",
    "focus:outline-none focus:ring-2",
    // An invalid control has to be distinguishable by more than colour, which
    // is what the error text under it is for — this is the supporting signal,
    // not the only one.
    invalid
      ? "border-danger-600 focus:border-danger-600 focus:ring-danger-600/25"
      : "border-line-control focus:border-focus focus:ring-focus/25",
    "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-subtle",
    className,
  ]
    .filter(Boolean)
    .join(" ");
