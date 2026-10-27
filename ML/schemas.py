from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class FileMetadata(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    file_id: str = Field(min_length=1, max_length=200)
    size_gb: float = Field(ge=0, le=10_000_000)
    days_since_last_accessed: int | None = Field(default=None, ge=0, le=100_000)
    storage_class: str | None = Field(default="UNKNOWN", max_length=100)
    file_type: str | None = Field(default="unknown", max_length=100)


class PredictionRequest(BaseModel):
    files: list[FileMetadata] = Field(min_length=1, max_length=500)


class PredictionResult(BaseModel):
    file_id: str
    predicted_class: Literal["KEEP", "REVIEW", "ARCHIVE_CANDIDATE"]
    confidence: float
    probabilities: dict[str, float]
    explanation: str


class PredictionResponse(BaseModel):
    model_version: str
    predictions: list[PredictionResult]


class AwsConnectionCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    customer_id: str = Field(min_length=1, max_length=200)
    role_arn: str = Field(min_length=20, max_length=600)
    display_name: str = Field(default="", max_length=100)


class AwsOwnedRequest(BaseModel):
    customer_id: str = Field(min_length=1, max_length=200)


class AwsSyncRequest(AwsOwnedRequest):
    buckets: list[str] = Field(min_length=1, max_length=100)
