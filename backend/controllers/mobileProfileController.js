import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const patchSchema = z.object({ phone: z.string().min(6).max(20).optional() });

function imgUrl(image) {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return "/uploads/" + image.replace(/^\/+/, "");
}

export async function me(req, res) {
  const s = await prisma.student.findUnique({
    where: { id: BigInt(req.studentId) },
  });
  if (!s)
    return res
      .status(404)
      .json({ ok: false, message: "No encontrado", code: "NOT_FOUND" });
  return res.json({
    ok: true,
    student: {
      id: Number(s.id),
      name: s.name,
      lastName: s.last_name,
      secondLastName: s.second_last_name,
      ci: s.ci || "",
      phone: s.phone,
      gender: s.gender,
      imageUrl: imgUrl(s.image),
    },
  });
}

export async function patchProfile(req, res) {
  const parse = patchSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({
      ok: false,
      message: "Datos inválidos",
      code: "VALIDATION_ERROR",
    });
  const data = {};
  if (parse.data.phone !== undefined) data.phone = parse.data.phone;
  const updated = await prisma.student.update({
    where: { id: BigInt(req.studentId) },
    data,
  });
  return res.json({
    ok: true,
    student: {
      id: Number(updated.id),
      name: updated.name,
      lastName: updated.last_name,
      secondLastName: updated.second_last_name,
      ci: updated.ci || "",
      phone: updated.phone,
      gender: updated.gender,
      imageUrl: imgUrl(updated.image),
    },
  });
}

export async function uploadAvatar(req, res) {
  if (!req.file)
    return res
      .status(400)
      .json({ ok: false, message: "Archivo requerido", code: "FILE_REQUIRED" });
  await prisma.student.update({
    where: { id: BigInt(req.studentId) },
    data: { image: req.file.filename },
  });
  return res.json({ ok: true, imageUrl: "/uploads/" + req.file.filename });
}
