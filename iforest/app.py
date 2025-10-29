from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import joblib, json, pandas as pd, os, numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from datetime import datetime

MODEL_PATH = os.getenv("MODEL_PATH", "/models/iforest_model.joblib")
META_PATH  = os.getenv("META_PATH",  "/models/iforest_meta.json")

app = FastAPI(title="Dropout-IForest")
pipe = None
meta = None

FEATS_EN = [
  "gender_f","age","days_since_enrollment","marks_total","attendance_pct",
  "absences","tardies","absences_30d","tardies_30d","avg_hours",
  "items_count","grade_avg","grade_p25","fail_fraction","days_since_last_grade"
]

ES2EN = {
  "edad":"age",
  "dias_desde_matricula":"days_since_enrollment",
  "marcas_tot":"marks_total",
  "asistencia_pct":"attendance_pct",
  "ausentes":"absences",
  "tardes":"tardies",
  "ausentes_30d":"absences_30d",
  "tardes_30d":"tardies_30d",
  "horas_prom":"avg_hours",
  "n_items":"items_count",
  "nota_prom":"grade_avg",
  "nota_p25":"grade_p25",
  "frac_reprob":"fail_fraction",
  "dias_desde_ultima_nota":"days_since_last_grade",
}

def _try_load():
  global pipe, meta
  if pipe is None and os.path.exists(MODEL_PATH):
    pipe = joblib.load(MODEL_PATH)
  if meta is None and os.path.exists(META_PATH):
    with open(META_PATH) as f:
      meta = json.load(f)

def _now_version():
  return f"IF-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"

def _harmonize_columns(df: pd.DataFrame) -> pd.DataFrame:
  cols = {c: ES2EN.get(c, c) for c in df.columns}
  return df.rename(columns=cols)

def _resolve_meta_feats_to_en() -> List[str]:
  """Convierte meta['features'] (vengan en ES o EN) a la lista en inglés."""
  feats = (meta.get("features") if meta else None) or FEATS_EN
  out = []
  for f in feats:
    out.append(ES2EN.get(f, f))
  return out

class Row(BaseModel):
  student_id: int
  course_id: int
  gender_f: float
  age: float
  days_since_enrollment: float
  marks_total: float
  attendance_pct: float
  absences: float
  tardies: float
  absences_30d: float
  tardies_30d: float
  avg_hours: float
  items_count: float
  grade_avg: float
  grade_p25: float
  fail_fraction: float
  days_since_last_grade: float

class PredictIn(BaseModel):
  rows: List[Row]

class TrainIn(BaseModel):
  rows: List[Row]
  contamination: Optional[float] = 0.18
  target_recall: Optional[float] = None
  optimize_metric: Optional[str] = "f1"

@app.get("/health")
def health():
  _try_load()
  return {
    "ok": True,
    "model_loaded": bool(pipe is not None),
    "features": (meta.get("features") if meta else None),
    "version": (meta.get("version") if meta else None),
    "contamination": (meta.get("contamination") if meta else None),
    "threshold": (meta.get("threshold") if meta else None)
  }

@app.post("/predict")
def predict(body: PredictIn):
  _try_load()
  if pipe is None or meta is None:
    raise HTTPException(status_code=400, detail="Modelo no entrenado. Entrena con /train.")

  df = pd.DataFrame([r.dict() for r in body.rows])
  df = _harmonize_columns(df)

  feats_en = _resolve_meta_feats_to_en()
  missing = [f for f in feats_en if f not in df.columns]
  if missing:
    raise HTTPException(
      status_code=422,
      detail=f"Faltan columnas en el payload: {missing}. Esperadas: {feats_en}"
    )

  X = df[feats_en].fillna(0.0).astype(float).values
  scores = pipe["clf"].score_samples(pipe["scaler"].transform(X))
  z = -scores
  p = (z - z.min()) / (z.max() - z.min() + 1e-9)
  alerts = scores <= meta["threshold"]

  out = []
  for i, r in enumerate(body.rows):
    out.append({
      "student_id": int(r.student_id),
      "course_id":  int(r.course_id),
      "score": float(scores[i]),
      "risk_score01": float(p[i]),
      "alert": bool(alerts[i])
    })
  return {
    "ok": True,
    "n": len(out),
    "contamination": meta["contamination"],
    "threshold": meta["threshold"],
    "version": meta.get("version"),
    "items": out
  }

@app.post("/train")
def train(body: TrainIn):
  global pipe, meta
  df = pd.DataFrame([r.dict() for r in body.rows])
  df = _harmonize_columns(df)

  X = df[FEATS_EN].fillna(0.0).astype(float).values
  pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", IsolationForest(n_estimators=300, contamination=float(body.contamination), random_state=42, n_jobs=-1))
  ])
  pipe.fit(X)
  scores = pipe["clf"].score_samples(pipe["scaler"].transform(X))
  q = float(np.quantile(scores, float(body.contamination)))
  ver = _now_version()

  joblib.dump(pipe, MODEL_PATH)
  with open(META_PATH, "w") as f:
    json.dump({
      "version": ver,
      "features": FEATS_EN,    
      "contamination": float(body.contamination),
      "threshold": q
    }, f, indent=2)

  meta = {"version": ver, "features": FEATS_EN, "contamination": float(body.contamination), "threshold": q}
  return {"ok": True, "n_rows": int(len(df)), "threshold": q, "contamination": float(body.contamination), "version": ver}
