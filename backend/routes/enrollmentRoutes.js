import { Router } from "express";
import {
  listEnrollments,
  getEnrollmentById,
  createEnrollment,
  deleteEnrollment,
} from "../controllers/enrollmentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", listEnrollments);
router.get("/:id", getEnrollmentById);
router.post("/", createEnrollment);
router.delete("/:id", deleteEnrollment);

export default router;
