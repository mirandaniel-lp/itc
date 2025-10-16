import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

function rangeYear(year) {
  const y = Number(year) || new Date().getFullYear();
  const start = new Date(Date.UTC(y, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y + 1, 0, 1, 0, 0, 0));
  return { start, end, y };
}

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

  res.json({ labels, series });
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
  res.json({
    labels: rows.map((r) => r.period),
    series: rows.map((r) => r.total),
  });
};

export const enrollmentsByModality = async (req, res) => {
  const { year } = req.query;
  const { start, end } = rangeYear(year);
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
  res.json({
    labels: rows.map((r) => r.modality),
    series: rows.map((r) => r.total),
  });
};

export const topCourses = async (req, res) => {
  const { year, limit } = req.query;
  const lim = Math.min(Math.max(parseInt(limit || "5", 10), 1), 20);
  const { start, end } = rangeYear(year);
  const rows = await prisma.$queryRaw`
    SELECT c.id,
           c.name,
           c.parallel,
           COUNT(*)::int AS total
    FROM "Enrollment" e
    JOIN "Course" c ON c.id = e."courseId"
    WHERE e.status = true
      AND e."enrollment_date" >= ${start}
      AND e."enrollment_date" < ${end}
    GROUP BY c.id, c.name, c.parallel
    ORDER BY total DESC
    LIMIT ${lim};
  `;

  res.json({
    labels: rows.map((r) => `${r.name} (${r.parallel})`),
    series: rows.map((r) => r.total),
    items: rows,
  });
};

export const passRateByCourse = async (req, res) => {
  const { year } = req.query;
  const { start, end } = rangeYear(year);
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

  res.json({
    labels: rows.map((r) => `${r.name} (${r.parallel})`),
    series: rows.map((r) => Number(((r.approved / r.total) * 100).toFixed(2))),
    items: rows.map((r) => ({
      ...r,
      passRate: Number(((r.approved / r.total) * 100).toFixed(2)),
    })),
  });
};
