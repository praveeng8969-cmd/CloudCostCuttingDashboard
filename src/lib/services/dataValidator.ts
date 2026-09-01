import { StorageRecord, InvalidRow, StorageClass, FileCategory, ThresholdConfig } from '@/types/storage'

// Helper to determine file category from extension if missing or general
function inferFileType(fileName: string, providedType?: string): FileCategory {
  if (providedType && providedType.trim().length > 0 && providedType.toLowerCase() !== 'other' && providedType.toLowerCase() !== 'unknown') {
    const t = providedType.trim()
    const cap = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
    return cap
  }
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  if (['zip', 'tar', 'gz', '7z', 'bak', 'dump', 'sql', 'iso', 'vmdk'].includes(ext)) return 'Backup'
  if (['log', 'txt', 'out', 'csv', 'tsv', 'json', 'xml'].includes(ext)) return 'Logs'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'].includes(ext)) return 'Video'
  if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'tiff'].includes(ext)) return 'Image'
  if (['pdf', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'md'].includes(ext)) return 'Document'
  if (['arc', 'bundle', 'pak'].includes(ext)) return 'Archive'
  return 'Other'
}

// Normalize storage class name
function normalizeStorageClass(rawClass?: string): StorageClass {
  if (!rawClass) return 'STANDARD'
  const c = rawClass.trim().toUpperCase().replace(/[\s_\-]+/g, '')
  if (c.includes('DEEP') || c.includes('ARCHIVEDEEP') || c.includes('GLACIERDEEP')) return 'DEEP_ARCHIVE'
  if (c.includes('GLACIER') || c.includes('ARCHIVE')) return 'GLACIER'
  if (c.includes('ONEZONE') || c.includes('1Z')) return 'ONEZONE_IA'
  if (c.includes('IA') || c.includes('INFREQUENT') || c.includes('STANDARDIA')) return 'STANDARD_IA'
  return 'STANDARD'
}

// Calculate age in days from current date (reference baseline: Sep 2026 for demo consistency or Date.now())
export function calculateAgeDays(dateStr: string): number {
  try {
    const parsed = new Date(dateStr)
    if (isNaN(parsed.getTime())) return 0
    const now = new Date('2026-09-01T00:00:00Z') // standard demo baseline
    const diffMs = now.getTime() - parsed.getTime()
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
    return days
  } catch {
    return 0
  }
}

export function validateCsvRows(
  rows: Record<string, string>[],
  thresholds: ThresholdConfig = { inactiveDays: 180, highlyInactiveDays: 365, largeFileSizeGB: 10 }
): { validRecords: StorageRecord[]; invalidRows: InvalidRow[] } {
  const validRecords: StorageRecord[] = []
  const invalidRows: InvalidRow[] = []
  const seenKeys = new Set<string>()

  rows.forEach((row, idx) => {
    const rowNum = idx + 2 // accounting for header row
    const errors: string[] = []

    // 1. Validate file_name
    const fileName = row['file_name'] || row['filename'] || row['name'] || ''
    if (!fileName || fileName.trim().length === 0) {
      errors.push('Missing file_name')
    }

    // 2. Validate size_gb
    const rawSize = row['size_gb'] || row['size'] || row['sizegb'] || '0'
    const sizeGB = parseFloat(rawSize.replace(/[^0-9.]/g, ''))
    if (isNaN(sizeGB) || sizeGB < 0) {
      errors.push(`Invalid size: "${rawSize}" is not a positive number`)
    }

    // 3. Validate last_accessed
    const rawDate = row['last_accessed'] || row['lastaccessed'] || row['date'] || ''
    let lastAccessed = rawDate.trim()
    if (!lastAccessed) {
      errors.push('Missing last_accessed date')
    } else {
      const d = new Date(lastAccessed)
      if (isNaN(d.getTime())) {
        errors.push(`Invalid date format: "${rawDate}"`)
      } else {
        // Format to YYYY-MM-DD
        lastAccessed = d.toISOString().split('T')[0]
      }
    }

    // 4. Storage class & bucket
    const storageClass = normalizeStorageClass(row['storage_class'] || row['storageclass'] || row['class'] || 'STANDARD')
    const bucket = (row['bucket'] || row['bucketname'] || row['container'] || 'default-bucket').trim()
    const fileType = inferFileType(fileName, row['file_type'] || row['filetype'] || row['type'])

    if (errors.length > 0) {
      invalidRows.push({
        rowNumber: rowNum,
        fileName: fileName || `Row ${rowNum}`,
        rawRow: row,
        errors
      })
      return
    }

    // Deduplicate identical rows imported in multiple files
    const dedupKey = `${fileName.toLowerCase()}_${sizeGB}_${lastAccessed}_${storageClass}_${bucket.toLowerCase()}`
    if (seenKeys.has(dedupKey)) {
      return // skip exact duplicate row
    }
    seenKeys.add(dedupKey)

    // Calculate metadata
    const ageDays = calculateAgeDays(lastAccessed)
    const isInactive = ageDays >= thresholds.inactiveDays
    const isHighlyInactive = ageDays >= thresholds.highlyInactiveDays
    const isLarge = sizeGB >= thresholds.largeFileSizeGB

    let status: StorageRecord['status'] = 'Active'
    if (isHighlyInactive) status = 'Highly Inactive'
    else if (isInactive) status = 'Inactive'

    let recommendation: StorageRecord['recommendation'] = 'Keep'
    if (isHighlyInactive && storageClass !== 'DEEP_ARCHIVE') {
      recommendation = 'Archive'
    } else if (isInactive && storageClass === 'STANDARD') {
      recommendation = 'Tier Down'
    } else if (fileType === 'Logs' && ageDays > 90) {
      recommendation = 'Delete'
    } else if (isLarge && (fileType === 'Backup' || fileType === 'Video')) {
      recommendation = 'Compress'
    }

    validRecords.push({
      id: `rec_${idx + 1}_${Math.random().toString(36).substr(2, 6)}`,
      fileName,
      sizeGB: Math.round(sizeGB * 100) / 100,
      lastAccessed,
      storageClass,
      fileType,
      bucket,
      ageDays,
      isInactive,
      isHighlyInactive,
      isLarge,
      status,
      recommendation,
      estimatedMonthlyCost: 0 // populated by costCalculator
    })
  })

  return { validRecords, invalidRows }
}
