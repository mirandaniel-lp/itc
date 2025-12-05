import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listAuditEvents = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, userId, q, from, to } = req.query;
    const where = {};
    if (userId) where.userId = Number(userId);
    if (q)
      where.OR = [
        { route: { contains: q } },
        { action: { contains: q } },
        { method: { contains: q } },
      ];
    if (from || to) where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
    const skip = (Number(page) - 1) * Number(pageSize);
    const [items, total] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(pageSize),
        include: { user: true, createdByUser: true, updatedByUser: true },
      }),
      prisma.auditEvent.count({ where }),
    ]);
    res.json({ events: serialize(items), total });
  } catch {
    res.status(500).json({ error: "Error listing audit events." });
  }
};

export const getAuditEvent = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.auditEvent.findUnique({
      where: { id },
      include: { user: true, createdByUser: true, updatedByUser: true },
    });
    if (!item) return res.status(404).json({ error: "Audit event not found." });
    res.json({ event: serialize(item) });
  } catch {
    res.status(500).json({ error: "Error getting audit event." });
  }
};

export const createAuditEvent = async (req, res) => {
  try {
    const b = req.body || {};
    const created = await prisma.auditEvent.create({
      data: {
        userId: b.userId ?? null,
        method: String(b.method),
        route: String(b.route),
        action: b.action ?? null,
        ip: b.ip ?? null,
        userAgent: b.userAgent ?? null,
        payload: b.payload ?? null,
        createdBy: b.createdBy ?? null,
        updatedBy: b.updatedBy ?? null,
      },
    });
    res.status(201).json({ event: serialize(created) });
  } catch {
    res.status(400).json({ error: "Error creating audit event." });
  }
};

export const listSessions = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, userId } = req.query;
    const where = {};
    if (userId) where.userId = Number(userId);
    const skip = (Number(page) - 1) * Number(pageSize);
    const [items, total] = await Promise.all([
      prisma.loginSession.findMany({
        where,
        orderBy: { startedAt: "desc" },
        skip,
        take: Number(pageSize),
        include: { user: true },
      }),
      prisma.loginSession.count({ where }),
    ]);
    res.json({ sessions: serialize(items), total });
  } catch {
    res.status(500).json({ error: "Error listing sessions." });
  }
};

export const getSession = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.loginSession.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!item) return res.status(404).json({ error: "Session not found." });
    res.json({ session: serialize(item) });
  } catch {
    res.status(500).json({ error: "Error getting session." });
  }
};

export const createSession = async (req, res) => {
  try {
    const b = req.body || {};
    const created = await prisma.loginSession.create({
      data: {
        userId: Number(b.userId),
        ip: b.ip ?? null,
        userAgent: b.userAgent ?? null,
        startedAt: b.startedAt ? new Date(b.startedAt) : new Date(),
        endedAt: b.endedAt ? new Date(b.endedAt) : null,
        createdBy: b.createdBy ?? null,
        updatedBy: b.updatedBy ?? null,
      },
    });
    res.status(201).json({ session: serialize(created) });
  } catch {
    res.status(400).json({ error: "Error creating session." });
  }
};

export const endSession = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ended = await prisma.loginSession.update({
      where: { id },
      data: { endedAt: new Date(), updatedBy: req.user?.id ?? null },
    });
    res.json({ session: serialize(ended) });
  } catch {
    res.status(400).json({ error: "Error ending session." });
  }
};
