import { Router } from "express";
import {
  listPolicies,
  getPolicy,
  getPolicyByCourse,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from "../controllers/gradePolicyController.js";

const router = Router();
router.get("/", listPolicies);
router.get("/:id", getPolicy);
router.get("/curso/:courseId", getPolicyByCourse);
router.post("/", createPolicy);
router.put("/:id", updatePolicy);
router.delete("/:id", deletePolicy);

export default router;
