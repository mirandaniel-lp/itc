import numpy as np, pandas as pd
rng = np.random.default_rng(42)
n = 600

df = pd.DataFrame({
  "student_id": rng.integers(1,2000,size=n),
  "course_id": rng.integers(1,50,size=n),
  "gender_f": rng.choice([0,1], size=n),
  "edad": rng.normal(23, 4, n).clip(16,60),
  "dias_desde_matricula": rng.integers(10,120,n),
  "marcas_tot": rng.integers(8,40,n),
})

df["presentes"] = (df["marcas_tot"] * rng.uniform(0.6,0.98,n)).astype(int)
df["ausentes"]  = df["marcas_tot"] - df["presentes"]
df["tardes"]    = rng.integers(0,5,n)
df["ausentes_30d"] = (df["ausentes"] * rng.uniform(0.2,0.6,n)).astype(int)
df["tardes_30d"]   = (df["tardes"]  * rng.uniform(0.5,1.0,n)).astype(int)
df["horas_prom"]   = rng.normal(1.7, 0.4, n).clip(0.5,4)
df["n_items"]      = rng.integers(3,12,n)
df["nota_prom"]    = rng.normal(75, 10, n).clip(0,100)
df["nota_p25"]     = (df["nota_prom"] - rng.normal(8,4,n)).clip(0,100)
df["frac_reprob"]  = rng.uniform(0,0.4,n)
df["dias_desde_ultima_nota"] = rng.integers(2,45,n)

mask = rng.random(n) < 0.18
asistencia_pct_r = rng.uniform(0.3,0.6,mask.sum())
ausentes_30d_r   = rng.integers(3,10,mask.sum())
nota_prom_r      = rng.normal(48,8,mask.sum()).clip(0,100)
frac_reprob_r    = rng.uniform(0.25,0.7,mask.sum())

vals = np.column_stack([asistencia_pct_r, ausentes_30d_r, nota_prom_r, frac_reprob_r])
df.loc[mask, ["asistencia_pct","ausentes_30d","nota_prom","frac_reprob"]] = vals
if "asistencia_pct" not in df.columns:
  df["asistencia_pct"] = df["presentes"] / df["marcas_tot"].where(df["marcas_tot"]>0, 1)
else:
  tmp = df["presentes"] / df["marcas_tot"].where(df["marcas_tot"]>0, 1)
  df["asistencia_pct"] = df["asistencia_pct"].fillna(tmp)

df[["presentes","ausentes","tardes","ausentes_30d","tardes_30d","n_items"]] = \
  df[["presentes","ausentes","tardes","ausentes_30d","tardes_30d","n_items"]].astype(int)

df.to_csv("/app/features_demo.csv", index=False)
print("features_demo.csv listo")
