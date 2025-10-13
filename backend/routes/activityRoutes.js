import express from "express";
import {
  createActivity,
  listActivities,
  listActivitiesByCourse,
  getActivityById,
} from "../controllers/activityController.js";

const router = express.Router();

router.post("/", createActivity);
router.get("/", listActivities);
router.get("/course/:courseId", listActivitiesByCourse);
router.get("/:id", getActivityById);

export default router;
