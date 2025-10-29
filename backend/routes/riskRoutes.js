import { Router } from "express";
import {
  riskByCourse,
  train,
  validateByCourse,
  persistByCourse,
  health as health,
} from "../controllers/riskController.js";

const router = Router();

router.get("/health", health);
router.post("/train", train);
router.get("/courses/:courseId/predictions", riskByCourse);
router.post("/courses/:courseId/predictions", persistByCourse);
router.get("/courses/:courseId/validate", validateByCourse);

export default router;
