import { featuresByCourse, featuresAll } from "../services/featuresService.js";
import {
  predictRows,
  trainRows,
  getHealth,
} from "../services/iforestService.js";
import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
import { normalizeIfRows } from "../utils/iforestNormalize.js";
import { studentsByCourseBasic } from "../services/studentsService.js";

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

async function resolveModelVersion(pred) {
  if (pred?.version) return String(pred.version);
  try {
    const h = await getHealth();
    if (h?.version) return String(h.version);
  } catch {}
  const last = await prisma.iForestModel.findFirst({
    orderBy: { createdAt: "desc" },
  });
  if (last?.version) return String(last.version);
  return `IF-${new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14)}`;
}

export async function riskByCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const rowsDb = await featuresByCourse(courseId);
    if (!rowsDb.length) return res.json({ ok: true, n: 0, items: [] });

    const rows = normalizeIfRows(serialize(rowsDb));
    const pred = await predictRows(rows);

    const byRow = new Map(rows.map((r) => [`${r.student_id}`, r]));
    const studs = await studentsByCourseBasic(courseId);
    const byStudent = new Map(studs.map((s) => [`${s.id}`, s]));

    const items = pred.items
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
      .sort((a, b) => b.risk_score01 - a.risk_score01);

    return res.json({
      ok: true,
      n: items.length,
      version: pred.version,
      threshold: pred.threshold,
      contamination: pred.contamination,
      items,
    });
  } catch (err) {
    next(err);
  }
}

export async function persistByCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const rowsDb = await featuresByCourse(courseId);
    if (!rowsDb.length) return res.json({ ok: true, n: 0, saved: 0 });
    const rows = normalizeIfRows(serialize(rowsDb));
    const pred = await predictRows(rows);
    const version = await resolveModelVersion(pred);
    const saved = await prisma.$transaction(
      pred.items.map((p) =>
        prisma.riskPrediction.upsert({
          where: {
            studentId_courseId_modelVersion: {
              studentId: BigInt(p.student_id),
              courseId: BigInt(p.course_id),
              modelVersion: version,
            },
          },
          update: {
            score: p.score,
            risk01: p.risk_score01,
            alert: p.alert,
            threshold: pred.threshold,
            contamination: pred.contamination,
          },
          create: {
            studentId: BigInt(p.student_id),
            courseId: BigInt(p.course_id),
            score: p.score,
            risk01: p.risk_score01,
            alert: p.alert,
            modelVersion: version,
            threshold: pred.threshold,
            contamination: pred.contamination,
          },
        })
      )
    );
    return res.json({
      ok: true,
      n: pred.items.length,
      saved: saved.length,
      version,
    });
  } catch (err) {
    next(err);
  }
}

export async function train(req, res, next) {
  try {
    const { courseId, contamination } = req.body || {};
    const rowsDb = courseId
      ? await featuresByCourse(courseId)
      : await featuresAll();
    if (!rowsDb.length)
      return res
        .status(400)
        .json({ ok: false, message: "No hay filas para entrenar" });
    const rows = normalizeIfRows(serialize(rowsDb));
    const out = await trainRows(rows, Number(contamination ?? 0.18));
    const version = String(
      out.version ||
        `IF-${new Date()
          .toISOString()
          .replace(/[-:.TZ]/g, "")
          .slice(0, 14)}`
    );
    const features = JSON.stringify(Object.keys(rows[0] || {}));
    await prisma.iForestModel.upsert({
      where: { version },
      update: {
        contamination: out.contamination,
        threshold: out.threshold,
        features,
      },
      create: {
        version,
        contamination: out.contamination,
        threshold: out.threshold,
        features,
      },
    });
    return res.json({ ...out, version });
  } catch (err) {
    next(err);
  }
}

export async function validateByCourse(req, res, next) {
  try {
    const courseId = req.params.courseId;
    const rowsDb = await featuresByCourse(courseId);
    if (!rowsDb.length) return res.json({ ok: true, n: 0, items: [] });

    const rows = normalizeIfRows(serialize(rowsDb));
    const pred = await predictRows(rows);
    const byKey = new Map(rows.map((r) => [r.student_id, r]));

    let tp = 0,
      fp = 0,
      tn = 0,
      fn = 0;
    pred.items.forEach((p) => {
      const r = byKey.get(p.student_id);
      const proxyBad = r.attendance_pct < 0.8 || r.grade_avg < 51;
      if (p.alert && proxyBad) tp++;
      else if (p.alert && !proxyBad) fp++;
      else if (!p.alert && !proxyBad) tn++;
      else fn++;
    });

    const precision = tp / Math.max(tp + fp, 1);
    const recall = tp / Math.max(tp + fn, 1);

    res.json({
      ok: true,
      n: pred.items.length,
      tp,
      fp,
      tn,
      fn,
      precision,
      recall,
      rule: "asistencia_pct < 0.80 OR nota_prom < 51",
      version: pred.version,
    });
  } catch (e) {
    next(e);
  }
}

export async function health(_req, res, next) {
  try {
    const h = await getHealth();
    res.json(h);
  } catch (e) {
    next(e);
  }
}
