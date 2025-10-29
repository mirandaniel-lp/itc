import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

const toBigInt = (v) =>
  v === null || v === undefined ? null : BigInt(String(v));

const hhmmToMinutes = (t) => {
  const [h, m] = String(t || "")
    .split(":")
    .map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};
const rangesOverlap = (aStart, aEnd, bStart, bEnd) =>
  Math.max(aStart, bStart) < Math.min(aEnd, bEnd);

export const listCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { status: true },
      orderBy: { id: "asc" },
      include: { teacher: true, modality: true },
    });
    res.json({ courses: serialize(courses) });
  } catch {
    res.status(500).json({ error: "Error al listar cursos." });
  }
};

export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await prisma.course.findUnique({
      where: { id: BigInt(id) },
      include: {
        schedules: { include: { classroom: true } },
        teacher: true,
        modality: true,
        term: true,
        program: true,
      },
    });
    if (!course) return res.status(404).json({ error: "Curso no encontrado." });
    res.json({ course: serialize(course) });
  } catch {
    res.status(500).json({ error: "Error al obtener curso." });
  }
};

export const getCourseCatalogs = async (_req, res) => {
  try {
    const [teachers, modalities, terms, programs, classrooms] =
      await Promise.all([
        prisma.teacher.findMany({
          where: { status: true },
          orderBy: [{ name: "asc" }, { last_name: "asc" }],
        }),
        prisma.modality.findMany({ orderBy: { name: "asc" } }),
        prisma.academicTerm.findMany({
          where: { status: true },
          orderBy: { start_date: "desc" },
        }),
        prisma.program.findMany({
          where: { status: true },
          orderBy: { name: "asc" },
        }),
        prisma.classroom.findMany({
          where: { status: true },
          orderBy: { name: "asc" },
        }),
      ]);
    const shifts = ["MAÑANA", "TARDE", "NOCHE"];
    res.json({
      teachers: serialize(teachers),
      modalities: serialize(modalities),
      terms: serialize(terms),
      programs: serialize(programs),
      classrooms: serialize(classrooms),
      shifts,
    });
  } catch {
    res.status(500).json({ error: "Error al cargar catálogos." });
  }
};

export const createCourse = async (req, res) => {
  try {
    const b = req.body || {};
    if (
      !b.name ||
      !b.parallel ||
      !b.shift ||
      !b.teacherId ||
      !b.modalityId ||
      !b.termId ||
      !b.programId ||
      !b.start_date
    ) {
      return res
        .status(400)
        .json({ error: "Datos incompletos para crear el curso." });
    }
    const created = await prisma.course.create({
      data: {
        name: String(b.name),
        parallel: String(b.parallel),
        description: b.description ?? null,
        cost: b.cost ?? "0",
        start_date: new Date(b.start_date),
        end_date: b.end_date ? new Date(b.end_date) : null,
        shift: b.shift,
        max_capacity: b.max_capacity ?? null,
        teacherId: toBigInt(b.teacherId),
        modalityId: toBigInt(b.modalityId),
        termId: toBigInt(b.termId),
        programId: toBigInt(b.programId),
      },
    });
    res.status(201).json({ course: serialize(created) });
  } catch {
    res.status(400).json({ error: "Error al crear curso." });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const b = req.body || {};
    const updated = await prisma.course.update({
      where: { id: BigInt(id) },
      data: {
        name: b.name,
        parallel: b.parallel,
        description: b.description ?? null,
        cost: b.cost ?? undefined,
        start_date: b.start_date ? new Date(b.start_date) : undefined,
        end_date: b.end_date ? new Date(b.end_date) : undefined,
        shift: b.shift ?? undefined,
        max_capacity: b.max_capacity ?? undefined,
        teacherId: b.teacherId ? toBigInt(b.teacherId) : undefined,
        modalityId: b.modalityId ? toBigInt(b.modalityId) : undefined,
        termId: b.termId ? toBigInt(b.termId) : undefined,
        programId: b.programId ? toBigInt(b.programId) : undefined,
      },
    });
    res.json({ course: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar curso." });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.course.update({
      where: { id: BigInt(id) },
      data: { status: false },
    });
    res.json({ message: "Curso eliminado correctamente." });
  } catch {
    res.status(400).json({ error: "Error al eliminar curso." });
  }
};

export const getEnrolledStudentsByCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: BigInt(courseId),
        status: true,
        student: { status: true },
      },
      include: { student: true },
      orderBy: { studentId: "asc" },
    });
    const students = enrollments.map((e) => e.student);
    res.json({ students: serialize(students) });
  } catch {
    res.status(500).json({ error: "Error al listar estudiantes del curso." });
  }
};

export const createCoursesWithSchedules = async (req, res) => {
  const b = req.body || {};
  const baseRequired =
    b.name &&
    Array.isArray(b.parallels) &&
    b.parallels.length > 0 &&
    b.shift &&
    b.teacherId &&
    b.modalityId &&
    b.termId &&
    b.programId &&
    b.start_date;
  if (!baseRequired) {
    return res.status(400).json({ error: "Datos incompletos." });
  }
  const startDate = new Date(b.start_date);
  const endDate = b.end_date ? new Date(b.end_date) : null;
  if (endDate && endDate < startDate) {
    return res.status(400).json({ error: "Fechas inválidas." });
  }
  const schedules = Array.isArray(b.schedules) ? b.schedules : [];
  const parallels = b.parallels.map((p) => String(p));
  const byParallel = new Map();
  for (const p of parallels) byParallel.set(p, []);
  for (const s of schedules) {
    const p = String(s.parallel || "");
    if (!byParallel.has(p)) {
      return res
        .status(400)
        .json({ error: "Paralelo sin declarar en horarios." });
    }
    const wd = String(s.weekday || "");
    const st = String(s.start_time || "");
    const et = String(s.end_time || "");
    const cl = s.classroomId;
    if (!wd || !st || !et || !cl) {
      return res.status(400).json({ error: "Horario incompleto." });
    }
    const sm = hhmmToMinutes(st);
    const em = hhmmToMinutes(et);
    if (sm == null || em == null || sm >= em) {
      return res.status(400).json({ error: "Rango de hora inválido." });
    }
    byParallel.get(p).push({
      weekday: wd,
      classroomId: BigInt(String(cl)),
      start_time: st,
      end_time: et,
      sm,
      em,
    });
  }
  for (const p of parallels) {
    const arr = byParallel.get(p) || [];
    if (!arr.length) {
      return res
        .status(400)
        .json({ error: "Cada paralelo debe tener al menos un horario." });
    }
    arr.sort((a, b) =>
      a.weekday === b.weekday ? a.sm - b.sm : a.weekday.localeCompare(b.weekday)
    );
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i].weekday !== arr[j].weekday) continue;
        if (arr[i].classroomId !== arr[j].classroomId) continue;
        if (rangesOverlap(arr[i].sm, arr[i].em, arr[j].sm, arr[j].em)) {
          return res
            .status(400)
            .json({
              error:
                "Solapamiento interno de horarios en el mismo paralelo y aula.",
            });
        }
      }
    }
  }
  const weekdaysSet = new Set();
  const classroomSet = new Set();
  schedules.forEach((s) => {
    weekdaysSet.add(String(s.weekday));
    classroomSet.add(String(s.classroomId));
  });
  const weekdays = Array.from(weekdaysSet);
  const classroomIds = Array.from(classroomSet).map((x) => BigInt(x));

  try {
    const classroomDb = await prisma.courseSchedule.findMany({
      where: {
        classroomId: { in: classroomIds },
        weekday: { in: weekdays },
        course: {
          status: true,
          AND: [
            { start_date: { lte: endDate ?? startDate } },
            { OR: [{ end_date: null }, { end_date: { gte: startDate } }] },
          ],
        },
      },
      include: { course: true },
    });
    for (const existing of classroomDb) {
      const esm = hhmmToMinutes(existing.start_time);
      const eem = hhmmToMinutes(existing.end_time);
      const cmp = schedules.filter(
        (x) =>
          String(x.weekday) === existing.weekday &&
          BigInt(String(x.classroomId)) === existing.classroomId
      );
      for (const n of cmp) {
        const nsm = hhmmToMinutes(String(n.start_time));
        const nem = hhmmToMinutes(String(n.end_time));
        if (rangesOverlap(esm, eem, nsm, nem)) {
          return res
            .status(400)
            .json({ error: "Aula ocupada en el rango seleccionado." });
        }
      }
    }
    const teacherDb = await prisma.courseSchedule.findMany({
      where: {
        weekday: { in: weekdays },
        course: {
          status: true,
          teacherId: BigInt(String(b.teacherId)),
          AND: [
            { start_date: { lte: endDate ?? startDate } },
            { OR: [{ end_date: null }, { end_date: { gte: startDate } }] },
          ],
        },
      },
      include: { course: true },
    });
    for (const existing of teacherDb) {
      const esm = hhmmToMinutes(existing.start_time);
      const eem = hhmmToMinutes(existing.end_time);
      const cmp = schedules.filter(
        (x) => String(x.weekday) === existing.weekday
      );
      for (const n of cmp) {
        const nsm = hhmmToMinutes(String(n.start_time));
        const nem = hhmmToMinutes(String(n.end_time));
        if (rangesOverlap(esm, eem, nsm, nem)) {
          return res
            .status(400)
            .json({ error: "El docente ya tiene clase en ese horario." });
        }
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const out = [];
      for (const p of parallels) {
        const course = await tx.course.create({
          data: {
            name: String(b.name),
            parallel: String(p),
            description: b.description ?? null,
            cost: b.cost ?? "0",
            start_date: startDate,
            end_date: endDate,
            shift: b.shift,
            max_capacity: b.max_capacity ?? null,
            teacherId: toBigInt(b.teacherId),
            modalityId: toBigInt(b.modalityId),
            termId: toBigInt(b.termId),
            programId: toBigInt(b.programId),
          },
        });
        const rows = byParallel.get(p) || [];
        if (rows.length) {
          await tx.courseSchedule.createMany({
            data: rows.map((r) => ({
              courseId: course.id,
              classroomId: r.classroomId,
              weekday: r.weekday,
              start_time: r.start_time,
              end_time: r.end_time,
            })),
          });
        }
        out.push(course);
      }
      return out;
    });

    const result = await prisma.course.findMany({
      where: { id: { in: created.map((c) => c.id) } },
      include: {
        schedules: { include: { classroom: true } },
        teacher: true,
        modality: true,
        term: true,
        program: true,
      },
      orderBy: { id: "asc" },
    });

    res.status(201).json({ courses: serialize(result) });
  } catch {
    res.status(400).json({ error: "Error al crear cursos y horarios." });
  }
};
