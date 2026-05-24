/**
 * Backfills `aadhaar` on user documents created before the nic -> aadhaar rename.
 *
 * Why this is needed: userSchema declares `aadhaar` as required and unique.
 * Existing documents have no such field, so MongoDB sees N documents with
 * aadhaar: null and refuses to build the unique index — silently, until the
 * index-error listener in dbConnection.js started reporting it. Until every
 * document has a distinct aadhaar, that constraint does not exist.
 *
 *   Dry run (default, writes nothing):
 *     node scripts/migrate-aadhaar.js
 *
 *   Apply:
 *     node scripts/migrate-aadhaar.js --apply
 *
 *   Also remove the dead `nic` field (optional, after you are satisfied):
 *     node scripts/migrate-aadhaar.js --apply --drop-nic
 *
 * Safe to re-run: documents that already have an aadhaar are skipped, and
 * nothing is deleted unless --drop-nic is passed.
 */
import "../config/loadEnv.js";
import mongoose from "mongoose";

const APPLY = process.argv.includes("--apply");
const DROP_NIC = process.argv.includes("--drop-nic");

// Obviously-synthetic placeholders: valid shape (12 digits, first digit 2-9)
// but the 9999 prefix makes them easy to spot and replace later.
const PLACEHOLDER_PREFIX = "9999";
const placeholderFor = (n) =>
  PLACEHOLDER_PREFIX + String(n).padStart(8, "0");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "HMS",
    serverSelectionTimeoutMS: 10000,
  });
  const users = mongoose.connection.collection("users");

  const missing = await users
    .find(
      { $or: [{ aadhaar: { $exists: false } }, { aadhaar: null }] },
      { projection: { email: 1, role: 1, nic: 1 } }
    )
    .sort({ _id: 1 })
    .toArray();

  // Never collide with an aadhaar that already exists.
  const taken = new Set(
    (await users.distinct("aadhaar", { aadhaar: { $type: "string" } })) || []
  );

  console.log(
    `${missing.length} user document(s) without an aadhaar.` +
      (APPLY ? "" : "  [DRY RUN — nothing will be written]")
  );

  let counter = 1;
  const plan = [];
  for (const user of missing) {
    let value = placeholderFor(counter++);
    while (taken.has(value)) value = placeholderFor(counter++);
    taken.add(value);
    plan.push({ _id: user._id, email: user.email, role: user.role, value });
  }

  for (const item of plan) {
    console.log(
      `  ${String(item.role).padEnd(8)} ${String(item.email).padEnd(26)} ` +
        `aadhaar -> ${item.value}`
    );
  }

  if (DROP_NIC) {
    const withNic = await users.countDocuments({ nic: { $exists: true } });
    console.log(
      `\n${withNic} document(s) still carry a \`nic\` field; --drop-nic will unset it.`
    );
  }

  if (!APPLY) {
    console.log("\nRe-run with --apply to write these changes.");
    await mongoose.disconnect();
    return;
  }

  for (const item of plan) {
    await users.updateOne({ _id: item._id }, { $set: { aadhaar: item.value } });
  }
  console.log(`\nUpdated ${plan.length} document(s).`);

  if (DROP_NIC) {
    const res = await users.updateMany(
      { nic: { $exists: true } },
      { $unset: { nic: "" } }
    );
    console.log(`Removed \`nic\` from ${res.modifiedCount} document(s).`);
  }

  // Build the index now so success or failure is visible here rather than on
  // the next server boot.
  try {
    await users.createIndex({ aadhaar: 1 }, { unique: true, background: true });
    console.log("Unique index on aadhaar: BUILT");
  } catch (error) {
    console.error("Unique index on aadhaar FAILED:", error.message);
  }

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
