import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

const toBigInt = (v) =>
  v === null || v === undefined ? null : BigInt(String(v));

export const summary = async (_req, res) => {
  try {
    const students = await prisma.student.count({ where: { status: true } });
    const courses = await prisma.course.count({ where: { status: true } });
    const enrollments = await prisma.enrollment.count({
      where: { status: true },
    });
    const teachers = await prisma.teacher.count({ where: { status: true } });
    res.json({
      students_active: students,
      courses_active: courses,
      enrollments_active: enrollments,
      teachers_active: teachers,
    });
  } catch {
    res.status(500).json({ error: "Error al obtener resumen." });
  }
};

export const listActiveCourses = async (_req, res) => {
  try {
    const items = await prisma.course.findMany({
      where: { status: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, parallel: true, modalityId: true },
    });
    res.json({ courses: serialize(items) });
  } catch {
    res.status(500).json({ error: "Error al listar cursos." });
  }
};

export const coursePerformance = async (req, res) => {
  try {
    const courseId = toBigInt(req.params.id);
    const enrolls = await prisma.enrollment.findMany({
      where: { courseId, status: true },
      include: { student: true },
    });
    const out = [];
    for (const e of enrolls) {
      const avgRes = await prisma.grade.aggregate({
        where: {
          studentId: e.studentId,
          activity: { courseId },
          status: true,
          is_published: true,
        },
        _avg: { score: true },
      });
      const attendanceCount = await prisma.attendance.count({
        where: { studentId: e.studentId, courseId },
      });
      out.push({
        studentId: Number(e.studentId),
        studentName: `${e.student.name} ${e.student.last_name ?? ""} ${
          e.student.second_last_name ?? ""
        }`.trim(),
        avg_score:
          avgRes._avg.score === null ? null : Number(avgRes._avg.score),
        attendances: attendanceCount,
      });
    }
    res.json({ students: out });
  } catch {
    res.status(500).json({ error: "Error al obtener desempeño del curso." });
  }
};
