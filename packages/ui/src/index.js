/* Public surface of @uc/ui.
 *
 * Everything both apps render in common lives here. Part 5 adds the layout and
 * feedback primitives — Button, Card, StatusPill, Table, EmptyState, Skeleton,
 * Modal, Alert, PageHeader.
 *
 * Components here are consumed as source — Vite compiles them as part of
 * whichever app imports them, so there is no build step for this package. That
 * also means any Tailwind class used in here has to be visible to each app's
 * `@source` directive; see frontend/src/App.css.
 *
 * Every component is written in semantic tokens only (surface, fg, line,
 * accent-solid, focus), never in ramp steps, so they are already correct under
 * <html data-theme="dark">.
 */

export { Logo, LogoMark } from "./Logo.jsx";

// Form primitives. Prefer the composite controls (Input, Select, …) — they
// render Field for you. Reach for Field directly only when wrapping a control
// this package does not cover.
export { Field, useFieldIds } from "./Field.jsx";
export { Input, NumericInput } from "./Input.jsx";
export { Select } from "./Select.jsx";
export { Textarea } from "./Textarea.jsx";
export { Checkbox } from "./Checkbox.jsx";
export { PasswordInput } from "./PasswordInput.jsx";
export { PhoneInput } from "./PhoneInput.jsx";
export { controlClass } from "./field-styles.js";
