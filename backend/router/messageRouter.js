import express from "express";
import {
  getAllMessages,
  sendMessage,
} from "../controller/messageController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Public on purpose — this is the "Send Us A Message" form on the marketing
// site, so visitors are not logged in. It is the only unauthenticated write
// endpoint in the API and has no rate limit yet.
router.post("/send", sendMessage);

router.get("/getall", isAdminAuthenticated, getAllMessages);

export default router;
