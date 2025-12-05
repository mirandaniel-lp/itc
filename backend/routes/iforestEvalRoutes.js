import express from "express";
import {
  tuneCourse,
  applyThreshold,
} from "../controllers/iforestEvalController.js";

const router = express.Router();

router.get("/tune/course/:courseId", tuneCourse);
router.post("/tune/course/:courseId/apply", applyThreshold);

export default router;
