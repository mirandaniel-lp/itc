import express from "express";
import {
  createGrade,
  listGrades,
  listGradesByActivity,
  updateGrade,
} from "../controllers/gradeController.js";
const router = express.Router();

router.post("/", createGrade);
router.get("/", listGrades);
router.get("/activity/:activityId", listGradesByActivity);
router.put("/:id", updateGrade);

export default router;
