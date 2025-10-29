import { Router } from "express";
import * as ScheduleController from "../controllers/scheduleController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", ScheduleController.listByCourse);
router.post("/", ScheduleController.create);
router.patch("/:id", ScheduleController.update);
router.delete("/:id", ScheduleController.remove);
router.get("/calendar", ScheduleController.calendar);

export default router;
