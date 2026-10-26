import json
from pathlib import Path

from fastapi import FastAPI, HTTPException

from predict import MODEL_PATH, load_model, predict_files
from schemas import PredictionRequest, PredictionResponse

ROOT = Path(__file__).resolve().parent
METRICS_PATH = ROOT / "models" / "metrics.json"

app = FastAPI(title="CloudCut ML Service", version="1.0.0")


def model_ready() -> bool:
    try:
        load_model()
        return True
    except (FileNotFoundError, OSError, ValueError):
        return False


@app.get("/health")
def health():
    ready = model_ready()
    return {"status": "ready" if ready else "unavailable", "model_loaded": ready}


@app.get("/model-info")
def model_info():
    if not METRICS_PATH.exists():
        raise HTTPException(status_code=503, detail="Model evaluation data is unavailable.")
    return {**json.loads(METRICS_PATH.read_text(encoding="utf-8")), "model_loaded": model_ready()}


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if not MODEL_PATH.exists():
        raise HTTPException(status_code=503, detail="Model is unavailable. Train the model before prediction.")
    try:
        return {"predictions": predict_files([item.model_dump() for item in request.files])}
    except (FileNotFoundError, OSError, ValueError) as error:
        raise HTTPException(status_code=503, detail=f"Prediction service unavailable: {error}") from error
