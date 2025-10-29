import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  listPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";

const router = Router();
router.use(authenticate);
router.get("/", listPrograms);
router.get("/:id", getProgramById);
router.post("/", createProgram);
router.put("/:id", updateProgram);
router.delete("/:id", deleteProgram);

export default router;
