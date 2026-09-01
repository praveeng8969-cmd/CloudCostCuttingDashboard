// Realistic built-in sample CSV dataset with diverse dates, sizes, buckets, and duplicate candidates

export const SAMPLE_CSV_HEADER = "file_name,size_gb,last_accessed,storage_class,file_type,bucket\n"

export function generateSampleCsvString(): string {
  const rows = [
    // Duplicate Set 1: Production DB Snapshots
    "prod_db_snapshot_20250815.sql.tar.gz,140,2025-08-15,STANDARD,Backup,prod-db-backups",
    "prod_db_snapshot_20250815_copy.sql.tar.gz,140,2025-08-15,STANDARD,Backup,prod-db-backups",
    "prod_db_snapshot_20250815_replica.sql.tar.gz,140,2025-08-16,STANDARD,Backup,dev-test-restore",

    // Duplicate Set 2: Machine Learning Weights
    "resnet50_v2_weights_final.bin,42.5,2025-06-20,STANDARD,Other,ml-model-registry",
    "resnet50_v2_weights_final_v2.bin,42.5,2025-06-21,STANDARD,Other,ml-model-staging",
    "resnet50_v2_weights_final_backup.bin,42.5,2025-06-22,STANDARD_IA,Other,ml-experiments-archive",

    // Duplicate Set 3: Product Keynote Video
    "product_launch_keynote_4k_master.mp4,68,2025-03-10,STANDARD,Video,marketing-assets-prod",
    "product_launch_keynote_4k_master_copy.mp4,68,2025-03-10,STANDARD,Video,marketing-raw-footage",

    // Duplicate Set 4: Annual Audit Reports
    "financial_audit_fy2024_consolidated.pdf,3.2,2025-01-14,STANDARD,Document,finance-reports",
    "financial_audit_fy2024_consolidated_copy.pdf,3.2,2025-01-14,STANDARD,Document,legal-compliance-vault",

    // Highly Inactive Data (> 365 days)
    "legacy_customer_invoices_2023.zip,240,2024-05-12,STANDARD,Archive,historical-billing-2023",
    "oracle_db_full_export_20240201.dmp,310,2024-02-01,STANDARD,Backup,prod-db-backups",
    "kubernetes_cluster_logs_q1_2024.tar,85,2024-04-10,STANDARD,Logs,cluster-observability-logs",
    "old_user_uploads_batch_2023.tar.gz,190,2024-01-15,STANDARD,Archive,cold-storage-vault",
    "security_camera_archive_202312.mp4,220,2023-12-30,STANDARD_IA,Video,facility-surveillance",
    "gitlab_backup_16.4_20240315.tar,150,2024-03-15,STANDARD,Backup,devops-backup-vault",
    "salesforce_datalake_export_2023.csv,95,2024-06-01,STANDARD_IA,Document,enterprise-bi-warehouse",

    // Inactive Standard Data (181–365 days)
    "analytics_parquet_warehouse_2025q1.parquet,380,2025-09-12,STANDARD,Document,data-lake-analytics",
    "quarterly_compliance_filing_q2_2025.pdf,12,2025-10-05,STANDARD,Document,legal-compliance-vault",
    "redis_dump_snapshot_20250920.rdb,45,2025-09-20,STANDARD,Backup,cache-state-backups",
    "ios_build_release_ipa_v4.2.0.zip,18,2025-10-18,STANDARD,Other,mobile-build-artifacts",
    "android_bundle_production_v4.2.0.aab,14,2025-10-18,STANDARD,Other,mobile-build-artifacts",
    "elasticsearch_index_snapshots_sep2025.tar,280,2025-09-30,STANDARD,Logs,cluster-observability-logs",

    // Stale Logs (> 90 days)
    "nginx_access_logs_2025_05.log,65,2025-05-31,STANDARD,Logs,cluster-observability-logs",
    "api_gateway_error_traces_2025_06.log,48,2025-06-30,STANDARD,Logs,cluster-observability-logs",
    "auth0_audit_events_2025_q2.json,32,2025-06-30,STANDARD,Logs,security-audit-logs",
    "lambda_cloudwatch_stream_dump_202507.log,54,2025-07-28,STANDARD,Logs,cluster-observability-logs",

    // Large Uncompressed Files (> 10 GB)
    "raw_uncompressed_telemetry_stream.csv,115,2026-04-10,STANDARD,Logs,data-lake-analytics",
    "vmware_esxi_golden_image_2026.iso,85,2026-02-15,STANDARD,Other,infrastructure-iso-repo",
    "mysql_ecommerce_master_dump_live.sql,165,2026-06-12,STANDARD,Backup,prod-db-backups",

    // Active Standard Storage (0–90 days)
    "daily_incremental_backup_20260830.tar.gz,28,2026-08-30,STANDARD,Backup,prod-db-backups",
    "react_production_bundle_assets_v5.1.js,4.5,2026-08-31,STANDARD,Document,static-web-cdn",
    "customer_support_tickets_export_aug2026.xlsx,1.8,2026-08-28,STANDARD,Document,finance-reports",
    "marketing_promo_social_reels_aug.mp4,35,2026-08-25,STANDARD,Video,marketing-assets-prod",
    "high_res_branding_vector_kit.svg,0.8,2026-08-29,STANDARD,Image,marketing-assets-prod",
    "executive_presentation_board_deck_q3.pptx,2.4,2026-08-31,STANDARD,Document,finance-reports",
    "microservices_docker_layers_cache.tar,55,2026-08-27,STANDARD,Other,devops-backup-vault",
    "user_avatar_thumbnails_active_pack.tar,15,2026-08-26,STANDARD,Image,static-web-cdn",

    // Already Optimized Tiers (Glacier / Deep Archive / Standard-IA)
    "historical_tax_records_2020_2022.tar.gpg,450,2024-01-10,DEEP_ARCHIVE,Archive,compliance-deep-vault",
    "sap_erp_cold_backup_2023.tar,620,2024-03-01,GLACIER,Backup,enterprise-glacier-vault",
    "soc2_audit_evidence_trail_2024.zip,180,2024-11-20,STANDARD_IA,Document,legal-compliance-vault",
    "training_dataset_audio_raw_wavs.tar,340,2025-04-15,STANDARD_IA,Other,ml-experiments-archive"
  ]

  return SAMPLE_CSV_HEADER + rows.join('\n')
}
