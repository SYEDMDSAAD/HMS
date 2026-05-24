import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {
  Appointment,
  APPOINTMENT_STATUSES,
} from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    aadhaar,
    dob,
    gender,
    appointment_date,
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
    !aadhaar ||
    !dob ||
    !gender ||
    !appointment_date ||
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
  }).select("_id");

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
    aadhaar,
    dob,
    gender,
    appointment_date,
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
