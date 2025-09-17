import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const convertBigIntToString = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      const value = obj[key];
      newObj[key] =
        typeof value === "bigint"
          ? value.toString()
          : convertBigIntToString(value);
    }
    return newObj;
  }
  return obj;
};

export const listStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { status: true },
      orderBy: { id: "asc" },
    });
    res.json({ students: convertBigIntToString(students) });
  } catch (err) {
    console.error("ERROR en listStudents:", err);
    res.status(500).json({ error: "Error al listar estudiantes." });
  }
};

export const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({
      where: { id: BigInt(id) },
    });

    if (!student || student.status !== true) {
      return res.status(404).json({ error: "Estudiante no encontrado." });
    }

    const data = convertBigIntToString(student);

    data.dateofbirth = student.dateofbirth
      ? new Date(student.dateofbirth).getTime()
      : null;

    res.json({ student: data });
  } catch (err) {
    console.error("ERROR en getStudentById:", err);
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
        status: true,
      },
    });
    res.status(201).json({ student: convertBigIntToString(student) });
  } catch (err) {
    console.error("ERROR en createStudent:", err);
    res.status(400).json({ error: "Error al crear estudiante." });
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingStudent) {
      return res.status(404).json({ error: "Estudiante no encontrado." });
    }

    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : existingStudent.image;

    const updatedStudent = await prisma.student.update({
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

    res.json({ student: convertBigIntToString(updatedStudent) });
  } catch (err) {
    console.error("ERROR en updateStudent:", err);
    res.status(400).json({ error: "No se pudo actualizar estudiante." });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.student.update({
      where: { id: BigInt(id) },
      data: { status: false },
    });
    res.json({ message: "Estudiante eliminado correctamente." });
  } catch (err) {
    console.error("ERROR en deleteStudent:", err);
    res.status(400).json({ error: "Error al eliminar estudiante." });
  }
};
