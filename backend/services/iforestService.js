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
    return data;
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
