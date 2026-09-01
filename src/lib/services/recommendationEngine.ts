import { StorageRecord, RecommendationItem, DuplicateCandidateGroup, PricingConfig } from '@/types/storage'

export function generateRecommendations(
  records: StorageRecord[],
  duplicateGroups: DuplicateCandidateGroup[],
  pricing: PricingConfig
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = []

  // 1. Duplicate Candidates Recommendation
  if (duplicateGroups.length > 0) {
    const totalDupCopies = duplicateGroups.reduce((s, g) => s + g.duplicates.length, 0)
    const totalDupGB = duplicateGroups.reduce((s, g) => s + g.recoverableSizeGB, 0)
    const totalDupSavings = duplicateGroups.reduce((s, g) => s + g.estimatedMonthlySavings, 0)

    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
    if (totalDupSavings >= 5000 || totalDupGB >= 100) priority = 'HIGH'
    else if (totalDupSavings < 1000) priority = 'LOW'

    recommendations.push({
      id: 'rec_duplicates',
      type: 'duplicate',
      title: 'Purge Redundant Duplicate Candidates',
      description: `Identified ${duplicateGroups.length} duplicate groups across buckets containing ${totalDupCopies} redundant copies.`,
      problem: `${totalDupGB.toFixed(1)} GB of duplicate storage consuming unnecessary recurring budget.`,
      affectedStorageGB: Math.round(totalDupGB * 10) / 10,
      affectedFilesCount: totalDupCopies,
      reason: 'Multiple uploads of identical backups, datasets, or video assets in different directories.',
      recommendedAction: 'Keep primary canonical file and review/delete all duplicate replicas.',
      estimatedMonthlySavings: totalDupSavings,
      priority,
      color: 'orange',
      icon: 'Copy',
      details: [
        `Deduplicates ${duplicateGroups.length} candidate clusters.`,
        'Reclaims capacity immediately with zero business disruption.',
        `Estimated annual recovery: ₹${(totalDupSavings * 12).toLocaleString('en-IN')}`
      ]
    })
  }

  // 2. Highly Inactive Files (> 365 days) -> Glacier Deep Archive
  const highlyInactiveFiles = records.filter(r => r.isHighlyInactive && r.storageClass !== 'DEEP_ARCHIVE')
  if (highlyInactiveFiles.length > 0) {
    const storageGB = highlyInactiveFiles.reduce((s, r) => s + r.sizeGB, 0)
    const currentCost = highlyInactiveFiles.reduce((s, r) => s + r.estimatedMonthlyCost, 0)
    const deepRate = pricing.DEEP_ARCHIVE ?? 0.10
    const optimizedCost = storageGB * deepRate
    const savings = Math.max(0, Math.round(currentCost - optimizedCost))

    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
    if (savings >= 5000 || storageGB >= 200) priority = 'HIGH'
    else if (savings < 1000) priority = 'LOW'

    recommendations.push({
      id: 'rec_deep_archive',
      type: 'archive',
      title: 'Move Highly Inactive Files to Deep Archive',
      description: `${highlyInactiveFiles.length} objects have not been accessed in over 365 days.`,
      problem: `Unaccessed historical data stored in standard or infrequent access tiers.`,
      affectedStorageGB: Math.round(storageGB * 10) / 10,
      affectedFilesCount: highlyInactiveFiles.length,
      reason: 'Old compliance logs and historical exports stored in high-cost active storage.',
      recommendedAction: 'Transition objects to S3 Glacier Deep Archive (-90% per-GB cost).',
      estimatedMonthlySavings: savings,
      priority,
      color: 'red',
      icon: 'Archive',
      details: [
        `Automated lifecycle transition rule for objects aged > 365 days.`,
        `Low retrieval frequency ensures minimal transition overhead.`,
        `Estimated annual recovery: ₹${(savings * 12).toLocaleString('en-IN')}`
      ]
    })
  }

  // 3. Inactive Standard Data (180–365 days) -> Standard IA
  const inactiveStandardFiles = records.filter(r => r.isInactive && !r.isHighlyInactive && r.storageClass === 'STANDARD')
  if (inactiveStandardFiles.length > 0) {
    const storageGB = inactiveStandardFiles.reduce((s, r) => s + r.sizeGB, 0)
    const currentCost = storageGB * (pricing.STANDARD ?? 2.0)
    const iaCost = storageGB * (pricing.STANDARD_IA ?? 1.25)
    const savings = Math.max(0, Math.round(currentCost - iaCost))

    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
    if (savings >= 4000 || storageGB >= 150) priority = 'HIGH'
    else if (savings < 800) priority = 'LOW'

    recommendations.push({
      id: 'rec_tier_down',
      type: 'tier_down',
      title: 'Transition Inactive Data to Standard-IA',
      description: `${inactiveStandardFiles.length} standard-tier objects inactive for over 180 days.`,
      problem: 'Paying full standard storage pricing on infrequently read assets.',
      affectedStorageGB: Math.round(storageGB * 10) / 10,
      affectedFilesCount: inactiveStandardFiles.length,
      reason: 'Stable quarterly archives still residing in Hot Standard buckets.',
      recommendedAction: 'Apply S3 Lifecycle policy to transition objects > 180 days to Infrequent Access.',
      estimatedMonthlySavings: savings,
      priority,
      color: 'blue',
      icon: 'Zap',
      details: [
        'Saves ~38% on storage rates with millisecond retrieval availability.',
        'Zero code changes required for client applications.',
        `Estimated annual recovery: ₹${(savings * 12).toLocaleString('en-IN')}`
      ]
    })
  }

  // 4. Stale Logs & Temporary Files (> 90 days)
  const staleLogs = records.filter(r => (r.fileType === 'Logs' || r.fileName.includes('.tmp')) && r.ageDays > 90)
  if (staleLogs.length > 0) {
    const storageGB = staleLogs.reduce((s, r) => s + r.sizeGB, 0)
    const savings = Math.round(staleLogs.reduce((s, r) => s + r.estimatedMonthlyCost, 0))

    recommendations.push({
      id: 'rec_stale_logs',
      type: 'temp_purge',
      title: 'Purge Stale Logs & Temp Build Artifacts',
      description: `${staleLogs.length} raw server logs and build artifacts older than 90 days.`,
      problem: 'Orphaned debug traces and CI/CD artifacts accumulating indefinitely.',
      affectedStorageGB: Math.round(storageGB * 10) / 10,
      affectedFilesCount: staleLogs.length,
      reason: 'No automatic expiration policy configured on log output buckets.',
      recommendedAction: 'Configure 90-day object expiration rule on logging buckets.',
      estimatedMonthlySavings: savings,
      priority: savings >= 2000 ? 'HIGH' : 'MEDIUM',
      color: 'purple',
      icon: 'Trash2',
      details: [
        'Enforces automated expiration cleanup.',
        'Prevents uncontrolled log storage creep.',
        `Estimated annual recovery: ₹${(savings * 12).toLocaleString('en-IN')}`
      ]
    })
  }

  // 5. Large Uncompressed Backups (> 10 GB)
  const largeBackups = records.filter(r => r.isLarge && (r.fileType === 'Backup' || r.fileType === 'Document'))
  if (largeBackups.length > 0) {
    const storageGB = largeBackups.reduce((s, r) => s + r.sizeGB, 0)
    const currentCost = largeBackups.reduce((s, r) => s + r.estimatedMonthlyCost, 0)
    const savings = Math.round(currentCost * 0.45) // ~45% reduction from GZIP/ZSTD

    recommendations.push({
      id: 'rec_compression',
      type: 'compression',
      title: 'Compress Large Backups & Exports',
      description: `${largeBackups.length} large files (>10 GB) stored without high-ratio compression.`,
      problem: 'Raw SQL dumps and uncompressed VM images consuming disproportionate capacity.',
      affectedStorageGB: Math.round(storageGB * 10) / 10,
      affectedFilesCount: largeBackups.length,
      reason: 'Direct uncompressed stream uploads from database backup cron jobs.',
      recommendedAction: 'Enable client-side Zstandard/GZIP compression prior to storage ingestion.',
      estimatedMonthlySavings: savings,
      priority: savings >= 3000 ? 'HIGH' : 'MEDIUM',
      color: 'green',
      icon: 'FileArchive',
      details: [
        'Achieves 40%–60% data compression ratio.',
        'Reduces upload network egress and transfer times.',
        `Estimated annual recovery: ₹${(savings * 12).toLocaleString('en-IN')}`
      ]
    })
  }

  // Sort by priority HIGH -> MEDIUM -> LOW, then by potential savings descending
  const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
  recommendations.sort((a, b) => {
    const pDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (pDiff !== 0) return pDiff
    return b.estimatedMonthlySavings - a.estimatedMonthlySavings
  })

  return recommendations
}
