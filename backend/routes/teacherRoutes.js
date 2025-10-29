import { Router } from "express";
import {
  listTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherCourses,
} from "../controllers/teacherController.js";

const router = Router();

router.get("/", listTeachers);
router.get("/:id/courses", getTeacherCourses);
router.get("/:id", getTeacherById);
router.post("/", createTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;
