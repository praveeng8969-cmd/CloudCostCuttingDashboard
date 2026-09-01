export type StorageClass = 'STANDARD' | 'STANDARD_IA' | 'ONEZONE_IA' | 'GLACIER' | 'DEEP_ARCHIVE' | string

export type FileCategory = 'Backup' | 'Document' | 'Logs' | 'Video' | 'Image' | 'Archive' | 'Other' | string

export interface StorageRecord {
  id: string
  fileName: string
  sizeGB: number
  lastAccessed: string // YYYY-MM-DD
  storageClass: StorageClass
  fileType: FileCategory
  bucket: string
  ageDays: number
  isInactive: boolean
  isHighlyInactive: boolean
  isLarge: boolean
  status: 'Active' | 'Inactive' | 'Highly Inactive' | 'Duplicate Candidate'
  recommendation: 'Keep' | 'Delete' | 'Archive' | 'Compress' | 'Tier Down' | 'Review'
  estimatedMonthlyCost: number
}

export interface InvalidRow {
  rowNumber: number
  fileName?: string
  rawRow: Record<string, string>
  errors: string[]
}

export interface DuplicateCandidateGroup {
  id: string
  baseName: string
  fileType: string
  canonicalFile: StorageRecord
  duplicates: StorageRecord[]
  totalCopies: number
  totalSizeGB: number
  recoverableSizeGB: number
  estimatedMonthlySavings: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface RecommendationItem {
  id: string
  type: 'duplicate' | 'tier_down' | 'archive' | 'temp_purge' | 'compression' | 'bucket_policy'
  title: string
  description: string
  problem: string
  affectedStorageGB: number
  affectedFilesCount: number
  reason: string
  recommendedAction: string
  estimatedMonthlySavings: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  color: 'red' | 'orange' | 'purple' | 'blue' | 'green'
  icon: string
  details: string[]
}

export interface CategoryBreakdown {
  name: string
  storageGB: number
  percentage: number
  fileCount: number
  cost: number
  color: string
}

export interface AgeBreakdown {
  range: '0–30 days' | '31–90 days' | '91–180 days' | '181–365 days' | '365+ days'
  storageGB: number
  fileCount: number
  percentage: number
  status: 'Active' | 'Moderate' | 'Inactive' | 'Highly Inactive'
}

export interface PricingConfig {
  STANDARD: number // e.g. 2.0 per GB/mo
  STANDARD_IA: number // 1.25
  ONEZONE_IA: number // 1.00
  GLACIER: number // 0.40
  DEEP_ARCHIVE: number // 0.10
  currency: string // 'INR'
}

export interface ThresholdConfig {
  inactiveDays: number // default 180
  highlyInactiveDays: number // default 365
  largeFileSizeGB: number // default 10
}

export interface StorageAnalysisResult {
  totalStorageGB: number
  totalObjects: number
  averageFileSizeGB: number
  largestFile: StorageRecord | null
  
  // Cost breakdown
  currentMonthlyCost: number
  potentialMonthlyCost: number
  potentialMonthlySavings: number
  potentialAnnualSavings: number
  savingsPercentage: number
  
  // Inactive & Duplicate Stats
  inactiveStorageGB: number
  inactiveObjectsCount: number
  duplicateCandidatesCount: number
  duplicateRecoverableStorageGB: number
  duplicateEstimatedSavings: number
  
  // Optimization Health Score
  optimizationScore: number
  scoreStatus: 'Excellent' | 'Good' | 'Needs Attention' | 'Critical'
  scoreDeductions: { reason: string; points: number }[]
  
  // Breakdowns
  byFileType: CategoryBreakdown[]
  byBucket: CategoryBreakdown[]
  byStorageClass: CategoryBreakdown[]
  byAge: AgeBreakdown[]
  
  // Lists
  duplicateGroups: DuplicateCandidateGroup[]
  recommendations: RecommendationItem[]
}
