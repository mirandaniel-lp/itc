import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "../utils/serializer.js";
import { sendTeacherCredentials } from "../utils/mailer.js";

const prisma = new PrismaClient();

const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

export const listTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { status: true },
      orderBy: { id: "asc" },
    });
    res.json({ teachers: serialize(teachers) });
  } catch {
    res.status(500).json({ error: "Error al listar docentes." });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: BigInt(req.params.id) },
    });
    if (!teacher || !teacher.status)
      return res.status(404).json({ error: "Docente no encontrado." });
    res.json({ teacher: serialize(teacher) });
  } catch {
    res.status(500).json({ error: "Error al obtener docente." });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const plainPassword = generatePin();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const data = { ...req.body, password: hashedPassword };
    const teacher = await prisma.teacher.create({ data });

    if (req.body.email) {
      await sendTeacherCredentials({
        to: req.body.email,
        name: req.body.name,
        ci: req.body.ci,
        pin: plainPassword,
      });
    }

    res.status(201).json({ teacher: serialize(teacher), pin: plainPassword });
  } catch {
    res.status(400).json({ error: "Error al crear docente." });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const updated = await prisma.teacher.update({
      where: { id: BigInt(req.params.id) },
      data: req.body,
    });
    res.json({ teacher: serialize(updated) });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar docente." });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    await prisma.teacher.update({
      where: { id: BigInt(req.params.id) },
      data: { status: false },
    });
    res.json({ message: "Docente eliminado correctamente." });
  } catch {
    res.status(400).json({ error: "Error al eliminar docente." });
  }
};

export const loginTeacher = async (req, res) => {
  const { ci, password } = req.body;
  try {
    const teacher = await prisma.teacher.findUnique({ where: { ci } });
    if (!teacher || !teacher.status)
      return res.status(401).json({ error: "CI o contraseña incorrectos." });

    const valid = await bcrypt.compare(password, teacher.password);
    if (!valid)
      return res.status(401).json({ error: "CI o contraseña incorrectos." });

    const token = jwt.sign(
      {
        id: teacher.id.toString(),
        ci: teacher.ci,
        role: "TEACHER",
        name: teacher.name,
        last_name: teacher.last_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Inicio de sesión exitoso.",
      token,
      teacher: serialize(teacher),
    });
  } catch {
    res.status(500).json({ error: "Error al iniciar sesión docente." });
  }
};

export const logoutTeacher = async (req, res) => {
  try {
    res.json({ message: "Sesión cerrada exitosamente." });
  } catch {
    res.status(500).json({ error: "Error al cerrar sesión." });
  }
};

export const getTeacherCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { teacherId: BigInt(req.params.id), status: true },
      include: {
        modality: true,
        students: { include: { student: true } },
      },
    });
    res.json({ courses: serialize(courses) });
  } catch {
    res.status(500).json({ error: "Error al obtener cursos del docente." });
  }
};
