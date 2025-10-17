import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getRoster,
  markBulk,
  saveGrid,
  updateOne,
  statsByCourseDate,
} from "../controllers/attendanceController.js";

const router = Router();
router.use(authenticate);

router.get("/roster", getRoster);
router.get("/stats", statsByCourseDate);
router.post("/bulk", markBulk);
router.post("/save-grid", saveGrid);
router.put("/:id", updateOne);

export default router;
