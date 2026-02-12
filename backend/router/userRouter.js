import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
  login,
  logoutAdmin,
  logoutPatient,
  patientRegister,
} from "../controller/userController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

// --- Public ---
router.post("/patient/register", patientRegister);
router.post("/login", login);

// Feeds the doctor picker on the public booking form. The controller projects
// away Aadhaar and DOB precisely because this route has no auth.
router.get("/doctors", getAllDoctors);

// Logging out only clears a cookie, so it must not require a valid session —
// otherwise an expired token leaves the user unable to log out at all.
router.post("/patient/logout", logoutPatient);
router.post("/admin/logout", logoutAdmin);

// --- Patient ---
router.get("/patient/me", isPatientAuthenticated, getUserDetails);

// --- Admin ---
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

export default router;
