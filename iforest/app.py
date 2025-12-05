from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
import joblib, json, pandas as pd, os, numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from datetime import datetime
MODEL_PATH = os.getenv("MODEL_PATH", "/models/iforest_model.joblib")
META_PATH  = os.getenv("META_PATH",  "/models/iforest_meta.json")
app = FastAPI(title="Dropout-IForest")
pipe = None
meta = None
FEATS_EN = [
  "days_since_enrollment","marks_total","attendance_pct",
  "absences","tardies","absences_30d","tardies_30d","avg_hours",
  "items_count","grade_avg","grade_p25","fail_fraction","days_since_last_grade"
]
ES2EN = {
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
class IdentityImputer:
  def fit(self, X, y=None):
    return self
  def transform(self, X):
    return X
def _try_load():
  global pipe, meta
  if pipe is None and os.path.exists(MODEL_PATH):
    try:
      loaded = joblib.load(MODEL_PATH)
      if isinstance(loaded, dict):
        pipe = loaded
      elif isinstance(loaded, Pipeline):
        imputer = IdentityImputer()
        scaler = loaded["scaler"] if "scaler" in loaded.named_steps else (loaded[0] if len(loaded.steps)>0 else StandardScaler())
        clf = loaded["clf"] if "clf" in loaded.named_steps else loaded[-1]
        pipe = {"imputer": imputer, "scaler": scaler, "clf": clf}
      else:
        pipe = loaded
    except:
      pipe = None
  if meta is None and os.path.exists(META_PATH):
    try:
      with open(META_PATH) as f:
        meta = json.load(f)
    except:
      meta = None
def _now_version():
  return f"IF-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
def _harmonize_columns(df: pd.DataFrame) -> pd.DataFrame:
  cols = {c: ES2EN.get(c, c) for c in df.columns}
  return df.rename(columns=cols)
def _resolve_meta_feats_to_en() -> List[str]:
  feats = (meta.get("features") if meta else None) or FEATS_EN
  out = []
  for f in feats:
    out.append(ES2EN.get(f, f))
  return out
class Row(BaseModel):
  student_id: int
  course_id: int
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
  if pipe is None:
    raise HTTPException(status_code=400, detail="Modelo no entrenado. Entrena con /train.")
  df = pd.DataFrame([r.dict() for r in body.rows])
  df = _harmonize_columns(df)
  feats_en = _resolve_meta_feats_to_en()
  missing = [f for f in feats_en if f not in df.columns]
  if missing:
    raise HTTPException(status_code=422, detail=f"Faltan columnas en el payload: {missing}. Esperadas: {feats_en}")
  Xdf = df[feats_en].astype(float)
  imputer = pipe.get("imputer") if isinstance(pipe, dict) else (pipe.get("imputer") if hasattr(pipe, "get") else None)
  scaler = pipe.get("scaler") if isinstance(pipe, dict) else (pipe.get("scaler") if hasattr(pipe, "get") else None)
  clf = pipe.get("clf") if isinstance(pipe, dict) else (pipe.get("clf") if hasattr(pipe, "get") else None)
  if imputer is None:
    imputer = IdentityImputer()
  if scaler is None:
    scaler = StandardScaler()
  if clf is None:
    raise HTTPException(status_code=500, detail="Modelo cargado inválido")
  try:
    X_imputed = imputer.transform(Xdf.values)
    Xs = scaler.transform(X_imputed)
    scores = clf.score_samples(Xs)
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
  contamination = float(meta.get("contamination", 0.18)) if meta else 0.18
  stored_thresh = meta.get("threshold", None) if meta else None
  if stored_thresh is not None:
    used_thresh = float(stored_thresh)
    used_thresh_source = "meta"
  else:
    used_thresh = float(np.quantile(scores, contamination)) if len(scores) else None
    used_thresh_source = "sample"
  smin = float(scores.min()) if len(scores) else 0.0
  smax = float(scores.max()) if len(scores) else 0.0
  def risk01_from_score_pct(s):
    try:
      s = float(s)
      if len(scores) == 0:
        return 0.0
      if abs(smax - smin) < 1e-12:
        return 0.0
      pct = float((scores <= s).sum()) / len(scores)
      r = 1.0 - pct
      return float(max(0.0, min(1.0, r)))
    except:
      return 0.0
  alerts = [bool(s <= used_thresh) if used_thresh is not None else False for s in scores]
  out = []
  for i, r in enumerate(body.rows):
    out.append({
      "student_id": int(r.student_id),
      "course_id":  int(r.course_id),
      "score": float(scores[i]),
      "risk_score01": float(risk01_from_score_pct(scores[i])),
      "alert": bool(alerts[i])
    })
  return {
    "ok": True,
    "n": len(out),
    "contamination": contamination,
    "threshold": used_thresh,
    "threshold_source": used_thresh_source,
    "version": meta.get("version") if meta else None,
    "items": out
  }
@app.post("/tune_threshold")
def tune_threshold(body: PredictIn, grid_size: int = Query(60)):
  _try_load()
  if pipe is None:
    raise HTTPException(status_code=400, detail="Modelo no entrenado")
  df = pd.DataFrame([r.dict() for r in body.rows])
  df = _harmonize_columns(df)
  feats = _resolve_meta_feats_to_en()
  Xdf = df[feats].astype(float)
  imputer = pipe.get("imputer") if isinstance(pipe, dict) else IdentityImputer()
  scaler = pipe.get("scaler") if isinstance(pipe, dict) else StandardScaler()
  clf = pipe.get("clf") if isinstance(pipe, dict) else None
  if clf is None:
    raise HTTPException(status_code=500, detail="Modelo cargado inválido")
  X_imputed = imputer.transform(Xdf.values)
  Xs = scaler.transform(X_imputed)
  scores = clf.score_samples(Xs)
  smin = float(scores.min()) if len(scores) else 0.0
  smax = float(scores.max()) if len(scores) else 0.0
  N = max(1, int(grid_size))
  ths = [smin + (i / N) * (smax - smin) for i in range(N + 1)]
  metrics = []
  for th in ths:
    marked = int((scores <= th).sum())
    metrics.append({"th": float(th), "marked": marked})
  best = min(metrics, key=lambda m: abs(m["marked"] - (len(scores) * 0.1))) if metrics else None
  sample = metrics if len(metrics) <= 40 else [metrics[i] for i in range(0, len(metrics), max(1, len(metrics)//40))]
  return {
    "ok": True,
    "version": meta.get("version") if meta else None,
    "metrics": metrics,
    "best": best,
    "metrics_sample": sample
  }
@app.post("/train")
def train(body: TrainIn):
  global pipe, meta
  df = pd.DataFrame([r.dict() for r in body.rows])
  df = _harmonize_columns(df)
  Xdf = df[FEATS_EN].astype(float)
  imputer = SimpleImputer(strategy="median")
  scaler = StandardScaler()
  clf = IsolationForest(n_estimators=300, contamination=float(body.contamination), random_state=42, n_jobs=-1)
  X_imputed = imputer.fit_transform(Xdf.values)
  Xs = scaler.fit_transform(X_imputed)
  clf.fit(Xs)
  pipe = {"imputer": imputer, "scaler": scaler, "clf": clf}
  scores = clf.score_samples(Xs)
  q = float(np.quantile(scores, float(body.contamination))) if len(scores) else None
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
@app.post("/tune_contamination")
def tune_contamination(body: TrainIn, grid: Optional[List[float]] = Query(None)):
  df = pd.DataFrame([r.dict() for r in body.rows])
  df = _harmonize_columns(df)
  if grid is None:
    grid_vals = [0.02,0.04,0.06,0.08,0.10,0.12,0.15,0.18,0.20]
  else:
    grid_vals = sorted([float(x) for x in grid])
  X = df[FEATS_EN].astype(float).values
  results = []
  for c in grid_vals:
    clf = IsolationForest(n_estimators=300, contamination=float(c), random_state=42, n_jobs=-1)
    scaler = StandardScaler()
    imputer = SimpleImputer(strategy="median")
    Xs = scaler.fit_transform(imputer.fit_transform(X))
    clf.fit(Xs)
    scores = clf.score_samples(Xs)
    th = float(np.quantile(scores, float(c))) if len(scores) else None
    results.append({"contamination": c, "threshold": th, "min": float(scores.min()) if len(scores) else None, "max": float(scores.max()) if len(scores) else None})
  return {"ok": True, "candidates": results}
