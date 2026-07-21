import mongoose from "mongoose";

/**
 * Atomic sequence numbers, for human-facing identifiers.
 *
 * MongoDB has no auto-increment, and the obvious substitute — count the
 * documents and add one — is a race: two registrations a millisecond apart both
 * read the same count and both claim the same number. `findOneAndUpdate` with
 * `$inc` is a single atomic operation on the server, so every caller gets a
 * distinct value even under concurrency.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);

/**
 * The next patient identifier, e.g. "UC-2026-000431".
 *
 * Scoped per calendar year so the running number stays short and readable, and
 * so the year a patient registered is legible on their card. `upsert` creates
 * the counter on the first registration of each year.
 */
export const nextPatientId = async () => {
  const year = new Date().getUTCFullYear();
  const { seq } = await Counter.findOneAndUpdate(
    { _id: `patient-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `UC-${year}-${String(seq).padStart(6, "0")}`;
};
