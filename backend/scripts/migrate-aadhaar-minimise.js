/**
 * Reduces stored Aadhaar numbers to their last four digits, and gives every
 * patient a hospital-issued identifier.
 *
 * Why: the application stored the full twelve digits on every user *and* copied
 * them onto every appointment, while reading none of them — no lookup, no
 * verification, no display. The uniqueness it provided was already guaranteed
 * by the unique email. Storing full Aadhaar numbers is restricted for private
 * entities under the Aadhaar Act, so this was exposure in exchange for nothing.
 *
 *   Dry run (default, writes nothing):
 *     node scripts/migrate-aadhaar-minimise.js
 *
 *   Apply:
 *     node scripts/migrate-aadhaar-minimise.js --apply
 *
 * ---------------------------------------------------------------------------
 * THIS IS NOT REVERSIBLE.
 *
 * `--apply` overwrites the full numbers with their last four digits and drops
 * the original field. There is no undo and no copy kept anywhere. If you need
 * the full numbers for anything — a paper process, a migration into another
 * system — export them first and store that export somewhere you are willing
 * to defend.
 *
 * It also drops the unique index on users.aadhaar. That index is what made two
 * accounts with the same Aadhaar impossible; email uniqueness still prevents
 * duplicate accounts, but the Aadhaar-level constraint is gone by design.
 * ---------------------------------------------------------------------------
 */
import "../config/loadEnv.js";
import mongoose from "mongoose";

const APPLY = process.argv.includes("--apply");

const lastFour = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 4 ? digits.slice(-4) : null;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "HMS",
    serverSelectionTimeoutMS: 10000,
  });

  const users = mongoose.connection.collection("users");
  const appointments = mongoose.connection.collection("appointments");
  const counters = mongoose.connection.collection("counters");

  /* --- 1. users: truncate, and issue patient identifiers ----------------- */

  const withAadhaar = await users
    .find({ aadhaar: { $exists: true } })
    .sort({ _id: 1 })
    .toArray();

  const patients = withAadhaar.filter((u) => u.role === "Patient");
  const unparseable = withAadhaar.filter((u) => !lastFour(u.aadhaar));

  console.log(`Users with a stored aadhaar: ${withAadhaar.length}`);
  console.log(`  of those, patients needing an ID: ${patients.length}`);
  if (unparseable.length) {
    console.log(
      `  ${unparseable.length} have fewer than 4 digits and will get no last4:`
    );
    for (const u of unparseable) console.log(`    ${u._id}  ${u.email}`);
  }

  if (APPLY) {
    // One sequence shared with nextPatientId() in models/counterSchema.js, so
    // that identifiers issued here and at registration cannot collide.
    const year = new Date().getUTCFullYear();
    let issued = 0;

    for (const user of withAadhaar) {
      const set = {};
      const last4 = lastFour(user.aadhaar);
      if (last4) set.aadhaarLast4 = last4;

      if (user.role === "Patient" && !user.patientId) {
        const { seq } = await counters.findOneAndUpdate(
          { _id: `patient-${year}` },
          { $inc: { seq: 1 } },
          { upsert: true, returnDocument: "after" }
        );
        set.patientId = `UC-${year}-${String(seq).padStart(6, "0")}`;
        issued += 1;
      }

      await users.updateOne(
        { _id: user._id },
        { $set: set, $unset: { aadhaar: "" } }
      );
    }
    console.log(`Truncated ${withAadhaar.length} user(s); issued ${issued} ID(s).`);

    // The unique index on the now-absent field would otherwise keep enforcing
    // uniqueness across documents that all have aadhaar: null.
    const indexes = await users.indexes();
    for (const index of indexes) {
      if (Object.keys(index.key).includes("aadhaar")) {
        await users.dropIndex(index.name);
        console.log(`Dropped index ${index.name} on users.aadhaar.`);
      }
    }
  }

  /* --- 2. appointments: the second copy ---------------------------------- */

  const appointmentsWithAadhaar = await appointments
    .find({ aadhaar: { $exists: true } })
    .toArray();

  console.log(`Appointments with a stored aadhaar: ${appointmentsWithAadhaar.length}`);

  if (APPLY) {
    for (const appointment of appointmentsWithAadhaar) {
      const last4 = lastFour(appointment.aadhaar);
      await appointments.updateOne(
        { _id: appointment._id },
        {
          ...(last4 ? { $set: { aadhaarLast4: last4 } } : {}),
          $unset: { aadhaar: "" },
        }
      );
    }
    console.log(`Truncated ${appointmentsWithAadhaar.length} appointment(s).`);
  }

  if (!APPLY) {
    console.log(
      "\nDry run — nothing was written." +
        "\nRe-run with --apply. This cannot be undone; export the full numbers first if you need them."
    );
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
