import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "synthetic_storage.csv"
MODEL_PATH = ROOT / "models" / "storage_classifier.joblib"
METRICS_PATH = ROOT / "models" / "metrics.json"
FEATURES = ["size_gb", "days_since_last_accessed", "storage_class", "file_type"]
LABELS = ["KEEP", "REVIEW", "ARCHIVE_CANDIDATE"]


def score_predictions(expected, predicted) -> dict:
    precision, recall, f1, _ = precision_recall_fscore_support(
        expected, predicted, labels=LABELS, average="weighted", zero_division=0
    )
    return {
        "accuracy": round(float(accuracy_score(expected, predicted)), 4),
        "precision_weighted": round(float(precision), 4),
        "recall_weighted": round(float(recall), 4),
        "f1_weighted": round(float(f1), 4),
        "confusion_matrix": confusion_matrix(expected, predicted, labels=LABELS).tolist(),
        "labels": LABELS,
    }


def train_model(
    data_path: Path = DATA_PATH,
    model_path: Path = MODEL_PATH,
    metrics_path: Path = METRICS_PATH,
) -> tuple[Pipeline, dict]:
    frame = pd.read_csv(data_path)
    missing_columns = set(FEATURES + ["label"]) - set(frame.columns)
    if missing_columns:
        raise ValueError(f"Dataset is missing columns: {sorted(missing_columns)}")
    if frame.empty or not set(frame["label"]).issubset(LABELS):
        raise ValueError("Dataset is empty or contains unsupported labels")

    train_features, test_features, train_labels, test_labels = train_test_split(
        frame[FEATURES], frame["label"], test_size=0.2, random_state=42, stratify=frame["label"]
    )
    preprocessing = ColumnTransformer(
        [
            ("numeric", SimpleImputer(strategy="median"), ["size_gb", "days_since_last_accessed"]),
            (
                "categorical",
                Pipeline(
                    [
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                ["storage_class", "file_type"],
            ),
        ]
    )
    model = Pipeline(
        [
            ("preprocessing", preprocessing),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=250, max_depth=14, min_samples_leaf=2, class_weight="balanced",
                    random_state=42, n_jobs=-1,
                ),
            ),
        ]
    )
    model.fit(train_features, train_labels)
    predictions = model.predict(test_features)

    baseline = DummyClassifier(strategy="most_frequent")
    baseline.fit(train_features, train_labels)
    baseline_predictions = baseline.predict(test_features)
    metrics = {
        "model_name": "CloudCut Storage Review Classifier",
        "model_version": "1.0.0",
        "algorithm": "Random Forest Classifier",
        "training_dataset_type": "Synthetic storage metadata",
        "training_records": len(train_features),
        "test_records": len(test_features),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model": score_predictions(test_labels, predictions),
        "baseline": score_predictions(test_labels, baseline_predictions),
    }
    model_path.parent.mkdir(parents=True, exist_ok=True)
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return model, metrics


if __name__ == "__main__":
    _, evaluation = train_model()
    print(json.dumps(evaluation, indent=2))
