/* Public surface of @uc/ui.
 *
 * Everything both apps render in common lives here. Right now that is just the
 * brand lockup; Parts 4 and 5 add the form and layout primitives (Field, Input,
 * Button, Card, StatusPill, Table, EmptyState, Modal) that the seven form
 * components currently re-declare as inline class strings.
 *
 * Components here are consumed as source — Vite compiles them as part of
 * whichever app imports them, so there is no build step for this package. That
 * also means any Tailwind class used in here has to be visible to each app's
 * `@source` directive; see frontend/src/App.css.
 */

export { Logo, LogoMark } from "./Logo.jsx";
