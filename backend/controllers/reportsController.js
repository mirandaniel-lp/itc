import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";

const prisma = new PrismaClient();

function rangeYear(year) {
  const y = Number(year) || new Date().getFullYear();
  const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0));
  return { start, end, y };
}

function parseFilters(req) {
  const { start, end, courseId, modalityId, granularity } = req.query;
  const hasRange = !!(start && end);
  const range = hasRange
    ? {
        start: new Date(`${start}T00:00:00.000Z`),
        end: new Date(`${end}T23:59:59.999Z`),
      }
    : null;
  return {
    start: range?.start || null,
    end: range?.end || null,
    courseId: courseId ? BigInt(courseId) : null,
    modalityId: modalityId ? BigInt(modalityId) : null,
    granularity: granularity || "month",
  };
}

export const kpis = async (req, res) => {
  try {
    const { start, end, courseId, modalityId } = parseFilters(req);
    const enrollmentWhere = {
      status: true,
      ...(start && end ? { enrollment_date: { gte: start, lt: end } } : {}),
      ...(courseId ? { courseId } : {}),
      ...(modalityId ? { course: { modalityId } } : {}),
    };
    const totalEnrollments = await prisma.enrollment.count({
      where: enrollmentWhere,
    });
    const activeStudents = await prisma.student.count({
      where: { status: true },
    });
    const gradeWhere = {
      status: true,
      ...(start && end ? { created_at: { gte: start, lt: end } } : {}),
      ...(courseId || modalityId
        ? {
            activity: {
              course: {
                ...(courseId ? { id: courseId } : {}),
                ...(modalityId ? { modalityId } : {}),
              },
            },
          }
        : {}),
    };
    const avg = await prisma.grade.aggregate({
      where: gradeWhere,
      _avg: { score: true },
    });
    const [approved, totalGrades] = await Promise.all([
      prisma.grade.count({ where: { ...gradeWhere, score: { gte: 51 } } }),
      prisma.grade.count({ where: gradeWhere }),
    ]);
    const approvalRate =
      totalGrades > 0 ? Number(((approved / totalGrades) * 100).toFixed(2)) : 0;
    res.json(
      serialize({
        enrollments: totalEnrollments,
        activeStudents,
        avgScore: avg._avg.score ? Number(avg._avg.score.toFixed(2)) : 0,
        approvalRate,
      })
    );
  } catch (err) {
    res.status(500).json({ error: "Error al calcular KPIs." });
  }
};

export const enrollmentsOverTimeRange = async (req, res) => {
  try {
    const { start, end, courseId, modalityId, granularity } = parseFilters(req);
    if (!start || !end)
      return res.status(400).json({ error: "start y end son requeridos." });
    const unit =
      granularity === "day"
        ? "day"
        : granularity === "week"
        ? "week"
        : granularity === "year"
        ? "year"
        : "month";
    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT to_char(date_trunc($1, e."enrollment_date"),
             CASE 
               WHEN $1 = 'day' THEN 'YYYY-MM-DD'
               WHEN $1 = 'week' THEN 'IYYY-IW'
               WHEN $1 = 'year' THEN 'YYYY'
               ELSE 'YYYY-MM'
             END
      ) AS bucket,
      COUNT(*)::int AS count
      FROM "Enrollment" e
      JOIN "Course" c ON c.id = e."courseId"
      WHERE e.status = true
        AND e."enrollment_date" >= $2
        AND e."enrollment_date" < $3
        ${courseId ? 'AND e."courseId" = $4' : ""}
        ${!courseId && modalityId ? 'AND c."modalityId" = $4' : ""}
        ${courseId && modalityId ? 'AND c."modalityId" = $5' : ""}
      GROUP BY 1
      ORDER BY 1;
    `,
      unit,
      start,
      end,
      ...(courseId && modalityId
        ? [courseId, modalityId]
        : courseId
        ? [courseId]
        : modalityId
        ? [modalityId]
        : [])
    );
    res.json(serialize(rows));
  } catch (err) {
    res.status(500).json({ error: "Error al agrupar inscripciones." });
  }
};

export const enrollmentsByMonth = async (req, res) => {
  const { year } = req.query;
  const { start, end, y } = rangeYear(year);
  const rows = await prisma.$queryRaw`
    SELECT to_char(date_trunc('month', "enrollment_date"), 'YYYY-MM') AS period,
           COUNT(*)::int AS total
    FROM "Enrollment"
    WHERE status = true
      AND "enrollment_date" >= ${start}
      AND "enrollment_date" < ${end}
    GROUP BY 1
    ORDER BY 1;
  `;
  const labels = Array.from(
    { length: 12 },
    (_, i) => `${y}-${String(i + 1).padStart(2, "0")}`
  );
  const map = Object.fromEntries(rows.map((r) => [r.period, r.total]));
  const series = labels.map((m) => map[m] || 0);
  res.json(serialize({ labels, series }));
};

export const enrollmentsByWeek = async (req, res) => {
  const weeks = Math.min(
    Math.max(parseInt(req.query.weeks || "12", 10), 1),
    52
  );
  const rows = await prisma.$queryRaw`
    SELECT to_char(date_trunc('week', "enrollment_date"), 'IYYY-IW') AS period,
           COUNT(*)::int AS total
    FROM "Enrollment"
    WHERE status = true
      AND "enrollment_date" >= (current_date - interval '${weeks} weeks')
    GROUP BY 1
    ORDER BY 1;
  `;
  res.json(
    serialize({
      labels: rows.map((r) => r.period),
      series: rows.map((r) => r.total),
    })
  );
};

export const enrollmentsByModality = async (req, res) => {
  const { year } = req.query;
  const { start: sStart, end: sEnd } = parseFilters(req);
  const { start, end } =
    sStart && sEnd ? { start: sStart, end: sEnd } : rangeYear(year);
  const rows = await prisma.$queryRaw`
    SELECT m.name AS modality, COUNT(*)::int AS total
    FROM "Enrollment" e
    JOIN "Course" c ON c.id = e."courseId"
    JOIN "Modality" m ON m.id = c."modalityId"
    WHERE e.status = true
      AND e."enrollment_date" >= ${start}
      AND e."enrollment_date" < ${end}
    GROUP BY m.name
    ORDER BY total DESC;
  `;
  res.json(
    serialize(rows.map((r) => ({ modality: r.modality, count: r.total })))
  );
};

export const topCourses = async (req, res) => {
  const { year, limit } = req.query;
  const lim = Math.min(Math.max(parseInt(limit || "5", 10), 1), 20);
  const { start: sStart, end: sEnd } = parseFilters(req);
  const { start, end } =
    sStart && sEnd ? { start: sStart, end: sEnd } : rangeYear(year);

  const rows = await prisma.$queryRaw`
    SELECT c.id, c.name, c.parallel, COUNT(*)::int AS total
    FROM "Enrollment" e
    JOIN "Course" c ON c.id = e."courseId"
    WHERE e.status = true
      AND e."enrollment_date" >= ${start}
      AND e."enrollment_date" < ${end}
    GROUP BY c.id, c.name, c.parallel
    ORDER BY total DESC
    LIMIT ${lim};
  `;

  const arr = rows.map((r) => ({
    course: `${r.name}${r.parallel ? ` (${r.parallel})` : ""}`,
    count: Number(r.total || 0),
  }));

  res.json(serialize(arr));
};

export const gradesDistribution = async (req, res) => {
  try {
    const { start, end, courseId, modalityId } = parseFilters(req);
    const whereBase = {
      status: true,
      ...(start && end ? { created_at: { gte: start, lt: end } } : {}),
      ...(courseId || modalityId
        ? {
            activity: {
              course: {
                ...(courseId ? { id: courseId } : {}),
                ...(modalityId ? { modalityId } : {}),
              },
            },
          }
        : {}),
    };
    const [avgAgg, approved, total] = await Promise.all([
      prisma.grade.aggregate({ where: whereBase, _avg: { score: true } }),
      prisma.grade.count({ where: { ...whereBase, score: { gte: 51 } } }),
      prisma.grade.count({ where: whereBase }),
    ]);
    const failed = total - approved;
    const avg = avgAgg._avg.score ? Number(avgAgg._avg.score.toFixed(2)) : 0;
    res.json(serialize({ avg, approved, failed }));
  } catch (err) {
    res.status(500).json({ error: "Error en distribución de calificaciones." });
  }
};

export const passRateByCourse = async (req, res) => {
  try {
    const { year } = req.query;
    const { start: sStart, end: sEnd } = parseFilters(req);
    const { start, end } =
      sStart && sEnd ? { start: sStart, end: sEnd } : rangeYear(year);
    const rows = await prisma.$queryRaw`
      SELECT c.id,
             c.name,
             c.parallel,
             SUM(CASE WHEN g.score::numeric >= 51 THEN 1 ELSE 0 END)::int AS approved,
             COUNT(*)::int AS total
      FROM "Grade" g
      JOIN "Activity" a ON a.id = g."activityId"
      JOIN "Course" c ON c.id = a."courseId"
      WHERE g.status = true
        AND g."created_at" >= ${start}
        AND g."created_at" < ${end}
      GROUP BY c.id, c.name, c.parallel
      HAVING COUNT(*) > 0
      ORDER BY approved::float/NULLIF(COUNT(*),0) DESC;
    `;
    const payload = {
      labels: rows.map((r) => `${r.name} (${r.parallel})`),
      series: rows.map((r) =>
        Number(((r.approved / r.total) * 100).toFixed(2))
      ),
      items: rows.map((r) => ({
        ...r,
        passRate: Number(((r.approved / r.total) * 100).toFixed(2)),
      })),
    };
    res.json(serialize(payload));
  } catch (err) {
    res.status(500).json({ error: "Error en passRateByCourse." });
  }
};
