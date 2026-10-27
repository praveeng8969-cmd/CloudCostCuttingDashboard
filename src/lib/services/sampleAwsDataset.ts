import { FileCategory, PricingConfig, StorageClass, StorageRecord } from '@/types/storage'

export type SampleAwsAccountId = 'novatech' | 'shopsphere' | 'datacore'

export interface SampleAwsAccount {
  id: SampleAwsAccountId
  company: string
  email: string
  region: 'ap-south-1'
  profile: string
  objectCount: number
  buckets: readonly string[]
  bucketCategories: readonly FileCategory[]
  sizeScale: number
  seed: number
}

export const SAMPLE_AWS_ACCOUNTS: readonly SampleAwsAccount[] = [
  {
    id: 'novatech', company: 'NovaTech Solutions', email: 'novatech@cloudcut.demo', region: 'ap-south-1',
    profile: 'Software company with old backups and duplicate candidates.', objectCount: 750, seed: 202601,
    buckets: ['novatech-app-backups', 'novatech-static-assets', 'novatech-system-logs', 'novatech-documents'],
    bucketCategories: ['Backup', 'Image', 'Logs', 'Document'], sizeScale: 1
  },
  {
    id: 'shopsphere', company: 'ShopSphere Commerce', email: 'shopsphere@cloudcut.demo', region: 'ap-south-1',
    profile: 'E-commerce business with product images, reports, invoices and logs.', objectCount: 1200, seed: 202602,
    buckets: ['shopsphere-product-images', 'shopsphere-order-backups', 'shopsphere-invoices', 'shopsphere-application-logs'],
    bucketCategories: ['Image', 'Backup', 'Document', 'Logs'], sizeScale: 0.72
  },
  {
    id: 'datacore', company: 'DataCore Analytics', email: 'datacore@cloudcut.demo', region: 'ap-south-1',
    profile: 'Analytics company with large datasets, research exports and archived backups.', objectCount: 2000, seed: 202603,
    buckets: ['datacore-datasets', 'datacore-model-exports', 'datacore-client-reports', 'datacore-backups'],
    bucketCategories: ['Other', 'Archive', 'Document', 'Backup'], sizeScale: 2.4
  }
] as const

const BASELINE = new Date('2026-09-01T00:00:00.000Z')

export function getSampleAwsAccount(accountId: string): SampleAwsAccount | null {
  return SAMPLE_AWS_ACCOUNTS.find(account => account.id === accountId) || null
}

export function sampleConnectionStorageKey(customerId: string): string {
  return `cloudcut_sample_aws_connection_${customerId}`
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function dateBefore(days: number): string {
  const date = new Date(BASELINE)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

function rateFor(storageClass: StorageClass, pricing: PricingConfig): number {
  const rate = (pricing as unknown as Record<string, number | string>)[storageClass]
  return typeof rate === 'number' ? rate : pricing.STANDARD
}

function extensionFor(category: FileCategory, index: number): string {
  const options: Record<string, readonly string[]> = {
    Backup: ['tar.gz', 'bak', 'sql', 'zip'], Video: ['mp4', 'mov', 'webm'], Image: ['png', 'jpg', 'webp'],
    Logs: ['log', 'json', 'csv'], Document: ['pdf', 'docx', 'xlsx', 'pptx'], Archive: ['parquet', 'zip', 'tar.gz'],
    Other: ['parquet', 'csv', 'jsonl', 'bin']
  }
  const values = options[category] || options.Other
  return values[index % values.length]
}

export function generateSampleAwsDataset(pricing: PricingConfig, accountId: SampleAwsAccountId): StorageRecord[] {
  const account = getSampleAwsAccount(accountId)
  if (!account) throw new Error('Sample AWS account is unavailable.')
  const random = seededRandom(account.seed)
  const records: StorageRecord[] = []

  for (let index = 0; index < account.objectCount; index += 1) {
    const duplicateWindow = account.id === 'novatech' ? 64 : account.id === 'shopsphere' ? 36 : 48
    const logicalIndex = index < duplicateWindow && index % 2 === 1 ? index - 1 : index
    const bucketIndex = logicalIndex % account.buckets.length
    const bucket = account.buckets[bucketIndex]
    const category = account.bucketCategories[bucketIndex]
    const extension = extensionFor(category, logicalIndex)
    const ageBias = account.id === 'novatech' ? 720 : account.id === 'shopsphere' ? 390 : 610
    const ageDays = Math.floor(random() * ageBias)
    const baseScale = category === 'Backup' ? 90 : category === 'Video' ? 25 : category === 'Image' ? 2.8 : category === 'Logs' ? 5 : category === 'Other' ? 45 : category === 'Archive' ? 35 : 1.8
    const sizeGB = Math.round(Math.max(0.001, random() * random() * baseScale * account.sizeScale) * 1000) / 1000
    const storageClass: StorageClass = ageDays > 500 && index % 3 === 0 ? 'DEEP_ARCHIVE' : ageDays > 330 && index % 2 === 0 ? 'GLACIER' : ageDays > 150 && index % 3 === 0 ? 'STANDARD_IA' : 'STANDARD'
    const isHighlyInactive = ageDays >= 365
    const isInactive = ageDays >= 180
    const isLarge = sizeGB >= 10
    const duplicateSuffix = index < duplicateWindow && index % 2 === 1 ? '_copy' : ''
    const fileName = `${category.toLowerCase()}/${2024 + (logicalIndex % 3)}/${account.id}-${category.toLowerCase()}-${String(logicalIndex + 1).padStart(5, '0')}${duplicateSuffix}.${extension}`
    let recommendation: StorageRecord['recommendation'] = 'Keep'
    if (isHighlyInactive && storageClass !== 'DEEP_ARCHIVE') recommendation = 'Archive'
    else if (isInactive && storageClass === 'STANDARD') recommendation = 'Tier Down'
    else if (category === 'Logs' && ageDays > 90) recommendation = 'Delete'
    else if (isLarge && (category === 'Backup' || category === 'Video')) recommendation = 'Compress'

    records.push({
      id: `sample-s3-${account.id}-${String(index + 1).padStart(5, '0')}`,
      fileName, sizeGB, lastAccessed: dateBefore(ageDays),
      lastModified: dateBefore(Math.min(ageDays, Math.floor(random() * 120))),
      activityDataAvailable: true, storageClass, fileType: category, bucket, ageDays,
      isInactive, isHighlyInactive, isLarge,
      status: isHighlyInactive ? 'Highly Inactive' : isInactive ? 'Inactive' : 'Active',
      recommendation,
      estimatedMonthlyCost: Math.round(sizeGB * rateFor(storageClass, pricing) * 100) / 100
    })
  }
  return records
}
