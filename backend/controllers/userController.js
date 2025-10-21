import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: true,
        id: { not: req.user.userId },
      },
      select: {
        id: true,
        email: true,
        roleId: true,
        role: {
          select: { name: true },
        },
        created_at: true,
        status: true,
      },
      orderBy: { id: "asc" },
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: "Error al listar usuarios." });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        email_verified_at: true,
        roleId: true,
        role: { select: { name: true } },
        created_at: true,
        updated_at: true,
        status: true,
      },
    });
    if (!user || !user.status) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuario." });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, roleId } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        roleId,
      },
    });
    res.json({
      message: "Usuario actualizado.",
      user: {
        id: updated.id,
        email: updated.email,
        roleId: updated.roleId,
      },
    });
  } catch (err) {
    res.status(400).json({ error: "No se pudo actualizar el usuario." });
  }
};

export const softDeleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: false },
    });
    res.json({ message: "Usuario eliminado exitosamente." });
  } catch (err) {
    res.status(400).json({ error: "No se pudo eliminar al usuario." });
  }
};
