import { MdComputer, MdDarkMode, MdLightMode } from "react-icons/md";

import { useTheme } from "./use-theme.js";

/**
 * Light / System / Dark, as a segmented control.
 *
 * Three visible buttons rather than one that cycles: a cycling icon button
 * cannot show which of three states you are in, and "system" in particular is
 * impossible to infer from an icon that currently looks like a sun.
 *
 * The group is a set of toggle buttons carrying `aria-pressed`, which is what
 * tells a screen reader that these are states rather than actions, and which
 * one is active. Icons are aria-hidden; each button's accessible name comes
 * from the visually-hidden label beside it.
 */

const OPTIONS = [
  { value: "light", label: "Light", icon: MdLightMode },
  { value: "system", label: "System", icon: MdComputer },
  { value: "dark", label: "Dark", icon: MdDarkMode },
];

export const ThemeToggle = ({ orientation = "horizontal", className = "" }) => {
  const { preference, setTheme } = useTheme();
  const vertical = orientation === "vertical";

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={`inline-flex gap-0.5 rounded-lg border border-line bg-surface-muted p-0.5 ${
        vertical ? "flex-col" : ""
      } ${className}`}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                active
                  ? "bg-surface text-accent-text shadow-e1"
                  : "text-fg-subtle hover:text-fg"
              }`}
          >
            <Icon aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
