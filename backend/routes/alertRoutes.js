import { Router } from "express";
import { index, run } from "../controllers/alertController.js";

const router = Router();

router.get("/", index);
router.post("/run", run);

export default router;
