import sys
from pathlib import Path

from fastapi.testclient import TestClient

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ML_ROOT))

from app import app

client = TestClient(app)


def test_health_and_model_info():
    assert client.get("/health").status_code == 200
    response = client.get("/model-info")
    assert response.status_code == 200
    assert response.json()["algorithm"] == "Random Forest Classifier"


def test_predict_and_validation():
    response = client.post(
        "/predict",
        json={"files": [{"file_id": "file-001", "size_gb": 8.5,
                          "days_since_last_accessed": 400, "storage_class": "STANDARD",
                          "file_type": "backup"}]},
    )
    assert response.status_code == 200
    assert response.json()["predictions"][0]["file_id"] == "file-001"
    assert client.post("/predict", json={"files": []}).status_code == 422
    assert client.post("/predict", json={"files": [{"file_id": "bad", "size_gb": -1}]}).status_code == 422
