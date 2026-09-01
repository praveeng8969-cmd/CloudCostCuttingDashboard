import { StorageRecord } from '@/types/storage'

export function calculateOptimizationScore(
  records: StorageRecord[],
  totalStorageGB: number,
  duplicateStorageGB: number,
  inactiveStorageGB: number
): {
  optimizationScore: number
  scoreStatus: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical'
  scoreDeductions: { reason: string; points: number }[]
} {
  if (records.length === 0 || totalStorageGB === 0) {
    return {
      optimizationScore: 100,
      scoreStatus: 'Excellent',
      scoreDeductions: []
    }
  }

  let score = 100
  const deductions: { reason: string; points: number }[] = []

  // 1. Inactive storage deduction (up to 30 points)
  const inactiveRatio = inactiveStorageGB / totalStorageGB
  if (inactiveRatio > 0.05) {
    const pts = Math.min(30, Math.round(inactiveRatio * 50))
    score -= pts
    deductions.push({
      reason: `${Math.round(inactiveRatio * 100)}% storage inactive (>180d)`,
      points: pts
    })
  }

  // 2. Duplicate candidates deduction (up to 25 points)
  const duplicateRatio = duplicateStorageGB / totalStorageGB
  if (duplicateRatio > 0.02) {
    const pts = Math.min(25, Math.round(duplicateRatio * 80))
    score -= pts
    deductions.push({
      reason: `${Math.round(duplicateRatio * 100)}% duplicate redundancy detected`,
      points: pts
    })
  }

  // 3. Stale Standard tier storage (up to 20 points)
  const standardInactiveGB = records
    .filter(r => r.isInactive && r.storageClass === 'STANDARD')
    .reduce((s, r) => s + r.sizeGB, 0)
  const standardInactiveRatio = standardInactiveGB / totalStorageGB
  if (standardInactiveRatio > 0.05) {
    const pts = Math.min(20, Math.round(standardInactiveRatio * 40))
    score -= pts
    deductions.push({
      reason: `${Math.round(standardInactiveRatio * 100)}% inactive data in costly Standard tier`,
      points: pts
    })
  }

  // 4. Large uncompressed files (up to 15 points)
  const largeFilesGB = records
    .filter(r => r.isLarge && r.fileType === 'Backup')
    .reduce((s, r) => s + r.sizeGB, 0)
  const largeFilesRatio = largeFilesGB / totalStorageGB
  if (largeFilesRatio > 0.1) {
    const pts = Math.min(15, Math.round(largeFilesRatio * 20))
    score -= pts
    deductions.push({
      reason: `${Math.round(largeFilesRatio * 100)}% large uncompressed backup storage`,
      points: pts
    })
  }

  score = Math.max(15, Math.min(100, Math.round(score)))

  let scoreStatus: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical' = 'Good'
  if (score >= 90) scoreStatus = 'Excellent'
  else if (score >= 75) scoreStatus = 'Good'
  else if (score >= 50) scoreStatus = 'Needs Attention'
  else scoreStatus = 'Critical'

  return {
    optimizationScore: score,
    scoreStatus,
    scoreDeductions: deductions
  }
}
