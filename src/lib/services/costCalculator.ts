import { StorageRecord, PricingConfig, CategoryBreakdown } from '@/types/storage'

export function calculateRecordCosts(
  records: StorageRecord[],
  pricing: PricingConfig
): {
  currentMonthlyCost: number
  potentialMonthlyCost: number
  potentialMonthlySavings: number
  potentialAnnualSavings: number
  savingsPercentage: number
} {
  let currentMonthlyCost = 0
  let potentialMonthlyCost = 0

  records.forEach(rec => {
    // Current price based on active storage class
    const currentRate = (pricing as any)[rec.storageClass] ?? pricing.STANDARD ?? 2.0
    const currentCost = rec.sizeGB * currentRate
    rec.estimatedMonthlyCost = Math.round(currentCost * 100) / 100
    currentMonthlyCost += currentCost

    // Optimized price target
    let optimizedRate = currentRate

    if (rec.status === 'Duplicate Candidate') {
      // Deletion yields 0 cost
      optimizedRate = 0
    } else if (rec.isHighlyInactive && rec.storageClass !== 'DEEP_ARCHIVE') {
      // Tier down to Deep Archive
      optimizedRate = pricing.DEEP_ARCHIVE ?? 0.10
    } else if (rec.isInactive && rec.storageClass === 'STANDARD') {
      // Tier down to Infrequent Access
      optimizedRate = pricing.STANDARD_IA ?? 1.25
    } else if (rec.fileType === 'Logs' && rec.ageDays > 90) {
      // Stale logs pruned
      optimizedRate = 0
    } else if (rec.isLarge && rec.fileType === 'Backup') {
      // Compression savings (~50% size reduction)
      optimizedRate = currentRate * 0.5
    }

    potentialMonthlyCost += rec.sizeGB * optimizedRate
  })

  currentMonthlyCost = Math.round(currentMonthlyCost)
  potentialMonthlyCost = Math.round(potentialMonthlyCost)
  const potentialMonthlySavings = Math.max(0, currentMonthlyCost - potentialMonthlyCost)
  const potentialAnnualSavings = potentialMonthlySavings * 12
  const savingsPercentage = currentMonthlyCost > 0 ? Math.round((potentialMonthlySavings / currentMonthlyCost) * 100) : 0

  return {
    currentMonthlyCost,
    potentialMonthlyCost,
    potentialMonthlySavings,
    potentialAnnualSavings,
    savingsPercentage
  }
}
