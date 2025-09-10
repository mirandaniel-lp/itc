import { Router } from "express";
import {
  listUsers,
  getUserById,
  updateUser,
  softDeleteUser,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
const router = Router();
router.use(authenticate);
router.get("/", listUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", softDeleteUser);

export default router;
