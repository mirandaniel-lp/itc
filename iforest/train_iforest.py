import argparse, json, joblib, pandas as pd, numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

FEATS = ["gender_f","age","days_since_enrollment","marks_total","attendance_pct",
         "absences","tardies","absences_30d","tardies_30d","avg_hours",
         "items_count","grade_avg","grade_p25","fail_fraction","days_since_last_grade"]

def main():
  ap = argparse.ArgumentParser()
  ap.add_argument("--csv", required=True)
  ap.add_argument("--contamination", type=float, default=0.18)
  ap.add_argument("--model_out", default="/models/iforest_model.joblib")
  ap.add_argument("--meta_out", default="/models/iforest_meta.json")
  args = ap.parse_args()

  df = pd.read_csv(args.csv)
  X = df[FEATS].fillna(0.0).astype(float).values

  pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", IsolationForest(n_estimators=300, contamination=args.contamination, random_state=42, n_jobs=-1))
  ])
  pipe.fit(X)
  scores = pipe["clf"].score_samples(pipe["scaler"].transform(X))
  q = float(np.quantile(scores, args.contamination))
  ver = "IF-cli"

  joblib.dump(pipe, args.model_out)
  with open(args.meta_out, "w") as f:
    json.dump({"version": ver, "features": FEATS, "contamination": float(args.contamination), "threshold": q}, f, indent=2)

  print(json.dumps({"n_rows": int(len(df)), "threshold": q, "version": ver}, indent=2))

if __name__ == "__main__":
  main()
