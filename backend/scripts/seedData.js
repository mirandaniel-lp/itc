import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function addMonths(d, n) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}
function daysBetween(a, b) {
  return Math.floor((b - a) / 86400000);
}
function eachDay(start, end) {
  const arr = [];
  let d = new Date(start);
  while (d <= end) {
    arr.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return arr;
}
function randBetween(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}
function randomChoice(a) {
  return a[Math.floor(Math.random() * a.length)];
}
const holidays = [
  "2025-01-01",
  "2025-02-17",
  "2025-02-18",
  "2025-03-28",
  "2025-05-01",
  "2025-05-25",
  "2025-08-06",
  "2025-10-12",
  "2025-11-07",
  "2025-11-21",
  "2025-12-25",
];
function isHoliday(d) {
  return holidays.includes(d.toISOString().slice(0, 10));
}

async function main() {
  const termStart = new Date("2025-07-01");
  const termEnd = new Date("2026-06-30");
  const term = await prisma.academicTerm.create({
    data: {
      name: "2025-2",
      start_date: termStart,
      end_date: termEnd,
      status: true,
    },
  });
  const modModular = await prisma.modality.upsert({
    where: { name: "MODULAR" },
    update: {},
    create: { name: "MODULAR", duration_in_months: 3 },
  });
  const modAnual = await prisma.modality.upsert({
    where: { name: "ANUAL" },
    update: {},
    create: { name: "ANUAL", duration_in_months: 12 },
  });
  const programOffice = await prisma.program.upsert({
    where: { code: "OFM-01" },
    update: {},
    create: { code: "OFM-01", name: "Ofimática" },
  });
  const programDesign = await prisma.program.upsert({
    where: { code: "DG-01" },
    update: {},
    create: { code: "DG-01", name: "Diseño Gráfico" },
  });
  const programAccounting = await prisma.program.upsert({
    where: { code: "CTG-01" },
    update: {},
    create: { code: "CTG-01", name: "Contaduría/Contabilidad General" },
  });
  const programAdmin = await prisma.program.upsert({
    where: { code: "ADM-01" },
    update: {},
    create: { code: "ADM-01", name: "Administración de Empresas" },
  });
  const classroom = await prisma.classroom.upsert({
    where: { code: "A101" },
    update: {},
    create: {
      code: "A101",
      name: "Aula 101",
      location: "Sede Central",
      capacity: 40,
    },
  });

  const teacherNames = [
    { name: "Juan", last: "Gonzales" },
    { name: "Pedro", last: "Quispe" },
    { name: "Luis", last: "Choque" },
    { name: "Carlos", last: "Flores" },
    { name: "Ana", last: "Mamani" },
    { name: "María", last: "Paredes" },
  ];
  const teachersData = teacherNames.map((t, i) => ({
    name: t.name,
    last_name: t.last,
    second_last_name: t.last,
    ci: String(7000000 + 100 + i),
    dateofbirth: new Date(
      1980 + randBetween(0, 10),
      randBetween(0, 11),
      randBetween(1, 25)
    ),
    placeofbirth: ["La Paz", "El Alto", "Cochabamba", "Santa Cruz"][i % 4],
    phone: "7" + String(7000000 + i).slice(-8),
    gender: i % 2 === 0 ? "MASCULINO" : "FEMENINO",
    status: true,
  }));
  await prisma.teacher.createMany({ data: teachersData, skipDuplicates: true });
  const teachers = await prisma.teacher.findMany();

  const courseDefs = [
    {
      name: "Ofimática Básica",
      programId: programOffice.id,
      modality: "MODULAR",
    },
    {
      name: "Ofimática Avanzada",
      programId: programOffice.id,
      modality: "MODULAR",
    },
    {
      name: "Diseño Gráfico Básico",
      programId: programDesign.id,
      modality: "MODULAR",
    },
    {
      name: "Diseño Gráfico Digital",
      programId: programDesign.id,
      modality: "MODULAR",
    },
    {
      name: "Contabilidad I",
      programId: programAccounting.id,
      modality: "MODULAR",
    },
    {
      name: "Contabilidad II",
      programId: programAccounting.id,
      modality: "MODULAR",
    },
    {
      name: "Aplicaciones Contables",
      programId: programAccounting.id,
      modality: "MODULAR",
    },
    {
      name: "Prácticas Profesionales",
      programId: programAdmin.id,
      modality: "MODULAR",
    },
    {
      name: "Técnico Superior en Contabilidad",
      programId: programAccounting.id,
      modality: "ANUAL",
    },
    {
      name: "Técnico Superior en Informática",
      programId: programOffice.id,
      modality: "ANUAL",
    },
  ];

  const courses = [];
  for (let i = 0; i < courseDefs.length; i++) {
    const def = courseDefs[i];
    const isMod = def.modality === "MODULAR";
    const start = new Date("2025-07-01");
    const end = isMod ? addMonths(start, 3) : addMonths(start, 12);
    const teacher = teachers[i % teachers.length];
    const c = await prisma.course.create({
      data: {
        name: def.name,
        parallel: "A",
        description: "",
        cost: "0",
        start_date: start,
        end_date: end,
        teacherId: teacher.id,
        modalityId: isMod ? modModular.id : modAnual.id,
        programId: def.programId,
        termId: term.id,
        shift: "MAÑANA",
        max_capacity: 40,
      },
    });
    courses.push({ c, start, end });
    const pattern = isMod
      ? [{ weekday: "LUNES" }, { weekday: "MIERCOLES" }, { weekday: "VIERNES" }]
      : [
          { weekday: "LUNES" },
          { weekday: "MARTES" },
          { weekday: "MIERCOLES" },
          { weekday: "JUEVES" },
          { weekday: "VIERNES" },
        ];
    const schedules = pattern.map((p, idx) => ({
      courseId: c.id,
      classroomId: classroom.id,
      weekday: p.weekday,
      start_time: idx % 2 === 0 ? "08:00" : "10:00",
      end_time: idx % 2 === 0 ? "10:00" : "12:00",
    }));
    await prisma.courseSchedule.createMany({
      data: schedules,
      skipDuplicates: true,
    });
    await prisma.gradePolicy.create({
      data: {
        courseId: c.id,
        min_approval_score: "51.00",
        min_attendance_pct: "75.00",
      },
    });
    const totalDays = Math.max(1, daysBetween(start, end));
    const activities = [];
    for (let a = 1; a <= 25; a++) {
      const due = addDays(
        start,
        Math.min(totalDays - 1, Math.floor((totalDays * (a - 1)) / 25) + 3)
      );
      activities.push({
        title: `Actividad ${a} - ${def.name}`,
        courseId: c.id,
        teacherId: teacher.id,
        weight_pct: "4.00",
        due_date: due,
        is_published: true,
        type: ["EXAMEN", "PRACTICA", "TAREA", "PROYECTO"][a % 4],
      });
    }
    for (let k = 0; k < activities.length; k += 50)
      await prisma.activity.createMany({
        data: activities.slice(k, k + 50),
        skipDuplicates: true,
      });
  }

  const firstNames = [
    "Juan",
    "Carlos",
    "Luis",
    "Diego",
    "José",
    "Marco",
    "Andrés",
    "Miguel",
    "Rosa",
    "Ana",
    "María",
    "Sofía",
    "Camila",
    "Verónica",
    "Daniel",
    "Carla",
    "Johana",
    "Raul",
    "Pablo",
    "Natalia",
  ];
  const lastNames = [
    "Gonzales",
    "Quispe",
    "Choque",
    "Cruz",
    "Flores",
    "Mamani",
    "Paredes",
    "Huanca",
    "Lopez",
    "Vargas",
    "Cano",
    "Soto",
    "Cusi",
    "Calle",
  ];
  const places = [
    "La Paz",
    "El Alto",
    "Cochabamba",
    "Santa Cruz",
    "Oruro",
    "Potosí",
    "Tarija",
    "Sucre",
  ];
  const studentsData = [];
  for (let s = 1; s <= 200; s++) {
    const birthYear = 2001 + randBetween(0, 7);
    const dob = new Date(birthYear, randBetween(0, 11), randBetween(1, 25));
    const name = randomChoice(firstNames);
    const ln = randomChoice(lastNames);
    const sln = randomChoice(lastNames);
    studentsData.push({
      name,
      last_name: ln,
      second_last_name: sln,
      ci: String(7100000 + s),
      dateofbirth: dob,
      placeofbirth: randomChoice(places),
      phone: "7" + String(600000 + s).slice(-8),
      gender: s % 2 === 0 ? "MASCULINO" : "FEMENINO",
      app_username: "user" + s,
      status: true,
    });
  }
  for (let k = 0; k < studentsData.length; k += 50)
    await prisma.student.createMany({
      data: studentsData.slice(k, k + 50),
      skipDuplicates: true,
    });
  const students = await prisma.student.findMany({ orderBy: { id: "asc" } });

  const weekdayMap = {
    LUNES: 1,
    MARTES: 2,
    MIERCOLES: 3,
    JUEVES: 4,
    VIERNES: 5,
    SABADO: 6,
    DOMINGO: 0,
  };
  const courseSchedulesCache = {};
  for (const cr of courses) {
    courseSchedulesCache[cr.c.id] = (
      await prisma.courseSchedule.findMany({ where: { courseId: cr.c.id } })
    ).map((s) => weekdayMap[s.weekday]);
  }

  let si = 0;
  for (const st of students) {
    const chosen = courses[si % courses.length];
    const enrollWindowStart = addDays(chosen.start, -30);
    const enrollDate = addDays(
      enrollWindowStart,
      randBetween(0, Math.max(0, daysBetween(enrollWindowStart, chosen.start)))
    );
    await prisma.enrollment.create({
      data: {
        studentId: st.id,
        courseId: chosen.c.id,
        enrollment_date: enrollDate,
        payment_type: "MENSUAL",
        status: true,
      },
    });
    const allDays = eachDay(chosen.start, chosen.end);
    const wds = courseSchedulesCache[chosen.c.id];
    const classDates = [];
    for (const d of allDays) {
      if (isHoliday(d)) continue;
      if (wds.includes(d.getDay())) classDates.push(d);
    }
    const attendanceRows = [];
    for (const cd of classDates) {
      const r = Math.random();
      let status = "PRESENTE";
      if (r < 0.08) status = "TARDE";
      else if (r < 0.2) status = "AUSENTE";
      else if (r < 0.22) status = "LICENCIA";
      let checkin = null;
      let checkout = null;
      if (status === "PRESENTE" || status === "TARDE") {
        checkin = new Date(cd);
        checkin.setHours(8, randBetween(0, 20), 0);
      }
      if (status === "PRESENTE") {
        checkout = new Date(cd);
        checkout.setHours(10, randBetween(0, 40), 0);
      }
      attendanceRows.push({
        studentId: st.id,
        courseId: chosen.c.id,
        date: cd,
        status,
        checkinAt: checkin,
        checkoutAt: checkout,
      });
    }
    for (let j = 0; j < attendanceRows.length; j += 500)
      await prisma.attendance.createMany({
        data: attendanceRows.slice(j, j + 500),
        skipDuplicates: true,
      });
    const activities = await prisma.activity.findMany({
      where: { courseId: chosen.c.id },
    });
    const gradeRows = [];
    for (const a of activities) {
      const base = 65 + (Math.random() - 0.5) * 20;
      const score = Math.max(
        0,
        Math.min(
          100,
          Math.round((base + (Math.random() - 0.5) * 10) * 100) / 100
        )
      );
      gradeRows.push({
        activityId: a.id,
        studentId: st.id,
        score: String(score),
        is_published: true,
      });
    }
    for (let j = 0; j < gradeRows.length; j += 500)
      await prisma.grade.createMany({
        data: gradeRows.slice(j, j + 500),
        skipDuplicates: true,
      });
    await prisma.studentContact.create({
      data: {
        studentId: st.id,
        full_name: `${st.name} ${st.last_name} Tutor`,
        relation: "Padre/Madre",
        phone: "70000000",
      },
    });
    si++;
  }

  await prisma.iForestModel.upsert({
    where: { version: "v1" },
    update: { threshold: -0.48, contamination: 0.18 },
    create: {
      version: "v1",
      features:
        "days_since_enrollment,marks_total,attendance_pct,absences,tardies,absences_30d,tardies_30d,avg_hours,items_count,grade_avg,grade_p25,fail_fraction,days_since_last_grade",
      contamination: 0.18,
      threshold: -0.48,
    },
  });
  console.log("seed-from-doc completed");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
