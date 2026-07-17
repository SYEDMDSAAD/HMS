/**
 * Moves appointments from a bare `appointment_date` string onto real
 * `startsAt` / `endsAt` instants, and backfills doctor `availability`.
 *
 * Why this is needed: appointment_date was a "YYYY-MM-DD" String. It carried no
 * time, so two appointments with the same doctor on the same day were
 * indistinguishable, and the unique index that now prevents double-booking
 * cannot be built while documents have no startsAt.
 *
 *   Dry run (default, writes nothing):
 *     node scripts/migrate-appointment-slots.js
 *
 *   Apply:
 *     node scripts/migrate-appointment-slots.js --apply
 *
 *   Also remove the dead appointment_date field (optional, once satisfied):
 *     node scripts/migrate-appointment-slots.js --apply --drop-legacy
 *
 * Safe to re-run: documents that already have startsAt are skipped.
 *
 * ---------------------------------------------------------------------------
 * The part that needs a human decision
 *
 * A date has no time in it, so this script has to invent one, and there is no
 * correct answer — only defensible ones. It assigns each appointment the first
 * consultation slot of its day that is not already taken, in creation order,
 * which keeps every booking on the day the patient chose and never collides.
 *
 * What it does NOT do is pretend that is what the patient asked for. Anything
 * it touches is marked `slotWasInferred: true`, so the front desk can see which
 * times were reconstructed and confirm them. Report on that field before
 * treating historical times as real.
 * ---------------------------------------------------------------------------
 */
import "../config/loadEnv.js";
import mongoose from "mongoose";
import {
  DEFAULT_SLOT_MINUTES,
  DEFAULT_WEEKLY_HOURS,
  generateSlots,
} from "../models/availability.js";

const APPLY = process.argv.includes("--apply");
const DROP_LEGACY = process.argv.includes("--drop-legacy");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "HMS",
    serverSelectionTimeoutMS: 10000,
  });

  const users = mongoose.connection.collection("users");
  const appointments = mongoose.connection.collection("appointments");

  /* --- 1. doctors without availability get the default OPD hours --------- */

  const doctorsMissing = await users
    .find({ role: "Doctor", availability: { $exists: false } })
    .toArray();

  console.log(
    `Doctors without availability: ${doctorsMissing.length}` +
      (doctorsMissing.length ? " → default OPD hours" : "")
  );

  if (APPLY && doctorsMissing.length) {
    await users.updateMany(
      { role: "Doctor", availability: { $exists: false } },
      {
        $set: {
          availability: {
            slotMinutes: DEFAULT_SLOT_MINUTES,
            weekly: DEFAULT_WEEKLY_HOURS,
            closedDates: [],
          },
        },
      }
    );
  }

  /* --- 2. appointments get instants ------------------------------------- */

  const pending = await appointments
    .find({ startsAt: { $exists: false } })
    .sort({ _id: 1 })
    .toArray();

  console.log(`Appointments needing startsAt: ${pending.length}`);

  // doctorId + date -> slots already handed out in this run, so two
  // appointments for one doctor on one day cannot be given the same instant.
  const usedByDoctorDate = new Map();

  // Slots already occupied by appointments migrated in an earlier run.
  for (const existing of await appointments
    .find({ startsAt: { $exists: true } })
    .project({ doctorId: 1, startsAt: 1 })
    .toArray()) {
    const key = `${existing.doctorId}`;
    if (!usedByDoctorDate.has(key)) usedByDoctorDate.set(key, new Set());
    usedByDoctorDate.get(key).add(new Date(existing.startsAt).getTime());
  }

  const availabilityByDoctor = new Map();
  const getAvailability = async (doctorId) => {
    const key = `${doctorId}`;
    if (!availabilityByDoctor.has(key)) {
      const doctor = await users.findOne({ _id: doctorId });
      availabilityByDoctor.set(
        key,
        doctor?.availability || {
          slotMinutes: DEFAULT_SLOT_MINUTES,
          weekly: DEFAULT_WEEKLY_HOURS,
          closedDates: [],
        }
      );
    }
    return availabilityByDoctor.get(key);
  };

  let migrated = 0;
  const unresolved = [];

  for (const appointment of pending) {
    const dateString = String(appointment.appointment_date || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      unresolved.push({ _id: appointment._id, reason: "unparseable date", value: appointment.appointment_date });
      continue;
    }

    const availability = await getAvailability(appointment.doctorId);
    const slots = generateSlots(availability, dateString);
    if (slots.length === 0) {
      // The doctor does not work that weekday. Rather than invent a time
      // outside their hours, leave it for a human.
      unresolved.push({ _id: appointment._id, reason: "no slots that day", value: dateString });
      continue;
    }

    const key = `${appointment.doctorId}`;
    if (!usedByDoctorDate.has(key)) usedByDoctorDate.set(key, new Set());
    const used = usedByDoctorDate.get(key);

    const slot = slots.find((s) => !used.has(s.startsAt.getTime()));
    if (!slot) {
      unresolved.push({ _id: appointment._id, reason: "day fully booked", value: dateString });
      continue;
    }
    used.add(slot.startsAt.getTime());

    if (APPLY) {
      await appointments.updateOne(
        { _id: appointment._id },
        {
          $set: {
            startsAt: slot.startsAt,
            endsAt: slot.endsAt,
            slotWasInferred: true,
            slotHeld: appointment.status !== "Rejected",
          },
        }
      );
    }
    migrated += 1;
  }

  console.log(`${APPLY ? "Migrated" : "Would migrate"}: ${migrated}`);

  if (unresolved.length) {
    console.log(`\nNeeds a human (${unresolved.length}):`);
    for (const row of unresolved) {
      console.log(`  ${row._id}  ${row.reason}  (${row.value})`);
    }
  }

  if (DROP_LEGACY) {
    const stillMissing = await appointments.countDocuments({
      startsAt: { $exists: false },
    });
    if (stillMissing > 0) {
      console.log(
        `\nRefusing --drop-legacy: ${stillMissing} appointment(s) still have no startsAt. ` +
          `Dropping appointment_date now would destroy the only copy of their date.`
      );
    } else if (APPLY) {
      const { modifiedCount } = await appointments.updateMany(
        { appointment_date: { $exists: true } },
        { $unset: { appointment_date: "" } }
      );
      console.log(`\nDropped appointment_date from ${modifiedCount} document(s).`);
    } else {
      console.log("\nWould drop appointment_date (re-run with --apply).");
    }
  }

  if (!APPLY) {
    console.log("\nDry run — nothing was written. Re-run with --apply.");
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
