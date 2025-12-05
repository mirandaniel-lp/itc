import cron from "node-cron";
import { featuresAll } from "../services/featuresService.js";
import { trainRows, getHealth } from "../services/iforestService.js";

function parseIfVersion(ver) {
  const m = String(ver || "").match(/^IF-(\d{8})-(\d{6})$/);
  if (!m) return null;
  const [_, ymd, hms] = m;
  const dt = new Date(
    `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}T${hms.slice(
      0,
      2
    )}:${hms.slice(2, 4)}:${hms.slice(4, 6)}Z`
  );
  return isNaN(dt.getTime()) ? null : dt;
}

const daysSince = (d) =>
  d ? Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)) : null;

export function startIForestCron() {
  cron.schedule("0 6 * * 1", async () => {
    try {
      const h = await getHealth().catch(() => ({}));
      const verDate = parseIfVersion(h?.version);
      const stale = daysSince(verDate);
      if (stale == null || stale >= 14) {
        const rowsDb = await featuresAll();
        if (!rowsDb.length) return;
        const { normalizeIfRows } = await import(
          "../utils/iforestNormalize.js"
        );
        const rows = normalizeIfRows(rowsDb);
        await trainRows(rows, 0.18);
        console.log("[IForestCron] retrained");
      } else {
        console.log("[IForestCron] fresh", { stale });
      }
    } catch (e) {
      console.error("[IForestCron]", e?.message || e);
    }
  });
}
