import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listPolicies = async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = courseId ? { courseId: BigInt(courseId) } : {};
    const rows = await prisma.gradePolicy.findMany({
      where,
      include: { course: { select: { id: true, name: true, parallel: true } } },
      orderBy: { id: "desc" },
    });
    res.json({ policies: serialize(rows) });
  } catch {
    res.status(500).json({ error: "Error al listar políticas." });
  }
};

export const getPolicy = async (req, res) => {
  try {
    const row = await prisma.gradePolicy.findUnique({
      where: { id: BigInt(req.params.id) },
      include: { course: { select: { id: true, name: true, parallel: true } } },
    });
    if (!row) return res.status(404).json({ error: "Política no encontrada." });
    res.json({ policy: serialize(row) });
  } catch {
    res.status(500).json({ error: "Error al obtener política." });
  }
};

export const getPolicyByCourse = async (req, res) => {
  try {
    const row = await prisma.gradePolicy.findUnique({
      where: { courseId: BigInt(req.params.courseId) },
    });
    if (!row)
      return res.status(404).json({ error: "Sin política para el curso." });
    res.json({ policy: serialize(row) });
  } catch {
    res.status(500).json({ error: "Error al obtener política del curso." });
  }
};

export const createPolicy = async (req, res) => {
  try {
    const { courseId, min_approval_score, min_attendance_pct } = req.body;
    const created = await prisma.gradePolicy.create({
      data: {
        courseId: BigInt(courseId),
        min_approval_score,
        min_attendance_pct,
      },
    });
    res.status(201).json({ policy: serialize(created) });
  } catch {
    res
      .status(400)
      .json({ error: "No se pudo crear la política (curso ya tiene una)." });
  }
};

export const updatePolicy = async (req, res) => {
  try {
    const { min_approval_score, min_attendance_pct } = req.body;
    const updated = await prisma.gradePolicy.update({
      where: { id: BigInt(req.params.id) },
      data: { min_approval_score, min_attendance_pct },
    });
    res.json({ policy: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar la política." });
  }
};

export const deletePolicy = async (req, res) => {
  try {
    await prisma.gradePolicy.delete({ where: { id: BigInt(req.params.id) } });
    res.json({ message: "Política eliminada." });
  } catch {
    res.status(400).json({ error: "No se pudo eliminar la política." });
  }
};
