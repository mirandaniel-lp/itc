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

export const listTeachers = async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { status: true },
      orderBy: { id: "asc" },
    });
    res.json({ teachers: convertBigIntToString(teachers) });
  } catch (err) {
    console.error("ERROR en listTeachers:", err);
    res.status(500).json({ error: "Error al listar docentes." });
  }
};

export const getTeacherById = async (req, res) => {
  const { id } = req.params;
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: BigInt(id) },
    });

    if (!teacher || teacher.status !== true) {
      return res.status(404).json({ error: "Docente no encontrado." });
    }

    const data = convertBigIntToString(teacher);
    data.dateofbirth = teacher.dateofbirth
      ? new Date(teacher.dateofbirth).getTime()
      : null;

    res.json({ teacher: data });
  } catch (err) {
    console.error("ERROR en getTeacherById:", err);
    res.status(500).json({ error: "Error al obtener docente." });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const teacher = await prisma.teacher.create({
      data: {
        last_name: req.body.last_name,
        second_last_name: req.body.second_last_name,
        name: req.body.name,
        ci: req.body.ci,
        dateofbirth: new Date(req.body.dateofbirth),
        placeofbirth: req.body.placeofbirth,
        phone: req.body.phone,
        gender: req.body.gender,
        specialty: req.body.specialty,
        status: true,
      },
    });
    res.status(201).json({ teacher: convertBigIntToString(teacher) });
  } catch (err) {
    console.error("ERROR en createTeacher:", err);
    res.status(400).json({ error: "Error al crear docente." });
  }
};

export const updateTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.teacher.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ error: "Docente no encontrado." });
    }

    const updated = await prisma.teacher.update({
      where: { id: BigInt(id) },
      data: {
        last_name: req.body.last_name,
        second_last_name: req.body.second_last_name,
        name: req.body.name,
        ci: req.body.ci,
        dateofbirth: new Date(req.body.dateofbirth),
        placeofbirth: req.body.placeofbirth,
        phone: req.body.phone,
        gender: req.body.gender,
        specialty: req.body.specialty,
      },
    });

    res.json({ teacher: convertBigIntToString(updated) });
  } catch (err) {
    console.error("ERROR en updateTeacher:", err);
    res.status(400).json({ error: "No se pudo actualizar docente." });
  }
};

export const deleteTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.teacher.update({
      where: { id: BigInt(id) },
      data: { status: false },
    });
    res.json({ message: "Docente eliminado correctamente." });
  } catch (err) {
    console.error("ERROR en deleteTeacher:", err);
    res.status(400).json({ error: "Error al eliminar docente." });
  }
};
