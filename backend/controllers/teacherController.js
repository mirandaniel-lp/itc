import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { serialize } from "../utils/serializer.js";
import { sendTeacherCredentials } from "../utils/mailer.js";

const prisma = new PrismaClient();
const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

export const listTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { status: true },
      orderBy: { id: "desc" },
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
    const pin = generatePin();
    const hashedPassword = await bcrypt.hash(pin, 10);
    const teacher = await prisma.teacher.create({
      data: {
        name: req.body.name,
        last_name: req.body.last_name,
        second_last_name: req.body.second_last_name,
        email: req.body.email,
        ci: req.body.ci,
        dateofbirth: req.body.dateofbirth
          ? new Date(req.body.dateofbirth)
          : null,
        placeofbirth: req.body.placeofbirth,
        phone: req.body.phone,
        gender: req.body.gender,
        specialty: req.body.specialty,
        password: hashedPassword,
        status: true,
      },
    });
    res.status(201).json({ teacher: serialize(teacher), pin });
    if (req.body.email) {
      Promise.resolve(
        sendTeacherCredentials({
          to: req.body.email,
          name: req.body.name,
          ci: req.body.ci,
          pin,
        })
      ).catch(() => {});
    }
  } catch {
    res.status(400).json({ error: "Error al crear docente." });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const updated = await prisma.teacher.update({
      where: { id: BigInt(req.params.id) },
      data: {
        name: req.body.name,
        last_name: req.body.last_name,
        second_last_name: req.body.second_last_name,
        email: req.body.email,
        ci: req.body.ci,
        dateofbirth: req.body.dateofbirth
          ? new Date(req.body.dateofbirth)
          : null,
        placeofbirth: req.body.placeofbirth,
        phone: req.body.phone,
        gender: req.body.gender,
        specialty: req.body.specialty,
      },
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

export const getTeacherCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { teacherId: BigInt(req.params.id), status: true },
      include: { modality: true, students: { include: { student: true } } },
    });
    res.json({ courses: serialize(courses) });
  } catch {
    res.status(500).json({ error: "Error al obtener cursos del docente." });
  }
};
