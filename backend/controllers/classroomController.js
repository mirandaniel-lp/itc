import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listClassrooms = async (_req, res) => {
  try {
    const rows = await prisma.classroom.findMany({
      where: { status: true },
      orderBy: { id: "desc" },
    });
    res.json({ classrooms: serialize(rows) });
  } catch (e) {
    res.status(500).json({ error: "Error al listar aulas." });
  }
};

export const getClassroom = async (req, res) => {
  try {
    const row = await prisma.classroom.findUnique({
      where: { id: BigInt(req.params.id) },
    });
    if (!row) return res.status(404).json({ error: "Aula no encontrada." });
    res.json({ classroom: serialize(row) });
  } catch {
    res.status(500).json({ error: "Error al obtener aula." });
  }
};

export const createClassroom = async (req, res) => {
  try {
    const { code, name, location, capacity } = req.body;
    const created = await prisma.classroom.create({
      data: { code, name, location, capacity, status: true },
    });
    res.status(201).json({ classroom: serialize(created) });
  } catch {
    res.status(400).json({ error: "No se pudo crear el aula." });
  }
};

export const updateClassroom = async (req, res) => {
  try {
    const { code, name, location, capacity, status } = req.body;
    const updated = await prisma.classroom.update({
      where: { id: BigInt(req.params.id) },
      data: { code, name, location, capacity, status },
    });
    res.json({ classroom: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar el aula." });
  }
};

export const deleteClassroom = async (req, res) => {
  try {
    await prisma.classroom.update({
      where: { id: BigInt(req.params.id) },
      data: { status: false },
    });
    res.json({ message: "Aula desactivada." });
  } catch {
    res.status(400).json({ error: "No se pudo eliminar el aula." });
  }
};
