import { MLPrediction, OptimizationScenario, OptimizationSummary } from '@/types/ml'
import { PricingConfig, StorageRecord } from '@/types/storage'

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100
}

export function getStorageRate(storageClass: string, pricing: PricingConfig): number | null {
  const value = (pricing as unknown as Record<string, number | string>)[storageClass]
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function chooseArchiveTarget(record: StorageRecord, pricing: PricingConfig): string | null {
  if (record.activityDataAvailable === false || record.ageDays === null) return null
  if (record.storageClass === 'DEEP_ARCHIVE') return null
  const candidates = record.ageDays >= 365 ? ['DEEP_ARCHIVE', 'GLACIER'] : ['GLACIER', 'STANDARD_IA']
  const currentRate = getStorageRate(record.storageClass, pricing)
  if (currentRate === null) return null
  return candidates.find(candidate => {
    const rate = getStorageRate(candidate, pricing)
    return rate !== null && rate < currentRate
  }) || null
}

export function buildOptimizationSummary(
  records: StorageRecord[],
  predictions: MLPrediction[],
  pricing: PricingConfig
): OptimizationSummary {
  const predictionMap = new Map(predictions.map(item => [item.fileId, item]))
  const counts = { KEEP: 0, REVIEW: 0, ARCHIVE_CANDIDATE: 0 }
  let currentMonthlyCost = 0
  let mlFlaggedStorageCost = 0

  const scenarios = records.flatMap<OptimizationScenario>(record => {
    const prediction = predictionMap.get(record.id)
    if (!prediction) return []
    counts[prediction.prediction] += 1

    const currentRate = getStorageRate(record.storageClass, pricing)
    const currentCost = currentRate === null ? 0 : roundCurrency(record.sizeGB * currentRate)
    currentMonthlyCost += currentCost
    if (prediction.prediction !== 'KEEP') mlFlaggedStorageCost += currentCost

    const target = prediction.prediction === 'ARCHIVE_CANDIDATE'
      ? chooseArchiveTarget(record, pricing)
      : null
    const targetRate = target ? getStorageRate(target, pricing) : null
    const proposedCost = targetRate === null ? currentCost : roundCurrency(record.sizeGB * targetRate)
    const savings = roundCurrency(Math.max(0, currentCost - proposedCost))
    const ruleSignals = [
      ...(record.isHighlyInactive ? ['Highly inactive (>365 days)'] : record.isInactive ? ['Inactive (>180 days)'] : []),
      ...(record.isLarge ? ['Large object'] : []),
      ...(record.status === 'Duplicate Candidate' ? ['Possible duplicate; verify content before removal'] : [])
    ]
    const priorityScore = savings + record.sizeGB + prediction.confidence * 100
    const priority = priorityScore >= 250 ? 'HIGH' : priorityScore >= 75 ? 'MEDIUM' : 'LOW'

    return [{
      fileId: record.id,
      source: 'ML_SUPPORTED',
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      currentStorageClass: record.storageClass,
      proposedStorageClass: target,
      currentMonthlyCost: currentCost,
      proposedMonthlyCost: proposedCost,
      grossMonthlySavings: savings,
      action: target
        ? `Review transition to ${target}`
        : prediction.prediction === 'REVIEW'
          ? 'Perform manual access, retention, and workload review'
          : prediction.prediction === 'KEEP'
            ? 'No immediate ML-supported optimization action'
            : 'No lower-cost configured tier is currently eligible',
      priority,
      ruleSignals,
      constraints: [
        'Verify retrieval frequency and latency requirements',
        'Check retention, minimum-duration, transition, and retrieval charges',
        'Obtain human approval before changing storage'
      ],
      eligible: Boolean(target && savings > 0)
    }]
  })

  const grossPotentialMonthlySavings = roundCurrency(
    scenarios.reduce((sum, scenario) => sum + (scenario.eligible ? scenario.grossMonthlySavings : 0), 0)
  )
  const roundedCurrentMonthlyCost = Math.round(currentMonthlyCost)
  return {
    scenarios,
    currentMonthlyCost: roundedCurrentMonthlyCost,
    mlFlaggedStorageCost: roundCurrency(mlFlaggedStorageCost),
    grossPotentialMonthlySavings,
    estimatedOptimizedMonthlyCost: roundCurrency(Math.max(0, roundedCurrentMonthlyCost - grossPotentialMonthlySavings)),
    counts
  }
}
