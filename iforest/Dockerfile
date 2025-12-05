FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    fastapi uvicorn[standard] \
    scikit-learn pandas numpy joblib pydantic

WORKDIR /app
COPY app.py train_iforest.py ./

CMD ["uvicorn","app:app","--host","0.0.0.0","--port","8021","--reload"]
