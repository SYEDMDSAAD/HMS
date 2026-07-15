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

/* Status tints are the one place components name ramp steps directly rather
 * than semantic tokens: the tone IS the meaning here, and a "danger surface"
 * token per tone would be twelve more tokens for four components.
 *
 * They do still have to follow the theme, which the `dark:` variants do. A
 * light pink banner on a dark dashboard is not a subtle wrongness — it is a
 * glowing rectangle, and it was exactly what shipped before this existed.
 * Every pair below is checked by packages/theme/check-contrast.mjs. */
const TONES = {
  info: {
    icon: MdInfo,
    className:
      "border-accent-200 bg-accent-50 text-accent-900 " +
      "dark:border-accent-800 dark:bg-accent-950 dark:text-accent-200",
    iconClass: "text-accent-700 dark:text-accent-300",
  },
  success: {
    icon: MdCheckCircle,
    className:
      "border-success-200 bg-success-50 text-success-900 " +
      "dark:border-success-800 dark:bg-success-950 dark:text-success-200",
    iconClass: "text-success-700 dark:text-success-300",
  },
  warning: {
    icon: MdWarning,
    className:
      "border-warning-300 bg-warning-50 text-warning-900 " +
      "dark:border-warning-800 dark:bg-warning-950 dark:text-warning-200",
    iconClass: "text-warning-700 dark:text-warning-300",
  },
  danger: {
    icon: MdError,
    className:
      "border-danger-200 bg-danger-50 text-danger-800 " +
      "dark:border-danger-800 dark:bg-danger-950 dark:text-danger-200",
    iconClass: "text-danger-700 dark:text-danger-300",
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
