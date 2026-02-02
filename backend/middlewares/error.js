class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (err, req, res, next) => {
  // Derived into locals rather than written back onto `err` — mutating the
  // incoming error hides the original for anything that inspects it later.
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(", ");
    statusCode = 400;
    message = `An account with this ${fields || "value"} already exists.`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(" ");
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Json Web Token is invalid, Try again!";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Json Web Token is expired, Try again!";
  }

  // Anything still landing on 500 is a genuine server fault, so keep the stack.
  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default ErrorHandler;
