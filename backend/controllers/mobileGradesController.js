import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getGrades(req, res) {
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
  const grades = await prisma.grade.findMany({
    where: {
      studentId: BigInt(req.studentId),
      status: true,
      is_published: true,
      activity: { courseId: BigInt(courseId) },
    },
    include: { activity: true },
    orderBy: { created_at: "asc" },
  });
  const items = grades.map((g) => ({
    activityId: Number(g.activityId),
    activityTitle: g.activity.title,
    score: Number(g.score),
    feedback: g.feedback || "",
  }));
  const avg = items.length
    ? items.reduce((a, b) => a + b.score, 0) / items.length
    : 0;
  return res.json({
    ok: true,
    summary: { count: items.length, average: Number(avg.toFixed(2)) },
    items,
  });
}
