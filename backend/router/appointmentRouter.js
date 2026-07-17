import express from "express";
import mongoose from "mongoose";
import {
  deleteAppointment,
  getAllAppointments,
  getAvailability,
  postAppointment,
  updateAppointmentStatus,
} from "../controller/appointmentController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";
import ErrorHandler from "../middlewares/error.js";

const router = express.Router();

// Reject malformed ids up front. Without this a bad id reaches Mongoose and
// comes back as a CastError reading "Invalid _id", which means nothing to a user.
router.param("id", (req, res, next, value) => {
  if (!mongoose.isValidObjectId(value)) {
    return next(new ErrorHandler("Invalid appointment ID.", 400));
  }
  next();
});

// Public, like GET /user/doctors: someone deciding whether to register should
// be able to see whether the doctor they want has any free time at all.
router.get("/availability", getAvailability);

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;
