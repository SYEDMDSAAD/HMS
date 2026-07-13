/* Public surface of @uc/ui.
 *
 * Everything both apps render in common lives here.
 *
 * Components are consumed as source — Vite compiles them as part of whichever
 * app imports them, so there is no build step for this package. That also means
 * any Tailwind class used in here has to be visible to each app's `@source`
 * directive; see frontend/src/App.css.
 *
 * Every component is written in semantic tokens only (surface, fg, line,
 * accent-solid, focus), never in ramp steps, so they are already correct under
 * <html data-theme="dark">.
 */

export { Logo, LogoMark } from "./Logo.jsx";

// Form primitives. Prefer the composite controls (Input, Select, …) — they
// render Field for you. Reach for Field directly only when wrapping a control
// this package does not cover.
export { Field } from "./Field.jsx";
export { useFieldIds } from "./use-field-ids.js";
export { Input, NumericInput } from "./Input.jsx";
export { Select } from "./Select.jsx";
export { Textarea } from "./Textarea.jsx";
export { Checkbox } from "./Checkbox.jsx";
export { PasswordInput } from "./PasswordInput.jsx";
export { PhoneInput } from "./PhoneInput.jsx";
export { controlClass } from "./field-styles.js";

// Layout and feedback.
export { Button } from "./Button.jsx";
export { Card } from "./Card.jsx";
export { PageHeader } from "./PageHeader.jsx";
export { Alert } from "./Alert.jsx";
export { StatusPill } from "./StatusPill.jsx";
export { EmptyState } from "./EmptyState.jsx";
export { Skeleton, SkeletonText, SkeletonGroup } from "./Skeleton.jsx";
export { Table } from "./Table.jsx";
export { Modal } from "./Modal.jsx";
export { Toaster } from "./Toaster.jsx";
export { notify } from "./notify.js";

// Colour theme. The resolved theme lives on <html data-theme>; each app's
// index.html carries an inline script that sets it before first paint.
export { ThemeToggle } from "./ThemeToggle.jsx";
export { useTheme } from "./use-theme.js";
export {
  THEME_STORAGE_KEY,
  THEME_PREFERENCES,
  applyTheme,
  getThemePreference,
  resolveTheme,
  setThemePreference,
} from "./theme.js";
