import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { id: "asc" },
    });
    res.json({ activities: serialize(activities) });
  } catch (err) {
    res.status(500).json({ error: "Error al listar actividades." });
  }
};

export const getActivityById = async (req, res) => {
  const { id } = req.params;
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: BigInt(id) },
      include: {
        course: {
          include: {
            modality: true,
          },
        },
        teacher: true,
      },
    });
    if (!activity) {
      return res.status(404).json({ error: "Actividad no encontrada." });
    }
    res.json(serialize(activity));
  } catch (err) {
    res.status(500).json({ error: "Error al obtener actividad." });
  }
};

export const createActivity = async (req, res) => {
  try {
    const activity = await prisma.activity.create({
      data: req.body,
    });
    res.status(201).json({ activity: serialize(activity) });
  } catch (err) {
    res.status(400).json({ error: "Error al crear actividad." });
  }
};

export const updateActivity = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.activity.update({
      where: { id: BigInt(id) },
      data: req.body,
    });
    res.json({ activity: serialize(updated) });
  } catch (err) {
    res.status(400).json({ error: "No se pudo actualizar actividad." });
  }
};

export const deleteActivity = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.activity.update({
      where: { id: BigInt(id) },
      data: { status: false },
    });
    res.json({ message: "Actividad eliminada correctamente." });
  } catch (err) {
    res.status(400).json({ error: "Error al eliminar actividad." });
  }
};

export const listActivitiesByCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const activities = await prisma.activity.findMany({
      where: {
        courseId: BigInt(courseId),
        status: true,
      },
      orderBy: { id: "asc" },
      include: { teacher: true },
    });
    res.json({ activities: serialize(activities) });
  } catch (err) {
    console.error("Error en listActivitiesByCourse:", err);
    res.status(500).json({ error: "Error al listar actividades." });
  }
};
