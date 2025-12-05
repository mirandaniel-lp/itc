import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function toDateOnly(s) {
  const d = new Date(s);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

export async function getAttendance(req, res) {
  const courseId = Number(req.query.courseId || 0);
  if (!courseId)
    return res.status(400).json({
      ok: false,
      message: "courseId es requerido",
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

  const course = await prisma.course.findUnique({
    where: { id: BigInt(courseId) },
    select: { start_date: true, end_date: true },
  });

  const from = toDateOnly(course.start_date);
  const to = course.end_date ? toDateOnly(course.end_date) : new Date();

  const itemsDb = await prisma.attendance.findMany({
    where: {
      studentId: BigInt(req.studentId),
      courseId: BigInt(courseId),
      date: { gte: from, lte: to },
    },
    orderBy: { date: "asc" },
  });

  const items = itemsDb.map((a) => ({
    date: new Date(a.date).toISOString().slice(0, 10),
    status: a.status,
    checkinAt: a.checkinAt
      ? new Date(a.checkinAt).toISOString().slice(11, 16)
      : null,
    checkoutAt: a.checkoutAt
      ? new Date(a.checkoutAt).toISOString().slice(11, 16)
      : null,
  }));

  const present = itemsDb.filter((i) => i.status === "PRESENTE").length;
  const absent = itemsDb.filter((i) => i.status === "AUSENTE").length;
  const late = itemsDb.filter((i) => i.status === "TARDE").length;
  const licensed = itemsDb.filter((i) => i.status === "LICENCIA").length;
  const total = present + absent + late + licensed;
  const attendancePct = total
    ? Number(((present / total) * 100).toFixed(1))
    : 0;

  const gradePolicy = await prisma.gradePolicy.findUnique({
    where: { courseId: BigInt(courseId) },
  });
  const minAttendancePct = gradePolicy?.min_attendance_pct?.toNumber() ?? 0;
  const meetsRequirement = attendancePct >= minAttendancePct;

  return res.json({
    ok: true,
    summary: {
      present,
      absent,
      late,
      licensed,
      total,
      attendancePct,
      minAttendancePct,
      meetsRequirement,
    },
    items,
  });
}
