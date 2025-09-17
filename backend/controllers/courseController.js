import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const convertBigIntToString = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === "bigint") {
        newObj[key] = value.toString();
      } else if (typeof value === "object") {
        newObj[key] = convertBigIntToString(value);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  }
  return obj;
};

export const listCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { status: true },
      include: {
        teacher: true,
        modality: true,
      },
      orderBy: { id: "asc" },
    });

    const result = courses.map((course) => ({
      ...convertBigIntToString(course),
      start_date: course.start_date?.toISOString(),
      end_date: course.end_date?.toISOString(),
    }));

    res.json({ courses: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar cursos." });
  }
};

export const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await prisma.course.findUnique({
      where: { id: BigInt(id) },
      include: {
        teacher: true,
        modality: true,
      },
    });

    if (!course || course.status !== true) {
      return res.status(404).json({ error: "Curso no encontrado." });
    }

    const result = {
      ...convertBigIntToString(course),
      cost: parseFloat(course.cost),
      start_date: course.start_date?.toISOString(),
      end_date: course.end_date?.toISOString() || null,
    };

    res.json({ course: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener curso." });
  }
};

export const createCourse = async (req, res) => {
  try {
    const {
      name,
      parallel,
      description,
      cost,
      start_date,
      end_date,
      teacherId,
      modalityId,
    } = req.body;

    const newCourse = await prisma.course.create({
      data: {
        name,
        parallel,
        description,
        cost: parseFloat(cost),
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        teacherId: BigInt(teacherId),
        modalityId: BigInt(modalityId),
        status: true,
      },
    });

    res.status(201).json({
      course: {
        ...convertBigIntToString(newCourse),
        start_date: newCourse.start_date?.toISOString(),
        end_date: newCourse.end_date?.toISOString() || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error al crear curso." });
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      name,
      parallel,
      description,
      cost,
      start_date,
      end_date,
      teacherId,
      modalityId,
    } = req.body;

    const updatedCourse = await prisma.course.update({
      where: { id: BigInt(id) },
      data: {
        name,
        parallel,
        description,
        cost: parseFloat(cost),
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        teacherId: BigInt(teacherId),
        modalityId: BigInt(modalityId),
      },
    });

    res.json({
      course: {
        ...convertBigIntToString(updatedCourse),
        start_date: updatedCourse.start_date?.toISOString(),
        end_date: updatedCourse.end_date?.toISOString() || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "No se pudo actualizar curso." });
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.course.update({
      where: { id: BigInt(id) },
      data: { status: false },
    });
    res.json({ message: "Curso eliminado correctamente." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error al eliminar curso." });
  }
};
