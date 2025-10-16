import { Router } from "express";
import {
  enrollmentsByMonth,
  enrollmentsByWeek,
  enrollmentsByModality,
  topCourses,
  passRateByCourse,
} from "../controllers/reportsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authenticate);

router.get("/enrollments/month", enrollmentsByMonth);
router.get("/enrollments/week", enrollmentsByWeek);
router.get("/enrollments/modality", enrollmentsByModality);
router.get("/courses/top", topCourses);
router.get("/grades/passrate-by-course", passRateByCourse);

export default router;
