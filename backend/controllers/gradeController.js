import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listGrades = async (req, res) => {
  try {
    const grades = await prisma.grade.findMany({
      where: { status: true },
      orderBy: { id: "asc" },
      include: { student: true, activity: true },
    });
    res.json({ grades: serialize(grades) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar calificaciones." });
  }
};

export const listGradesByActivity = async (req, res) => {
  const { activityId } = req.params;
  try {
    const grades = await prisma.grade.findMany({
      where: { activityId: BigInt(activityId), status: true },
      orderBy: { id: "asc" },
      include: { student: true },
    });
    res.json({ grades: serialize(grades) });
  } catch (err) {
    res.status(500).json({ error: "Error al listar calificaciones." });
  }
};

export const createGrade = async (req, res) => {
  try {
    const { activityId, studentId, score, feedback } = req.body;

    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return res.status(400).json({ error: "Nota inválida." });
    }

    const existing = await prisma.grade.findFirst({
      where: { activityId: BigInt(activityId), studentId: BigInt(studentId) },
    });

    if (existing) {
      const updated = await prisma.grade.update({
        where: { id: existing.id },
        data: { score: numericScore.toFixed(2), feedback },
      });
      return res.json(serialize(updated));
    }

    const grade = await prisma.grade.create({
      data: {
        activityId: BigInt(activityId),
        studentId: BigInt(studentId),
        score: numericScore.toFixed(2),
        feedback,
      },
    });
    res.status(201).json(serialize(grade));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error al crear calificación." });
  }
};

export const updateGrade = async (req, res) => {
  const { id } = req.params;
  const { score, feedback } = req.body;

  try {
    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return res.status(400).json({ error: "Nota inválida." });
    }

    const updated = await prisma.grade.update({
      where: { id: BigInt(id) },
      data: {
        score: numericScore.toFixed(2),
        feedback,
      },
    });
    res.json(serialize(updated));
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ error: err.message || "No se pudo actualizar la nota." });
  }
};

export const deleteGrade = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.grade.update({
      where: { id: BigInt(id) },
      data: { status: false },
    });
    res.json({ message: "Calificación eliminada correctamente." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error al eliminar calificación." });
  }
};
