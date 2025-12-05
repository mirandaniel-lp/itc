import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  listAuditEvents,
  getAuditEvent,
  createAuditEvent,
  listSessions,
  getSession,
  createSession,
  endSession,
} from "../controllers/auditController.js";

const router = Router();
router.use(authenticate);
router.get("/events", listAuditEvents);
router.get("/events/:id", getAuditEvent);
router.post("/events", createAuditEvent);
router.get("/sessions", listSessions);
router.get("/sessions/:id", getSession);
router.post("/sessions", createSession);
router.put("/sessions/:id/end", endSession);

export default router;
