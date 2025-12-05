import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const toInt = (v) => (v === null || v === undefined ? null : Number(v));

export default {
  async createEvent(payload) {
    const p = {
      userId: toInt(payload.userId),
      method: String(payload.method),
      path: String(payload.path),
      action: payload.action ?? null,
      ip: payload.ip ?? null,
      userAgent: payload.userAgent ?? null,
      payload: payload.payload ?? null,
      createdBy: toInt(payload.createdBy) ?? null,
      updatedBy: toInt(payload.updatedBy) ?? null,
    };
    return prisma.auditEvent.create({ data: p });
  },
  async listEvents({ skip = 0, take = 50, userId, q } = {}) {
    const where = {};
    if (userId) where.userId = toInt(userId);
    if (q) where.OR = [{ path: { contains: q } }, { action: { contains: q } }];
    const items = await prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
    const total = await prisma.auditEvent.count({ where });
    return { items, total };
  },
  async createSession({ userId, ip, userAgent, startedAt }) {
    return prisma.loginSession.create({
      data: {
        userId: toInt(userId),
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        startedAt: startedAt ?? new Date(),
      },
    });
  },
  async endSession({ sessionId, endedAt }) {
    return prisma.loginSession.update({
      where: { id: BigInt(sessionId) },
      data: { endedAt: endedAt ?? new Date() },
    });
  },
  async listSessions({ skip = 0, take = 50, userId } = {}) {
    const where = {};
    if (userId) where.userId = toInt(userId);
    const items = await prisma.loginSession.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip,
      take,
      include: { user: true },
    });
    const total = await prisma.loginSession.count({ where });
    return { items, total };
  },
};
