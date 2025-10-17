import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";

const prisma = new PrismaClient();

function normalizeToDateOnly(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new Error("Fecha inválida");
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseCourseDate(req) {
  const courseIdRaw = req.query.courseId ?? req.body.courseId;
  const dateRaw = req.query.date ?? req.body.date;
  if (!courseIdRaw || !dateRaw) {
    const missing = !courseIdRaw ? "courseId" : "date";
    const err = new Error(`${missing} es requerido.`);
    err.status = 400;
    throw err;
  }
  const courseId = BigInt(courseIdRaw);
  const date = normalizeToDateOnly(String(dateRaw));
  return { courseId, date };
}

export const getRoster = async (req, res) => {
  try {
    const { courseId, date } = parseCourseDate(req);
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: true },
      include: { student: true },
      orderBy: { id: "asc" },
    });
    const attendance = await prisma.attendance.findMany({
      where: { courseId, date },
    });
    const byStudent = new Map(
      attendance.map((a) => [a.studentId.toString(), a])
    );
    const counters = {
      PRESENTE: 0,
      AUSENTE: 0,
      LICENCIA: 0,
      TARDE: 0,
      SIN_MARCAR: 0,
    };
    const roster = enrollments.map((e, idx) => {
      const a = byStudent.get(e.student.id.toString());
      const row = {
        order: idx + 1,
        studentId: e.student.id,
        fullName: `${e.student.name} ${e.student.last_name} ${e.student.second_last_name}`,
        status: a?.status ?? null,
        attendanceId: a?.id ?? null,
        checkinAt: a?.checkinAt ?? null,
        checkoutAt: a?.checkoutAt ?? null,
        justification: a?.justification ?? null,
      };
      if (!row.status) counters.SIN_MARCAR++;
      else counters[row.status] = (counters[row.status] || 0) + 1;
      return row;
    });
    res.json(
      serialize({ courseId, date, total: roster.length, counters, roster })
    );
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Error al obtener roster." });
  }
};

export const markBulk = async (req, res) => {
  try {
    const { courseId, date } = parseCourseDate(req);
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (items.length === 0)
      return res
        .status(400)
        .json({ error: "items es requerido y no puede estar vacío." });
    const tx = items.map((it) => {
      const studentId = BigInt(it.studentId);
      const status = it.status;
      return prisma.attendance.upsert({
        where: { studentId_courseId_date: { studentId, courseId, date } },
        create: { studentId, courseId, date, status },
        update: { status },
      });
    });
    const result = await prisma.$transaction(tx);
    res.json(serialize({ ok: true, count: result.length }));
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Error al marcar asistencia masiva." });
  }
};

export const saveGrid = async (req, res) => {
  try {
    const { courseId, date } = parseCourseDate(req);
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
    if (rows.length === 0)
      return res
        .status(400)
        .json({ error: "rows es requerido y no puede estar vacío." });
    const tx = rows.map((r) => {
      const studentId = BigInt(r.studentId);
      const status = r.status ?? "AUSENTE";
      const checkinAt = r.checkinAt ? new Date(r.checkinAt) : null;
      const checkoutAt = r.checkoutAt ? new Date(r.checkoutAt) : null;
      const justification = r.justification ?? null;
      return prisma.attendance.upsert({
        where: { studentId_courseId_date: { studentId, courseId, date } },
        create: {
          studentId,
          courseId,
          date,
          status,
          checkinAt,
          checkoutAt,
          justification,
        },
        update: { status, checkinAt, checkoutAt, justification },
      });
    });
    const result = await prisma.$transaction(tx);
    res.json(serialize({ ok: true, count: result.length }));
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Error al guardar asistencia." });
  }
};

export const updateOne = async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const { status, checkinAt, checkoutAt, justification } = req.body;
    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status,
        checkinAt: checkinAt ? new Date(checkinAt) : null,
        checkoutAt: checkoutAt ? new Date(checkoutAt) : null,
        justification: justification ?? null,
      },
    });
    res.json(serialize(updated));
  } catch {
    res.status(500).json({ error: "Error al actualizar asistencia." });
  }
};

export const statsByCourseDate = async (req, res) => {
  try {
    const { courseId, date } = parseCourseDate(req);
    const grouped = await prisma.attendance.groupBy({
      by: ["status"],
      where: { courseId, date },
      _count: true,
    });
    const counters = { PRESENTE: 0, AUSENTE: 0, LICENCIA: 0, TARDE: 0 };
    grouped.forEach((g) => (counters[g.status] = g._count));
    const total = await prisma.enrollment.count({
      where: { courseId, status: true },
    });
    const marked = Object.values(counters).reduce((a, b) => a + b, 0);
    const sinMarcar = Math.max(total - marked, 0);
    res.json(serialize({ total, ...counters, SIN_MARCAR: sinMarcar }));
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Error al calcular stats." });
  }
};
