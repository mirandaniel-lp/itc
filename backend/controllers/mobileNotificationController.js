import {
  saveTokenForUserByUsername,
  sendToUserByStudentId,
  listNotificationsForStudentId,
} from "../services/mobileNotificationService.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const registerToken = async (req, res) => {
  const { token, appUsername } = req.body || {};
  try {
    if (req.user?.id) {
      return res.json({ ok: false, error: "not_implemented_for_auth_user" });
    }
    if (typeof appUsername === "string" && appUsername.trim() !== "") {
      await saveTokenForUserByUsername({ appUsername, token });
      return res.json({ ok: true });
    }
    return res.status(400).json({ ok: false, error: "invalid" });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: String(err.message || err) });
  }
};

export const sendNotificationToStudent = async (req, res) => {
  const studentId = req.params.studentId;
  const { title, body, data } = req.body || {};
  if (!studentId)
    return res.status(400).json({ ok: false, error: "Estudiante no válido" });
  if (!title && !body)
    return res.status(400).json({ ok: false, error: "invalid" });
  try {
    const r = await sendToUserByStudentId({
      studentId,
      title: title || "",
      body: body || "",
      data: data || {},
    });
    await prisma.notification.create({
      data: {
        title: title || "",
        message: body || "",
        level: "INFO",
        data: data ? data : {},
      },
    });
    return res.json({ ok: true, resp: r });
  } catch (err) {
    const msg = err?.message || String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
};

export const listMyNotifications = async (req, res) => {
  const appUsername = req.query.appUsername || req.body?.appUsername;
  try {
    if (!appUsername)
      return res.status(400).json({ ok: false, error: "appUsername required" });
    const st = await prisma.student.findUnique({
      where: { app_username: String(appUsername) },
    });
    if (!st)
      return res.status(404).json({ ok: false, error: "student_not_found" });
    const nots = await listNotificationsForStudentId(String(st.id), 200);
    return res.json({ ok: true, items: nots });
  } catch (err) {
    return res
      .status(500)
      .json({ ok: false, error: String(err.message || err) });
  }
};
