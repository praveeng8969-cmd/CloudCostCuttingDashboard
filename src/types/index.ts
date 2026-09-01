// ─── Navigation ───────────────────────────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  icon: string
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────
export interface MetricCardData {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  changeLabel?: string
  subtitle?: string
  icon?: string
  color?: string
}

// ─── Charts ───────────────────────────────────────────────────────────────────
export interface CostTrendPoint {
  month: string
  current: number
  projected: number
}

export interface StorageGrowthPoint {
  month: string
  storage: number
}

export interface FileTypeData {
  name: string
  value: number
  color: string
}

export interface DepartmentData {
  department: string
  storage: number
  cost: number
}

// ─── Activity ─────────────────────────────────────────────────────────────────
export type ActivityStatus = 'Needs Review' | 'Recommended' | 'Completed' | 'Dismissed'
export type ActivityType = 'Duplicate' | 'Inactive' | 'Backup' | 'Snapshot' | 'Temp'

export interface ActivityRow {
  id: string
  activity: string
  type: ActivityType
  storageImpact: string
  estimatedSavings: string
  status: ActivityStatus
  time: string
}

// ─── Files ────────────────────────────────────────────────────────────────────
export type FileCategory = 'Document' | 'Image' | 'Video' | 'Backup' | 'Log' | 'Archive' | 'Other'
export type StorageClass = 'Standard' | 'Infrequent Access' | 'Archive' | 'Deep Archive'
export type FileRecommendation = 'Delete' | 'Archive' | 'Review' | 'Compress' | 'Keep'

export interface FileRow {
  id: string
  name: string
  type: FileCategory
  size: string
  sizeBytes: number
  lastAccessed: string
  owner: string
  storageClass: StorageClass
  department: string
  recommendation: FileRecommendation
}

// ─── Duplicate Files ──────────────────────────────────────────────────────────
export interface DuplicateFile {
  id: string
  name: string
  type: FileCategory
  original: string
  copies: number
  size: string
  sizeBytes: number
  potentialSaving: string
  potentialSavingAmount: number
}

// ─── Recommendations ──────────────────────────────────────────────────────────
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'

export interface Recommendation {
  id: string
  title: string
  description: string
  details: string[]
  potentialSaving: string
  potentialSavingAmount: number
  impact: string
  priority: Priority
  files?: number
  icon: string
  color: string
}

// ─── Cloud Providers ──────────────────────────────────────────────────────────
export type ProviderStatus = 'connected' | 'disconnected' | 'syncing'

export interface CloudProvider {
  id: string
  name: string
  shortName: string
  storageUsed: string
  monthlyCost: string
  lastSync: string
  status: ProviderStatus
  icon: string
  color: string
  regions: number
  buckets: number
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export interface Report {
  id: string
  title: string
  description: string
  lastGenerated: string
  size: string
  icon: string
  color: string
}

// ─── Cost Breakdown ───────────────────────────────────────────────────────────
export interface CostItem {
  label: string
  amount: string
  amountNum: number
  percentage: number
  color: string
}

export type DateRange = '7d' | '30d' | '3m' | '1y'
