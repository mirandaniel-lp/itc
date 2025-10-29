import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

const toBigInt = (v) =>
  v === null || v === undefined ? null : BigInt(String(v));

export const listTerms = async (_req, res) => {
  try {
    const items = await prisma.academicTerm.findMany({
      where: { status: true },
      orderBy: { start_date: "desc" },
    });
    res.json({ terms: serialize(items) });
  } catch {
    res.status(500).json({ error: "Error al listar periodos." });
  }
};

export const getTermById = async (req, res) => {
  try {
    const item = await prisma.academicTerm.findUnique({
      where: { id: toBigInt(req.params.id) },
    });
    if (!item) return res.status(404).json({ error: "Periodo no encontrado." });
    res.json({ term: serialize(item) });
  } catch {
    res.status(500).json({ error: "Error al obtener periodo." });
  }
};

export const createTerm = async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.start_date || !b.end_date)
      return res.status(400).json({ error: "Datos incompletos." });
    const created = await prisma.academicTerm.create({
      data: {
        name: String(b.name),
        start_date: new Date(b.start_date),
        end_date: new Date(b.end_date),
        status: true,
      },
    });
    res.status(201).json({ term: serialize(created) });
  } catch {
    res.status(400).json({ error: "Error al crear periodo." });
  }
};

export const updateTerm = async (req, res) => {
  try {
    const b = req.body || {};
    const updated = await prisma.academicTerm.update({
      where: { id: toBigInt(req.params.id) },
      data: {
        name: b.name ?? undefined,
        start_date: b.start_date ? new Date(b.start_date) : undefined,
        end_date: b.end_date ? new Date(b.end_date) : undefined,
        status: b.status ?? undefined,
      },
    });
    res.json({ term: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar periodo." });
  }
};

export const deleteTerm = async (req, res) => {
  try {
    await prisma.academicTerm.update({
      where: { id: toBigInt(req.params.id) },
      data: { status: false },
    });
    res.json({ message: "Periodo eliminado." });
  } catch {
    res.status(400).json({ error: "Error al eliminar periodo." });
  }
};
