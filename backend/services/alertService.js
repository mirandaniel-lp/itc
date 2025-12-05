import { PrismaClient } from "@prisma/client";
import { featuresByCourse } from "./featuresService.js";
import { predictRows } from "./iforestService.js";
import { serialize } from "../utils/serializer.js";
import { normalizeIfRows } from "../utils/iforestNormalize.js";
import { studentsByCourseBasic } from "./studentsService.js";
import { adminRecipientUsers } from "./notifierService.js";
import { createNotification } from "./notificationService.js";

const prisma = new PrismaClient();
const MIN_MARKS = Number(process.env.IF_MIN_MARKS || 6);
const MIN_DAYS = Number(process.env.IF_MIN_DAYS || 21);
const MIN_ALERT_PCT = 0.05;
const MAX_ALERT_PCT = 0.25;

function quantileSorted(arr, q) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const a = arr.slice().sort((x, y) => x - y);
  const pos = (a.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (a[base + 1] !== undefined)
    return a[base] + rest * (a[base + 1] - a[base]);
  return a[base];
}

function chooseThresholdPolicy(scores, metaThreshold, contamination) {
  if (!scores || scores.length === 0)
    return {
      threshold: metaThreshold,
      source: metaThreshold ? "meta" : "none",
    };
  const n = scores.length;
  const sampleThreshold = quantileSorted(scores, contamination);
  const alertsBy = (th) =>
    th === null ? 0 : scores.filter((s) => Number(s) <= Number(th)).length;
  const alerts_meta = metaThreshold !== null ? alertsBy(metaThreshold) : 0;
  const pct_meta = alerts_meta / Math.max(1, n);
  if (metaThreshold === null)
    return { threshold: sampleThreshold, source: "sample" };
  if (pct_meta < MIN_ALERT_PCT || pct_meta > MAX_ALERT_PCT)
    return { threshold: sampleThreshold, source: "sample" };
  return { threshold: metaThreshold, source: "meta" };
}

function computeRankRisk01(scores) {
  const n = scores.length;
  if (n === 0) return [];
  const valid = [];
  for (let i = 0; i < n; i++) {
    const s = Number(scores[i]);
    if (Number.isFinite(s)) valid.push({ s, i });
  }
  if (valid.length === 0) return new Array(n).fill(0);
  const sorted = valid.slice().sort((a, b) => a.s - b.s);
  const positionsByScore = new Map();
  for (let i = 0; i < sorted.length; i++) {
    const key = sorted[i].s;
    if (!positionsByScore.has(key)) positionsByScore.set(key, []);
    positionsByScore.get(key).push(i);
  }
  const avgPosByScore = new Map();
  for (const [key, arr] of positionsByScore.entries()) {
    avgPosByScore.set(key, arr.reduce((a, b) => a + b, 0) / arr.length);
  }
  const ranks = new Array(n).fill(0);
  for (const v of valid) {
    const idxOriginal = v.i;
    const avgPos = avgPosByScore.get(v.s);
    const rank = sorted.length === 1 ? 0 : avgPos / (sorted.length - 1);
    ranks[idxOriginal] = 1 - rank;
  }
  return ranks;
}

function scoreToRankFromMap(_score, ranksArray, idx) {
  if (!Array.isArray(ranksArray)) return 0;
  if (!Number.isFinite(idx) || idx < 0 || idx >= ranksArray.length) return 0;
  return Number(ranksArray[idx] ?? 0);
}

function confFactor(row) {
  const minItems = 8;
  const itemsCount = Number(row.items_count || 0);
  const baseItems = Math.min(1, itemsCount / minItems);
  const enrollDays = Number(row.days_since_enrollment || 0);
  const enrollFactor = enrollDays < 30 ? 0.45 : 1;
  const att = Number(row.attendance_pct ?? 0);
  const attFactor = Math.min(1, Math.max(0, att));
  const grade = Number(row.grade_avg ?? 0);
  const gradeFactor = grade > 0 ? Math.min(1, grade / 100) : 0;
  const hasGrades = row._grades
    ? Array.isArray(row._grades) && row._grades.length > 0
    : !!row.grade_avg;
  const gradePresenceFactor = hasGrades ? 1 : 0.9;
  const combined =
    baseItems *
    enrollFactor *
    (0.6 * attFactor + 0.4 * gradeFactor) *
    gradePresenceFactor;
  const c = Math.max(0.25, Math.min(1, Number(combined.toFixed(3))));
  return c;
}

function risk01FromScore(score, threshold) {
  const s = Number(score);
  const t = Number(threshold);
  if (!Number.isFinite(s) || !Number.isFinite(t)) return 0;
  if (s >= t) return 0;
  const scale = Math.abs(t) + 1e-9;
  const r = (t - s) / scale;
  if (!isFinite(r) || isNaN(r)) return 0;
  if (r < 0) return 0;
  if (r > 1) return 1;
  return r;
}

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
    const eligible = rows.filter(
      (r) =>
        Number(r.marks_total || 0) >= MIN_MARKS ||
        Number(r.days_since_enrollment || 0) >= MIN_DAYS
    );
    if (!eligible.length) continue;
    const pred = await predictRows(eligible);
    if (!pred) continue;
    if (!meta.version && pred?.version) meta.version = pred.version;
    if (!meta.threshold && pred?.threshold != null)
      meta.threshold = pred.threshold;
    if (!meta.contamination && pred?.contamination != null)
      meta.contamination = pred.contamination;
    const byRow = new Map(eligible.map((r) => [`${r.student_id}`, r]));
    const studs = await studentsByCourseBasic(c.id);
    const byStudent = new Map(studs.map((s) => [`${s.id}`, s]));
    const itemsRaw = pred.items || [];
    const scores = itemsRaw
      .map((it) => Number(it.score))
      .filter((s) => Number.isFinite(s));
    const chosen = chooseThresholdPolicy(
      scores,
      pred.threshold !== undefined ? Number(pred.threshold) : null,
      pred.contamination !== undefined ? Number(pred.contamination) : 0.18
    );
    const chosenThreshold = chosen.threshold;
    const scoresAll = itemsRaw.map((p) => Number(p.score));
    const ranksArray = computeRankRisk01(scoresAll);
    const items = (itemsRaw || []).map((p, idx) => {
      const rawRank = scoreToRankFromMap(Number(p.score), ranksArray, idx);
      return {
        ...p,
        risk_rank01: Number((rawRank * 1).toFixed(6)),
        risk_score01:
          p.risk_score01 == null || p.risk_score01 === 0
            ? risk01FromScore(
                p.score,
                chosenThreshold != null ? chosenThreshold : pred.threshold ?? 0
              )
            : p.risk_score01,
      };
    });
    const flagged = items
      .map((p) => {
        const base = byRow.get(`${p.student_id}`) || {};
        const info = byStudent.get(`${p.student_id}`) || {};
        const confidence = confFactor(base);
        const rawRank = scoreToRankFromMap(
          Number(p.score),
          ranksArray,
          items.indexOf(p)
        );
        const risk_rank01 = Number((rawRank * confidence).toFixed(6));
        const meetsThreshold =
          chosenThreshold != null
            ? Number(p.score) <= Number(chosenThreshold) && confidence >= 0.5
            : false;
        const meetsRiskRank = risk_rank01 >= minRisk;
        return {
          ...p,
          reasons: reasonsFromRow(base),
          studentName: info.full_name || "",
          ci: info.ci || "",
          confidence,
          risk_rank01,
          meetsThreshold,
          meetsRiskRank,
        };
      })
      .filter((r) => r.meetsThreshold || r.meetsRiskRank)
      .sort((a, b) => (b.risk_rank01 || 0) - (a.risk_rank01 || 0));
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
