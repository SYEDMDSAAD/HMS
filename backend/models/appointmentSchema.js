import mongoose from "mongoose";
import validator from "validator";

// Shared so the controllers and both frontends can validate against one list
// instead of each keeping their own copy.
export const DEPARTMENTS = [
  "General Medicine",
  "Pediatrics",
  "Orthopedics",
  "Cardiology",
  "Neurology",
  "Oncology",
  "Radiology",
  "Physical Therapy",
  "Dermatology",
  "Gynaecology",
  "Dentistry",
  "Psychiatry",
  "ENT",
];

export const APPOINTMENT_STATUSES = ["Pending", "Accepted", "Rejected"];

export const GENDERS = ["Male", "Female", "Other"];

const appointmentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name Is Required!"],
      trim: true,
      minLength: [3, "First Name Must Contain At Least 3 Characters!"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name Is Required!"],
      trim: true,
      minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
    },
    email: {
      type: String,
      required: [true, "Email Is Required!"],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Provide A Valid Email!"],
    },
    phone: {
      type: String,
      required: [true, "Phone Is Required!"],
      trim: true,
      // Indian mobile numbers are 10 digits and always start 6-9.
      match: [
        /^[6-9]\d{9}$/,
        "Provide A Valid 10-Digit Indian Mobile Number!",
      ],
    },
    // See userSchema for why this is four digits and not twelve. The
    // appointment kept its own copy of the full number, so the same data was
    // exposed twice over.
    aadhaarLast4: {
      type: String,
      trim: true,
      match: [/^\d{4}$/, "Provide The Last 4 Digits Of The Aadhaar Number!"],
    },
    dob: {
      type: Date,
      required: [true, "DOB Is Required!"],
      validate: {
        validator: (value) => value <= new Date(),
        message: "Date Of Birth Cannot Be In The Future!",
      },
    },
    gender: {
      type: String,
      required: [true, "Gender Is Required!"],
      enum: { values: GENDERS, message: "Select A Valid Gender!" },
    },
    // The instant the consultation starts, in UTC. This replaced a bare
    // "YYYY-MM-DD" string, which could not express a time, could not be
    // compared or sorted correctly, and made double-booking undetectable —
    // every appointment on a given day looked identical to every other.
    // backend/scripts/migrate-appointment-slots.js backfills it.
    startsAt: {
      type: Date,
      required: [true, "Appointment Time Is Required!"],
      index: true,
    },
    endsAt: {
      type: Date,
      required: [true, "Appointment End Time Is Required!"],
    },
    // Mirrors "this appointment is not Rejected", maintained by the hooks
    // below. It exists so the unique index can be a *partial* one: a rejected
    // appointment must stop holding its slot, and MongoDB's partial filters
    // support $eq but not $ne, so the negation has to be precomputed into a
    // field rather than expressed in the index.
    slotHeld: {
      type: Boolean,
      default: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department Name Is Required!"],
      enum: { values: DEPARTMENTS, message: "Select A Valid Department!" },
    },
    doctor: {
      firstName: {
        type: String,
        required: [true, "Doctor Name Is Required!"],
        trim: true,
      },
      lastName: {
        type: String,
        required: [true, "Doctor Name Is Required!"],
        trim: true,
      },
    },
    hasVisited: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: [true, "Address Is Required!"],
      trim: true,
    },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Doctor Id Is Invalid!"],
      index: true,
    },
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id Is Required!"],
      index: true,
    },
    status: {
      type: String,
      enum: { values: APPOINTMENT_STATUSES, message: "Select A Valid Status!" },
      default: "Pending",
    },
  },
  { timestamps: true }
);

/* Keep slotHeld in step with status, on both write paths.
 *
 * save() and findOneAndUpdate() do not share hooks, and the admin status
 * endpoint uses the second — so a rejection through the dashboard would leave
 * slotHeld true and the slot permanently blocked if only the save hook existed.
 */
const heldFor = (status) => status !== "Rejected";

appointmentSchema.pre("save", function (next) {
  this.slotHeld = heldFor(this.status);
  next();
});

appointmentSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() || {};
  const status = update.status ?? update.$set?.status;
  if (status !== undefined) {
    this.set({ slotHeld: heldFor(status) });
  }
  next();
});

/* One doctor cannot be in two places at once.
 *
 * This is the actual guarantee — not the availability check in the controller,
 * which two simultaneous requests can both pass before either writes. The
 * database rejects the loser of that race with E11000, and the controller turns
 * that into "someone just took this slot".
 *
 * Partial, so that rejecting an appointment frees the slot for rebooking.
 */
appointmentSchema.index(
  { doctorId: 1, startsAt: 1 },
  {
    unique: true,
    partialFilterExpression: { slotHeld: true },
    name: "one_appointment_per_doctor_per_slot",
  }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
