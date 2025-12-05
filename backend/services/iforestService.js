import "dotenv/config";
import axios from "axios";
import { shapeIForestPayload } from "../utils/iforestNormalize.js";

function iforestUrl() {
  return process.env.IFOREST_URL || "http://localhost:8021";
}

function axiosErr(e) {
  const status = e?.response?.status;
  const data = e?.response?.data;
  const msg = data?.detail || data || e.message;
  const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  err.status = status || 500;
  throw err;
}

function risk01FromScore(score, threshold, sminArg = null) {
  const s = Number(score);
  const t2 = Number(threshold);
  if (!Number.isFinite(s) || !Number.isFinite(t2)) return 0;
  if (sminArg == null) {
    const scale = Math.abs(t2) + 1e-9;
    const r = (t2 - s) / scale;
    if (!isFinite(r) || isNaN(r)) return 0;
    if (r < 0) return 0;
    if (r > 1) return 1;
    return r;
  }
  const diff = t2 - Number(sminArg);
  const denom = diff !== 0 ? diff : 1.0;
  let r = (t2 - s) / denom;
  if (!isFinite(r) || isNaN(r)) return 0;
  if (r < 0) return 0;
  if (r > 1) return 1;
  return r;
}

export async function getHealth() {
  try {
    const { data } = await axios.get(`${iforestUrl()}/health`);
    return data;
  } catch (e) {
    axiosErr(e);
  }
}

export async function predictRows(rows) {
  try {
    const payload = { rows: shapeIForestPayload(rows) };
    const { data } = await axios.post(`${iforestUrl()}/predict`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    const t = data?.threshold;
    const scores = (data?.items || []).map((it) => Number(it.score));
    const smin = scores.length ? Math.min(...scores) : null;

    function risk01FromScore(score, threshold, sminArg = null) {
      const s = Number(score);
      const t2 = Number(threshold);
      if (!Number.isFinite(s) || !Number.isFinite(t2)) return 0;
      if (sminArg == null) {
        const scale = Math.abs(t2) + 1e-9;
        const r = (t2 - s) / scale;
        if (!isFinite(r) || isNaN(r)) return 0;
        if (r < 0) return 0;
        if (r > 1) return 1;
        return r;
      }
      const denom = t2 - Number(sminArg) !== 0 ? t2 - Number(sminArg) : 1.0;
      let r = (t2 - s) / denom;
      if (!isFinite(r) || isNaN(r)) return 0;
      if (r < 0) return 0;
      if (r > 1) return 1;
      return r;
    }

    const items = (data?.items || []).map((it) => ({
      ...it,
      risk_score01:
        it.risk_score01 == null || it.risk_score01 === 0
          ? risk01FromScore(it.score, t, smin)
          : it.risk_score01,
    }));
    return { ...data, items };
  } catch (e) {
    axiosErr(e);
  }
}

export async function trainRows(rows, contamination = 0.18) {
  try {
    const payload = { rows: shapeIForestPayload(rows), contamination };
    const { data } = await axios.post(`${iforestUrl()}/train`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (e) {
    axiosErr(e);
  }
}
