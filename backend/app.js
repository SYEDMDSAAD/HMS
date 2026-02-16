// Must stay first — it populates process.env before any other module is
// evaluated. See config/loadEnv.js.
import "./config/loadEnv.js";

import os from "os";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import ErrorHandler, { errorMiddleware } from "./middlewares/error.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET_KEY", "JWT_EXPIRES", "PORT"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}\n` +
      "Copy backend/config/config.env.example to backend/config/config.env and fill it in."
  );
  process.exit(1);
}

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL_ONE,
  process.env.FRONTEND_URL_TWO,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    // Note: the option is `methods`, not `method` — the misspelling was silently
    // ignored, leaving the permissive default in place.
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    // os.tmpdir() instead of a hardcoded "/tmp/" so this also works on Windows.
    tempFileDir: os.tmpdir(),
    // Doctor avatars only. Without a cap, any upload size is accepted and
    // written to disk before the controller ever sees it.
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: "Avatar must be 5MB or smaller.",
  })
);

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);

dbConnection();

// Unmatched routes returned Express's default HTML 404, which breaks clients
// that always parse the response as JSON.
app.use((req, res, next) => {
  next(new ErrorHandler(`Route ${req.originalUrl} not found.`, 404));
});

app.use(errorMiddleware);

export default app;
