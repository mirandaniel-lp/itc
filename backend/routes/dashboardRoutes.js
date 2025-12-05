import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  summary,
  listActiveCourses,
  coursePerformance,
} from "../controllers/dashboardController.js";
const router = Router();

router.use(authenticate);
router.get("/summary", summary);
router.get("/courses", listActiveCourses);
router.get("/course-performance/:id", coursePerformance);

export default router;
