import json
import re
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError, EndpointConnectionError
from fastapi import HTTPException

ROOT = Path(__file__).resolve().parent
STORE_PATH = ROOT / "data" / "aws_connections.json"
ROLE_ARN_PATTERN = re.compile(r"^arn:(aws|aws-us-gov|aws-cn):iam::(\d{12}):role/[A-Za-z0-9+=,.@_/-]{1,512}$")
STORE_LOCK = threading.Lock()
ACTIVE_SYNCS: set[str] = set()
AWS_RETRY_CONFIG = Config(retries={"max_attempts": 6, "mode": "standard"})


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _read_store() -> list[dict]:
    with STORE_LOCK:
        if not STORE_PATH.exists():
            return []
        try:
            value = json.loads(STORE_PATH.read_text(encoding="utf-8"))
            return value if isinstance(value, list) else []
        except (OSError, json.JSONDecodeError):
            return []


def _write_store(records: list[dict]) -> None:
    with STORE_LOCK:
        STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
        temporary = STORE_PATH.with_suffix(".tmp")
        temporary.write_text(json.dumps(records, indent=2), encoding="utf-8")
        temporary.replace(STORE_PATH)


def public_connection(record: dict) -> dict:
    return {key: value for key, value in record.items() if key != "sync_lock"}


def create_connection(customer_id: str, role_arn: str, display_name: str) -> dict:
    match = ROLE_ARN_PATTERN.fullmatch(role_arn)
    if not match:
        raise HTTPException(status_code=422, detail="Enter a valid AWS IAM role ARN.")
    records = _read_store()
    now = utc_now()
    record = {
        "id": f"aws_{uuid.uuid4().hex}",
        "customer_id": customer_id,
        "provider": "AWS_S3",
        "role_arn": role_arn,
        "account_id": match.group(2),
        "display_name": display_name.strip() or f"AWS account {match.group(2)}",
        "external_id": str(uuid.uuid4()),
        "status": "pending",
        "selected_buckets": [],
        "last_sync": None,
        "sync_status": "never_synced",
        "object_count": 0,
        "completeness": "not_started",
        "created_at": now,
        "updated_at": now,
    }
    records.append(record)
    _write_store(records)
    return public_connection(record)


def list_connections(customer_id: str) -> list[dict]:
    return [public_connection(item) for item in _read_store() if item.get("customer_id") == customer_id]


def get_owned_connection(connection_id: str, customer_id: str) -> dict:
    record = next((item for item in _read_store() if item.get("id") == connection_id), None)
    if not record or record.get("customer_id") != customer_id:
        raise HTTPException(status_code=404, detail="AWS connection not found.")
    return record


def _save_connection(updated: dict) -> dict:
    records = _read_store()
    updated["updated_at"] = utc_now()
    replaced = [updated if item.get("id") == updated.get("id") else item for item in records]
    _write_store(replaced)
    return public_connection(updated)


def _assumed_session(record: dict):
    try:
        sts = boto3.client("sts", config=AWS_RETRY_CONFIG)
        response = sts.assume_role(
            RoleArn=record["role_arn"],
            RoleSessionName=f"CloudCut-{record['id'][-12:]}",
            ExternalId=record["external_id"],
            DurationSeconds=3600,
        )
        credentials = response["Credentials"]
        return boto3.Session(
            aws_access_key_id=credentials["AccessKeyId"],
            aws_secret_access_key=credentials["SecretAccessKey"],
            aws_session_token=credentials["SessionToken"],
        )
    except (ClientError, BotoCoreError, EndpointConnectionError) as error:
        code = getattr(error, "response", {}).get("Error", {}).get("Code", "AWSConnectionError")
        raise HTTPException(status_code=502, detail=f"AWS connection failed ({code}). Check the role trust and CloudCut credentials.") from error


def test_connection(connection_id: str, customer_id: str) -> dict:
    record = get_owned_connection(connection_id, customer_id)
    session = _assumed_session(record)
    try:
        identity = session.client("sts", config=AWS_RETRY_CONFIG).get_caller_identity()
    except (ClientError, BotoCoreError, EndpointConnectionError) as error:
        raise HTTPException(status_code=502, detail="The assumed AWS role could not be verified.") from error
    record["status"] = "connected"
    record["account_id"] = identity.get("Account", record["account_id"])
    return _save_connection(record)


def list_buckets(connection_id: str, customer_id: str) -> list[dict]:
    record = get_owned_connection(connection_id, customer_id)
    session = _assumed_session(record)
    try:
        client = session.client("s3", config=AWS_RETRY_CONFIG)
        response = client.list_buckets()
        return [{"name": bucket["Name"], "created_at": bucket.get("CreationDate")} for bucket in response.get("Buckets", [])]
    except (ClientError, BotoCoreError, EndpointConnectionError) as error:
        code = getattr(error, "response", {}).get("Error", {}).get("Code", "AWSConnectionError")
        raise HTTPException(status_code=502, detail=f"Unable to list authorized buckets ({code}).") from error


def _bucket_region(client, bucket: str) -> str:
    location = client.get_bucket_location(Bucket=bucket).get("LocationConstraint")
    return "us-east-1" if location in (None, "") else "eu-west-1" if location == "EU" else location


def sync_buckets(connection_id: str, customer_id: str, buckets: list[str]) -> dict:
    record = get_owned_connection(connection_id, customer_id)
    clean_buckets = list(dict.fromkeys(bucket.strip() for bucket in buckets if bucket.strip()))
    if not clean_buckets:
        raise HTTPException(status_code=422, detail="Select at least one authorized bucket.")
    if connection_id in ACTIVE_SYNCS:
        raise HTTPException(status_code=409, detail="A synchronization is already running for this connection.")

    ACTIVE_SYNCS.add(connection_id)
    record["sync_status"] = "syncing"
    _save_connection(record)
    try:
        session = _assumed_session(record)
        base_client = session.client("s3", config=AWS_RETRY_CONFIG)
        collected: list[dict] = []
        failures: list[dict] = []
        collection_time = utc_now()
        for bucket in clean_buckets:
            try:
                region = _bucket_region(base_client, bucket)
                client = session.client("s3", region_name=region, config=AWS_RETRY_CONFIG)
                paginator = client.get_paginator("list_objects_v2")
                for page in paginator.paginate(Bucket=bucket, PaginationConfig={"PageSize": 1000}):
                    for item in page.get("Contents", []):
                        collected.append({
                            "id": f"aws:{connection_id}:{bucket}:{item['Key']}",
                            "file_name": item["Key"],
                            "size_bytes": item.get("Size", 0),
                            "last_modified": item["LastModified"].isoformat(),
                            "last_accessed": None,
                            "storage_class": item.get("StorageClass", "STANDARD"),
                            "bucket": bucket,
                            "region": region,
                            "collection_timestamp": collection_time,
                        })
            except (ClientError, BotoCoreError, EndpointConnectionError) as error:
                failures.append({
                    "bucket": bucket,
                    "error": getattr(error, "response", {}).get("Error", {}).get("Code", error.__class__.__name__),
                })

        record["selected_buckets"] = clean_buckets
        record["last_sync"] = collection_time
        record["object_count"] = len(collected)
        record["status"] = "connected"
        record["sync_status"] = "partial" if failures else "completed"
        record["completeness"] = "partial" if failures else "complete"
        _save_connection(record)
        return {
            "connection": public_connection(record),
            "dataset_id": f"aws-dataset-{uuid.uuid4().hex}",
            "customer_id": customer_id,
            "connection_id": connection_id,
            "bucket_scope": clean_buckets,
            "sync_timestamp": collection_time,
            "object_count": len(collected),
            "completeness": record["completeness"],
            "failures": failures,
            "records": collected,
        }
    finally:
        ACTIVE_SYNCS.discard(connection_id)


def delete_connection(connection_id: str, customer_id: str) -> None:
    get_owned_connection(connection_id, customer_id)
    records = [item for item in _read_store() if item.get("id") != connection_id]
    _write_store(records)
