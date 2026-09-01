export interface ParsedCsvRow {
  rowNumber: number
  fileName: string
  sizeGB: number
  lastAccessed: string
  storageClass: string
  fileType: string
  bucket: string
  raw: Record<string, string>
}

// Normalize column headers
function normalizeHeader(header: string): string {
  const clean = header.trim().toLowerCase().replace(/[\s_\-\(\)]+/g, '')
  if (clean.includes('file') && (clean.includes('name') || clean.includes('path'))) return 'file_name'
  if (clean.includes('size') || clean.includes('gb') || clean.includes('bytes') || clean.includes('capacity')) return 'size_gb'
  if (clean.includes('access') || clean.includes('date') || clean.includes('modified') || clean.includes('time')) return 'last_accessed'
  if (clean.includes('storage') || clean.includes('class') || clean.includes('tier')) return 'storage_class'
  if (clean.includes('type') || clean.includes('format') || clean.includes('extension') || clean.includes('mime')) return 'file_type'
  if (clean.includes('bucket') || clean.includes('container') || clean.includes('folder')) return 'bucket'
  return clean
}

// Robust RFC-compliant CSV line parser handling quotes, commas and newlines
export function parseCsvText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = []
  let currentLine = ''
  let insideQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      insideQuotes = !insideQuotes
      currentLine += char
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (currentLine.trim().length > 0) {
        lines.push(currentLine)
      }
      currentLine = ''
      if (char === '\r' && text[i + 1] === '\n') {
        i++
      }
    } else {
      currentLine += char
    }
  }
  if (currentLine.trim().length > 0) {
    lines.push(currentLine)
  }

  if (lines.length === 0) return { headers: [], rows: [] }

  function splitRow(rowText: string): string[] {
    const cells: string[] = []
    let currentCell = ''
    let inQuotes = false

    for (let i = 0; i < rowText.length; i++) {
      const char = rowText[i]
      if (char === '"') {
        if (inQuotes && rowText[i + 1] === '"') {
          currentCell += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        cells.push(currentCell.trim())
        currentCell = ''
      } else {
        currentCell += char
      }
    }
    cells.push(currentCell.trim())
    return cells
  }

  const rawHeaders = splitRow(lines[0])
  const headerMap: Record<number, string> = {}
  rawHeaders.forEach((h, idx) => {
    headerMap[idx] = normalizeHeader(h)
  })

  const rows: Record<string, string>[] = []
  for (let r = 1; r < lines.length; r++) {
    const cells = splitRow(lines[r])
    if (cells.length === 1 && cells[0] === '') continue
    const rowObj: Record<string, string> = {}
    cells.forEach((cell, idx) => {
      const key = headerMap[idx] || `col_${idx}`
      rowObj[key] = cell
    })
    rows.push(rowObj)
  }

  return { headers: rawHeaders, rows }
}

export function parseCsvFileContent(content: string): Record<string, string>[] {
  const { rows } = parseCsvText(content)
  return rows
}
