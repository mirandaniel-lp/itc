import { Router } from "express";
import {
  listTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  loginTeacher,
  logoutTeacher,
  getTeacherCourses,
} from "../controllers/teacherController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", loginTeacher);
router.post("/logout", authenticate, logoutTeacher);

router.use(authenticate);

router.get("/", listTeachers);
router.get("/:id", getTeacherById);
router.post("/", createTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);
router.get("/:id/courses", getTeacherCourses);

export default router;
