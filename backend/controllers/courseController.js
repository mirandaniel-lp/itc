import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { status: true },
      orderBy: { id: "asc" },
      include: {
        teacher: true,
        modality: true,
      },
    });
    res.json({ courses: serialize(courses) });
  } catch (err) {
    res.status(500).json({ error: "Error al listar cursos." });
  }
};

export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await prisma.course.findUnique({
      where: { id: BigInt(id) },
    });
    if (!course) return res.status(404).json({ error: "Curso no encontrado." });
    res.json({ course: serialize(course) });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener curso." });
  }
};

export const createCourse = async (req, res) => {
  try {
    const course = await prisma.course.create({
      data: req.body,
    });
    res.status(201).json({ course: serialize(course) });
  } catch (err) {
    res.status(400).json({ error: "Error al crear curso." });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.course.update({
      where: { id: BigInt(id) },
      data: req.body,
    });
    res.json({ course: serialize(updated) });
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ error: "Error al listar estudiantes del curso." });
  }
};
