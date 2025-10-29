import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";

const prisma = new PrismaClient();

const WD_MAP = {
  LUNES: 1,
  MARTES: 2,
  MIERCOLES: 3,
  JUEVES: 4,
  VIERNES: 5,
  SABADO: 6,
  DOMINGO: 0,
};

function parseHHMM(s) {
  const [h, m] = s.split(":").map(Number);
  return { h: h || 0, m: m || 0 };
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function hasOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export async function listByCourse(req, res) {
  try {
    const courseId = BigInt(req.query.courseId);
    const items = await prisma.courseSchedule.findMany({
      where: { courseId },
      include: {
        classroom: true,
        course: { include: { teacher: true, program: true, term: true } },
      },
      orderBy: [{ weekday: "asc" }, { start_time: "asc" }],
    });
    res.json({ ok: true, items: serialize(items) });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

export async function create(req, res) {
  try {
    const { courseId, classroomId, weekday, start_time, end_time } = req.body;
    const course = await prisma.course.findUnique({
      where: { id: BigInt(courseId) },
      include: { teacher: true },
    });
    if (!course)
      return res.status(404).json({ ok: false, error: "Curso no encontrado" });
    if (!weekday || !start_time || !end_time)
      return res.status(400).json({
        ok: false,
        error: "weekday, start_time y end_time son requeridos",
      });

    const conflicts = await prisma.courseSchedule.findMany({
      where: {
        weekday,
        OR: [
          { classroomId: BigInt(classroomId) },
          { course: { teacherId: course.teacherId } },
        ],
      },
      include: { course: true },
    });

    const toMin = (hhmm) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };
    const newStart = toMin(start_time);
    const newEnd = toMin(end_time);
    const conflicting = conflicts.find((c) => {
      const cs = toMin(c.start_time);
      const ce = toMin(c.end_time);
      return hasOverlap(
        new Date(0, 0, 0, Math.floor(newStart / 60), newStart % 60),
        new Date(0, 0, 0, Math.floor(newEnd / 60), newEnd % 60),
        new Date(0, 0, 0, Math.floor(cs / 60), cs % 60),
        new Date(0, 0, 0, Math.floor(ce / 60), ce % 60)
      );
    });
    if (conflicting) {
      const who =
        conflicting.classroomId === BigInt(classroomId) ? "Aula" : "Docente";
      return res.status(409).json({
        ok: false,
        error: `Conflicto de horario (${who}) con curso ID ${conflicting.courseId}`,
      });
    }

    const created = await prisma.courseSchedule.create({
      data: {
        courseId: BigInt(courseId),
        classroomId: BigInt(classroomId),
        weekday,
        start_time,
        end_time,
      },
    });
    res.json({ ok: true, created: serialize(created) });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

export async function update(req, res) {
  try {
    const id = BigInt(req.params.id);
    const { classroomId, weekday, start_time, end_time } = req.body;
    if (!weekday || !start_time || !end_time || !classroomId)
      return res.status(400).json({ ok: false, error: "Datos incompletos" });

    const schedule = await prisma.courseSchedule.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!schedule)
      return res
        .status(404)
        .json({ ok: false, error: "Horario no encontrado" });

    const conflicts = await prisma.courseSchedule.findMany({
      where: {
        id: { not: id },
        weekday,
        OR: [
          { classroomId: BigInt(classroomId) },
          { course: { teacherId: schedule.course.teacherId } },
        ],
      },
      include: { course: true },
    });

    const toMin = (hhmm) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };
    const newStart = toMin(start_time);
    const newEnd = toMin(end_time);
    if (newStart >= newEnd)
      return res
        .status(400)
        .json({ ok: false, error: "Rango de horas inválido" });

    const conflicting = conflicts.find((c) => {
      const cs = toMin(c.start_time);
      const ce = toMin(c.end_time);
      return hasOverlap(
        new Date(0, 0, 0, Math.floor(newStart / 60), newStart % 60),
        new Date(0, 0, 0, Math.floor(newEnd / 60), newEnd % 60),
        new Date(0, 0, 0, Math.floor(cs / 60), cs % 60),
        new Date(0, 0, 0, Math.floor(ce / 60), ce % 60)
      );
    });
    if (conflicting) {
      const who =
        conflicting.classroomId === BigInt(classroomId) ? "Aula" : "Docente";
      return res.status(409).json({
        ok: false,
        error: `Conflicto de horario (${who}) con curso ID ${conflicting.courseId}`,
      });
    }

    const updated = await prisma.courseSchedule.update({
      where: { id },
      data: { classroomId: BigInt(classroomId), weekday, start_time, end_time },
    });
    res.json({ ok: true, updated: serialize(updated) });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const id = BigInt(req.params.id);
    await prisma.courseSchedule.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}

export async function calendar(req, res) {
  try {
    const from = new Date(`${req.query.from}T00:00:00`);
    const to = new Date(`${req.query.to}T23:59:59`);
    if (isNaN(from) || isNaN(to))
      return res.status(400).json({ ok: false, error: "from/to inválidos" });

    const filters = {};
    if (req.query.courseId) filters.courseId = BigInt(req.query.courseId);
    if (req.query.teacherId) filters.teacherId = BigInt(req.query.teacherId);
    if (req.query.programId) filters.programId = BigInt(req.query.programId);

    const holidays = await prisma.academicHoliday.findMany({
      where: { date: { gte: from, lte: to } },
    });
    const holidaySet = new Set(
      holidays.map((f) => new Date(f.date).toDateString())
    );

    const schedules = await prisma.courseSchedule.findMany({
      where: {
        course: {
          ...(filters.courseId ? { id: filters.courseId } : {}),
          ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
          ...(filters.programId ? { programId: filters.programId } : {}),
          status: true,
        },
      },
      include: {
        classroom: true,
        course: { include: { teacher: true, program: true, term: true } },
      },
    });

    const events = [];
    for (const s of schedules) {
      const rangeStart = new Date(
        Math.max(from.getTime(), new Date(s.course.start_date).getTime())
      );
      const rangeEnd = new Date(
        Math.min(to.getTime(), new Date(s.course.end_date ?? to).getTime())
      );
      if (rangeStart > rangeEnd) continue;

      const goalWday = WD_MAP[s.weekday];
      const { h: sh, m: sm } = parseHHMM(s.start_time);
      const { h: eh, m: em } = parseHHMM(s.end_time);

      let cur = new Date(rangeStart);
      while (cur.getDay() !== goalWday) cur = addDays(cur, 1);
      while (cur <= rangeEnd) {
        if (!holidaySet.has(cur.toDateString())) {
          const start = new Date(
            cur.getFullYear(),
            cur.getMonth(),
            cur.getDate(),
            sh,
            sm
          );
          const end = new Date(
            cur.getFullYear(),
            cur.getMonth(),
            cur.getDate(),
            eh,
            em
          );
          events.push({
            id: `sched-${String(s.id)}-${+cur}`,
            title: `${s.course.name} ${s.course.parallel} — ${s.course.teacher.name}`,
            start,
            end,
            extendedProps: {
              courseId: Number(s.courseId),
              classroomId: Number(s.classroomId),
              classroom: s.classroom?.name ?? "",
              teacher: s.course.teacher?.name ?? "",
              program: s.course.program?.name ?? "",
              programColor: s.course.program?.color ?? null,
              weekday: s.weekday,
              scheduleId: Number(s.id),
            },
          });
        }
        cur = addDays(cur, 7);
      }
    }
    res.json({ ok: true, events });
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
}
