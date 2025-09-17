import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function serializeBigInt(obj) {
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  } else if (obj && typeof obj === "object") {
    const result = {};
    for (const key in obj) {
      const value = obj[key];
      result[key] =
        typeof value === "bigint" ? value.toString() : serializeBigInt(value);
    }
    return result;
  }
  return obj;
}

export const listModalities = async (req, res) => {
  try {
    const modalities = await prisma.modality.findMany({
      orderBy: { id: "asc" },
    });
    res.json({ modalities: serializeBigInt(modalities) });
  } catch (err) {
    console.error("ERROR al listar modalidades:", err);
    res.status(500).json({ error: "Error al obtener modalidades." });
  }
};
