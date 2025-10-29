import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  listTerms,
  getTermById,
  createTerm,
  updateTerm,
  deleteTerm,
} from "../controllers/termController.js";

const router = Router();
router.use(authenticate);
router.get("/", listTerms);
router.get("/:id", getTermById);
router.post("/", createTerm);
router.put("/:id", updateTerm);
router.delete("/:id", deleteTerm);

export default router;
