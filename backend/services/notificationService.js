import { PrismaClient } from "@prisma/client";
import { emitToUsers } from "../sockets/socket.js";
import { serialize } from "../utils/serializer.js";

const prisma = new PrismaClient();

export async function createNotification({
  title,
  message,
  level,
  data,
  userIds,
  created_by,
}) {
  const notif = await prisma.notification.create({
    data: {
      title,
      message,
      level,
      data: data || {},
      created_by: created_by || "IFOREST",
    },
  });

  if (userIds?.length) {
    await prisma.notificationRecipient.createMany({
      data: userIds.map((u) => ({ notificationId: notif.id, userId: u })),
    });

    const payload = serialize({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      level: notif.level,
      data: notif.data,
      created_at: notif.created_at,
    });

    emitToUsers(userIds, "notifications:new", payload);
  }

  return notif;
}

export async function listMyNotifications(
  userId,
  { unread = false, limit = 20 } = {}
) {
  return prisma.notificationRecipient.findMany({
    where: { userId, ...(unread ? { readAt: null } : {}) },
    orderBy: { created_at: "desc" },
    take: Number(limit || 20),
    select: {
      id: true,
      readAt: true,
      notification: {
        select: {
          id: true,
          title: true,
          message: true,
          level: true,
          data: true,
          created_at: true,
        },
      },
    },
  });
}

export async function countMyUnread(userId) {
  const n = await prisma.notificationRecipient.count({
    where: { userId, readAt: null },
  });
  return { unread: n };
}

export async function markRead(userId, recId) {
  return prisma.notificationRecipient.updateMany({
    where: { id: BigInt(recId), userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markReadAll(userId) {
  return prisma.notificationRecipient.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
