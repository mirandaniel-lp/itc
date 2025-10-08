import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listEnrollments = async (req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { status: true },
      orderBy: { id: "asc" },
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
    res.json({ enrollments: serialize(enrollments) });
  } catch (err) {
    res.status(500).json({ error: "Error al listar inscripciones." });
  }
};

export const getEnrollmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: BigInt(id) },
    });
    if (!enrollment)
      return res.status(404).json({ error: "Inscripción no encontrada." });
    res.json({ enrollment: serialize(enrollment) });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener inscripción." });
  }
};

export const createEnrollment = async (req, res) => {
  try {
    const enrollment = await prisma.enrollment.create({
      data: req.body,
    });
    res.status(201).json({ enrollment: serialize(enrollment) });
  } catch (err) {
    res.status(400).json({ error: "Error al crear inscripción." });
  }
};

export const updateEnrollment = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.enrollment.update({
      where: { id: BigInt(id) },
      data: req.body,
    });
    res.json({ enrollment: serialize(updated) });
  } catch (err) {
    res.status(400).json({ error: "No se pudo actualizar inscripción." });
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
    res.status(400).json({ error: "Error al eliminar inscripción." });
  }
};
