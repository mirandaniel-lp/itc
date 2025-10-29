import { PrismaClient } from "@prisma/client";
import { featuresByCourse } from "./featuresService.js";
import { predictRows } from "./iforestService.js";
import { serialize } from "../utils/serializer.js";
import { normalizeIfRows } from "../utils/iforestNormalize.js";
import { studentsByCourseBasic } from "./studentsService.js";
import { adminRecipientUsers } from "./notifierService.js";
import { createNotification } from "./notificationService.js";

const prisma = new PrismaClient();

function reasonsFromRow(row) {
  const out = [];
  const att = row.attendance_pct;
  const marks = row.marks_total ?? 0;
  const hasAttendance = att != null && (marks > 0 || att > 0);
  const gavg = row.grade_avg;
  const items = row.items_count ?? 0;
  const hasGrades = gavg != null && (items > 0 || gavg > 0);
  if (hasAttendance && att < 0.8) out.push("Asistencia baja");
  if ((row.absences_30d ?? 0) >= 3) out.push("Ausencias recientes");
  if (hasGrades && gavg < 51) out.push("Promedio bajo");
  if (hasGrades && (row.fail_fraction ?? 0) > 0.3) out.push("Alta reprobación");
  if ((row.tardies_30d ?? 0) >= 3) out.push("Tardanzas frecuentes");
  return out;
}

export async function runAlertsOnce() {
  const enabled = String(process.env.ALERTS_ENABLED || "true") === "true";
  if (!enabled) return { ok: true, created: 0, message: "Deshabilitado" };

  const minRisk = Number(process.env.RISK_HIGH_MIN || 0.66);
  const admins = await adminRecipientUsers();
  if (!admins.length)
    return { ok: true, created: 0, message: "Sin destinatarios" };

  const courses = await prisma.course.findMany({
    where: { status: true, term: { status: true } },
    select: { id: true, name: true, parallel: true },
    orderBy: [{ id: "asc" }],
  });

  const sections = [];
  let meta = { version: null, threshold: null, contamination: null };

  for (const c of courses) {
    const rowsDb = await featuresByCourse(c.id);
    if (!rowsDb.length) continue;
    const rows = normalizeIfRows(serialize(rowsDb));
    const pred = await predictRows(rows);

    if (!meta.version && pred?.version) meta.version = pred.version;
    if (!meta.threshold && pred?.threshold != null)
      meta.threshold = pred.threshold;
    if (!meta.contamination && pred?.contamination != null)
      meta.contamination = pred.contamination;

    const byRow = new Map(rows.map((r) => [`${r.student_id}`, r]));
    const studs = await studentsByCourseBasic(c.id);
    const byStudent = new Map(studs.map((s) => [`${s.id}`, s]));

    const flagged = (pred.items || [])
      .map((p) => {
        const base = byRow.get(`${p.student_id}`) || {};
        const info = byStudent.get(`${p.student_id}`) || {};
        return {
          ...p,
          reasons: reasonsFromRow(base),
          studentName: info.full_name || "",
          ci: info.ci || "",
        };
      })
      .filter((r) => r.alert && Number(r.risk_score01 || 0) >= minRisk)
      .sort((a, b) => b.risk_score01 - a.risk_score01);

    if (flagged.length) {
      const courseName = `${c.name}${c.parallel ? " – " + c.parallel : ""}`;
      sections.push({ courseId: c.id, courseName, items: flagged });
    }
  }

  if (!sections.length) return { ok: true, created: 0, message: "Sin alertas" };

  const total = sections.reduce((s, sec) => s + sec.items.length, 0);
  await createNotification({
    title: "Riesgo de deserción detectado",
    message: `Se detectaron ${total} estudiantes en riesgo`,
    level: "ALTA",
    data: { meta, sections },
    userIds: admins,
    created_by: "IFOREST",
  });

  return { ok: true, created: 1, sections: sections.length, total };
}
