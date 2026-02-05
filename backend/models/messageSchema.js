import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name Is Required!"],
      trim: true,
      minLength: [3, "First Name Must Contain At Least 3 Characters!"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name Is Required!"],
      trim: true,
      minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
    },
    email: {
      type: String,
      required: [true, "Email Is Required!"],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Provide A Valid Email!"],
    },
    phone: {
      type: String,
      required: [true, "Phone Is Required!"],
      trim: true,
      // Indian mobile numbers are 10 digits and always start 6-9.
      match: [
        /^[6-9]\d{9}$/,
        "Provide A Valid 10-Digit Indian Mobile Number!",
      ],
    },
    message: {
      type: String,
      required: [true, "Message Is Required!"],
      trim: true,
      minLength: [10, "Message Must Contain At Least 10 Characters!"],
      maxLength: [2000, "Message Cannot Exceed 2000 Characters!"],
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
