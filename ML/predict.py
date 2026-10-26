from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

MODEL_PATH = Path(__file__).resolve().parent / "models" / "storage_classifier.joblib"


@lru_cache(maxsize=1)
def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Trained model is unavailable. Run python train.py first.")
    return joblib.load(MODEL_PATH)


def explain_prediction(record: dict[str, Any], predicted_class: str) -> str:
    days = record.get("days_since_last_accessed")
    storage_class = str(record.get("storage_class") or "UNKNOWN").upper()
    if days is None:
        return "Last-access metadata is missing, so manual review is recommended."
    if storage_class in {"GLACIER", "DEEP_ARCHIVE"}:
        return "The object is already in an archival storage class; verify retrieval needs before changes."
    if predicted_class == "ARCHIVE_CANDIDATE":
        return f"Infrequent access ({int(days)} days) and object characteristics suggest reviewing a cheaper tier."
    if predicted_class == "REVIEW":
        return "The metadata is uncertain or near an optimization threshold and needs manual review."
    return "Recent access and current object characteristics do not indicate an immediate optimization review."


def predict_files(files: list[dict[str, Any]]) -> list[dict[str, Any]]:
    model = load_model()
    normalized = []
    for item in files:
        normalized.append(
            {
                "size_gb": item.get("size_gb"),
                "days_since_last_accessed": item.get("days_since_last_accessed"),
                "storage_class": str(item.get("storage_class") or "UNKNOWN").upper(),
                "file_type": str(item.get("file_type") or "unknown").lower(),
            }
        )
    frame = pd.DataFrame(normalized)
    predicted = model.predict(frame)
    probabilities = model.predict_proba(frame)
    classes = list(model.named_steps["classifier"].classes_)
    return [
        {
            "file_id": files[index]["file_id"],
            "predicted_class": str(label),
            "confidence": round(float(max(probabilities[index])), 4),
            "probabilities": {
                class_name: round(float(probability), 4)
                for class_name, probability in zip(classes, probabilities[index])
            },
            "explanation": explain_prediction(normalized[index], str(label)),
        }
        for index, label in enumerate(predicted)
    ]
