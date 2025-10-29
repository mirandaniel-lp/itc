import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function dateIso(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : null;
}

export async function getCourses(req, res) {
  const enrolls = await prisma.enrollment.findMany({
    where: { studentId: BigInt(req.studentId), status: true },
    include: {
      course: {
        include: { teacher: true, program: true, modality: true, term: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
  const courses = enrolls.map((e) => ({
    id: Number(e.course.id),
    name: e.course.name,
    parallel: e.course.parallel,
    startDate: dateIso(e.course.start_date),
    endDate: dateIso(e.course.end_date),
    shift: e.course.shift,
    teacherName: [
      e.course.teacher.name,
      e.course.teacher.last_name,
      e.course.teacher.second_last_name,
    ]
      .filter(Boolean)
      .join(" "),
    program: e.course.program.name,
    modality: e.course.modality.name,
  }));
  return res.json({ ok: true, courses });
}

export async function getSchedule(req, res) {
  const enrolls = await prisma.enrollment.findMany({
    where: { studentId: BigInt(req.studentId), status: true },
    select: { courseId: true },
  });
  const courseIds = enrolls.map((e) => e.courseId);
  if (courseIds.length === 0) return res.json({ ok: true, items: [] });
  const schedules = await prisma.courseSchedule.findMany({
    where: { courseId: { in: courseIds } },
    include: { classroom: true, course: true },
    orderBy: [{ weekday: "asc" }, { start_time: "asc" }],
  });
  const items = schedules.map((s) => ({
    courseId: Number(s.courseId),
    weekday: s.weekday,
    start: s.start_time,
    end: s.end_time,
    classroom: s.classroom.code,
    courseName: `${s.course.name} - ${s.course.parallel}`,
  }));
  return res.json({ ok: true, items });
}

export async function getActivities(req, res) {
  const courseId = Number(req.query.courseId || 0);
  if (!courseId)
    return res.status(400).json({
      ok: false,
      message: "courseId requerido",
      code: "VALIDATION_ERROR",
    });
  const enroll = await prisma.enrollment.findFirst({
    where: {
      studentId: BigInt(req.studentId),
      courseId: BigInt(courseId),
      status: true,
    },
  });
  if (!enroll)
    return res.status(403).json({
      ok: false,
      message: "Acceso denegado al curso",
      code: "FORBIDDEN",
    });
  const acts = await prisma.activity.findMany({
    where: { courseId: BigInt(courseId), status: true, is_published: true },
    orderBy: [{ due_date: "asc" }, { created_at: "asc" }],
  });
  const activities = acts.map((a) => ({
    id: Number(a.id),
    title: a.title,
    type: a.type,
    weightPct: a.weight_pct ? Number(a.weight_pct) : null,
    dueDate: a.due_date
      ? new Date(a.due_date).toISOString().slice(0, 10)
      : null,
  }));
  return res.json({ ok: true, activities });
}
