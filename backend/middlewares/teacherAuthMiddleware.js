import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authenticateTeacher = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header) return res.status(401).json({ error: "No autorizado." });
    const parts = header.split(" ");
    if (parts.length !== 2)
      return res
        .status(401)
        .json({ error: "Formato de autorización inválido." });
    const token = parts[1];
    if (!token) return res.status(401).json({ error: "Token inválido." });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherIdRaw =
      decoded?.id ?? decoded?.teacherId ?? decoded?.teacher_id ?? decoded?.sub;

    if (!teacherIdRaw) {
      return res
        .status(403)
        .json({ error: "Token no contiene identificador de docente." });
    }

    let teacherId;
    try {
      teacherId = BigInt(teacherIdRaw);
    } catch (e) {
      return res
        .status(400)
        .json({ error: "Identificador de docente inválido en token." });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || !teacher.status) {
      return res
        .status(403)
        .json({ error: "Docente no encontrado o inactivo." });
    }
    req.teacherId = teacher.id.toString();
    req.teacher = teacher;
    req.teacherPayload = decoded;
    next();
  } catch (err) {
    console.error("authenticateTeacher error:", err);
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
};
