import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const register = async (req, res) => {
  const { email, password, roleId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId,
      },
    });
    res.status(201).json({
      message: "Usuario registrado exitosamente.",
      user: { id: user.id, email: user.email, roleId: user.roleId },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ error: "Credenciales incorrectas." });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: "Credenciales incorrectas." });
    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    await prisma.loginSession.create({
      data: {
        userId: user.id,
        ip:
          req.ip ||
          (req.headers["x-forwarded-for"] || "").split(",")[0] ||
          null,
        userAgent: req.headers["user-agent"] ?? null,
        startedAt: new Date(),
      },
    });
    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Inicio de sesión exitoso.", token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        roleId: true,
        role: {
          select: { name: true },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuario." });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user?.userId ?? null;
    if (userId) {
      await prisma.loginSession.updateMany({
        where: { userId, endedAt: null },
        data: { endedAt: new Date(), updatedBy: userId },
      });
    }
    res.clearCookie("token");
    res.json({ message: "Sesión cerrada correctamente." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
