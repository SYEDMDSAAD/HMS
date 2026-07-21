import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DEPARTMENTS, GENDERS } from "./appointmentSchema.js";
import { availabilitySchema } from "./availability.js";
import { nextPatientId } from "./counterSchema.js";

export const ROLES = ["Patient", "Doctor", "Admin"];

const userSchema = new mongoose.Schema(
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
      unique: true,
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
    // The hospital's own identifier, and the one a patient is known by. It
    // replaced Aadhaar in this role: a national ID should not be a primary key,
    // and the uniqueness Aadhaar was providing here was already guaranteed by
    // the unique email above, so the full number bought nothing.
    patientId: {
      type: String,
      unique: true,
      sparse: true, // doctors and admins have none
      trim: true,
    },
    // Four digits, not twelve.
    //
    // Storing full Aadhaar numbers is restricted for private entities under the
    // Aadhaar Act, and this application never read the other eight: no lookup,
    // no verification, no display. What a front desk actually does is check the
    // last four against the card the patient is holding, and that is all this
    // supports. Optional, because a patient without a card must still be able
    // to book.
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
    password: {
      type: String,
      required: [true, "Password Is Required!"],
      minLength: [8, "Password Must Contain At Least 8 Characters!"],
      select: false,
    },
    role: {
      type: String,
      required: [true, "User Role Required!"],
      enum: { values: ROLES, message: "Select A Valid Role!" },
      index: true,
    },
    doctorDepartment: {
      type: String,
      trim: true,
      // Departments must match the list appointments are booked against,
      // otherwise a doctor can never be found by the booking lookup.
      enum: {
        values: [...DEPARTMENTS, null, undefined],
        message: "Select A Valid Department!",
      },
      required: [
        function () {
          return this.role === "Doctor";
        },
        "Department Is Required For A Doctor!",
      ],
    },
    docAvatar: {
      public_id: String,
      url: String,
    },
    // Doctors only. Left undefined for patients and admins rather than given a
    // default, so that "has no availability" and "works the default hours" stay
    // distinguishable — a doctor row created before this field existed should
    // not silently start accepting bookings at hours nobody set.
    availability: {
      type: availabilitySchema,
      required: [
        function () {
          return this.role === "Doctor";
        },
        "Availability Is Required For A Doctor!",
      ],
    },
  },
  { timestamps: true }
);

// Last line of defence against leaking the hash: res.json() calls toJSON, so
// even a handler that forgets to strip the field cannot serialise it.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

// Patients get an identifier on first save. Doctors and admins do not — they
// are staff, and a patient number would imply a medical record that is not there.
userSchema.pre("save", async function (next) {
  if (this.role === "Patient" && !this.patientId) {
    this.patientId = await nextPatientId();
  }
  next();
});

userSchema.pre("save", async function (next) {
  // Without the return, an unrelated save() would re-hash the existing hash and
  // lock the account out permanently.
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  // `password` has select: false, so a document fetched without an explicit
  // .select("+password") would otherwise fail inside bcrypt.
  if (!this.password) {
    throw new Error(
      "Password not selected on this document — query with .select(\"+password\")."
    );
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export const User = mongoose.model("User", userSchema);
