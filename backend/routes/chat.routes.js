import { Router } from "express";
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from "../controllers/chat.controller.js";
import authMiddleware from "../middleware/auth.js";

const router = Router();

router.route("/message").post(authMiddleware, sendMessage);
router.route("/history").get(authMiddleware, getChatHistory);
router.route("/history").delete(authMiddleware, clearChatHistory);

export default router; // ✅ this line was missing