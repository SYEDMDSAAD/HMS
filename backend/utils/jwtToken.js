const COOKIE_EXPIRE_DAYS = Number(process.env.COOKIE_EXPIRE) || 7;

// Shared so logout clears a cookie with the same attributes it was set with.
export const authCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    path: "/",
    // Cross-site cookies are only accepted over HTTPS, so the pair has to move
    // together. In dev (localhost, different ports) "lax" is same-site and works.
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  };
};

// One cookie per role, deliberately not one shared session cookie: a doctor
// signed into the staff portal must not thereby be signed into the patient site
// as themselves, and being signed into one portal grants nothing in another.
const COOKIE_BY_ROLE = {
  Admin: "adminToken",
  Doctor: "doctorToken",
  Patient: "patientToken",
};

const cookieNameFor = (role) => COOKIE_BY_ROLE[role] || "patientToken";

export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  res
    .status(statusCode)
    .cookie(cookieNameFor(user.role), token, {
      ...authCookieOptions(),
      maxAge: COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
    })
    .json({
      success: true,
      message,
      // The password hash is stripped by the toJSON transform on userSchema.
      // The token itself is deliberately not included — it lives in the
      // httpOnly cookie, and echoing it into the body hands it to any script
      // on the page, which is the thing httpOnly exists to prevent.
      user,
    });
};
