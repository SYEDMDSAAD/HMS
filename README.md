# Hospital Management System

A MERN application: a REST API, a public patient site, and an admin dashboard,
with the code the two front ends share extracted into local packages.

| Package           | What it is                                             | Dev port |
| ----------------- | ------------------------------------------------------ | -------- |
| `backend`         | Express + Mongoose REST API                            | 4000     |
| `frontend`        | Patient site — register, sign in, book an appointment  | 5173     |
| `dashboard`       | Admin portal — appointments, doctors, admins, messages | 5174     |
| `packages/theme`  | `@uc/theme` — design tokens and base styles            | —        |
| `packages/ui`     | `@uc/ui` — shared React components                     | —        |
| `packages/client` | `@uc/client` — API client and auth context             | —        |

Both front ends are React 18 + Vite 6 + Tailwind 4. The backend is ESM
(`"type": "module"`), so every local import needs its `.js` extension.

## Workspace layout

`frontend`, `dashboard` and `packages/*` are one npm workspace: a single
lockfile, a single hoisted `node_modules`, one copy of React. The `packages/*`
entries are consumed as **source** — Vite compiles them as part of whichever app
imports them — so they have no build step and editing one hot-reloads both apps.

Anything used by both apps belongs in a package. Three things were previously
maintained as two copies each (`AppContext.js`, `api.js`, `Logo.jsx`), plus two
byte-identical `eslint.config.js` files; a rule or fix applied to one silently
did not apply to the other.

`@uc/ui` exports the form primitives: `Input`, `NumericInput`, `Select`,
`Textarea`, `Checkbox`, `PasswordInput`, `PhoneInput`, and the `Field` wrapper
they are built on. Use them rather than styling a bare `<input>` — they carry
the label binding and the `aria-describedby` wiring for hint and error text,
which is the part that is easy to leave out and impossible to see is missing.
Every control takes `value` + `onValueChange(nextValue)`; `Checkbox` takes
`checked` + `onCheckedChange(bool)`.

One consequence worth knowing before adding components to `@uc/ui`: Tailwind
scans the project it compiles in, and `packages/ui` sits outside both app roots.
Each app's `App.css` carries an `@source "../../packages/ui/src"` line to make
those files visible. Without it the classes are silently never generated — no
error, just unstyled output. If a shared component renders unstyled, check that
line first.

## Design tokens

`@uc/theme` is the single source for colour, type, radius and elevation. Each
app's `src/App.css` pulls it in with `@import "@uc/theme"`. Tailwind's default
palette is switched off in `tokens.css`, so `bg-slate-200` compiles to nothing —
reach for a token instead.

Two layers, and the difference matters:

- **Ramps** — `accent-*`, `ink-*`, `success-*`, `warning-*`, `danger-*`. Fixed
  values, identical in light and dark. Use for brand marks and fixed graphics.
- **Semantic** — `surface`, `fg`, `fg-muted`, `line`, `line-control`,
  `accent-solid`, `focus`, … Named by role, swapped by theme. Use these for
  anything a component paints.

Dark mode is live. The resolved theme sits on `<html data-theme>`, written
before first paint by an inline script in each app's `index.html`; the
Light / System / Dark control is in the public footer and the dashboard sidebar.

There is deliberately no `prefers-color-scheme` media query in the CSS.
Supporting "system" there would mean writing the dark palette twice — once under
the attribute, once under the query — and eighteen values kept in two places are
eighteen values that drift. `packages/ui/src/theme.js` resolves the preference
instead, which costs a JavaScript dependency the SPA already has.

After changing any colour, run the contrast check — it parses `tokens.css`
directly and exits non-zero on a regression:

```bash
npm run check:contrast
```

## Prerequisites

- Node 18 or newer (developed against Node 20)
- A MongoDB connection string — Atlas or a local `mongod`. The database name is
  hardcoded to `HMS` in `backend/database/dbConnection.js`.
- A Cloudinary account, but only to add doctors. Everything else runs without
  it; the server logs a warning at boot and doctor avatar uploads fail.

## Setup

The front ends are an npm workspace, so one install at the repo root covers
`frontend`, `dashboard` and everything in `packages/`. The backend is not a
workspace — it shares no code with the front ends, and folding it in would mean
rebuilding its native `bcrypt` dependency for no benefit.

```bash
npm install                       # frontend + dashboard + packages/*
npm install --prefix backend
```

Then the backend config, which is required:

```bash
cp backend/config/config.env.example backend/config/config.env
```

Fill it in. `MONGO_URI`, `JWT_SECRET_KEY`, `JWT_EXPIRES` and `PORT` are
mandatory — `app.js` exits at startup listing whatever is missing rather than
booting into a broken state.

The two front ends need no config; they default to `http://localhost:4000/api/v1`.
Copy `frontend/.env.example` / `dashboard/.env.example` to `.env` only if your
API lives somewhere else.

## Running

Three terminals:

```bash
npm run dev --prefix backend      # nodemon, port 4000
npm run dev:web                   # patient site,    port 5173
npm run dev:admin                 # admin dashboard, port 5174
```

Both front-end commands run from the repo root. There is deliberately no single
`npm run dev` that starts both: doing it without a process manager leaves
orphaned Vite servers behind, and adding one for two commands is not worth the
dependency.

The Vite ports are pinned with `strictPort`, so a busy port fails loudly instead
of silently moving to the next one — which matters because the backend only
accepts CORS requests from the two origins named in `FRONTEND_URL_ONE` and
`FRONTEND_URL_TWO`.

From the root, `npm run build` builds both front ends and `npm run lint` lints
the whole workspace against the single `eslint.config.js` at the root. There is
no per-app `lint` script — there is no per-app config left for it to use.

## Creating the first admin

`POST /user/admin/addnew` is itself admin-only, so the first admin cannot be
created through the UI. Register as a patient on the frontend, then promote that
account:

```js
// mongosh
use HMS
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "Admin" } })
```

Promoting an existing account rather than inserting a document directly matters:
passwords are hashed by a `pre("save")` hook on the model, so a hand-inserted
user would have a plaintext password that can never match at login.

Doctors sign in at the **same dashboard** as admins, choosing "Doctor" on the
login form, and land on their own schedule instead of the appointments desk. Each
role has its own cookie (`adminToken`, `doctorToken`, `patientToken`), so being
signed into one portal grants nothing in another.

## API

All routes are under `/api/v1`.

| Method | Route                        | Access  |
| ------ | ---------------------------- | ------- |
| POST   | `/user/patient/register`     | public  |
| POST   | `/user/login`                | public  |
| GET    | `/user/doctors`              | public  |
| POST   | `/user/patient/logout`       | public  |
| POST   | `/user/admin/logout`         | public  |
| GET    | `/user/patient/me`           | patient |
| GET    | `/user/admin/me`             | admin   |
| POST   | `/user/admin/addnew`         | admin   |
| POST   | `/user/doctor/addnew`        | admin   |
| POST   | `/user/doctor/logout`             | public  |
| GET    | `/user/doctor/me`                 | doctor  |
| GET    | `/appointment/availability`       | public  |
| POST   | `/appointment/post`               | patient |
| GET    | `/appointment/mine`               | patient |
| PATCH  | `/appointment/mine/:id/cancel`    | patient |
| GET    | `/appointment/doctor/mine`        | doctor  |
| PATCH  | `/appointment/doctor/:id/complete`| doctor  |
| GET    | `/appointment/getall`             | admin   |
| PUT    | `/appointment/update/:id`    | admin   |
| DELETE | `/appointment/delete/:id`    | admin   |
| POST   | `/message/send`              | public  |
| GET    | `/message/getall`            | admin   |

Appointment statuses are `Pending`, `Accepted`, `Rejected`, `Cancelled` and
`Completed`. `Rejected` and `Cancelled` release the slot for rebooking;
`Completed` keeps holding it, because that time really was used.

`GET /appointment/availability?doctorId=<id>&date=YYYY-MM-DD` returns every slot
that doctor works on that clinic-local day, each flagged `available`. A
`configured: false` in the response means the doctor has no consultation hours
set at all, which is a different problem from being fully booked.

Times are stored as UTC instants and interpreted against a fixed **+05:30**
(`Asia/Kolkata`). India has had no daylight saving since 1945, so the offset is
a constant; `backend/models/availability.js` is the one place that assumption
lives.

Double-booking is prevented by a partial unique index on
`{ doctorId, startsAt }` where `slotHeld` is true — not by the availability
check in the controller, which two simultaneous requests can both pass before
either writes. The loser of that race gets a 409. Rejecting an appointment sets
`slotHeld` false and frees the slot for rebooking.

### Identifiers, and why Aadhaar is not one

Patients are identified by `patientId` — `UC-2026-000431`, issued from an atomic
counter at registration. Only the **last four digits** of an Aadhaar number are
stored, optionally, in `aadhaarLast4`.

The application previously stored all twelve, on the user *and* again on every
appointment, while reading none of them: no lookup, no verification, no display.
The uniqueness it provided was already covered by the unique email. Storing full
Aadhaar numbers is restricted for private entities under the Aadhaar Act, so
that was exposure in exchange for nothing. The last four still support the one
thing a front desk does with the number — checking it against the card in the
patient's hand.

This is not legal advice. If Aadhaar matters to your operations, take proper
advice before changing it back.

Auth is a JWT in an httpOnly cookie — `patientToken` or `adminToken`, kept
separate so being signed into one portal grants nothing in the other. The token
is deliberately never returned in the response body. Logout routes are public on
purpose: an expired token must not leave a user unable to log out.

## Database migrations

`backend/scripts/migrate-aadhaar-minimise.js` reduces stored Aadhaar numbers to
their last four digits and issues each patient a hospital ID.

```bash
node backend/scripts/migrate-aadhaar-minimise.js            # dry run
node backend/scripts/migrate-aadhaar-minimise.js --apply
```

**`--apply` is not reversible.** It overwrites the full numbers and drops the
field; no copy is kept. Export first if any paper process still needs them. It
also drops the unique index on `users.aadhaar` — email uniqueness still prevents
duplicate accounts, but the Aadhaar-level constraint goes by design.

(This replaced `migrate-aadhaar.js`, which backfilled a field that no longer
exists.)

`backend/scripts/migrate-appointment-slots.js` gives every doctor default OPD
hours and converts appointments from the old bare-date `appointment_date` string
to real `startsAt` / `endsAt` instants.

```bash
node backend/scripts/migrate-appointment-slots.js            # dry run
node backend/scripts/migrate-appointment-slots.js --apply
```

**Until this runs, existing doctors cannot be booked** — a doctor with no
availability returns no slots, deliberately, rather than being given invented
consultation hours that nobody set.

A date has no time in it, so the script has to choose one: it assigns each
appointment the first free slot of its day, in creation order, and marks
everything it touched `slotWasInferred: true` so the front desk can confirm
those times rather than trusting them.

## What's next

[`docs/ROADMAP.md`](docs/ROADMAP.md) is the systematic to-do: everything
outstanding, tiered by what actually gates a launch, plus the product thesis
that decides *how* the clinical record gets built rather than just whether it
does. Read Part A before starting anything in its Tier 2.

## Known gaps

- `POST /message/send` is the only unauthenticated write endpoint and has no
  rate limit.
- Appointment times migrated from the old bare-date field are marked
  `slotWasInferred: true`. Those times were reconstructed, not chosen by the
  patient, and should be confirmed before being treated as real.
- No automated tests in any package. The flows added in Part 9 were verified by
  driving the API over HTTP against a throwaway database, but that harness was
  not kept.
- `GET /appointment/getall` searches with a case-insensitive regex. The input is
  escaped, but an unanchored regex cannot use an index — at real volume this
  wants a text index or Atlas Search.
