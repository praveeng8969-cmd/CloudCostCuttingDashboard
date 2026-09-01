import { StorageRecord, DuplicateCandidateGroup, PricingConfig } from '@/types/storage'

// Clean filename to extract the core identifier: e.g. "report_final_copy.pdf" -> "report_final.pdf"
function getNormalizedBaseName(fileName: string): string {
  const parts = fileName.toLowerCase().split('.')
  const ext = parts.length > 1 ? parts.pop() : ''
  let name = parts.join('.')

  // Remove common duplicate/versioning suffixes
  name = name
    .replace(/[\-_ ]*(copy|duplicate|replica|backup|v\d+|\(\d+\)|\d{8})[\-_ ]*/gi, '')
    .trim()

  return ext ? `${name}.${ext}` : name
}

export function detectDuplicateCandidates(
  records: StorageRecord[],
  pricing: PricingConfig
): { duplicateGroups: DuplicateCandidateGroup[]; duplicateCandidatesCount: number; duplicateRecoverableStorageGB: number; duplicateEstimatedSavings: number } {
  // Cluster records by normalized base name + fileType + approximate size
  const clusters = new Map<string, StorageRecord[]>()

  records.forEach(rec => {
    const baseName = getNormalizedBaseName(rec.fileName)
    // Create a fuzzy key
    const clusterKey = `${baseName}__${rec.fileType}`
    const existing = clusters.get(clusterKey) || []
    existing.push(rec)
    clusters.set(clusterKey, existing)
  })

  const duplicateGroups: DuplicateCandidateGroup[] = []
  let duplicateCandidatesCount = 0
  let duplicateRecoverableStorageGB = 0
  let duplicateEstimatedSavings = 0

  clusters.forEach((items, clusterKey) => {
    if (items.length > 1) {
      // Sort so the oldest / most standard becomes canonical
      items.sort((a, b) => new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime())
      const canonicalFile = items[0]
      const duplicateItems = items.slice(1)

      const totalCopies = items.length
      const totalSizeGB = items.reduce((sum, r) => sum + r.sizeGB, 0)
      const recoverableSizeGB = duplicateItems.reduce((sum, r) => sum + r.sizeGB, 0)
      
      // Cost of the redundant copies based on pricing
      const stdPrice = pricing.STANDARD || 2.0
      const groupSavings = duplicateItems.reduce((sum, r) => {
        const rate = (pricing as any)[r.storageClass] || stdPrice
        return sum + (r.sizeGB * rate)
      }, 0)

      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
      if (recoverableSizeGB >= 50 || groupSavings >= 2000) priority = 'HIGH'
      else if (recoverableSizeGB >= 10 || groupSavings >= 500) priority = 'MEDIUM'

      duplicateCandidatesCount += duplicateItems.length
      duplicateRecoverableStorageGB += recoverableSizeGB
      duplicateEstimatedSavings += groupSavings

      // Tag records
      duplicateItems.forEach(d => {
        d.status = 'Duplicate Candidate'
        if (d.recommendation === 'Keep') d.recommendation = 'Delete'
      })

      duplicateGroups.push({
        id: `dup_group_${duplicateGroups.length + 1}`,
        baseName: canonicalFile.fileName,
        fileType: canonicalFile.fileType,
        canonicalFile,
        duplicates: duplicateItems,
        totalCopies,
        totalSizeGB: Math.round(totalSizeGB * 100) / 100,
        recoverableSizeGB: Math.round(recoverableSizeGB * 100) / 100,
        estimatedMonthlySavings: Math.round(groupSavings),
        priority
      })
    }
  })

  // Sort groups by potential recoverable size descending
  duplicateGroups.sort((a, b) => b.recoverableSizeGB - a.recoverableSizeGB)

  return {
    duplicateGroups,
    duplicateCandidatesCount,
    duplicateRecoverableStorageGB: Math.round(duplicateRecoverableStorageGB * 100) / 100,
    duplicateEstimatedSavings: Math.round(duplicateEstimatedSavings)
  }
}
