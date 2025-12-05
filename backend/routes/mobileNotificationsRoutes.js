import { Router } from "express";
import {
  registerToken,
  sendNotificationToStudent,
  listMyNotifications,
} from "../controllers/mobileNotificationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register-token", registerToken);
router.get("/my", listMyNotifications);
router.post(
  "/send-student/:studentId",
  authenticate,
  sendNotificationToStudent
);

export default router;
