import json
from pathlib import Path

from fastapi import FastAPI, HTTPException

from predict import MODEL_PATH, load_model, predict_files
from aws_connections import (
    create_connection, delete_connection, list_buckets, list_connections,
    sync_buckets, test_connection,
)
from schemas import AwsConnectionCreate, AwsOwnedRequest, AwsSyncRequest, PredictionRequest, PredictionResponse

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
        model_version = "unknown"
        if METRICS_PATH.exists():
            model_version = json.loads(METRICS_PATH.read_text(encoding="utf-8")).get("model_version", "unknown")
        return {
            "model_version": model_version,
            "predictions": predict_files([item.model_dump() for item in request.files]),
        }
    except (FileNotFoundError, OSError, ValueError) as error:
        raise HTTPException(status_code=503, detail=f"Prediction service unavailable: {error}") from error


@app.post("/aws/connections")
def aws_create_connection(request: AwsConnectionCreate):
    return create_connection(request.customer_id, request.role_arn, request.display_name)


@app.get("/aws/connections/{customer_id}")
def aws_list_connections(customer_id: str):
    return {"connections": list_connections(customer_id)}


@app.post("/aws/connections/{connection_id}/test")
def aws_test_connection(connection_id: str, request: AwsOwnedRequest):
    return test_connection(connection_id, request.customer_id)


@app.get("/aws/connections/{connection_id}/buckets")
def aws_list_buckets(connection_id: str, customer_id: str):
    return {"buckets": list_buckets(connection_id, customer_id)}


@app.post("/aws/connections/{connection_id}/sync")
def aws_sync(connection_id: str, request: AwsSyncRequest):
    return sync_buckets(connection_id, request.customer_id, request.buckets)


@app.delete("/aws/connections/{connection_id}", status_code=204)
def aws_disconnect(connection_id: str, customer_id: str):
    delete_connection(connection_id, customer_id)
