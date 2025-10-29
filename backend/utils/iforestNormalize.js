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
  const student_id = toNum(
    pick(row, "student_id", "estudiante_id", "studentId")
  );
  const course_id = toNum(pick(row, "course_id", "curso_id", "courseId"));
  const gender_f = toNum(pick(row, "gender_f", "genero_f", "generoF"));
  const age = toNum(pick(row, "age", "edad"));
  const days_since_enrollment = toNum(
    pick(row, "days_since_enrollment", "dias_desde_matricula")
  );
  const marks_total = toNum(
    pick(row, "marks_total", "marcas_tot", "marcas_total")
  );
  const attendance_pct = toNum(pick(row, "attendance_pct", "asistencia_pct"));
  const absences = toNum(pick(row, "absences", "ausentes"));
  const tardies = toNum(pick(row, "tardies", "tardes"));
  const absences_30d = toNum(pick(row, "absences_30d", "ausentes_30d"));
  const tardies_30d = toNum(pick(row, "tardies_30d", "tardes_30d"));
  const avg_hours = toNum(
    pick(row, "avg_hours", "horas_prom", "horas_promedio")
  );
  const items_count = toNum(pick(row, "items_count", "n_items"));
  const grade_avg = toNum(pick(row, "grade_avg", "nota_prom", "promedio"));
  const grade_p25 = toNum(pick(row, "grade_p25", "nota_p25"));
  const fail_fraction = toNum(
    pick(row, "fail_fraction", "frac_reprob", "fraccion_reprob")
  );
  const days_since_last_grade = toNum(
    pick(row, "days_since_last_grade", "dias_desde_ultima_nota")
  );

  const _student_name =
    pick(row, "_student_name", "student_name", "nombre", "full_name") || null;
  const _ci = pick(row, "_ci", "ci") || null;

  return {
    student_id,
    course_id,
    gender_f,
    age,
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
    _student_name,
    _ci,
  };
}

export function normalizeIfRows(rows) {
  return (rows || []).map(normalizeOne);
}

export function shapeIForestPayload(rows) {
  const r = normalizeIfRows(rows).map((x) => ({
    student_id: x.student_id,
    course_id: x.course_id,
    gender_f: x.gender_f,
    age: x.age,
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
  return r;
}
