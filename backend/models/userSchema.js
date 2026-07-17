import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DEPARTMENTS, GENDERS } from "./appointmentSchema.js";
import { availabilitySchema } from "./availability.js";

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
    aadhaar: {
      type: String,
      required: [true, "Aadhaar Number Is Required!"],
      unique: true,
      trim: true,
      // 12 digits, never starting with 0 or 1.
      match: [/^[2-9]\d{11}$/, "Provide A Valid 12-Digit Aadhaar Number!"],
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
