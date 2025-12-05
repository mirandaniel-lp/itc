import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { serialize } from "../utils/serializer.js";

const prisma = new PrismaClient();

const whereFromReq = (req) => {
  const id = req?.user?.userId ?? req?.user?.id;
  if (id) return { id: Number(id) };
  if (req?.user?.email) return { email: String(req.user.email) };
  return null;
};

export const getProfile = async (req, res) => {
  const where = whereFromReq(req);
  if (!where) return res.status(401).json({ error: "No autorizado" });
  const u = await prisma.user.findUnique({
    where,
    include: { role: true, notificationRecipients: true },
  });
  if (!u) return res.status(401).json({ error: "No autorizado" });
  const data = serialize(u);
  delete data.password;
  res.json({ user: data });
};

export const updateEmail = async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email requerido" });
  const where = whereFromReq(req);
  if (!where) return res.status(401).json({ error: "No autorizado" });
  try {
    const u = await prisma.user.update({ where, data: { email } });
    const data = serialize(u);
    delete data.password;
    res.json({ user: data });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar el email" });
  }
};

export const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!current_password || !new_password)
    return res.status(400).json({ error: "Datos incompletos" });
  const where = whereFromReq(req);
  if (!where) return res.status(401).json({ error: "No autorizado" });
  const u = await prisma.user.findUnique({ where });
  if (!u) return res.status(401).json({ error: "No autorizado" });
  const ok = await bcrypt.compare(current_password, u.password);
  if (!ok)
    return res.status(400).json({ error: "Contraseña actual incorrecta" });
  const hash = await bcrypt.hash(new_password, 10);
  await prisma.user.update({ where: { id: u.id }, data: { password: hash } });
  res.json({ message: "Contraseña actualizada" });
};
