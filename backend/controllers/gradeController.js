import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listGrades = async (req, res) => {
  try {
    const grades = await prisma.grade.findMany({
      orderBy: { id: "asc" },
    });
    res.json({ grades: serialize(grades) });
  } catch (err) {
    res.status(500).json({ error: "Error al listar calificaciones." });
  }
};

export const getGradeById = async (req, res) => {
  const { id } = req.params;
  try {
    const grade = await prisma.grade.findUnique({
      where: { id: BigInt(id) },
    });
    if (!grade)
      return res.status(404).json({ error: "Calificación no encontrada." });
    res.json({ grade: serialize(grade) });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener calificación." });
  }
};

export const createGrade = async (req, res) => {
  try {
    const grade = await prisma.grade.create({
      data: req.body,
    });
    res.status(201).json({ grade: serialize(grade) });
  } catch (err) {
    res.status(400).json({ error: "Error al crear calificación." });
    console.log(err);
  }
};

export const updateGrade = async (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  try {
    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      return res.status(400).json({ error: "Nota inválida." });
    }
    const updated = await prisma.grade.update({
      where: { id: BigInt(id) },
      data: { score: numericScore.toFixed(2) },
    });
    res.json({ grade: serialize(updated) });
  } catch (err) {
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
    res.status(400).json({ error: "Error al eliminar calificación." });
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
