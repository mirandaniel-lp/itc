import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getMy,
  getMyUnreadCount,
  postRead,
  postReadAll,
} from "../controllers/notificationController.js";

const router = Router();
router.use(authenticate);
router.get("/me", getMy);
router.get("/me/unread", getMyUnreadCount);
router.post("/me/read-all", postReadAll);
router.post("/me/:recId/read", postRead);

export default router;
