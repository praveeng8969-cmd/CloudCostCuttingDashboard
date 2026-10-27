import { PricingConfig, StorageClass, StorageRecord } from '@/types/storage'

export const SAMPLE_AWS_ACCOUNT = {
  name: 'CloudCut Demo Company',
  region: 'ap-south-1',
  provider: 'Amazon S3',
  mode: 'Sample Data',
  buckets: [
    'cloudcut-demo-backups',
    'cloudcut-demo-assets',
    'cloudcut-demo-logs',
    'cloudcut-demo-documents'
  ]
} as const

const BASELINE = new Date('2026-09-01T00:00:00.000Z')

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

export function generateSampleAwsDataset(pricing: PricingConfig, count = 750): StorageRecord[] {
  const random = seededRandom(20260901)
  const records: StorageRecord[] = []
  const extensions = {
    Backup: ['tar.gz', 'bak', 'sql', 'zip'],
    Video: ['mp4', 'mov', 'webm'],
    Image: ['png', 'jpg', 'webp'],
    Logs: ['log', 'json', 'csv'],
    Document: ['pdf', 'docx', 'xlsx', 'pptx']
  } as const

  for (let index = 0; index < count; index += 1) {
    const logicalIndex = index < 48 && index % 2 === 1 ? index - 1 : index
    const bucketIndex = logicalIndex % SAMPLE_AWS_ACCOUNT.buckets.length
    const bucket = SAMPLE_AWS_ACCOUNT.buckets[bucketIndex]
    const category = bucketIndex === 0 ? 'Backup' : bucketIndex === 1 ? (index % 3 === 0 ? 'Video' : 'Image') : bucketIndex === 2 ? 'Logs' : 'Document'
    const categoryExtensions = extensions[category]
    const extension = categoryExtensions[logicalIndex % categoryExtensions.length]
    const ageDays = Math.floor(random() * 640)
    const sizeMultiplier = category === 'Backup' ? 85 : category === 'Video' ? 24 : category === 'Image' ? 2.5 : category === 'Logs' ? 4 : 1.5
    const sizeGB = Math.round(Math.max(0.001, random() * random() * sizeMultiplier) * 1000) / 1000
    const storageClass: StorageClass = ageDays > 500 && index % 3 === 0
      ? 'DEEP_ARCHIVE'
      : ageDays > 330 && index % 2 === 0
        ? 'GLACIER'
        : ageDays > 150 && index % 3 === 0
          ? 'STANDARD_IA'
          : 'STANDARD'
    const isHighlyInactive = ageDays >= 365
    const isInactive = ageDays >= 180
    const isLarge = sizeGB >= 10
    const baseNumber = logicalIndex
    const duplicateSuffix = index < 48 && index % 2 === 1 ? '_copy' : ''
    const fileName = `${category.toLowerCase()}/${2024 + (index % 3)}/cloudcut-${category.toLowerCase()}-${String(baseNumber + 1).padStart(4, '0')}${duplicateSuffix}.${extension}`
    let recommendation: StorageRecord['recommendation'] = 'Keep'
    if (isHighlyInactive && storageClass !== 'DEEP_ARCHIVE') recommendation = 'Archive'
    else if (isInactive && storageClass === 'STANDARD') recommendation = 'Tier Down'
    else if (category === 'Logs' && ageDays > 90) recommendation = 'Delete'
    else if (isLarge && (category === 'Backup' || category === 'Video')) recommendation = 'Compress'

    records.push({
      id: `sample-s3-${String(index + 1).padStart(4, '0')}`,
      fileName,
      sizeGB,
      lastAccessed: dateBefore(ageDays),
      lastModified: dateBefore(Math.min(ageDays, Math.floor(random() * 120))),
      activityDataAvailable: true,
      storageClass,
      fileType: category,
      bucket,
      ageDays,
      isInactive,
      isHighlyInactive,
      isLarge,
      status: isHighlyInactive ? 'Highly Inactive' : isInactive ? 'Inactive' : 'Active',
      recommendation,
      estimatedMonthlyCost: Math.round(sizeGB * rateFor(storageClass, pricing) * 100) / 100
    })
  }

  return records
}
