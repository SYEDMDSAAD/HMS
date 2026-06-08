/**
 * Label + control + hint + error, wired together.
 *
 * Most callers do not use this directly — Input, Select, Textarea and friends
 * render it for you. Reach for it when you need a control this package does not
 * wrap, like the doctor avatar picker.
 *
 * What it buys, beyond not repeating the markup: the label is bound to the
 * control, and hint and error text are bound to it too via aria-describedby, so
 * a screen reader announces "Password, At least 8 characters" rather than
 * leaving the requirement as text floating somewhere near the box. That wiring
 * needs an id shared by four elements, which is why it belongs in one place.
 */

export const Field = ({
  label,
  hint,
  error,
  // Nearly every field in this app is required, so marking those would be noise
  // on 8 of 8 labels. The information a patient actually needs is which field
  // they may skip, so the marker goes on the exception.
  optional = false,
  ids,
  className = "",
  children,
}) => (
  <div className={className}>
    {label && (
      <label
        htmlFor={ids.id}
        className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-fg-muted"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-fg-subtle">Optional</span>
        )}
      </label>
    )}

    {children}

    {/* Error takes the slot when both are present: once something is wrong,
        the hint is no longer the most useful thing to read. */}
    {error ? (
      <p id={ids.errorId} className="mt-1.5 text-sm text-danger-600">
        {error}
      </p>
    ) : (
      hint && (
        <p id={ids.hintId} className="mt-1.5 text-sm text-fg-subtle">
          {hint}
        </p>
      )
    )}
  </div>
);
