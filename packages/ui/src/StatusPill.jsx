/**
 * An appointment status, as a pill.
 *
 * The dot is not decoration. Appointment status is exactly the kind of
 * information that must not be carried by colour alone — the label does the
 * work, the dot reinforces the shape, and the colour is the third signal rather
 * than the only one.
 *
 * Unknown statuses fall through to a neutral pill instead of rendering
 * unstyled, because the status strings come from the API and the frontend
 * should not break when the backend grows a fourth one.
 */

const TONES = {
  Pending: "border-warning-300 bg-warning-50 text-warning-900",
  Accepted: "border-success-200 bg-success-50 text-success-800",
  Rejected: "border-danger-200 bg-danger-50 text-danger-800",
};

const DOTS = {
  Pending: "bg-warning-500",
  Accepted: "bg-success-600",
  Rejected: "bg-danger-600",
};

export const StatusPill = ({ status, className = "" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1
      text-xs font-medium ${
        TONES[status] ?? "border-line bg-surface-muted text-fg-muted"
      } ${className}`}
  >
    <span
      aria-hidden="true"
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
        DOTS[status] ?? "bg-fg-subtle"
      }`}
    />
    {status || "Unknown"}
  </span>
);
