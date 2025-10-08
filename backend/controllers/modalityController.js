import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
const prisma = new PrismaClient();

export const listModalities = async (req, res) => {
  try {
    const modalities = await prisma.modality.findMany({
      orderBy: { id: "asc" },
    });
    res.json({ modalities: serialize(modalities) });
  } catch (err) {
    res.status(500).json({ error: "Error al listar modalidades." });
  }
};

export const getModalityById = async (req, res) => {
  const { id } = req.params;
  try {
    const modality = await prisma.modality.findUnique({
      where: { id: BigInt(id) },
    });
    if (!modality)
      return res.status(404).json({ error: "Modalidad no encontrada." });
    res.json({ modality: serialize(modality) });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener modalidad." });
  }
};

export const createModality = async (req, res) => {
  try {
    const modality = await prisma.modality.create({
      data: req.body,
    });
    res.status(201).json({ modality: serialize(modality) });
  } catch (err) {
    res.status(400).json({ error: "Error al crear modalidad." });
  }
};

export const updateModality = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.modality.update({
      where: { id: BigInt(id) },
      data: req.body,
    });
    res.json({ modality: serialize(updated) });
  } catch (err) {
    res.status(400).json({ error: "No se pudo actualizar modalidad." });
  }
};

export const deleteModality = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.modality.update({
      where: { id: BigInt(id) },
      data: { status: false },
    });
    res.json({ message: "Modalidad eliminada correctamente." });
  } catch (err) {
    res.status(400).json({ error: "Error al eliminar modalidad." });
  }
};
