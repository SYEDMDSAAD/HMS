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
    aadhaar: {
      type: String,
      required: [true, "Aadhaar Number Is Required!"],
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
    appointment_date: {
      type: String,
      required: [true, "Appointment Date Is Required!"],
      trim: true,
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

export const Appointment = mongoose.model("Appointment", appointmentSchema);
