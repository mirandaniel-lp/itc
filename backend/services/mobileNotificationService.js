import admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function saveTokenForUserByUsername({ appUsername, token }) {
  if (!appUsername) throw new Error("appUsername required");
  const st = await prisma.student.findUnique({
    where: { app_username: appUsername },
  });
  if (!st) throw new Error("student_not_found");
  await prisma.student.update({
    where: { id: st.id },
    data: { app_fcm_token: token },
  });
  return { ok: true };
}

export async function saveTokenForAuthUser({ userId, token }) {
  return { ok: false, error: "not_supported" };
}

export async function sendToUserByStudentId({
  studentId,
  title,
  body,
  data = {},
}) {
  if (!admin || !admin.messaging)
    throw new Error("firebase-admin not initialized");
  if (!studentId) throw new Error("studentId required");
  let sid;
  try {
    sid = BigInt(String(studentId));
  } catch (e) {
    throw new Error("invalid_student_id");
  }
  const st = await prisma.student.findUnique({
    where: { id: sid },
  });
  if (!st) throw new Error("student_not_found");
  const token = st.app_fcm_token;
  if (!token) throw new Error("no_token");
  const dataStr = {};
  try {
    for (const k of Object.keys(data || {})) {
      const v = data[k];
      dataStr[k] =
        typeof v === "string"
          ? v
          : typeof v === "number"
          ? String(v)
          : JSON.stringify(v);
    }
  } catch (e) {}
  const msg = {
    token,
    notification: {
      title: title || "",
      body: body || "",
    },
    data: dataStr,
  };
  try {
    const resp = await admin.messaging().send(msg);
    return { ok: true, resp };
  } catch (err) {
    throw new Error(err.message || String(err));
  }
}

export async function listNotificationsForStudentId(studentId, limit = 100) {
  if (!studentId) throw new Error("studentId required");
  const sid = String(studentId);
  const where = {
    data: {
      contains: { studentId: sid },
    },
  };
  const nots = await prisma.notification.findMany({
    where,
    orderBy: { created_at: "desc" },
    take: limit,
  });
  return nots;
}
