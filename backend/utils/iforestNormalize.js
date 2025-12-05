const toNum = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  if (
    v &&
    typeof v === "object" &&
    v.constructor &&
    v.constructor.name === "Decimal"
  ) {
    try {
      return Number(v);
    } catch {
      return Number(String(v));
    }
  }
  return 0;
};
const pick = (row, ...keys) => {
  for (const k of keys)
    if (row[k] !== undefined && row[k] !== null) return row[k];
  return undefined;
};
function normalizeOne(row) {
  const student_id = toNum(row.student_id);
  const course_id = toNum(row.course_id);
  const days_since_enrollment = toNum(row.dias_desde_matricula);
  const marks_total = toNum(row.marcas_tot);
  const attendance_pct = toNum(row.attendance_pct);
  const absences = toNum(row.ausentes);
  const tardies = toNum(row.tardes);
  const absences_30d = toNum(row.ausentes_30d);
  const tardies_30d = toNum(row.tardes_30d);
  const avg_hours = toNum(row.avg_hours);
  const items_count = toNum(row.items_count);
  const grade_avg = toNum(row.grade_avg_norm);
  const grade_p25 = toNum(row.grade_p25_norm);
  const fail_fraction = toNum(row.frac_reprob);
  const days_since_last_grade = toNum(row.dias_desde_ultima_nota_capped);
  return {
    student_id,
    course_id,
    days_since_enrollment,
    marks_total,
    attendance_pct,
    absences,
    tardies,
    absences_30d,
    tardies_30d,
    avg_hours,
    items_count,
    grade_avg,
    grade_p25,
    fail_fraction,
    days_since_last_grade,
  };
}
export function normalizeIfRows(rows) {
  return (rows || []).map(normalizeOne);
}
export function shapeIForestPayload(rows) {
  return normalizeIfRows(rows).map((x) => ({
    student_id: x.student_id,
    course_id: x.course_id,
    days_since_enrollment: x.days_since_enrollment,
    marks_total: x.marks_total,
    attendance_pct: x.attendance_pct,
    absences: x.absences,
    tardies: x.tardies,
    absences_30d: x.absences_30d,
    tardies_30d: x.tardies_30d,
    avg_hours: x.avg_hours,
    items_count: x.items_count,
    grade_avg: x.grade_avg,
    grade_p25: x.grade_p25,
    fail_fraction: x.fail_fraction,
    days_since_last_grade: x.days_since_last_grade,
  }));
}
