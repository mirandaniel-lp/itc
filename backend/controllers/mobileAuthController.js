import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const loginSchema = z.object({
  username: z.string().min(1),
  pin: z.string().regex(/^\d{4,6}$/),
});

const changePinSchema = z.object({
  currentPin: z.string().regex(/^\d{4,6}$/),
  newPin: z.string().regex(/^\d{4,6}$/),
});

export async function login(req, res) {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({
      ok: false,
      message: "Datos inválidos",
      code: "VALIDATION_ERROR",
    });
  const { username, pin } = parse.data;
  const student = await prisma.student.findFirst({
    where: { app_username: username },
  });
  if (!student || !student.app_password_hash)
    return res.status(401).json({
      ok: false,
      message: "Credenciales inválidas",
      code: "CREDENCIALES_INVALIDAS",
    });
  if (student.app_enabled === false)
    return res.status(403).json({
      ok: false,
      message: "Cuenta deshabilitada",
      code: "CUENTA_DESHABILITADA",
    });
  const ok = await bcrypt.compare(pin, student.app_password_hash);
  if (!ok)
    return res.status(401).json({
      ok: false,
      message: "Credenciales inválidas",
      code: "CREDENCIALES_INVALIDAS",
    });
  const token = jwt.sign(
    { studentId: Number(student.id), role: "student" },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "24h" }
  );
  const fullName = [student.name, student.last_name, student.second_last_name]
    .filter(Boolean)
    .join(" ");
  return res.json({
    ok: true,
    token,
    student: {
      id: Number(student.id),
      fullName,
      ci: student.ci || null,
      email: null,
    },
  });
}

export async function changePin(req, res) {
  const parse = changePinSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({
      ok: false,
      message: "Datos inválidos",
      code: "VALIDATION_ERROR",
    });
  const { currentPin, newPin } = parse.data;
  const student = await prisma.student.findUnique({
    where: { id: BigInt(req.studentId) },
  });
  if (!student || !student.app_password_hash)
    return res
      .status(401)
      .json({ ok: false, message: "No autorizado", code: "UNAUTHORIZED" });
  const ok = await bcrypt.compare(currentPin, student.app_password_hash);
  if (!ok)
    return res.status(401).json({
      ok: false,
      message: "PIN actual incorrecto",
      code: "PIN_INCORRECTO",
    });
  const hash = await bcrypt.hash(newPin, 10);
  await prisma.student.update({
    where: { id: BigInt(req.studentId) },
    data: { app_password_hash: hash },
  });
  return res.json({ ok: true, message: "PIN actualizado" });
}
