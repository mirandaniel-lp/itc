import cron from "node-cron";
import { runAlertsOnce } from "../services/alertService.js";

let started = false;

export function startAlertsCron() {
  if (started) return;
  if (process.env.ALERTS_ENABLED !== "true") return;
  const spec = process.env.ALERTS_CRON || "0 8 * * *";
  const tz = process.env.ALERTS_TZ || "America/La_Paz";
  cron.schedule(
    spec,
    async () => {
      try {
        await runAlertsOnce();
      } catch {}
    },
    { timezone: tz }
  );
  started = true;
}

export async function runAlertsNow() {
  return await runAlertsOnce();
}
