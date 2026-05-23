import app from "./app.js";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Not fatal — only doctor avatar uploads need Cloudinary — but failing at the
// point of upload with "Must supply api_key" is a confusing way to find out.
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(
    "Cloudinary credentials are incomplete. Adding a doctor will fail until they are set."
  );
}

const server = app.listen(process.env.PORT, () => {
  console.log(
    `Server listening at port ${process.env.PORT} (${
      process.env.NODE_ENV || "development"
    })`
  );
});

// Close the HTTP server and the database connection before exiting, so
// in-flight requests finish and Mongo does not log an abrupt disconnect.
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down.`);
  // This disconnect is deliberate, so drop the listener that warns about
  // unexpected ones.
  mongoose.connection.removeAllListeners("disconnected");
  server.close(async () => {
    await mongoose.connection.close(false).catch(() => {});
    console.log("Closed HTTP server and database connection.");
    process.exit(0);
  });

  // Do not hang forever if a connection refuses to close.
  setTimeout(() => {
    console.error("Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// A rejection that reaches this point is a bug we failed to catch. Log it with
// its stack instead of letting Node print a bare trace and exit.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});
