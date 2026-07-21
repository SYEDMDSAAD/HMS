import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {
  Appointment,
  APPOINTMENT_STATUSES,
} from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import {
  CLINIC_TIME_ZONE,
  generateSlots,
  isDateString,
  isSlotStart,
  slotEndFor,
} from "../models/availability.js";

/**
 * Which slots a doctor has free on a clinic-local date.
 *
 * Public, like the doctor list it accompanies: someone deciding whether to
 * register should be able to see whether there is any point.
 */
export const getAvailability = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, date } = req.query;

  if (!isDateString(date)) {
    return next(new ErrorHandler("Provide a date as YYYY-MM-DD.", 400));
  }

  const doctor = await User.findOne({ _id: doctorId, role: "Doctor" }).select(
    "availability firstName lastName"
  );
  if (!doctor) {
    return next(new ErrorHandler("Doctor not found.", 404));
  }

  const slots = generateSlots(doctor.availability, date);

  // One query for the whole day rather than one per slot.
  const taken = await Appointment.find({
    doctorId,
    slotHeld: true,
    startsAt: {
      $gte: slots[0]?.startsAt ?? new Date(0),
      $lte: slots.at(-1)?.startsAt ?? new Date(0),
    },
  }).select("startsAt");

  const takenTimes = new Set(taken.map((a) => a.startsAt.getTime()));
  const now = Date.now();

  res.status(200).json({
    success: true,
    timeZone: CLINIC_TIME_ZONE,
    // Lets the caller distinguish "fully booked" from "this doctor has no
    // consultation hours set", which look identical as an empty slot list and
    // need completely different actions from the front desk.
    configured: Boolean(doctor.availability),
    doctor: { firstName: doctor.firstName, lastName: doctor.lastName },
    slots: slots.map((slot) => ({
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      // A slot earlier today is gone, not merely booked. Saying so keeps the
      // patient from clicking it and being told it is unavailable.
      available:
        !takenTimes.has(slot.startsAt.getTime()) &&
        slot.startsAt.getTime() > now,
    })),
  });
});

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    aadhaarLast4,
    dob,
    gender,
    startsAt,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !dob ||
    !gender ||
    !startsAt ||
    !department ||
    !doctor_firstName ||
    !doctor_lastName ||
    !address
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const matchingDoctors = await User.find({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  }).select("_id availability");

  if (matchingDoctors.length === 0) {
    return next(new ErrorHandler("Doctor not found", 404));
  }
  if (matchingDoctors.length > 1) {
    return next(
      new ErrorHandler(
        "Doctors Conflict! Please Contact Through Email Or Phone!",
        400
      )
    );
  }

  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    aadhaarLast4,
    dob,
    gender,
    startsAt,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited: Boolean(hasVisited),
    address,
    doctorId: matchingDoctors[0]._id,
    patientId: req.user._id,
  });

  res.status(201).json({
    success: true,
    appointment,
    message: "Appointment booked successfully!",
  });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find().sort({ _id: -1 });
  res.status(200).json({
    success: true,
    appointments,
  });
});

export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!APPOINTMENT_STATUSES.includes(status)) {
      return next(
        new ErrorHandler(
          `Status must be one of: ${APPOINTMENT_STATUSES.join(", ")}`,
          400
        )
      );
    }

    // Only the status is writable here — taking req.body wholesale would let a
    // caller rewrite patientId, doctorId or any other field on the record.
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }

    res.status(200).json({
      success: true,
      appointment,
      message: "Appointment Status Updated!",
    });
  }
);

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findByIdAndDelete(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  }
  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});
