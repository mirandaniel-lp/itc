import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  updateEmail,
  changePassword,
} from "../controllers/profileController.js";

const router = Router();
router.get("/me", authenticate, getProfile);
router.put("/email", authenticate, updateEmail);
router.post("/change-password", authenticate, changePassword);
export default router;
