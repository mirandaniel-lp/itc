import { Router } from "express";
import {
  listHolidays,
  getHoliday,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "../controllers/holidayController.js";

const router = Router();
router.get("/", listHolidays);
router.get("/:id", getHoliday);
router.post("/", createHoliday);
router.put("/:id", updateHoliday);
router.delete("/:id", deleteHoliday);

export default router;
