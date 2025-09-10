import { Router } from "express";
import {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = Router();
router.use(authenticate);
router.get("/", listStudents);
router.get("/:id", getStudentById);
router.post("/", upload.single("image"), createStudent);
router.put("/:id", upload.single("image"), updateStudent);
router.delete("/:id", deleteStudent);

export default router;
