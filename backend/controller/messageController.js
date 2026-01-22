import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Message } from "../models/messageSchema.js";

const trim = (value) => (typeof value === "string" ? value.trim() : value);

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const firstName = trim(req.body.firstName);
  const lastName = trim(req.body.lastName);
  const email = trim(req.body.email);
  const phone = trim(req.body.phone);
  const message = trim(req.body.message);

  if (!firstName || !lastName || !email || !phone || !message) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  await Message.create({ firstName, lastName, email, phone, message });

  res.status(201).json({
    success: true,
    message: "Message Sent!",
  });
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find().sort({ _id: -1 });
  res.status(200).json({
    success: true,
    messages,
  });
});
