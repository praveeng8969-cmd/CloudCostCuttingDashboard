import {
  StorageRecord, StorageAnalysisResult, PricingConfig,
  ThresholdConfig, CategoryBreakdown, AgeBreakdown
} from '@/types/storage'
import { detectDuplicateCandidates } from './duplicateDetector'
import { calculateRecordCosts } from './costCalculator'
import { generateRecommendations } from './recommendationEngine'
import { calculateOptimizationScore } from './optimizationScore'

const PALETTE = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#f43f5e', '#64748b']

export function analyzeStorageDataset(
  records: StorageRecord[],
  pricing: PricingConfig = { STANDARD: 2.0, STANDARD_IA: 1.25, ONEZONE_IA: 1.0, GLACIER: 0.40, DEEP_ARCHIVE: 0.10, currency: 'INR' },
  thresholds: ThresholdConfig = { inactiveDays: 180, highlyInactiveDays: 365, largeFileSizeGB: 10 }
): StorageAnalysisResult {
  if (records.length === 0) {
    return {
      totalStorageGB: 0,
      totalObjects: 0,
      averageFileSizeGB: 0,
      largestFile: null,
      currentMonthlyCost: 0,
      potentialMonthlyCost: 0,
      potentialMonthlySavings: 0,
      potentialAnnualSavings: 0,
      savingsPercentage: 0,
      inactiveStorageGB: 0,
      inactiveObjectsCount: 0,
      duplicateCandidatesCount: 0,
      duplicateRecoverableStorageGB: 0,
      duplicateEstimatedSavings: 0,
      optimizationScore: 100,
      scoreStatus: 'Excellent',
      scoreDeductions: [],
      byFileType: [],
      byBucket: [],
      byStorageClass: [],
      byAge: [],
      duplicateGroups: [],
      recommendations: []
    }
  }

  // 1. Basic Stats
  const totalObjects = records.length
  const totalStorageGB = Math.round(records.reduce((sum, r) => sum + r.sizeGB, 0) * 100) / 100
  const averageFileSizeGB = totalObjects > 0 ? Math.round((totalStorageGB / totalObjects) * 100) / 100 : 0

  let largestFile: StorageRecord | null = null
  records.forEach(r => {
    if (!largestFile || r.sizeGB > largestFile.sizeGB) {
      largestFile = r
    }
  })

  // 2. Duplicate Detection
  const { duplicateGroups, duplicateCandidatesCount, duplicateRecoverableStorageGB, duplicateEstimatedSavings } = detectDuplicateCandidates(records, pricing)

  // 3. Cost Calculations
  const {
    currentMonthlyCost,
    potentialMonthlyCost,
    potentialMonthlySavings,
    potentialAnnualSavings,
    savingsPercentage
  } = calculateRecordCosts(records, pricing)

  // 4. Inactive Stats
  const inactiveRecords = records.filter(r => r.isInactive)
  const inactiveStorageGB = Math.round(inactiveRecords.reduce((sum, r) => sum + r.sizeGB, 0) * 100) / 100
  const inactiveObjectsCount = inactiveRecords.length

  // 5. Category Breakdown: By FileType
  const typeMap = new Map<string, { storageGB: number; count: number; cost: number }>()
  records.forEach(r => {
    const entry = typeMap.get(r.fileType) || { storageGB: 0, count: 0, cost: 0 }
    entry.storageGB += r.sizeGB
    entry.count += 1
    entry.cost += r.estimatedMonthlyCost
    typeMap.set(r.fileType, entry)
  })

  const byFileType: CategoryBreakdown[] = Array.from(typeMap.entries())
    .map(([name, data], idx) => ({
      name,
      storageGB: Math.round(data.storageGB * 10) / 10,
      percentage: totalStorageGB > 0 ? Math.round((data.storageGB / totalStorageGB) * 100) : 0,
      fileCount: data.count,
      cost: Math.round(data.cost),
      color: PALETTE[idx % PALETTE.length]
    }))
    .sort((a, b) => b.storageGB - a.storageGB)

  // 6. Category Breakdown: By Bucket
  const bucketMap = new Map<string, { storageGB: number; count: number; cost: number }>()
  records.forEach(r => {
    const entry = bucketMap.get(r.bucket) || { storageGB: 0, count: 0, cost: 0 }
    entry.storageGB += r.sizeGB
    entry.count += 1
    entry.cost += r.estimatedMonthlyCost
    bucketMap.set(r.bucket, entry)
  })

  const byBucket: CategoryBreakdown[] = Array.from(bucketMap.entries())
    .map(([name, data], idx) => ({
      name,
      storageGB: Math.round(data.storageGB * 10) / 10,
      percentage: totalStorageGB > 0 ? Math.round((data.storageGB / totalStorageGB) * 100) : 0,
      fileCount: data.count,
      cost: Math.round(data.cost),
      color: PALETTE[idx % PALETTE.length]
    }))
    .sort((a, b) => b.storageGB - a.storageGB)

  // 7. Category Breakdown: By Storage Class
  const classMap = new Map<string, { storageGB: number; count: number; cost: number }>()
  records.forEach(r => {
    const entry = classMap.get(r.storageClass) || { storageGB: 0, count: 0, cost: 0 }
    entry.storageGB += r.sizeGB
    entry.count += 1
    entry.cost += r.estimatedMonthlyCost
    classMap.set(r.storageClass, entry)
  })

  const byStorageClass: CategoryBreakdown[] = Array.from(classMap.entries())
    .map(([name, data], idx) => ({
      name,
      storageGB: Math.round(data.storageGB * 10) / 10,
      percentage: totalStorageGB > 0 ? Math.round((data.storageGB / totalStorageGB) * 100) : 0,
      fileCount: data.count,
      cost: Math.round(data.cost),
      color: PALETTE[idx % PALETTE.length]
    }))
    .sort((a, b) => b.storageGB - a.storageGB)

  // 8. Age Distribution
  const ageBuckets = [
    { range: '0–30 days' as const, min: 0, max: 30, status: 'Active' as const },
    { range: '31–90 days' as const, min: 31, max: 90, status: 'Active' as const },
    { range: '91–180 days' as const, min: 91, max: 180, status: 'Moderate' as const },
    { range: '181–365 days' as const, min: 181, max: 365, status: 'Inactive' as const },
    { range: '365+ days' as const, min: 366, max: Infinity, status: 'Highly Inactive' as const }
  ]

  const byAge: AgeBreakdown[] = ageBuckets.map(b => {
    const matching = records.filter(r => r.ageDays >= b.min && r.ageDays <= b.max)
    const storageGB = Math.round(matching.reduce((s, r) => s + r.sizeGB, 0) * 10) / 10
    const percentage = totalStorageGB > 0 ? Math.round((storageGB / totalStorageGB) * 100) : 0
    return {
      range: b.range,
      storageGB,
      fileCount: matching.length,
      percentage,
      status: b.status
    }
  })

  // 9. Recommendations
  const recommendations = generateRecommendations(records, duplicateGroups, pricing)

  // 10. Optimization Score
  const { optimizationScore, scoreStatus, scoreDeductions } = calculateOptimizationScore(
    records,
    totalStorageGB,
    duplicateRecoverableStorageGB,
    inactiveStorageGB
  )

  return {
    totalStorageGB,
    totalObjects,
    averageFileSizeGB,
    largestFile,
    currentMonthlyCost,
    potentialMonthlyCost,
    potentialMonthlySavings,
    potentialAnnualSavings,
    savingsPercentage,
    inactiveStorageGB,
    inactiveObjectsCount,
    duplicateCandidatesCount,
    duplicateRecoverableStorageGB,
    duplicateEstimatedSavings,
    optimizationScore,
    scoreStatus,
    scoreDeductions,
    byFileType,
    byBucket,
    byStorageClass,
    byAge,
    duplicateGroups,
    recommendations
  }
}
