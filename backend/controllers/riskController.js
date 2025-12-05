import { featuresByCourse, featuresAll } from "../services/featuresService.js";
import {
  predictRows,
  trainRows,
  getHealth,
} from "../services/iforestService.js";
import { PrismaClient } from "@prisma/client";
import { serialize } from "../utils/serializer.js";
import {
  normalizeIfRows,
  shapeIForestPayload,
} from "../utils/iforestNormalize.js";
import { studentsByCourseBasic } from "../services/studentsService.js";

const prisma = new PrismaClient();

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

function computeRankRisk01(scores) {
  const n = scores.length;
  if (n === 0) return [];
  const valid = [];
  for (let i = 0; i < n; i++) {
    const s = scores[i];
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
  const hasGrades = Array.isArray(row._grades)
    ? row._grades.length > 0
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

export async function riskByCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    const rowsDb = await featuresByCourse(courseId);
    if (!rowsDb.length) return res.json({ ok: true, n: 0, items: [] });
    const rows = normalizeIfRows(serialize(rowsDb));
    const pred = await predictRows(rows);
    const itemsRaw = pred.items || [];
    const scoresFinite = itemsRaw
      .map((p) => Number(p.score))
      .filter((s) => Number.isFinite(s));
    const metaThreshold =
      pred.threshold !== undefined ? Number(pred.threshold) : null;
    const contamination =
      pred.contamination !== undefined ? Number(pred.contamination) : 0.18;
    const chosen = chooseThresholdPolicy(
      scoresFinite,
      metaThreshold,
      contamination
    );
    const chosenThreshold = chosen.threshold;
    const scoresAll = itemsRaw.map((p) => Number(p.score));
    const ranksArray = computeRankRisk01(scoresAll);
    const studs = await studentsByCourseBasic(courseId);
    const byStudent = new Map(studs.map((s) => [`${s.id}`, s]));
    const byFeatures = new Map(rows.map((r) => [`${r.student_id}`, r]));
    const items = itemsRaw
      .map((p, idx) => {
        const info = byStudent.get(`${p.student_id}`) || {};
        const featRow = byFeatures.get(`${p.student_id}`) || {};
        const scoreVal = Number(p.score);
        const rawRank = scoreToRankFromMap(scoreVal, ranksArray, idx);
        const confidence = confFactor(featRow);
        const risk_rank01 = Number((rawRank * confidence).toFixed(6));
        const alert_chosen =
          chosenThreshold !== null
            ? Number(p.score) <= Number(chosenThreshold) && confidence >= 0.5
            : false;
        return {
          ...p,
          studentName: info.full_name || "",
          ci: info.ci || "",
          alert_chosen,
          risk_rank01,
          confidence,
        };
      })
      .sort((a, b) => b.risk_rank01 - a.risk_rank01);
    return res.json({
      ok: true,
      n: items.length,
      model_version: pred.version,
      threshold_used: chosenThreshold,
      threshold_source: chosen.source,
      contamination,
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
    const itemsRaw = pred.items || [];
    const scoresFinite = itemsRaw
      .map((p) => Number(p.score))
      .filter((s) => Number.isFinite(s));
    const metaThreshold =
      pred.threshold !== undefined ? Number(pred.threshold) : null;
    const contamination =
      pred.contamination !== undefined ? Number(pred.contamination) : 0.18;
    const chosen = chooseThresholdPolicy(
      scoresFinite,
      metaThreshold,
      contamination
    );
    const chosenThreshold = chosen.threshold;
    const version = await resolveModelVersion(pred);
    const scoresAll = itemsRaw.map((p) => Number(p.score));
    const ranksArray = computeRankRisk01(scoresAll);
    const byFeatures = new Map(rows.map((r) => [`${r.student_id}`, r]));
    const upserts = itemsRaw.map((p, idx) => {
      const featRow = byFeatures.get(`${p.student_id}`) || {};
      const scoreVal = Number(p.score);
      const rawRank = scoreToRankFromMap(scoreVal, ranksArray, idx);
      const confidence = confFactor(featRow);
      const risk_rank01 = Number((rawRank * confidence).toFixed(6));
      const alertFinal =
        chosenThreshold !== null
          ? Number(p.score) <= Number(chosenThreshold) && confidence >= 0.5
          : false;
      const sid = BigInt(Math.trunc(Number(p.student_id) || 0));
      const cid = BigInt(Math.trunc(Number(p.course_id) || 0));
      return prisma.riskPrediction.upsert({
        where: {
          studentId_courseId_modelVersion: {
            studentId: sid,
            courseId: cid,
            modelVersion: version,
          },
        },
        update: {
          score: p.score,
          risk01: risk_rank01,
          raw_risk_score: p.risk_score01 ?? null,
          alert: alertFinal,
          threshold: chosenThreshold,
          contamination: pred.contamination,
          threshold_source: chosen.source,
          confidence,
        },
        create: {
          studentId: sid,
          courseId: cid,
          score: p.score,
          risk01: risk_rank01,
          raw_risk_score: p.risk_score01 ?? null,
          alert: alertFinal,
          modelVersion: version,
          threshold: chosenThreshold,
          contamination: pred.contamination,
          threshold_source: chosen.source,
          confidence,
        },
      });
    });
    const saved = await prisma.$transaction(upserts);
    return res.json({
      ok: true,
      n: itemsRaw.length,
      saved: saved.length,
      version,
      threshold_used: chosenThreshold,
      threshold_source: chosen.source,
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
    const featsUsed = Object.keys(shapeIForestPayload(rows)[0] || {});
    const version = String(
      out.version ||
        `IF-${new Date()
          .toISOString()
          .replace(/[-:.TZ]/g, "")
          .slice(0, 14)}`
    );
    await prisma.iForestModel.upsert({
      where: { version },
      update: {
        contamination: out.contamination,
        threshold: out.threshold,
        features: JSON.stringify(featsUsed),
      },
      create: {
        version,
        contamination: out.contamination,
        threshold: out.threshold,
        features: JSON.stringify(featsUsed),
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
    if (!rowsDb.length) return res.json({ ok: true, n: 0 });
    const rows = normalizeIfRows(serialize(rowsDb));
    const pred = await predictRows(rows);
    const items = pred.items || [];
    const metaThreshold =
      pred.threshold !== undefined ? Number(pred.threshold) : null;
    const contamination =
      pred.contamination !== undefined ? Number(pred.contamination) : 0.18;
    const scoresFinite = items
      .map((p) => Number(p.score))
      .filter((s) => Number.isFinite(s));
    const sampleThreshold = scoresFinite.length
      ? quantileSorted(scoresFinite, contamination)
      : null;
    const chosen = chooseThresholdPolicy(
      scoresFinite,
      metaThreshold,
      contamination
    );
    const ranksArray = computeRankRisk01(items.map((p) => Number(p.score)));
    const studs = await studentsByCourseBasic(courseId);
    const byStudent = new Map(studs.map((s) => [`${s.id}`, s]));
    const byFeatures = new Map(rows.map((r) => [`${r.student_id}`, r]));
    const sample = items.slice(0, 10).map((p, idx) => {
      const info = byStudent.get(`${p.student_id}`) || {};
      const featRow = byFeatures.get(`${p.student_id}`) || {};
      const scoreVal = Number(p.score);
      const rawRank = scoreToRankFromMap(scoreVal, ranksArray, idx);
      const confidence = confFactor(featRow);
      const risk_rank01 = Number((rawRank * confidence).toFixed(6));
      return {
        ...p,
        studentName: info.full_name || "",
        ci: info.ci || "",
        alert_sample:
          sampleThreshold !== null ? Number(p.score) <= sampleThreshold : false,
        alert_chosen:
          chosen.threshold !== null
            ? Number(p.score) <= chosen.threshold && confidence >= 0.5
            : false,
        risk_rank01,
        confidence,
      };
    });
    const alerts_meta =
      metaThreshold !== null
        ? items.filter((p) => Number(p.score) <= metaThreshold).length
        : 0;
    const alerts_sample =
      sampleThreshold !== null
        ? items.filter((p) => Number(p.score) <= sampleThreshold).length
        : 0;
    const alerts_chosen =
      chosen.threshold !== null
        ? items.filter((p) => {
            const feat = byFeatures.get(`${p.student_id}`) || {};
            return (
              Number(p.score) <= chosen.threshold && confFactor(feat) >= 0.5
            );
          }).length
        : 0;
    return res.json({
      ok: true,
      n: items.length,
      alerts_meta,
      alerts_sample,
      alerts_chosen,
      normals_meta: items.length - alerts_meta,
      normals_sample: items.length - alerts_sample,
      normals_chosen: items.length - alerts_chosen,
      threshold_meta: metaThreshold,
      threshold_sample: sampleThreshold,
      threshold_chosen: chosen.threshold,
      threshold_source_chosen: chosen.source,
      contamination,
      version: pred.version,
      sample,
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
