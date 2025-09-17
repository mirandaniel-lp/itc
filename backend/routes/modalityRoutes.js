import { Router } from "express";
import { listModalities } from "../controllers/modalityController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();
router.use(authenticate);

router.get("/", listModalities);

export default router;
