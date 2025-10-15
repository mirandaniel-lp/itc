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

const router = Router();

router.get("/", listTeachers);
router.get("/:id", getTeacherById);
router.post("/", createTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);
router.post("/auth/login", loginTeacher);
router.post("/auth/logout", logoutTeacher);
router.get("/:id/courses", getTeacherCourses);

export default router;
