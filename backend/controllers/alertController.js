import { runAlertsNow } from "../jobs/alerts.job.js";

export async function index(_req, res) {
  res.json({
    ok: true,
    enabled: String(process.env.ALERTS_ENABLED || "true") === "true",
    cron: process.env.ALERTS_CRON || "0 8 * * *",
    tz: process.env.ALERTS_TZ || "America/La_Paz",
    lookback_days: Number(process.env.ALERTS_LOOKBACK_DAYS || 14),
    risk_high_min: Number(process.env.RISK_HIGH_MIN || 0.66),
  });
}

export async function run(_req, res, next) {
  try {
    const out = await runAlertsNow();
    res.json(out);
  } catch (e) {
    next(e);
  }
}
