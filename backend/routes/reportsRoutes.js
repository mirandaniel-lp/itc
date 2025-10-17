import { Router } from "express";
import * as reports from "../controllers/reportsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authenticate);

router.get("/kpis", reports.kpis);
router.get("/enrollments/over-time", reports.enrollmentsOverTimeRange);
router.get("/grades/distribution", reports.gradesDistribution);

router.get("/enrollments/month", reports.enrollmentsByMonth);
router.get("/enrollments/week", reports.enrollmentsByWeek);
router.get("/enrollments/modality", reports.enrollmentsByModality);
router.get("/courses/top", reports.topCourses);
router.get("/grades/passrate-by-course", reports.passRateByCourse);

export default router;
