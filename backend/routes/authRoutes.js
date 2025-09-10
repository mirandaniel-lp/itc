import { Router } from "express";
import {
  register,
  login,
  getUser,
  logout,
} from "../controllers/authController.js";
import { authenticate, authorizeRole } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", authenticate, getUser);
router.post("/logout", authenticate, logout);

router.get("/admin", authenticate, authorizeRole(1), (req, res) => {
  res.json({ message: "Solo administradores pueden ver esto" });
});

export default router;
