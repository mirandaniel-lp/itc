import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function eachDay(start, end) {
  const a = [];
  let d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  while (d <= e) {
    a.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return a;
}
function iso(d) {
  return new Date(d).toISOString().slice(0, 10);
}
function randBetween(a, b) {
  return a + Math.floor(Math.random() * (b - a + 1));
}
function randomStatus() {
  const r = Math.random();
  if (r < 0.08) return "TARDE";
  if (r < 0.28) return "AUSENTE";
  if (r < 0.3) return "LICENCIA";
  return "PRESENTE";
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
  return holidays.includes(iso(d));
}

async function main() {
  const now = new Date();
  const enrollments = await prisma.enrollment.findMany({
    where: {},
    include: {
      student: true,
      course: { include: { schedules: true } },
    },
  });
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalDeleted = 0;
  for (const en of enrollments) {
    const course = en.course;
    const student = en.student;
    if (!course || !student) continue;
    const courseStart = new Date(course.start_date);
    const courseEnd = course.end_date
      ? new Date(course.end_date)
      : new Date(courseStart);
    const attendanceEnd = courseEnd < now ? courseEnd : now;
    const enrollDate = en.enrollment_date
      ? new Date(en.enrollment_date)
      : courseStart;
    if (attendanceEnd < enrollDate) {
      const res = await prisma.attendance.deleteMany({
        where: {
          studentId: student.id,
          courseId: course.id,
          date: { lt: enrollDate },
        },
      });
      totalDeleted += res.count || 0;
      continue;
    }
    const schedules = course.schedules || [];
    const weekdayMap = {
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
      DOMINGO: 0,
    };
    const scheduledWeekdays = schedules
      .map((s) => weekdayMap[s.weekday])
      .filter(Boolean);
    if (scheduledWeekdays.length === 0) continue;
    const allClassDays = eachDay(courseStart, attendanceEnd).filter(
      (d) => !isHoliday(d) && scheduledWeekdays.includes(d.getDay())
    );
    const classDaysFiltered = allClassDays.filter(
      (d) => d >= new Date(enrollDate)
    );
    const existing = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
        courseId: course.id,
        date: { gte: courseStart, lte: courseEnd },
      },
    });
    const existingMap = new Map(existing.map((r) => [iso(r.date), r]));
    const toCreate = [];
    const toUpdate = [];
    for (const cd of classDaysFiltered) {
      const key = iso(cd);
      const ex = existingMap.get(key);
      if (!ex) {
        toCreate.push({
          studentId: student.id,
          courseId: course.id,
          date: cd,
          status: randomStatus(),
          checkinAt:
            Math.random() < 0.3
              ? null
              : new Date(cd).setHours(8, randBetween(0, 20), 0) && new Date(cd),
          checkoutAt:
            Math.random() < 0.6
              ? new Date(cd).setHours(10, randBetween(0, 40), 0) && new Date(cd)
              : null,
        });
      } else {
        if (!ex.status) {
          toUpdate.push({
            id: ex.id,
            status: randomStatus(),
            checkinAt:
              ex.checkinAt ||
              (new Date(cd).setHours(8, randBetween(0, 20), 0) && new Date(cd)),
            checkoutAt:
              ex.checkoutAt ||
              (new Date(cd).setHours(10, randBetween(0, 40), 0) &&
                new Date(cd)),
          });
        }
      }
    }
    const del = await prisma.attendance.deleteMany({
      where: {
        studentId: student.id,
        courseId: course.id,
        OR: [{ date: { gt: attendanceEnd } }, { date: { lt: enrollDate } }],
      },
    });
    totalDeleted += del.count || 0;
    for (let i = 0; i < toCreate.length; i += 500) {
      const chunk = toCreate.slice(i, i + 500);
      const res = await prisma.attendance.createMany({ data: chunk });
      totalCreated += res.count || chunk.length;
    }
    for (const u of toUpdate) {
      await prisma.attendance.update({
        where: { id: u.id },
        data: {
          status: u.status,
          checkinAt: u.checkinAt,
          checkoutAt: u.checkoutAt,
        },
      });
      totalUpdated++;
    }
  }
  console.log("attendance fixed", { totalCreated, totalUpdated, totalDeleted });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
