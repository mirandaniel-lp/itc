import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auditMiddleware = async (req, res, next) => {
  const origSend = res.send;
  res.send = function (body) {
    res.send = origSend;
    res.send(body);
    return res;
  };

  res.onFinishOrClose = () => {};

  res.on("finish", async () => {
    try {
      const userId = req.user?.userId ?? null;
      await prisma.auditEvent.create({
        data: {
          userId,
          method: req.method,
          route: req.originalUrl,
          action: req.body?.action ?? null,
          ip:
            req.ip ||
            (req.headers["x-forwarded-for"] || "").split(",")[0] ||
            null,
          userAgent: req.headers["user-agent"] ?? null,
          payload: Object.keys(req.body || {}).length ? req.body : null,
          createdBy: req.user?.userId ?? null,
          updatedBy: req.user?.userId ?? null,
        },
      });
    } catch {}
  });

  next();
};
