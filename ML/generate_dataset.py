from pathlib import Path

import numpy as np
import pandas as pd

SEED = 42
ROW_COUNT = 2_500
DATA_PATH = Path(__file__).resolve().parent / "data" / "synthetic_storage.csv"


def assign_label(size_gb: float, days: float | None, storage_class: str, file_type: str) -> str:
    if days is None or storage_class == "UNKNOWN" or file_type == "unknown":
        return "REVIEW"
    if storage_class in {"GLACIER", "DEEP_ARCHIVE"}:
        return "KEEP" if days >= 180 else "REVIEW"
    if days >= 365 and (size_gb >= 1 or file_type in {"backup", "logs", "archive"}):
        return "ARCHIVE_CANDIDATE"
    if days >= 180 and (size_gb >= 5 or file_type in {"backup", "logs", "archive"}):
        return "ARCHIVE_CANDIDATE"
    if days >= 120 or size_gb >= 50:
        return "REVIEW"
    return "KEEP"


def generate_dataset(output_path: Path = DATA_PATH, row_count: int = ROW_COUNT) -> pd.DataFrame:
    rng = np.random.default_rng(SEED)
    file_types = rng.choice(
        ["document", "image", "video", "backup", "logs", "archive", "database", "unknown"],
        row_count,
        p=[0.18, 0.16, 0.12, 0.17, 0.14, 0.10, 0.09, 0.04],
    )
    storage_classes = rng.choice(
        ["STANDARD", "STANDARD_IA", "ONEZONE_IA", "GLACIER", "DEEP_ARCHIVE", "UNKNOWN"],
        row_count,
        p=[0.43, 0.20, 0.10, 0.12, 0.10, 0.05],
    )
    sizes = np.round(np.clip(rng.lognormal(mean=1.1, sigma=1.55, size=row_count), 0.001, 500), 3)
    days = rng.integers(0, 1_461, size=row_count).astype(float)
    missing_days = rng.random(row_count) < 0.06
    days[missing_days] = np.nan

    labels = [
        assign_label(float(size), None if np.isnan(day) else float(day), str(storage), str(file_type))
        for size, day, storage, file_type in zip(sizes, days, storage_classes, file_types)
    ]
    frame = pd.DataFrame(
        {
            "size_gb": sizes,
            "days_since_last_accessed": days,
            "storage_class": storage_classes,
            "file_type": file_types,
            "label": labels,
        }
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(output_path, index=False)
    return frame


if __name__ == "__main__":
    dataset = generate_dataset()
    print(f"Generated {len(dataset)} synthetic records at {DATA_PATH}")
    print(dataset["label"].value_counts().to_string())
