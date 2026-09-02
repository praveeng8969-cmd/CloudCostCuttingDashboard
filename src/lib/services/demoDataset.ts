// Realistic built-in sample CSV datasets tailored for multi-customer SaaS demonstration

export const SAMPLE_CSV_HEADER = "file_name,size_gb,last_accessed,storage_class,file_type,bucket\n"

// Standard / NovaTech Balanced Dataset (~1.2 TB)
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

// ByteWorks Dataset — Heavy on Duplicate Files & Redundancy (~850 GB)
export function generateByteWorksDataset(): string {
  const rows = [
    // Duplicate Cluster 1: Monolithic DB Exports (3 redundant copies)
    "postgres_monolith_prod_full_jul26.dump,120,2026-07-20,STANDARD,Backup,bw-database-backups",
    "postgres_monolith_prod_full_jul26_copy.dump,120,2026-07-20,STANDARD,Backup,bw-database-backups",
    "postgres_monolith_prod_full_jul26_staging_test.dump,120,2026-07-21,STANDARD,Backup,bw-dev-staging-vault",

    // Duplicate Cluster 2: CI/CD Build Docker Artifacts
    "docker_image_backend_build_v3.4.1.tar,45,2026-08-10,STANDARD,Other,bw-ci-build-cache",
    "docker_image_backend_build_v3.4.1_copy.tar,45,2026-08-10,STANDARD,Other,bw-ci-build-cache",
    "docker_image_backend_build_v3.4.1_release_mirror.tar,45,2026-08-11,STANDARD,Other,bw-docker-registry",

    // Duplicate Cluster 3: Raw Product Video B-Roll
    "byteworks_enterprise_intro_raw_4k.mov,75,2026-05-15,STANDARD,Video,bw-marketing-assets",
    "byteworks_enterprise_intro_raw_4k_backup.mov,75,2026-05-15,STANDARD,Video,bw-marketing-assets",

    // Duplicate Cluster 4: Analytics Clickstream Exports
    "clickstream_events_2026_q2_raw.json.gz,35,2026-06-30,STANDARD,Logs,bw-analytics-lake",
    "clickstream_events_2026_q2_raw_copy.json.gz,35,2026-06-30,STANDARD,Logs,bw-backup-lake",

    // Regular active storage
    "active_app_assets_bundle.zip,12,2026-08-28,STANDARD,Document,bw-static-cdn",
    "daily_incremental_db_diff.sql,8.5,2026-08-30,STANDARD,Backup,bw-database-backups",
    "customer_contracts_pdf_vault.zip,22,2026-08-15,STANDARD,Document,bw-legal-vault",
    "ml_inference_logs_current.log,18,2026-08-25,STANDARD,Logs,bw-analytics-lake",
    "archived_audit_records_2024.tar.gz,150,2024-03-01,GLACIER,Archive,bw-cold-archive"
  ]
  return SAMPLE_CSV_HEADER + rows.join('\n')
}

// StartFlow Dataset — Heavy on Inactive & Old Archives in Standard Class (~2.4 TB)
export function generateStartFlowDataset(): string {
  const rows = [
    // Stale STANDARD files that should be Glacier / Deep Archive (>365 days)
    "startflow_core_legacy_db_2023.tar,420,2023-11-10,STANDARD,Backup,sf-legacy-backups",
    "user_activity_archive_2023_full.csv,380,2024-01-05,STANDARD,Archive,sf-datalake-archive",
    "historical_financial_audits_2022_2023.zip,260,2023-12-15,STANDARD,Document,sf-compliance-records",
    "cold_server_image_snapshots_centos7.vmdk,310,2024-02-18,STANDARD,Other,sf-server-images",
    "application_debug_logs_complete_2024_h1.log,290,2024-06-25,STANDARD,Logs,sf-telemetry-dumps",
    
    // Inactive files (180–365 days)
    "clickhouse_migration_snapshot_2025q3.sql,220,2025-09-14,STANDARD,Backup,sf-database-backups",
    "sales_demo_screen_recordings_pack.mp4,140,2025-10-20,STANDARD,Video,sf-marketing-media",
    "old_mobile_releases_archive.zip,75,2025-11-02,STANDARD,Other,sf-release-vault",

    // Normal active files
    "active_production_mongodb_live.tar.gz,110,2026-08-29,STANDARD,Backup,sf-live-production",
    "static_frontend_assets_v8.js,15,2026-08-31,STANDARD,Document,sf-cdn-assets",
    "compliance_monthly_pack_aug2026.pdf,6.5,2026-08-28,STANDARD,Document,sf-compliance-records",
    "glacier_enterprise_vault_2021.tar.gpg,480,2023-01-10,DEEP_ARCHIVE,Archive,sf-deep-vault"
  ]
  return SAMPLE_CSV_HEADER + rows.join('\n')
}

// PixelLabs Dataset — Heavy on Media & Uncompressed Videos (~3.1 TB)
export function generatePixelLabsDataset(): string {
  const rows = [
    // Huge video & raw media files
    "brand_commercial_superbowl_raw_prores.mov,480,2026-03-20,STANDARD,Video,px-raw-footage",
    "brand_commercial_superbowl_raw_prores_copy.mov,480,2026-03-20,STANDARD,Video,px-creative-staging",
    "fashion_show_multi_cam_4k_master.mp4,320,2026-04-12,STANDARD,Video,px-raw-footage",
    "podcast_season_4_multitrack_flac.tar,190,2026-05-18,STANDARD,Other,px-audio-vault",
    "cgi_rendering_blender_assets_pack.tar.gz,240,2026-06-05,STANDARD,Other,px-3d-renders",
    "uncompressed_telemetry_streaming_raw.csv,210,2026-02-14,STANDARD,Logs,px-media-analytics",
    
    // Inactive media
    "product_demos_archive_2024.zip,350,2024-07-22,STANDARD,Archive,px-cold-vault",
    "stock_video_b_roll_licensed_pack.mp4,280,2024-09-30,STANDARD_IA,Video,px-b-roll-stock",
    "audio_sound_effects_library.tar,140,2025-01-15,STANDARD_IA,Other,px-audio-vault",

    // Active production assets
    "client_social_reels_final_export_aug.mp4,65,2026-08-30,STANDARD,Video,px-active-campaigns",
    "high_res_photo_gallery_august.zip,45,2026-08-28,STANDARD,Image,px-active-campaigns",
    "website_optimized_webp_assets.tar,18,2026-08-31,STANDARD,Image,px-static-cdn",
    "legal_media_rights_releases_2026.pdf,4.2,2026-08-27,STANDARD,Document,px-contracts"
  ]
  return SAMPLE_CSV_HEADER + rows.join('\n')
}

export function getDemoDatasetForUser(userId: string): string {
  if (userId === 'user_byteworks') return generateByteWorksDataset()
  if (userId === 'user_startflow') return generateStartFlowDataset()
  if (userId === 'user_pixellabs') return generatePixelLabsDataset()
  return generateSampleCsvString()
}
