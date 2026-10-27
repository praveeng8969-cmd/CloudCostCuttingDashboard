export interface AwsConnection {
  id: string
  customer_id: string
  provider: 'AWS_S3'
  role_arn: string
  account_id: string
  display_name: string
  external_id: string
  status: 'pending' | 'connected'
  selected_buckets: string[]
  last_sync: string | null
  sync_status: 'never_synced' | 'syncing' | 'completed' | 'partial'
  object_count: number
  completeness: 'not_started' | 'complete' | 'partial'
}

export interface AwsBucket {
  name: string
  created_at: string
}

export interface AwsMetadataRecord {
  id: string
  file_name: string
  size_bytes: number
  last_modified: string
  last_accessed: null
  storage_class: string
  bucket: string
  region: string
  collection_timestamp: string
}

export interface AwsSyncResult {
  connection: AwsConnection
  dataset_id: string
  customer_id: string
  connection_id: string
  bucket_scope: string[]
  sync_timestamp: string
  object_count: number
  completeness: 'complete' | 'partial'
  failures: { bucket: string; error: string }[]
  records: AwsMetadataRecord[]
}
