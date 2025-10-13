// controllers/teacherDashboardController.js
import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";

const prisma = new PrismaClient();

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = BigInt(req.teacher?.id || 41);
    const courses = await prisma.course.findMany({
      where: { teacherId, status: true },
      include: {
        students: { include: { student: true } },
        activities: true,
      },
      orderBy: { id: "asc" },
    });

    const totalStudents = courses.reduce(
      (acc, course) => acc + (course.students?.length || 0),
      0
    );
    const totalActivities = courses.reduce(
      (acc, course) => acc + (course.activities?.length || 0),
      0
    );
    const lowPerformance = courses.reduce(
      (acc, course) =>
        acc +
        (course.students?.filter((s) => s.student.lowPerformance)?.length || 0),
      0
    );

    res.json({
      courses,
      totalStudents,
      totalActivities,
      lowPerformance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar el dashboard docente" });
  }
};
