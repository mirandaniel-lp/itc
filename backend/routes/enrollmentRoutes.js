import { Router } from "express";
import {
  listEnrollments,
  listEnrollmentSummary,
  getEnrollmentById,
  createEnrollment,
  createEnrollmentTx,
  deleteEnrollment,
  getStudentSchedule,
} from "../controllers/enrollmentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", listEnrollments);
router.get("/summary", listEnrollmentSummary);
router.get("/:id", getEnrollmentById);
router.get("/student/:studentId/schedule", getStudentSchedule);
router.post("/", createEnrollment);
router.post("/tx", createEnrollmentTx);
router.delete("/:id", deleteEnrollment);

export default router;
