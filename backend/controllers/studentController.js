import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { status: 1 },
      orderBy: { id: "asc" },
    });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: "Error al listar estudiantes." });
  }
};

export const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({
      where: { id: BigInt(id) },
    });
    if (!student || student.status !== 1) {
      return res.status(404).json({ error: "Estudiante no encontrado." });
    }
    res.json({ student });
  } catch {
    res.status(500).json({ error: "Error al obtener estudiante." });
  }
};

export const createStudent = async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const student = await prisma.student.create({
      data: {
        last_name: req.body.last_name,
        second_last_name: req.body.second_last_name,
        name: req.body.name,
        ci: req.body.ci,
        image: imagePath,
        dateofbirth: new Date(req.body.dateofbirth),
        placeofbirth: req.body.placeofbirth,
        phone: req.body.phone,
        gender: req.body.gender,
        status: 1,
      },
    });
    res.status(201).json({ student });
  } catch (err) {
    res.status(400).json({ error: "Error al crear estudiante." });
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const student = await prisma.student.update({
      where: { id: BigInt(id) },
      data: {
        last_name: req.body.last_name,
        second_last_name: req.body.second_last_name,
        name: req.body.name,
        ci: req.body.ci,
        image: imagePath,
        dateofbirth: new Date(req.body.dateofbirth),
        placeofbirth: req.body.placeofbirth,
        phone: req.body.phone,
        gender: req.body.gender,
      },
    });
    res.json({ student });
  } catch {
    res.status(400).json({ error: "No se pudo actualizar estudiante." });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.student.update({
      where: { id: BigInt(id) },
      data: { status: 0 },
    });
    res.json({ message: "Estudiante eliminado correctamente." });
  } catch {
    res.status(400).json({ error: "Error al eliminar estudiante." });
  }
};
