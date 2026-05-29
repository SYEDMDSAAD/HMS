# Hospital Management System

A MERN application in three parts: a REST API, a public patient site, and an
admin dashboard.

| Package     | What it is                                                  | Dev port |
| ----------- | ----------------------------------------------------------- | -------- |
| `backend`   | Express + Mongoose REST API                                 | 4000     |
| `frontend`  | Patient site — register, sign in, book an appointment       | 5173     |
| `dashboard` | Admin portal — appointments, doctors, admins, messages      | 5174     |

Both front ends are React 18 + Vite 6 + Tailwind 4. The backend is ESM
(`"type": "module"`), so every local import needs its `.js` extension.

## Prerequisites

- Node 18 or newer (developed against Node 20)
- A MongoDB connection string — Atlas or a local `mongod`. The database name is
  hardcoded to `HMS` in `backend/database/dbConnection.js`.
- A Cloudinary account, but only to add doctors. Everything else runs without
  it; the server logs a warning at boot and doctor avatar uploads fail.

## Setup

Each package installs separately — there is no workspace root.

```bash
npm install --prefix backend
npm install --prefix frontend
npm install --prefix dashboard
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
npm run dev --prefix frontend     # port 5173
npm run dev --prefix dashboard    # port 5174
```

The Vite ports are pinned with `strictPort`, so a busy port fails loudly instead
of silently moving to the next one — which matters because the backend only
accepts CORS requests from the two origins named in `FRONTEND_URL_ONE` and
`FRONTEND_URL_TWO`.

`npm run build` and `npm run lint` are available in both front ends.

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
