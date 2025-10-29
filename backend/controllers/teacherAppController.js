import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "../utils/serializer.js";

const prisma = new PrismaClient();

const toBigInt = (v) => {
  if (v === undefined || v === null) return undefined;
  const asStr = typeof v === "string" ? v : String(v);
  return BigInt(asStr);
};

const weekdayFromTs = (d) => {
  const i = new Date(d).getDay();
  return [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
  ][i];
};

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const nextDay = (d) => {
  const x = new Date(d);
  x.setDate(x.getDate() + 1);
  return x;
};

const isAttendanceAllowedInternal = async (course, dateObj) => {
  const d0 = startOfDay(dateObj);
  const inRange =
    (!course.start_date || d0 >= startOfDay(course.start_date)) &&
    (!course.end_date || d0 <= startOfDay(course.end_date));
  if (!inRange)
    return { allowed: false, reason: "Fecha fuera del rango del curso." };

  const w = weekdayFromTs(d0);
  const hasDay = (course.schedules || []).some((s) => s.weekday === w);
  if (!hasDay)
    return {
      allowed: false,
      reason: "Día no habilitado según el horario del curso.",
    };

  const feriado = await prisma.academicHoliday.findFirst({
    where: { date: { gte: d0, lt: nextDay(d0) } },
  });
  if (feriado) return { allowed: false, reason: "Feriado académico." };

  return { allowed: true, reason: null };
};

export const attendanceAllowed = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const courseId = toBigInt(req.params.courseId);
    const date = req.query.date ? new Date(req.query.date) : null;

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId, status: true },
      include: { schedules: true },
    });
    if (!course) return res.status(404).json({ error: "Curso no encontrado." });
    if (!date) return res.status(400).json({ error: "Fecha inválida." });

    const check = await isAttendanceAllowedInternal(course, date);
    res.json({
      allowed: check.allowed,
      reason: check.reason,
      weekday: weekdayFromTs(date),
    });
  } catch {
    res.status(500).json({ error: "Error al validar fecha." });
  }
};

export const attendanceMeta = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const courseId = toBigInt(req.params.courseId);
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId, status: true },
      include: { schedules: true },
    });
    if (!course) return res.status(404).json({ error: "Curso no encontrado." });

    const holidays = await prisma.academicHoliday.findMany({});
    res.json({
      meta: {
        start_date: course.start_date,
        end_date: course.end_date,
        weekdays: (course.schedules || []).map((s) => s.weekday),
        holidays: holidays.map((h) => h.date.toISOString().slice(0, 10)),
      },
    });
  } catch {
    res.status(500).json({ error: "Error al obtener meta de asistencia." });
  }
};

export const teacherLogin = async (req, res) => {
  const { ci, password } = req.body;
  try {
    const teacher = await prisma.teacher.findUnique({ where: { ci } });
    if (!teacher || !teacher.status)
      return res.status(401).json({ error: "CI o contraseña incorrectos." });
    const valid = await bcrypt.compare(password, teacher.password || "");
    if (!valid)
      return res.status(401).json({ error: "CI o contraseña incorrectos." });
    const token = jwt.sign(
      {
        id: teacher.id.toString(),
        ci: teacher.ci,
        role: "TEACHER",
        name: teacher.name,
        last_name: teacher.last_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({
      message: "Inicio de sesión exitoso.",
      token,
      teacher: serialize(teacher),
    });
  } catch {
    res.status(500).json({ error: "Error al iniciar sesión docente." });
  }
};

export const teacherLogout = async (_req, res) => {
  try {
    res.json({ message: "Sesión cerrada exitosamente." });
  } catch {
    res.status(500).json({ error: "Error al cerrar sesión." });
  }
};

export const teacherCourses = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const courses = await prisma.course.findMany({
      where: { teacherId, status: true },
      include: {
        modality: true,
        enrollments: true,
        activities: true,
        term: true,
      },
      orderBy: { start_date: "desc" },
    });
    res.json({ courses: serialize(courses) });
  } catch {
    res.status(500).json({ error: "Error al obtener cursos del docente." });
  }
};

export const teacherActivities = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const courseId = req.query.courseId
      ? toBigInt(req.query.courseId)
      : undefined;
    const activities = await prisma.activity.findMany({
      where: { teacherId, status: true, ...(courseId ? { courseId } : {}) },
      include: { course: true },
      orderBy: { created_at: "desc" },
    });
    res.json({ activities: serialize(activities) });
  } catch {
    res
      .status(500)
      .json({ error: "Error al obtener actividades del docente." });
  }
};

export const createActivity = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const payload = req.body || {};
    const cId = toBigInt(payload.courseId);
    const course = await prisma.course.findFirst({
      where: { id: cId, teacherId, status: true },
    });
    if (!course) return res.status(403).json({ error: "Curso no válido." });
    const act = await prisma.activity.create({
      data: {
        title: payload.title,
        description: payload.description || null,
        weight_pct: payload.weight_pct ?? null,
        type: payload.type || "OTRO",
        due_date: payload.due_date ? new Date(payload.due_date) : null,
        is_published: payload.is_published ?? false,
        courseId: cId,
        teacherId,
      },
    });
    res.status(201).json({ activity: serialize(act) });
  } catch {
    res.status(400).json({ error: "No se pudo crear la actividad." });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const id = toBigInt(req.params.id);
    const payload = req.body || {};
    const act = await prisma.activity.findFirst({
      where: { id, teacherId, status: true },
    });
    if (!act)
      return res.status(404).json({ error: "Actividad no encontrada." });
    const updated = await prisma.activity.update({
      where: { id },
      data: {
        title: payload.title ?? act.title,
        description: payload.description ?? act.description,
        weight_pct: payload.weight_pct ?? act.weight_pct,
        type: payload.type ?? act.type,
        due_date: payload.due_date ? new Date(payload.due_date) : act.due_date,
      },
    });
    res.json({ activity: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar la actividad." });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const id = toBigInt(req.params.id);
    const act = await prisma.activity.findFirst({
      where: { id, teacherId, status: true },
    });
    if (!act)
      return res.status(404).json({ error: "Actividad no encontrada." });
    await prisma.activity.update({ where: { id }, data: { status: false } });
    res.json({ message: "Actividad eliminada." });
  } catch {
    res.status(400).json({ error: "No se pudo eliminar la actividad." });
  }
};

export const publishActivity = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const id = toBigInt(req.params.id);
    const act = await prisma.activity.findFirst({
      where: { id, teacherId, status: true },
    });
    if (!act)
      return res.status(404).json({ error: "Actividad no encontrada." });
    const updated = await prisma.activity.update({
      where: { id },
      data: { is_published: true },
    });
    res.json({ activity: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo publicar la actividad." });
  }
};

export const unpublishActivity = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const id = toBigInt(req.params.id);
    const act = await prisma.activity.findFirst({
      where: { id, teacherId, status: true },
    });
    if (!act)
      return res.status(404).json({ error: "Actividad no encontrada." });
    const updated = await prisma.activity.update({
      where: { id },
      data: { is_published: false },
    });
    res.json({ activity: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo despublicar la actividad." });
  }
};

export const courseStudents = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const courseId = toBigInt(req.params.courseId);
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId, status: true },
    });
    if (!course) return res.status(404).json({ error: "Curso no encontrado." });
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId, status: true },
      include: { student: true },
    });
    const students = enrollments.map((e) => e.student).filter((s) => s?.status);
    res.json({ students: serialize(students) });
  } catch {
    res.status(500).json({ error: "Error al obtener estudiantes del curso." });
  }
};

export const gradesByActivity = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const activityId = toBigInt(req.params.activityId);
    const act = await prisma.activity.findFirst({
      where: { id: activityId, teacherId, status: true },
    });
    if (!act)
      return res.status(404).json({ error: "Actividad no encontrada." });
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: act.courseId, status: true },
      include: { student: true },
    });
    const grades = await prisma.grade.findMany({
      where: { activityId },
      include: { student: true },
    });
    const gmap = new Map(grades.map((g) => [`${g.studentId}`, g]));
    const merged = enrollments
      .map((e) => {
        const g = gmap.get(`${e.studentId}`);
        return {
          id: g?.id || null,
          activityId: activityId.toString(),
          studentId: e.studentId.toString(),
          student: e.student,
          score: g?.score ?? null,
          feedback: g?.feedback ?? null,
          is_published: g?.is_published ?? false,
        };
      })
      .filter((r) => r.student?.status);
    res.json({ grades: serialize(merged) });
  } catch {
    res.status(500).json({ error: "Error al obtener calificaciones." });
  }
};

export const upsertGrades = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const activityId = toBigInt(req.params.activityId);
    const act = await prisma.activity.findFirst({
      where: { id: activityId, teacherId, status: true },
    });
    if (!act)
      return res.status(404).json({ error: "Actividad no encontrada." });
    const rows = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.rows)
      ? req.body.rows
      : [];
    const ops = rows.map((r) =>
      prisma.grade.upsert({
        where: {
          activityId_studentId: {
            activityId,
            studentId: toBigInt(r.studentId),
          },
        },
        update: { score: r.score, feedback: r.feedback ?? null },
        create: {
          activityId,
          studentId: toBigInt(r.studentId),
          score: r.score,
          feedback: r.feedback ?? null,
          is_published: false,
          status: true,
        },
      })
    );
    const saved = await prisma.$transaction(ops);
    res.json({ grades: serialize(saved) });
  } catch {
    res.status(400).json({ error: "No se pudieron guardar calificaciones." });
  }
};

export const publishGrades = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const activityId = toBigInt(req.params.activityId);
    const act = await prisma.activity.findFirst({
      where: { id: activityId, teacherId, status: true },
    });
    if (!act)
      return res.status(404).json({ error: "Actividad no encontrada." });
    await prisma.activity.update({
      where: { id: activityId },
      data: { is_published: true },
    });
    await prisma.grade.updateMany({
      where: { activityId },
      data: { is_published: true },
    });
    res.json({ message: "Calificaciones publicadas." });
  } catch {
    res.status(400).json({ error: "No se pudieron publicar calificaciones." });
  }
};

export const attendanceByCourseDate = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const courseId = toBigInt(req.params.courseId);
    const date = req.query.date ? new Date(req.query.date) : null;
    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId, status: true },
    });
    if (!course) return res.status(404).json({ error: "Curso no encontrado." });
    const records = await prisma.attendance.findMany({
      where: { courseId, ...(date ? { date } : {}) },
      include: { student: true },
    });
    res.json({ attendances: serialize(records) });
  } catch {
    res.status(500).json({ error: "Error al obtener asistencias." });
  }
};

export const saveAttendanceByCourseDate = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const courseId = toBigInt(req.params.courseId);
    const date = req.query.date ? new Date(req.query.date) : null;

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId, status: true },
      include: { schedules: true },
    });
    if (!course) return res.status(404).json({ error: "Curso no encontrado." });
    if (!date) return res.status(400).json({ error: "Fecha inválida." });

    const allowed = await isAttendanceAllowedInternal(course, date);
    if (!allowed.allowed)
      return res.status(400).json({ error: allowed.reason });

    const rows = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.rows)
      ? req.body.rows
      : [];

    const ops = rows.map((r) =>
      prisma.attendance.upsert({
        where: {
          studentId_courseId_date: {
            studentId: toBigInt(r.studentId),
            courseId,
            date,
          },
        },
        update: { status: r.status, justification: r.justification ?? null },
        create: {
          studentId: toBigInt(r.studentId),
          courseId,
          date,
          status: r.status,
          justification: r.justification ?? null,
        },
      })
    );
    const saved = await prisma.$transaction(ops);
    res.json({ attendances: serialize(saved) });
  } catch {
    res.status(400).json({ error: "No se pudieron guardar asistencias." });
  }
};

export const weeklySchedule = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const start = req.query.start ? new Date(req.query.start) : null;
    const end = req.query.end ? new Date(req.query.end) : null;
    const courses = await prisma.course.findMany({
      where: { teacherId, status: true },
      include: { schedules: { include: { classroom: true } } },
    });
    const items = [];
    courses.forEach((c) => {
      c.schedules.forEach((s) => {
        items.push({
          courseId: c.id.toString(),
          courseName: c.name,
          weekday: s.weekday,
          start_time: s.start_time,
          end_time: s.end_time,
          classroom: s.classroom?.name || null,
        });
      });
    });
    res.json({ schedule: serialize(items), range: { start, end } });
  } catch {
    res.status(500).json({ error: "Error al obtener horario." });
  }
};

export const teacherProfile = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const t = await prisma.teacher.findUnique({ where: { id: teacherId } });
    res.json({ teacher: serialize(t) });
  } catch {
    res.status(500).json({ error: "Error al obtener perfil." });
  }
};

export const updateTeacherProfile = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const data = req.body || {};
    const t = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        name: data.name,
        last_name: data.last_name,
        second_last_name: data.second_last_name ?? null,
        email: data.email ?? null,
        phone: data.phone,
        specialty: data.specialty ?? null,
        dateofbirth: data.dateofbirth ? new Date(data.dateofbirth) : undefined,
        placeofbirth: data.placeofbirth ?? undefined,
      },
    });
    res.json({ teacher: serialize(t) });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar perfil." });
  }
};

export const changeTeacherPin = async (req, res) => {
  try {
    const teacherId = toBigInt(req.teacherId);
    const { currentPin, newPin } = req.body || {};
    const t = await prisma.teacher.findUnique({ where: { id: teacherId } });
    const valid = await bcrypt.compare(currentPin, t?.password || "");
    if (!valid)
      return res.status(400).json({ error: "PIN actual incorrecto." });
    const hashed = await bcrypt.hash(newPin, 10);
    await prisma.teacher.update({
      where: { id: teacherId },
      data: { password: hashed },
    });
    res.json({ message: "PIN actualizado." });
  } catch {
    res.status(400).json({ error: "No se pudo cambiar el PIN." });
  }
};
