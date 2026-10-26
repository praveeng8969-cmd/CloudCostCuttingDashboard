import json
import sys
from pathlib import Path

import pandas as pd

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ML_ROOT))

from generate_dataset import generate_dataset
from predict import predict_files
from train import METRICS_PATH, MODEL_PATH, train_model


def test_generation_training_and_prediction(tmp_path):
    data_path = tmp_path / "synthetic.csv"
    frame = generate_dataset(data_path, row_count=500)
    assert len(frame) == 500
    assert set(frame["label"]) == {"KEEP", "REVIEW", "ARCHIVE_CANDIDATE"}

    model_path = tmp_path / "model.joblib"
    metrics_path = tmp_path / "metrics.json"
    train_model(data_path, model_path, metrics_path)
    assert model_path.exists()
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    assert metrics["model"]["accuracy"] >= metrics["baseline"]["accuracy"]

    prediction = predict_files(
        [{"file_id": "unknown-1", "size_gb": 4.2, "days_since_last_accessed": None,
          "storage_class": "NEW_TIER", "file_type": "custom"}]
    )[0]
    assert prediction["predicted_class"] in {"KEEP", "REVIEW", "ARCHIVE_CANDIDATE"}
    assert 0 <= prediction["confidence"] <= 1
