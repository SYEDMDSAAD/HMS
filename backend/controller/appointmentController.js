import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {
  Appointment,
  APPOINTMENT_STATUSES,
} from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import {
  CLINIC_TIME_ZONE,
  clinicTimeToInstant,
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

const SORTS = {
  soonest: { startsAt: 1 },
  latest: { startsAt: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

/**
 * The admin list: searched, filtered, sorted and paged on the server.
 *
 * It used to return every appointment ever booked, unbounded. That is fine at
 * ten and a problem at ten thousand — the whole collection crosses the wire and
 * the browser filters it, so the slowest machine does the most work. Doing it
 * here means the query is answered by the indexes.
 */
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const sort = SORTS[req.query.sort] || SORTS.soonest;

  const filter = {};

  if (req.query.status && APPOINTMENT_STATUSES.includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (req.query.department) {
    filter.department = req.query.department;
  }

  const search = (req.query.search || "").trim();
  if (search) {
    // Escaped before it reaches the regex: an unescaped "(" from a search box
    // is a syntax error that surfaces as a 500, and patterns like "(a+)+" are a
    // denial of service against the database.
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(safe, "i");
    filter.$or = [
      { firstName: pattern },
      { lastName: pattern },
      { email: pattern },
      { phone: pattern },
      { "doctor.firstName": pattern },
      { "doctor.lastName": pattern },
    ];
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    appointments,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

/** A patient's own appointments, soonest first. */
export const getMyAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find({ patientId: req.user._id }).sort({
    startsAt: -1,
  });
  res.status(200).json({ success: true, appointments });
});

/**
 * A patient cancelling their own appointment.
 *
 * Separate from the admin status endpoint rather than sharing it, because the
 * rules are different: a patient may only ever set Cancelled, only on their own
 * booking, and only before it happens. Routing this through the admin endpoint
 * with a role check would put those three rules one forgotten condition away
 * from letting a patient mark themselves Accepted.
 */
export const cancelMyAppointment = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    patientId: req.user._id,
  });

  if (!appointment) {
    // Deliberately the same 404 a stranger's id would produce: distinguishing
    // "not yours" from "does not exist" tells an attacker which ids are real.
    return next(new ErrorHandler("Appointment not found!", 404));
  }
  if (appointment.status === "Cancelled") {
    return next(new ErrorHandler("That appointment is already cancelled.", 400));
  }
  if (["Rejected", "Completed"].includes(appointment.status)) {
    return next(
      new ErrorHandler(
        `A ${appointment.status.toLowerCase()} appointment cannot be cancelled.`,
        400
      )
    );
  }
  if (appointment.startsAt.getTime() <= Date.now()) {
    return next(
      new ErrorHandler(
        "That appointment has already started. Please call the front desk.",
        400
      )
    );
  }

  appointment.status = "Cancelled";
  // save(), not findByIdAndUpdate — the pre-save hook is what releases the slot.
  await appointment.save();

  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment cancelled.",
  });
});

/** A doctor's own schedule. */
export const getDoctorAppointments = catchAsyncErrors(async (req, res, next) => {
  const filter = { doctorId: req.user._id };

  if (isDateString(req.query.date)) {
    const [start] = generateSlots(req.user.availability, req.query.date);
    if (start) {
      const dayStart = clinicTimeToInstant(req.query.date, 0);
      const dayEnd = clinicTimeToInstant(req.query.date, 24 * 60);
      filter.startsAt = { $gte: dayStart, $lt: dayEnd };
    }
  }

  const appointments = await Appointment.find(filter).sort({ startsAt: 1 });
  res.status(200).json({ success: true, appointments });
});

/** A doctor marking their own appointment as seen. */
export const completeAppointment = catchAsyncErrors(async (req, res, next) => {
  const appointment = await Appointment.findOne({
    _id: req.params.id,
    doctorId: req.user._id,
  });

  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }
  if (appointment.status !== "Accepted") {
    return next(
      new ErrorHandler(
        "Only an accepted appointment can be marked complete.",
        400
      )
    );
  }

  appointment.status = "Completed";
  appointment.hasVisited = true;
  await appointment.save();

  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment marked complete.",
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
