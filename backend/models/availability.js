import mongoose from "mongoose";

/**
 * Doctor availability, and the slot arithmetic built on it.
 *
 * The functions here are deliberately pure — they take an availability object
 * and a date and return slots, touching neither the database nor the clock
 * beyond what is passed in. That is what makes the double-booking rules
 * checkable without a live Mongo.
 *
 * ---------------------------------------------------------------------------
 * Time zones
 *
 * Working hours are stored as minutes from local midnight, not as instants: a
 * doctor works "09:00 to 17:00" every Tuesday, and that stays true across any
 * date. Turning that into a real instant needs a zone, and the zone is the
 * hospital's, not the browser's — a patient booking from London must see the
 * same 09:00 slot an Indian patient sees.
 *
 * That conversion is a fixed +05:30 here rather than a call into the Intl
 * time-zone database. India has observed IST with no daylight saving since
 * 1945, so the offset is a constant, and a constant that cannot silently drift
 * is worth more than generality this application will never use. If this
 * hospital ever opens outside India, this is the assumption to delete.
 * ---------------------------------------------------------------------------
 */

export const CLINIC_TIME_ZONE = "Asia/Kolkata";
export const CLINIC_UTC_OFFSET_MINUTES = 330; // +05:30

const MINUTES_PER_DAY = 24 * 60;

/** Default OPD hours. Kept in step with OPD_HOURS in frontend Footer.jsx. */
export const DEFAULT_WEEKLY_HOURS = [
  { dayOfWeek: 1, startMinute: 540, endMinute: 1200 }, // Mon 09:00–20:00
  { dayOfWeek: 2, startMinute: 540, endMinute: 1200 },
  { dayOfWeek: 3, startMinute: 540, endMinute: 1200 },
  { dayOfWeek: 4, startMinute: 540, endMinute: 1200 },
  { dayOfWeek: 5, startMinute: 540, endMinute: 1200 },
  { dayOfWeek: 6, startMinute: 540, endMinute: 1020 }, // Sat 09:00–17:00
  { dayOfWeek: 0, startMinute: 600, endMinute: 780 }, // Sun 10:00–13:00
];

export const DEFAULT_SLOT_MINUTES = 30;

const workingHoursSchema = new mongoose.Schema(
  {
    // 0 = Sunday … 6 = Saturday, matching Date#getUTCDay so no mapping table
    // is needed anywhere.
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startMinute: { type: Number, required: true, min: 0, max: MINUTES_PER_DAY },
    endMinute: { type: Number, required: true, min: 0, max: MINUTES_PER_DAY },
  },
  { _id: false }
);

export const availabilitySchema = new mongoose.Schema(
  {
    slotMinutes: {
      type: Number,
      default: DEFAULT_SLOT_MINUTES,
      min: [5, "A consultation slot cannot be shorter than 5 minutes."],
      max: [180, "A consultation slot cannot be longer than 3 hours."],
    },
    weekly: {
      type: [workingHoursSchema],
      default: () => DEFAULT_WEEKLY_HOURS,
      validate: {
        validator: (hours) =>
          hours.every((h) => h.endMinute > h.startMinute),
        message: "Working hours must end after they start.",
      },
    },
    // Specific dates the doctor is not working — leave, conferences, holidays.
    // "YYYY-MM-DD" in clinic-local terms, because that is how a human names a
    // day off; converting it to an instant would make it ambiguous.
    closedDates: {
      type: [String],
      default: [],
      validate: {
        validator: (dates) => dates.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
        message: "Closed dates must be in YYYY-MM-DD form.",
      },
    },
  },
  { _id: false }
);

/* --- date helpers ------------------------------------------------------- */

export const isDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || "");

/**
 * A clinic-local wall clock time as a real instant.
 *
 * `2026-08-12` + 540 minutes is 09:00 IST, which is 03:30 UTC.
 */
export const clinicTimeToInstant = (dateString, minuteOfDay) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(
    Date.UTC(year, month - 1, day, 0, minuteOfDay - CLINIC_UTC_OFFSET_MINUTES)
  );
};

/** The clinic-local "YYYY-MM-DD" an instant falls on. */
export const instantToClinicDate = (instant) => {
  const shifted = new Date(
    instant.getTime() + CLINIC_UTC_OFFSET_MINUTES * 60_000
  );
  return shifted.toISOString().slice(0, 10);
};

/** 0–6 for the clinic-local weekday an instant falls on. */
export const clinicDayOfWeek = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

/* --- slot generation ---------------------------------------------------- */

/**
 * Every slot a doctor works on a given clinic-local date.
 *
 * Returns instants, not wall-clock strings, so everything downstream — storage,
 * comparison, the unique index — deals in a single unambiguous type. A trailing
 * gap shorter than one slot is dropped rather than rounded up: a 20-minute
 * remainder at the end of the day is not a 30-minute appointment.
 */
export const generateSlots = (availability, dateString) => {
  if (!isDateString(dateString)) return [];

  // No availability at all is a data defect, not a doctor who works the usual
  // hours — the schema requires this field. Falling back to defaults here would
  // invent consultation hours nobody set, and a patient could be sent to the
  // hospital at a time the doctor is not there. An unbookable doctor is the
  // safe failure; run scripts/migrate-appointment-slots.js to set real hours.
  //
  // Defaults still apply *within* an availability object, where a missing
  // slotMinutes is an omission rather than an absence.
  if (!availability) return [];

  const {
    slotMinutes = DEFAULT_SLOT_MINUTES,
    weekly = DEFAULT_WEEKLY_HOURS,
    closedDates = [],
  } = availability;

  if (closedDates.includes(dateString)) return [];

  const dayOfWeek = clinicDayOfWeek(dateString);
  const slots = [];

  for (const window of weekly.filter((h) => h.dayOfWeek === dayOfWeek)) {
    for (
      let minute = window.startMinute;
      minute + slotMinutes <= window.endMinute;
      minute += slotMinutes
    ) {
      slots.push({
        startsAt: clinicTimeToInstant(dateString, minute),
        endsAt: clinicTimeToInstant(dateString, minute + slotMinutes),
      });
    }
  }

  return slots.sort((a, b) => a.startsAt - b.startsAt);
};

/**
 * Whether an instant is the exact start of a slot this doctor actually works.
 *
 * The booking endpoint checks this rather than trusting the client, because the
 * client sends a time and a time is trivially editable. Without it, a crafted
 * request could book 03:00 on a Sunday and the unique index would happily
 * accept it — it only prevents two bookings at the same instant, not one at a
 * nonsense instant.
 */
export const isSlotStart = (availability, instant) => {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    return false;
  }
  const dateString = instantToClinicDate(instant);
  return generateSlots(availability, dateString).some(
    (slot) => slot.startsAt.getTime() === instant.getTime()
  );
};

/** The end of the slot starting at `instant`, or null if it is not a slot. */
export const slotEndFor = (availability, instant) => {
  const dateString = instantToClinicDate(instant);
  const slot = generateSlots(availability, dateString).find(
    (s) => s.startsAt.getTime() === instant.getTime()
  );
  return slot ? slot.endsAt : null;
};
