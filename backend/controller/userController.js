import fs from "fs/promises";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { authCookieOptions, generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

// Whatever we hand back to a client, never the password hash. `select: false`
// on the schema only covers queries — a document returned by User.create()
// still carries the hash, so it has to be stripped explicitly.
const publicProfile = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  gender: user.gender,
  dob: user.dob,
  role: user.role,
  doctorDepartment: user.doctorDepartment,
  docAvatar: user.docAvatar,
});

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : email;

const removeTempFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // The upload already succeeded; a leftover temp file is not worth failing on.
  }
};

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, phone, aadhaar, dob, gender, password } =
    req.body;
  const email = normalizeEmail(req.body.email);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !aadhaar ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    aadhaar,
    dob,
    gender,
    password,
    role: "Patient",
  });

  user.password = undefined;
  generateToken(user, "User Registered!", 201, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { password, role } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!email || !password || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Matching the role in the query means a wrong-portal login fails with the
  // same generic message as a wrong password, rather than confirming that the
  // account exists.
  const user = await User.findOne({ email, role }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  user.password = undefined;
  generateToken(user, "Login Successfully!", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, phone, aadhaar, dob, gender, password } =
    req.body;
  const email = normalizeEmail(req.body.email);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !aadhaar ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    aadhaar,
    dob,
    gender,
    password,
    role: "Admin",
  });

  res.status(201).json({
    success: true,
    message: "New Admin Registered",
    admin: publicProfile(admin),
  });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }
  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }

  const {
    firstName,
    lastName,
    phone,
    aadhaar,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;
  const email = normalizeEmail(req.body.email);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !aadhaar ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment
  ) {
    await removeTempFile(docAvatar.tempFilePath);
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    await removeTempFile(docAvatar.tempFilePath);
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }

  let cloudinaryResponse;
  try {
    cloudinaryResponse = await cloudinary.v2.uploader.upload(
      docAvatar.tempFilePath,
      { folder: "hms/doctors" }
    );
  } catch (error) {
    console.error("Cloudinary Error:", error);
    return next(
      new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
    );
  } finally {
    await removeTempFile(docAvatar.tempFilePath);
  }

  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    aadhaar,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "New Doctor Registered",
    doctor: publicProfile(doctor),
  });
});

// Public endpoint (no auth) — it feeds the patient-facing doctor picker, so it
// must not expose Aadhaar numbers or dates of birth.
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" }).select(
    "firstName lastName email phone gender doctorDepartment docAvatar"
  );
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Logout function for dashboard admin
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    // Same attributes the cookie was set with — a cookie is only replaced when
    // name, path and domain all match.
    .cookie("adminToken", "", { ...authCookieOptions(), expires: new Date(0) })
    .json({
      success: true,
      message: "Admin Logged Out Successfully.",
    });
});

// Logout function for frontend patient
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", "", {
      ...authCookieOptions(),
      expires: new Date(0),
    })
    .json({
      success: true,
      message: "Patient Logged Out Successfully.",
    });
});
