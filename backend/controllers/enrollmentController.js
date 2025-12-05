import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { serialize } from "../utils/serializer.js";
import { sendStudentCredentials } from "../utils/mailer.js";

const prisma = new PrismaClient();

const toBigInt = (v) =>
  v === null || v === undefined ? null : BigInt(String(v));
const clean = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const initials = (last_name, second_last_name, name) =>
  `${(last_name || "").trim().charAt(0)}${(second_last_name || "")
    .trim()
    .charAt(0)}${(name || "").trim().charAt(0)}`.toLowerCase();
const generatePin = (len = 6) =>
  Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");

export const listEnrollments = async (_req, res) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { status: true },
      orderBy: { id: "asc" },
      include: {
        student: true,
        course: { include: { teacher: true, modality: true } },
      },
    });
    res.json({ enrollments: serialize(enrollments) });
  } catch {
    res.status(500).json({ error: "Error al listar inscripciones." });
  }
};

export const listEnrollmentSummary = async (_req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { status: true, enrollments: { some: { status: true } } },
      orderBy: [{ last_name: "asc" }, { name: "asc" }],
      include: {
        enrollments: {
          where: { status: true },
          orderBy: { id: "asc" },
          include: { course: { include: { teacher: true, modality: true } } },
        },
      },
    });
    const summary = students.map((s) => ({
      student: s,
      courses: s.enrollments.map((e) => ({
        enrollmentId: e.id,
        course: e.course,
        payment_type: e.payment_type,
        enrollment_date: e.enrollment_date,
      })),
    }));
    res.json({ items: serialize(summary) });
  } catch {
    res.status(500).json({ error: "Error al listar inscripciones." });
  }
};

export const getEnrollmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: BigInt(id) },
    });
    if (!enrollment)
      return res.status(404).json({ error: "Inscripción no encontrada." });
    res.json({ enrollment: serialize(enrollment) });
  } catch {
    res.status(500).json({ error: "Error al obtener inscripción." });
  }
};

async function ensureMobileCreds(studentId) {
  const st = await prisma.student.findUnique({
    where: { id: toBigInt(studentId) },
  });
  if (!st) throw new Error("Estudiante no encontrado");
  if (st.app_username && st.app_password_hash)
    return { created: false, username: st.app_username };
  const ci = (st.ci || "").replace(/\D/g, "");
  const base = clean(
    (initials(st.last_name, st.second_last_name, st.name) + ci).toLowerCase()
  ).replace(/\s+/g, "");
  let candidate = base || `alumno${String(st.id)}`;
  let finalUsername = candidate;
  let i = 0;
  while (true) {
    const exists = await prisma.student.findUnique({
      where: { app_username: finalUsername },
    });
    if (!exists) break;
    i += 1;
    finalUsername = `${candidate}${i}`;
  }
  const plain = generatePin(6);
  const hash = await bcrypt.hash(plain, 10);
  const updated = await prisma.student.update({
    where: { id: st.id },
    data: {
      app_username: finalUsername,
      app_password_hash: hash,
      app_enabled: true,
    },
  });
  return { created: true, username: updated.app_username, password: plain };
}

async function checkCapacity(courseId) {
  const course = await prisma.course.findUnique({
    where: { id: toBigInt(courseId) },
  });
  if (!course) throw new Error("Curso no encontrado");
  if (course.max_capacity == null) return { ok: true };
  const count = await prisma.enrollment.count({
    where: { courseId: toBigInt(courseId), status: true },
  });
  if (count >= course.max_capacity) return { ok: false, msg: "Cupo lleno" };
  return { ok: true };
}

async function checkDateWindow(courseId, enrollment_date) {
  const c = await prisma.course.findUnique({
    where: { id: toBigInt(courseId) },
  });
  if (!c) return { ok: false, msg: "Curso no encontrado" };
  const d = new Date(enrollment_date);
  if (isNaN(d.getTime())) return { ok: false, msg: "Fecha inválida" };
  return { ok: true };
}

export const createEnrollment = async (req, res) => {
  try {
    const enrollment = await prisma.enrollment.create({ data: req.body });
    res.status(201).json({ enrollment: serialize(enrollment) });
  } catch {
    res.status(400).json({ error: "Error al crear inscripción." });
  }
};

export const createEnrollmentTx = async (req, res) => {
  const { studentId, courseIds, enrollment_date, payment_type, contact } =
    req.body || {};
  if (
    !studentId ||
    !Array.isArray(courseIds) ||
    !courseIds.length ||
    !enrollment_date ||
    !payment_type
  ) {
    return res.status(400).json({ error: "Datos incompletos." });
  }
  try {
    const cred = await ensureMobileCreds(studentId);
    const createdIds = [];
    await prisma.$transaction(async (tx) => {
      if (
        contact &&
        String(contact.full_name || "").trim() &&
        String(contact.relation || "").trim() &&
        String(contact.phone || "").trim()
      ) {
        const ccount = await tx.studentContact.count({
          where: { studentId: toBigInt(studentId) },
        });
        if (ccount === 0) {
          await tx.studentContact.create({
            data: {
              studentId: toBigInt(studentId),
              full_name: String(contact.full_name),
              relation: String(contact.relation),
              phone: String(contact.phone),
            },
          });
        }
      }
      for (const cid of courseIds) {
        const cap = await checkCapacity(cid);
        if (!cap.ok) throw new Error(cap.msg);
        const win = await checkDateWindow(cid, enrollment_date);
        if (!win.ok) throw new Error(win.msg);
        const exists = await tx.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: toBigInt(studentId),
              courseId: toBigInt(cid),
            },
          },
        });
        if (exists && exists.status) continue;
        if (exists && !exists.status) {
          const up = await tx.enrollment.update({
            where: { id: exists.id },
            data: {
              status: true,
              enrollment_date: new Date(enrollment_date),
              payment_type,
            },
          });
          createdIds.push(up.id);
        } else {
          const en = await tx.enrollment.create({
            data: {
              studentId: toBigInt(studentId),
              courseId: toBigInt(cid),
              enrollment_date: new Date(enrollment_date),
              payment_type,
              status: true,
            },
          });
          createdIds.push(en.id);
        }
      }
    });

    const data = await prisma.enrollment.findMany({
      where: { studentId: toBigInt(studentId), status: true },
      include: {
        course: { include: { schedules: { include: { classroom: true } } } },
      },
      orderBy: { id: "asc" },
    });

    const schedule = data.flatMap((e) =>
      e.course.schedules.map((s) => ({
        courseId: e.courseId,
        courseName: e.course.name,
        weekday: s.weekday,
        start_time: s.start_time,
        end_time: s.end_time,
        classroom: s.classroom
          ? {
              id: s.classroomId,
              code: s.classroom.code,
              name: s.classroom.name,
            }
          : null,
      }))
    );

    const payload = {
      created: createdIds.map((x) => String(x)),
      user_created: cred.created,
      credentials: cred.created
        ? { username: cred.username, password: cred.password }
        : null,
      schedule,
    };

    const st = await prisma.student.findUnique({
      where: { id: toBigInt(studentId) },
    });
    if (cred.created && st?.email) {
      Promise.resolve(
        sendStudentCredentials({
          to: st.email,
          fullName: `${st.name} ${st.last_name}`.trim(),
          username: cred.username,
          password: cred.password,
        })
      ).catch(() => {});
    }

    res.status(201).json(serialize(payload));
  } catch (err) {
    res.status(400).json({ error: err.message || "Error en la transacción." });
  }
};

export const getStudentSchedule = async (req, res) => {
  const { studentId } = req.params;
  try {
    const data = await prisma.enrollment.findMany({
      where: { studentId: toBigInt(studentId), status: true },
      include: {
        course: { include: { schedules: { include: { classroom: true } } } },
      },
      orderBy: { id: "asc" },
    });
    const items = data.flatMap((e) =>
      e.course.schedules.map((s) => ({
        courseId: e.courseId,
        courseName: e.course.name,
        weekday: s.weekday,
        start_time: s.start_time,
        end_time: s.end_time,
        classroom: s.classroom
          ? {
              id: s.classroomId,
              code: s.classroom.code,
              name: s.classroom.name,
            }
          : null,
      }))
    );
    res.json({ items: serialize(items) });
  } catch {
    res.status(500).json({ error: "Error al obtener horario." });
  }
};

export const deleteEnrollment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.enrollment.update({
      where: { id: BigInt(id) },
      data: { status: false },
    });
    res.json({ message: "Inscripción eliminada correctamente." });
  } catch {
    res.status(400).json({ error: "Error al eliminar inscripción." });
  }
};
