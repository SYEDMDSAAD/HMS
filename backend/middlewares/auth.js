import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

// The two portals differ only in cookie name and expected role, so the
// middleware is built once and specialised below.
const authenticate = (cookieName, requiredRole, label) =>
  catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies[cookieName];
    if (!token) {
      return next(new ErrorHandler(`${label} is not authenticated!`, 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id);
    // A token can outlive the account it was issued for. Without this the next
    // line would throw on `null.role` and surface as a 500.
    if (!user) {
      return next(new ErrorHandler(`${label} is not authenticated!`, 401));
    }

    if (user.role !== requiredRole) {
      return next(
        new ErrorHandler(`${user.role} not authorized for this resource!`, 403)
      );
    }

    req.user = user;
    next();
  });

// Middleware to authenticate dashboard users
export const isAdminAuthenticated = authenticate(
  "adminToken",
  "Admin",
  "Dashboard User"
);

// Middleware to authenticate frontend users
export const isPatientAuthenticated = authenticate(
  "patientToken",
  "Patient",
  "User"
);

// Middleware to authenticate the doctor portal
export const isDoctorAuthenticated = authenticate(
  "doctorToken",
  "Doctor",
  "Doctor"
);

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorHandler("Not authenticated!", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resource!`,
          403
        )
      );
    }
    next();
  };
};
