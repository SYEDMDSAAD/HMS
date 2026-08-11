# Roadmap

What is left to build, and — more importantly — what to build *differently* so
this ends up as something other than one more hospital system.

Two documents' worth of thinking live here, because separating them was the
mistake waiting to happen:

- **Part A — the thesis.** Why most of the work below will not differentiate
  this product, and which small subset will.
- **Part B — the work.** Everything outstanding, tiered by what actually gates
  a launch, as checkboxes.
- **Part C — sequencing.** What to do first, and why that order.

> **How to use this.** Part B is the checklist you tick. Part A is what you
> re-read before starting any Part B item in Tier 2, because that is where the
> shape of a decision matters more than its completion.

Every claim about what is missing was checked against the codebase, not
remembered. Where something is called absent, it was verified absent — the
method is noted in [Appendix: how this was verified](#appendix-how-this-was-verified).

---

## Part A — The thesis

### The trap

The industry's central failure is that **its software is optimised for billing,
not for care**. The dominant systems grew out of revenue-cycle management with
clinical features attached, and everything people complain about follows from
it: notes written to justify a code, copy-forward bloat, roughly two hours of
documentation per hour of patient contact, usability that scores in the F range
on standard scales.

The trap is that this is not a mistake anyone made on purpose. It is what you
get by building the billable thing first and the clinical thing around it. **It
is available to us too**, and most of Part B is neutral about which way we go.

### Bucket 1 — Non-negotiable, but nobody will clap

Audit trail, soft delete, rate limiting, password reset, security headers,
sanitisation, token revocation, DPDP rights, staging split, tests, CI, error
tracking, health checks, backups, migrations, and the data-model corrections.

Do them because shipping without them is irresponsible. **None of them
differentiate anything.** Budget them as cost of entry and do not let them eat
the year.

Two of them quietly become differentiators if done unusually well:

- **DPDP export and erasure.** Everyone will build grudging compliance. Genuine
  one-click export is the portability nobody in this sector offers.
- **Login speed.** Ward staff share logins because logging in is slow — a
  usability failure that manufactures a security failure. Sub-second re-auth
  removes the incentive.

### Bucket 2 — This is the actual product

Each inverts a specific, documented failure of the field.

| # | Principle | Inverts |
| - | --------- | ------- |
| 1 | The note is for the next clinician, not the biller | Billing-shaped records, note bloat |
| 2 | The patient holds a complete copy | Four portals, four partial records |
| 3 | Fewer alerts than anyone else, on purpose | 90%+ override rates, dismissal by reflex |
| 4 | Zero training | Buyer ≠ user; onboarding measured in weeks |
| 5 | India-native, not India-localised | English-only clinical software, email-first flows |
| 6 | AI in exactly one place | Predictive models deployed ahead of their evidence |
| 7 | Measure care, not go-live | Nobody checks whether the software helped |
| 8 | Data quality enforced at entry | "See note" in a structured field |

Each is expanded where it becomes real work, in Part B Tier 2.

### Bucket 3 — Refuse these

Differentiation is as much refusal as addition. Each of the following is
tempting and each makes the product more generic.

- [ ] **Feature parity with the large EHRs.** Their feature list is accumulated
      billing sediment. Entering that race loses it.
- [ ] **Billing before the clinical record.** It is what sells in India, and it
      is exactly how every incumbent became billing-shaped. If built, build it
      *after* the record and *separate* from it.
- [ ] **A read-only patient portal.** That is the failure, not the fix.
- [ ] **Predictive AI as a headline.** Unearned and unmonitored.
- [ ] **Inpatient, wards, beds, theatre scheduling.** Turns this into a small
      bad Epic. Outpatient done exceptionally well is defensible.
- [ ] **Configurability instead of good defaults.** "It can be configured" is
      how software earns a two-week training course.

> These are checkboxes for a reason: tick one when you have consciously decided
> to break it. Breaking one on purpose is a strategy. Drifting into it is not.

---

## Part B — The work

Severity is about whether it gates a launch. Effort is a rough order of
magnitude, not an estimate.

### Tier 1 — Blocks a real launch

Safety, accountability and law.

- [ ] **Audit trail on every record change** · blocker · 2–3 days
  Who changed this appointment's status, and when — currently unanswerable. Log
  actor, action, target, before/after, timestamp, IP.
  `backend/controller/appointmentController.js` — `updateAppointmentStatus`
  writes with no actor.

- [ ] **Soft delete and a retention policy** · blocker · 1 day
  Deletion is permanent. Medical bookings should be retained, and an admin
  misclick is currently unrecoverable.
  `appointmentController.js` — `findByIdAndDelete`.

- [ ] **Notifications: SMS/WhatsApp first, email second** · blocker · 1 week
  A patient books and receives silence — no confirmation, no reminder, no notice
  when the front desk accepts or rejects. Needed on: booked, accepted, rejected,
  cancelled, and 24h before.
  Build it **WhatsApp-shaped from the start** (Bucket 2 #5); retrofitting the
  channel later is rework.

- [ ] **Rate limiting, including on login** · blocker · half a day
  Nothing is limited. `POST /message/send` is an open write endpoint and
  `POST /user/login` has no brute-force protection. Add per-IP and per-account
  limits plus lockout with backoff.

- [ ] **Password reset** · blocker · 2 days
  No reset flow exists; a locked-out admin has no route back in. Depends on
  notifications.

- [ ] **Security headers** · blocker · half a day
  No helmet, CSP or HSTS. The CSP needs care because both front ends are Vite
  bundles. `backend/app.js`.

- [ ] **NoSQL injection sanitisation** · blocker · 2 hours
  Request bodies reach Mongoose unsanitised; a `$`-prefixed object in a login
  body is the classic way in. The admin search is already regex-escaped;
  nothing else is.

- [ ] **Token revocation** · high · 1 day
  Logout clears the cookie but does not invalidate the JWT. Add a token version
  on the user, bumped on logout and password change.
  `backend/utils/jwtToken.js`, `backend/middlewares/auth.js`.

- [ ] **DPDP Act 2023: consent and data-principal rights** · blocker · needs legal input
  Health data is sensitive personal data. Consent capture, purpose limitation,
  and access / correction / erasure are not implemented. Build the export path
  properly and it doubles as Bucket 2 #2. *Flagged, not advised — get real legal
  input.*

- [ ] **Separate staging from production** · blocker · 1 day
  One Atlas cluster is currently both. Every migration is rehearsed on live
  patient data. Split it and seed staging with synthetic records.

- [ ] **Sub-second re-authentication** · high · 2 days
  Not on the original list; it is here because shared ward logins are a
  usability failure that becomes a security failure. Make logging back in fast
  enough that nobody wants a shared account.

### Tier 2 — Makes it a hospital system, and makes it *this* hospital system

This tier is where Part A stops being philosophy. Read Bucket 2 before starting
any of it.

- [ ] **The encounter record** · blocker · 2–3 weeks
  Consultation notes, diagnosis, prescription, attached to the appointment. A
  doctor currently sees exactly what the receptionist sees.

  **This is the fork in the road.** Per Bucket 2 #1:
  - [ ] **No copy-forward, ever.** Link the previous note; never clone it. This
        single rule prevents note bloat at the source.
  - [ ] Structure it around *what the next clinician needs to know* — what
        changed, what to watch for — not around what is billable.
  - [ ] **Hard-cap the primary free-text field.** A constraint that forces a
        summary is a feature.
  - [ ] **Separate the clinical note from any billing artifact at the schema
        level**, so they can never contaminate each other.
  - [ ] Instrument median note-writing time from day one.

- [ ] **The patient's complete copy** · high · 1 week
  Bucket 2 #2. Mostly a view over data that will already exist.
  - [ ] Export as FHIR-shaped JSON *and* a readable PDF.
  - [ ] Show the patient **who accessed their record and when** — the Tier 1
        audit trail, surfaced. Almost nobody does this; it is a strong trust
        signal over data you already hold.
  - [ ] No lock-in framing anywhere. Portability is marketing, not a concession.

- [ ] **Patient history on the appointment** · high · 1 week
  Past visits visible from the current appointment. Depends on the encounter
  record.

- [ ] **Allergies, vitals, current medication** · high · 1 week
  Allergies first: the one field whose absence causes harm rather than
  inconvenience.
  - [ ] **Reconciliation prompt** at the start of each encounter — "is this
        medication list still right?", one tap (Bucket 2 #8).
  - [ ] **No free-text escape hatch** in a structured field. If "see note" is a
        valid answer, the field is wrong.

- [ ] **Allergy checking, and almost no other alerts** · high · 3 days
  Bucket 2 #3.
  - [ ] An alert ships only if it **changes an action**, not if it is merely
        useful to know.
  - [ ] **Measure the override rate on every alert.** Anything consistently
        overridden gets deleted, not re-worded.

- [ ] **Availability editing for doctors** · high · 3 days
  Doctors get default OPD hours at creation with no way to change them, set a
  half-day, or block leave without editing the database. The schema already
  supports `closedDates` and per-day windows — only the interface is missing.
  `dashboard/src/components/AddNewDoctor.jsx`, `backend/models/availability.js`.

- [ ] **Reschedule** · medium · 2 days
  Cancel-and-rebook loses the appointment's history and its place in the queue.

- [ ] **Referrals between departments** · medium · 1 week
  The booking form says "choose General Medicine and we will refer you". There
  is no referral object to carry that.

- [ ] **Billing and insurance claims** · high · 3+ weeks
  The public site advertises help with cashless claims and nothing does it.
  **Build it after the record and separate from it** (Bucket 3).

### Tier 3 — Operationally invisible

Right now, if this broke in production you would find out from a patient.

- [ ] **Automated tests** · blocker · ongoing
  Verified: no test files, no test script in any `package.json`. Start with the
  rules that are expensive to get wrong — slot generation, the double-booking
  constraint, cancel and complete permissions.
- [ ] **CI on every push** · high · half a day
  `npm run lint`, `npm run build`, `npm run check:contrast` already exist as one
  command each. Nothing runs them automatically.
- [ ] **Error tracking** · high · half a day — API and both front ends.
- [ ] **Structured logs with request IDs** · medium · 1 day
  Logging is `console.error`; tracing one failed booking is guesswork.
- [ ] **Health check endpoint** · high · 1 hour
  Nothing can currently tell whether the API is alive or has lost the database.
- [ ] **Backups, and a restore you have actually run** · blocker · 1 day
  An untested restore is not a backup. Do the drill once; write down how long it
  took.
- [ ] **A migration framework** · medium · 1 day
  Hand-written scripts with no record of what has run. Fine at two, not at five.

### Tier 4 — Data model corrections

Cheap now, expensive once there is real data on top of them.

- [ ] **Look up doctors by id, not by name** · high · 2 hours
  Booking matches on first name + last name + department and carries an explicit
  "Doctors Conflict!" branch for duplicates. The client already sends a
  `doctorId`. `appointmentController.js`.
- [ ] **Decide what the appointment snapshot is for** · medium · 1 day
  Every appointment duplicates the patient's name, email, phone, DOB and address
  alongside `patientId`. Either a deliberate point-in-time record or accidental
  drift — nothing says which, and nothing reconciles them. Decide, document,
  enforce.
- [ ] **A status state machine** · medium · half a day
  An admin can move an appointment from Completed back to Pending. Each
  transition is individually valid; the sequence is not guarded.
- [ ] **A real search index** · medium · 1 day
  Admin search is a correctly-escaped but unanchored regex, which cannot use an
  index. Wants a text index or Atlas Search.

### Tier 5 — Reach, and the things that make it *ours*

- [ ] **Telugu and Hindi as first-class** · high · 1 week
  Bucket 2 #5. Not a late i18n pass — it affects which fields need translation,
  so decide before the encounter record lands.
- [ ] **Accessibility audit with a real screen reader** · high · 2 days
  Semantics and contrast have been handled carefully and the contrast check runs
  on every change, but careful is not tested. Run axe, then NVDA or VoiceOver
  through booking end to end.
- [ ] **Verify the mobile layout** · high · 2 hours
  Mobile-first by construction, but no narrow viewport has ever been looked at —
  the test browser would not size below ~1248px. Open it on a phone.
- [ ] **Works on a cheap Android on patchy 4G** · high · 3 days
  The bundle is 376KB today; protect that number. Consider a service worker so
  the front desk survives a dropout.
- [ ] **Zero-training target** · high · ongoing
  Bucket 2 #4. A new receptionist completes a real booking, unassisted, within
  five minutes of first seeing the screen. Test with someone who has never seen
  it. Treat "we need to train them" as a bug against the interface.
- [ ] **Ambient scribing of the consultation, in the patient's language** · medium · investigate
  Bucket 2 #6. The one AI intervention with clear evidence of reducing burden
  rather than relocating it, and doing it for Telugu and Hindi consultations is
  not well served by the large vendors. **Nothing predictive** — no risk scores,
  no triage prediction, no no-show prediction. If that ever changes, ship
  monitoring with the model and never use spend or utilisation as a proxy for
  need.
- [ ] **Measurement page** · medium · 3 days
  Bucket 2 #7. No-show rate, time-to-appointment, note-writing time, booking
  completion, alert override rate. Ship a metric with every feature and put them
  somewhere you actually look.
- [ ] **Doctor profiles** · medium · 3 days
  Patients pick a doctor from a name in a dropdown — no qualifications,
  experience, languages spoken.
- [ ] **Waitlist for full days** · medium · 3 days
  Cancellations already free their slots; nobody is told.
- [ ] **ABDM / ABHA integration** · medium · investigate
  Health ID plus the facility and practitioner registries. Decide early: it
  shapes the patient identity model just rebuilt around `patientId`.

---

## Part C — Sequencing

**Now.** The Tier 1 items that block a launch — audit trail, soft delete,
staging split, rate limiting, sanitisation — plus notifications, built
WhatsApp-shaped so the channel is not rework.

**Next.** The encounter record, designed per Bucket 2 #1. Take longer over the
schema than feels comfortable; getting its shape wrong produces a newer version
of the thing everyone complains about.

**Then.** The patient's complete copy, which is mostly a view over data that
will already exist and delivers DPDP compliance in the same motion.

**After.** Telugu, then ambient scribing, then measurement.

### Two migrations are written and have never been run

```bash
node backend/scripts/migrate-appointment-slots.js --apply   # doctors are unbookable until this runs
node backend/scripts/migrate-aadhaar-minimise.js --apply     # irreversible; export first if needed
```

### The discipline is the product

Every principle in Bucket 2 is easy to state and hard to keep. The pressure to
add copy-forward, to add one more alert, to make a field free-text "just for
now" will be constant, and each individual concession will look reasonable.

That discipline is the only part a competitor cannot copy from a screenshot.

---

## Appendix: how this was verified

Absences were confirmed by search across `backend`, `frontend/src`,
`dashboard/src` and `packages`, excluding `node_modules` and build output:

| Claim | How |
| ----- | --- |
| No rate limiting | no `express-rate-limit` or `rateLimit` |
| No security headers | no `helmet` |
| No sanitisation | no `mongo-sanitize` |
| No notifications | no `nodemailer`, `twilio`, `sendgrid`, `msg91`, `whatsapp` |
| No password reset | no `resetToken` / `forgotPassword` |
| No audit log | no `auditLog` |
| No error tracking | no `sentry` |
| No health check | no `/health`, `/healthz`, `readiness` |
| No tests | no `*.test.*`, `*.spec.*`, `__tests__`, no `test` script in any `package.json` |

Code references were read directly. Anything stated as a design intent rather
than a fact — the note-shape argument, the alert policy — is an opinion, and is
argued rather than asserted.
