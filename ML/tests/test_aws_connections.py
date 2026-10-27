import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi import HTTPException

ML_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ML_ROOT))

import aws_connections


class FakePaginator:
    def __init__(self, pages_by_bucket):
        self.pages_by_bucket = pages_by_bucket

    def paginate(self, Bucket, PaginationConfig):
        value = self.pages_by_bucket[Bucket]
        if isinstance(value, Exception):
            raise value
        return value


class FakeS3:
    def __init__(self, pages_by_bucket):
        self.pages_by_bucket = pages_by_bucket

    def get_bucket_location(self, Bucket):
        if Bucket == "denied-bucket":
            from botocore.exceptions import ClientError
            raise ClientError({"Error": {"Code": "AccessDenied", "Message": "denied"}}, "GetBucketLocation")
        return {"LocationConstraint": "ap-south-1"}

    def get_paginator(self, name):
        assert name == "list_objects_v2"
        return FakePaginator(self.pages_by_bucket)


class FakeSession:
    def __init__(self, pages_by_bucket):
        self.s3 = FakeS3(pages_by_bucket)

    def client(self, service, **kwargs):
        assert service == "s3"
        return self.s3


@pytest.fixture
def isolated_store(tmp_path, monkeypatch):
    monkeypatch.setattr(aws_connections, "STORE_PATH", tmp_path / "connections.json")
    aws_connections.ACTIVE_SYNCS.clear()


def test_role_arn_validation_and_tenant_isolation(isolated_store):
    with pytest.raises(HTTPException) as invalid:
        aws_connections.create_connection("tenant-a", "not-an-arn", "Bad")
    assert invalid.value.status_code == 422

    connection = aws_connections.create_connection(
        "tenant-a", "arn:aws:iam::123456789012:role/CloudCutReadOnly", "Production"
    )
    assert connection["external_id"]
    assert aws_connections.list_connections("tenant-b") == []
    with pytest.raises(HTTPException) as missing:
        aws_connections.get_owned_connection(connection["id"], "tenant-b")
    assert missing.value.status_code == 404


def test_sync_paginates_scope_and_preserves_unknown_access(isolated_store, monkeypatch):
    connection = aws_connections.create_connection(
        "tenant-a", "arn:aws:iam::123456789012:role/CloudCutReadOnly", "Production"
    )
    pages = {
        "bucket-a": [
            {"Contents": [{"Key": "one.csv", "Size": 10, "LastModified": datetime(2026, 1, 1, tzinfo=timezone.utc)}]},
            {"Contents": [{"Key": "two.zip", "Size": 20, "LastModified": datetime(2026, 1, 2, tzinfo=timezone.utc), "StorageClass": "STANDARD_IA"}]},
        ]
    }
    monkeypatch.setattr(aws_connections, "_assumed_session", lambda record: FakeSession(pages))

    result = aws_connections.sync_buckets(connection["id"], "tenant-a", ["bucket-a"])
    assert result["completeness"] == "complete"
    assert result["object_count"] == 2
    assert result["bucket_scope"] == ["bucket-a"]
    assert all(item["last_accessed"] is None for item in result["records"])
    assert {item["file_name"] for item in result["records"]} == {"one.csv", "two.zip"}


def test_partial_sync_is_not_complete(isolated_store, monkeypatch):
    connection = aws_connections.create_connection(
        "tenant-a", "arn:aws:iam::123456789012:role/CloudCutReadOnly", "Production"
    )
    pages = {"good-bucket": [{"Contents": []}], "denied-bucket": []}
    monkeypatch.setattr(aws_connections, "_assumed_session", lambda record: FakeSession(pages))

    result = aws_connections.sync_buckets(connection["id"], "tenant-a", ["good-bucket", "denied-bucket"])
    assert result["completeness"] == "partial"
    assert result["failures"] == [{"bucket": "denied-bucket", "error": "AccessDenied"}]


def test_disconnect_revokes_future_use(isolated_store):
    connection = aws_connections.create_connection(
        "tenant-a", "arn:aws:iam::123456789012:role/CloudCutReadOnly", "Production"
    )
    aws_connections.delete_connection(connection["id"], "tenant-a")
    with pytest.raises(HTTPException) as missing:
        aws_connections.get_owned_connection(connection["id"], "tenant-a")
    assert missing.value.status_code == 404
