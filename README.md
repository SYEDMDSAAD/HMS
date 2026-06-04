# Hospital Management System

A MERN application in three parts: a REST API, a public patient site, and an
admin dashboard.

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

Dark mode is defined and opt-in via `<html data-theme="dark">`. It is
deliberately not wired to `prefers-color-scheme` yet: most components still name
ramp steps directly, so a system-dark visitor would get a half-converted page.

After changing any colour, run the contrast check — it parses `tokens.css`
directly and exits non-zero on a regression:

```bash
node packages/theme/check-contrast.mjs
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
the whole workspace against the single `eslint.config.js` at the root.

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

Doctors are created by an admin from the dashboard and have no portal of their
own — there is nowhere for a doctor to sign in yet.

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
| POST   | `/appointment/post`          | patient |
| GET    | `/appointment/getall`        | admin   |
| PUT    | `/appointment/update/:id`    | admin   |
| DELETE | `/appointment/delete/:id`    | admin   |
| POST   | `/message/send`              | public  |
| GET    | `/message/getall`            | admin   |

Auth is a JWT in an httpOnly cookie — `patientToken` or `adminToken`, kept
separate so being signed into one portal grants nothing in the other. The token
is deliberately never returned in the response body. Logout routes are public on
purpose: an expired token must not leave a user unable to log out.

## Database migrations

`backend/scripts/migrate-aadhaar.js` backfills `aadhaar` on user documents
predating the `nic` → `aadhaar` rename. Until every document has a distinct
value, MongoDB cannot build the unique index and the constraint does not exist.

```bash
node backend/scripts/migrate-aadhaar.js            # dry run, writes nothing
node backend/scripts/migrate-aadhaar.js --apply
```

It is safe to re-run. See the header comment in the file for `--drop-nic`.

## Known gaps

- `POST /message/send` is the only unauthenticated write endpoint and has no
  rate limit.
- No automated tests in any package.
