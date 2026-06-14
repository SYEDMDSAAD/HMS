import {
  MdCheckCircle,
  MdError,
  MdInfo,
  MdWarning,
} from "react-icons/md";

/**
 * A banner that explains a state — "sign in first", "we could not load that".
 *
 * Two accessibility decisions that the hand-rolled banners it replaces got
 * wrong, and which are invisible if you only look at the screen:
 *
 *  - Every tone carries an icon. Colour alone cannot be the signal; roughly one
 *    man in twelve has a red/green deficiency, and this app shows clinical
 *    status to patients.
 *  - `live` sets role="alert", which makes a screen reader announce the banner
 *    when it appears. Without it, a message that arrives after a failed request
 *    is silent — the user is left waiting for a result that already came back.
 *    It is opt-in because a banner rendered on first paint should not
 *    interrupt: there is nothing new about it.
 */

const TONES = {
  info: {
    icon: MdInfo,
    className: "border-accent-200 bg-accent-50 text-accent-900",
    iconClass: "text-accent-700",
  },
  success: {
    icon: MdCheckCircle,
    className: "border-success-200 bg-success-50 text-success-900",
    iconClass: "text-success-700",
  },
  warning: {
    icon: MdWarning,
    className: "border-warning-300 bg-warning-50 text-warning-900",
    iconClass: "text-warning-700",
  },
  danger: {
    icon: MdError,
    className: "border-danger-200 bg-danger-50 text-danger-800",
    iconClass: "text-danger-700",
  },
};

export const Alert = ({
  tone = "info",
  title,
  live = false,
  className = "",
  children,
}) => {
  const { icon: Icon, className: toneClass, iconClass } = TONES[tone] ?? TONES.info;

  return (
    <div
      role={live ? "alert" : undefined}
      className={`flex items-start gap-3 rounded-xl border px-5 py-4 text-sm ${toneClass} ${className}`}
    >
      <Icon aria-hidden="true" className={`mt-0.5 shrink-0 text-lg ${iconClass}`} />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "mt-1" : ""}>{children}</div>
      </div>
    </div>
  );
};
