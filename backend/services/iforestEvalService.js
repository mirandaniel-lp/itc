import { featuresByCourse } from "./featuresService.js";
import { predictRows } from "./iforestService.js";
import { serialize } from "../utils/serializer.js";
import { normalizeIfRows } from "../utils/iforestNormalize.js";

function metricsAtThreshold(items, th) {
  const marked = items.filter((r) => Number(r.score) <= Number(th)).length;
  return { th, marked };
}

export async function tuneThresholdForCourse(courseId, opts = {}) {
  const gridSize = Number(opts.grid_size || 60);
  const rowsDb = await featuresByCourse(courseId);
  if (!rowsDb || !rowsDb.length) return { ok: true, n: 0 };

  const rows = normalizeIfRows(serialize(rowsDb));
  const pred = await predictRows(rows);
  const items = pred.items || [];

  const scores = items.map((r) => Number(r.score));
  const sMin = Math.min(...scores);
  const sMax = Math.max(...scores);

  const N = gridSize;
  const thresholds = [];
  for (let i = 0; i <= N; i++) thresholds.push(sMin + (i / N) * (sMax - sMin));
  const rowsMetrics = thresholds.map((th) => metricsAtThreshold(items, th));
  const targetCount = Math.round((pred.contamination || 0.0) * items.length);
  let best = rowsMetrics.reduce((a, b) =>
    Math.abs(a.marked - targetCount) < Math.abs(b.marked - targetCount) ? a : b
  );

  return {
    ok: true,
    courseId,
    n: items.length,
    version: pred.version,
    threshold_candidates: thresholds.length,
    best,
    metrics: rowsMetrics,
  };
}
