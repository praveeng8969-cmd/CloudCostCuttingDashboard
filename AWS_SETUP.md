# CloudCut Amazon S3 connection

CloudCut connects through AWS STS `AssumeRole`. Customers never enter permanent access keys, and CloudCut never calls `GetObject`, `PutObject`, or `DeleteObject`.

## CloudCut principal

The backend needs its own AWS principal. Locally, boto3 uses the standard credential chain (`AWS_PROFILE`, environment credentials, or workload roles). Grant that principal only `sts:AssumeRole` for approved customer roles.

```env
NEXT_PUBLIC_CLOUDCUT_AWS_PRINCIPAL_ARN=arn:aws:iam::111122223333:role/CloudCutConnector
ML_SERVICE_URL=https://your-fastapi-service.example.com
```

The public principal ARN is not a secret. Never expose AWS credentials in `NEXT_PUBLIC_*` variables.

## Customer trust policy

Enter the customer role ARN in CloudCut first. CloudCut generates a unique external ID. Apply this trust policy to the customer role:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "AWS": "arn:aws:iam::111122223333:role/CloudCutConnector" },
    "Action": "sts:AssumeRole",
    "Condition": { "StringEquals": { "sts:ExternalId": "PASTE_THE_CLOUDCUT_EXTERNAL_ID" } }
  }]
}
```

## Least-privilege S3 policy

Replace both bucket names. `ListAllMyBuckets` supports the picker; omit it when customers enter authorized names manually.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "OptionalBucketPicker", "Effect": "Allow", "Action": "s3:ListAllMyBuckets", "Resource": "*" },
    {
      "Sid": "CloudCutSelectedBucketMetadata",
      "Effect": "Allow",
      "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::production-assets", "arn:aws:s3:::audit-logs"]
    }
  ]
}
```

No object-level resource (`arn:aws:s3:::bucket/*`) is required because CloudCut does not read contents.

## Connect and synchronize

1. Open **Cloud Connections** and select **Connect AWS**.
2. Enter the role ARN and generate the setup.
3. Apply the trust and read-only policies in AWS.
4. Select **Verify Role Connection**.
5. Select authorized buckets, then choose **Save & Sync**.
6. A complete sync activates the dataset and triggers analysis automatically. A partial sync is not activated.

## Security and data limits

- STS credentials expire after one hour and exist only in backend process memory.
- Connection ownership is checked on every backend operation.
- S3 `LastModified` is stored separately and never treated as last access time.
- Access age remains unavailable, so inactivity-based archive scenarios are suppressed.
- Prices are configured storage-only estimates, not AWS bills. Retrieval, transition, minimum-duration, tax, and request charges are excluded.
- Disconnect removes the CloudCut record. Also revoke the AWS role for immediate defense in depth.

## Production deployment

Run FastAPI on a persistent Python host and set `ML_SERVICE_URL` for Next.js. The backend needs boto3 credentials for the dedicated principal and durable storage. The bundled JSON metadata store is local-development only; production must use an encrypted database and authenticated server-side tenant identity.

Scheduled sync and S3 Inventory ingestion are not enabled. They require a durable queue/worker and distributed overlap locking. The UI marks scheduled sync unavailable rather than claiming it is active.
