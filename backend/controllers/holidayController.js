import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listHolidays = async (_req, res) => {
  try {
    const rows = await prisma.academicHoliday.findMany({
      orderBy: { date: "desc" },
    });
    res.json({ holidays: serialize(rows) });
  } catch {
    res.status(500).json({ error: "Error al listar feriados." });
  }
};

export const getHoliday = async (req, res) => {
  try {
    const row = await prisma.academicHoliday.findUnique({
      where: { id: BigInt(req.params.id) },
    });
    if (!row) return res.status(404).json({ error: "Feriado no encontrado." });
    res.json({ holiday: serialize(row) });
  } catch {
    res.status(500).json({ error: "Error al obtener feriado." });
  }
};

export const createHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;
    const created = await prisma.academicHoliday.create({
      data: { date: new Date(date), name },
    });
    res.status(201).json({ holiday: serialize(created) });
  } catch {
    res.status(400).json({ error: "No se pudo crear (fecha duplicada)." });
  }
};

export const updateHoliday = async (req, res) => {
  try {
    const { date, name } = req.body;
    const updated = await prisma.academicHoliday.update({
      where: { id: BigInt(req.params.id) },
      data: { date: date ? new Date(date) : undefined, name },
    });
    res.json({ holiday: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar feriado." });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    await prisma.academicHoliday.delete({
      where: { id: BigInt(req.params.id) },
    });
    res.json({ message: "Feriado eliminado." });
  } catch {
    res.status(400).json({ error: "No se pudo eliminar feriado." });
  }
};
