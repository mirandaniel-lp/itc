import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const convertBigIntAndDates = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntAndDates);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === "bigint") {
        newObj[key] = value.toString();
      } else if (value instanceof Date) {
        newObj[key] = value.toISOString();
      } else {
        newObj[key] = convertBigIntAndDates(value);
      }
    }
    return newObj;
  }
  return obj;
};

export const listEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { status: true },
      include: {
        student: true,
        course: {
          include: {
            teacher: true,
            modality: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });
    res.json({ enrollments: convertBigIntAndDates(enrollments) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar inscripciones." });
  }
};

export const getEnrollmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: BigInt(id) },
      include: {
        student: true,
        course: {
          include: {
            teacher: true,
            modality: true,
          },
        },
      },
    });

    if (!enrollment || !enrollment.status) {
      return res.status(404).json({ error: "Inscripción no encontrada." });
    }

    res.json({ enrollment: convertBigIntAndDates(enrollment) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener inscripción." });
  }
};

export const createEnrollment = async (req, res) => {
  try {
    const { studentId, courseId, enrollment_date, payment_type } = req.body;

    const student = await prisma.student.findUnique({
      where: { id: BigInt(studentId) },
    });

    if (!student || student.status !== true) {
      return res
        .status(400)
        .json({ error: "Estudiante inactivo o no encontrado." });
    }

    const course = await prisma.course.findUnique({
      where: { id: BigInt(courseId) },
    });

    if (!course || course.status !== true) {
      return res.status(400).json({ error: "Curso inactivo o no encontrado." });
    }

    if (course.end_date && new Date(course.end_date) < new Date()) {
      return res
        .status(400)
        .json({ error: "Curso finalizado. No se puede inscribir." });
    }

    const exists = await prisma.enrollment.findFirst({
      where: {
        studentId: BigInt(studentId),
        courseId: BigInt(courseId),
        status: true,
      },
    });

    if (exists) {
      return res
        .status(400)
        .json({ error: "Estudiante ya inscrito en este curso." });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: BigInt(studentId),
        courseId: BigInt(courseId),
        enrollment_date: new Date(enrollment_date),
        payment_type,
        status: true,
      },
    });

    res.status(201).json({ enrollment: convertBigIntAndDates(enrollment) });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error al crear inscripción." });
  }
};

export const deleteEnrollment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.enrollment.update({
      where: { id: BigInt(id) },
      data: { status: false },
    });
    res.json({ message: "Inscripción eliminada correctamente." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error al eliminar inscripción." });
  }
};
