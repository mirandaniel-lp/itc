import { Router } from "express";
import {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getEnrolledStudentsByCourse,
  getCourseCatalogs,
  createCoursesWithSchedules,
  getAvailability,
} from "../controllers/courseController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", listCourses);
router.get("/catalogs", getCourseCatalogs);
router.post("/bulk-with-schedules", createCoursesWithSchedules);
router.get("/:id", getCourseById);
router.get("/:courseId/students", getEnrolledStudentsByCourse);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.post("/availability", getAvailability);

export default router;
