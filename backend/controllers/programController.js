import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

const toBigInt = (v) =>
  v === null || v === undefined ? null : BigInt(String(v));

export const listPrograms = async (_req, res) => {
  try {
    const items = await prisma.program.findMany({
      where: { status: true },
      orderBy: { name: "asc" },
    });
    res.json({ programs: serialize(items) });
  } catch {
    res.status(500).json({ error: "Error al listar programas." });
  }
};

export const getProgramById = async (req, res) => {
  try {
    const item = await prisma.program.findUnique({
      where: { id: toBigInt(req.params.id) },
    });
    if (!item)
      return res.status(404).json({ error: "Programa no encontrado." });
    res.json({ program: serialize(item) });
  } catch {
    res.status(500).json({ error: "Error al obtener programa." });
  }
};

export const createProgram = async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.code || !b.name)
      return res.status(400).json({ error: "Datos incompletos." });
    const created = await prisma.program.create({
      data: {
        code: String(b.code),
        name: String(b.name),
        status: true,
      },
    });
    res.status(201).json({ program: serialize(created) });
  } catch {
    res.status(400).json({ error: "Error al crear programa." });
  }
};

export const updateProgram = async (req, res) => {
  try {
    const b = req.body || {};
    const updated = await prisma.program.update({
      where: { id: toBigInt(req.params.id) },
      data: {
        code: b.code ?? undefined,
        name: b.name ?? undefined,
        status: b.status ?? undefined,
      },
    });
    res.json({ program: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar programa." });
  }
};

export const deleteProgram = async (req, res) => {
  try {
    await prisma.program.update({
      where: { id: toBigInt(req.params.id) },
      data: { status: false },
    });
    res.json({ message: "Programa eliminado." });
  } catch {
    res.status(400).json({ error: "Error al eliminar programa." });
  }
};
