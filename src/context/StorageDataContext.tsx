'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'
import {
  StorageRecord, InvalidRow, StorageAnalysisResult,
  PricingConfig, ThresholdConfig
} from '@/types/storage'
import { parseCsvFileContent } from '@/lib/services/dataParser'
import { validateCsvRows } from '@/lib/services/dataValidator'
import { analyzeStorageDataset } from '@/lib/services/storageAnalyzer'
import { generateSampleCsvString } from '@/lib/services/demoDataset'
import toast from 'react-hot-toast'

export type DataSourceType = 'CSV' | 'DEMO' | 'NONE'

const STORAGE_KEY = 'cloudcut_dataset_state_v2'

interface PersistedState {
  source: 'CSV' | 'DEMO'
  fileName: string
  recordCount: number
  dataset: StorageRecord[]
  lastAnalyzed: string
  pricing?: PricingConfig
  thresholds?: ThresholdConfig
}

interface StorageDataContextType {
  records: StorageRecord[]
  invalidRows: InvalidRow[]
  analysisResult: StorageAnalysisResult
  pricing: PricingConfig
  thresholds: ThresholdConfig
  dataSourceType: DataSourceType
  dataSourceName: string
  recordsAnalyzedCount: number
  lastAnalyzedTimestamp: string
  hasData: boolean
  isLoading: boolean
  isHydrated: boolean

  // Actions
  importCsvText: (text: string, sourceName?: string) => { validCount: number; invalidCount: number }
  importMultipleCsvFiles: (files: { name: string; content: string }[]) => { validCount: number; invalidCount: number }
  loadDemoData: () => void
  resetDataset: () => void
  updatePricing: (newPricing: Partial<PricingConfig>) => void
  updateThresholds: (newThresholds: Partial<ThresholdConfig>) => void
  deleteRecord: (id: string) => void
  updateRecord: (id: string, updates: Partial<StorageRecord>) => void
  downloadSampleCsv: () => void
  downloadInvalidRowsCsv: () => void
}

const defaultPricing: PricingConfig = {
  STANDARD: 2.0,
  STANDARD_IA: 1.25,
  ONEZONE_IA: 1.00,
  GLACIER: 0.40,
  DEEP_ARCHIVE: 0.10,
  currency: 'INR'
}

const defaultThresholds: ThresholdConfig = {
  inactiveDays: 180,
  highlyInactiveDays: 365,
  largeFileSizeGB: 10
}

const StorageDataContext = createContext<StorageDataContextType | undefined>(undefined)

export function StorageDataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<StorageRecord[]>([])
  const [invalidRows, setInvalidRows] = useState<InvalidRow[]>([])
  const [pricing, setPricing] = useState<PricingConfig>(defaultPricing)
  const [thresholds, setThresholds] = useState<ThresholdConfig>(defaultThresholds)
  const [dataSourceType, setDataSourceType] = useState<DataSourceType>('NONE')
  const [dataSourceName, setDataSourceName] = useState<string>('No Dataset Loaded')
  const [lastAnalyzedTimestamp, setLastAnalyzedTimestamp] = useState<string>('None')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isHydrated, setIsHydrated] = useState<boolean>(false)

  // STEP 1: Check whether a previously uploaded dataset exists in localStorage on startup
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed: PersistedState = JSON.parse(raw)
          if (parsed && Array.isArray(parsed.dataset) && parsed.dataset.length > 0) {
            setRecords(parsed.dataset)
            setDataSourceType(parsed.source || 'CSV')
            setDataSourceName(parsed.fileName || 'Uploaded Dataset.csv')
            setLastAnalyzedTimestamp(parsed.lastAnalyzed || 'Restored from local storage')
            if (parsed.pricing) setPricing(parsed.pricing)
            if (parsed.thresholds) setThresholds(parsed.thresholds)
            setIsHydrated(true)
            return
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse persisted dataset from localStorage:', e)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
      toast.error('Saved dataset could not be restored. Please upload the CSV again.')
    }
    // If no dataset exists or parsing fails: keep empty state
    setRecords([])
    setDataSourceType('NONE')
    setDataSourceName('No Dataset Loaded')
    setLastAnalyzedTimestamp('None')
    setIsHydrated(true)
  }, [])

  // Auto-persist dataset whenever records, source, pricing, or thresholds change
  useEffect(() => {
    if (!isHydrated) return

    try {
      if (typeof window !== 'undefined') {
        if (records.length > 0 && dataSourceType !== 'NONE') {
          const stateToSave: PersistedState = {
            source: dataSourceType,
            fileName: dataSourceName,
            recordCount: records.length,
            dataset: records,
            lastAnalyzed: lastAnalyzedTimestamp,
            pricing,
            thresholds
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (e: any) {
      console.error('Failed to save dataset to localStorage:', e)
      if (e?.name === 'QuotaExceededError' || e?.code === 22) {
        toast.error('Dataset is too large to persist in browser storage. Please upload it again after refresh.')
      }
    }
  }, [records, dataSourceType, dataSourceName, lastAnalyzedTimestamp, pricing, thresholds, isHydrated])

  // Single source of truth calculation engine
  const analysisResult = useMemo(() => {
    return analyzeStorageDataset(records, pricing, thresholds)
  }, [records, pricing, thresholds])

  // Single CSV text import
  const importCsvText = useCallback((text: string, sourceName = 'Uploaded Dataset.csv') => {
    setIsLoading(true)
    const rawRows = parseCsvFileContent(text)
    const { validRecords, invalidRows: errors } = validateCsvRows(rawRows, thresholds)

    const timestamp = new Date().toISOString()
    setRecords(validRecords)
    setInvalidRows(errors)
    setDataSourceType('CSV')
    setDataSourceName(sourceName)
    setLastAnalyzedTimestamp(timestamp)
    setIsLoading(false)

    return { validCount: validRecords.length, invalidCount: errors.length }
  }, [thresholds])

  // Multi-CSV files import (replaces old dataset, combines and deduplicates new rows)
  const importMultipleCsvFiles = useCallback((files: { name: string; content: string }[]) => {
    setIsLoading(true)
    let allRawRows: Record<string, string>[] = []

    files.forEach(f => {
      const rows = parseCsvFileContent(f.content)
      allRawRows = allRawRows.concat(rows)
    })

    const { validRecords, invalidRows: errors } = validateCsvRows(allRawRows, thresholds)
    const timestamp = new Date().toISOString()
    const label = files.length === 1
      ? files[0].name
      : `${files.length} Combined Datasets (${files.map(f => f.name).join(', ')})`

    setRecords(validRecords)
    setInvalidRows(errors)
    setDataSourceType('CSV')
    setDataSourceName(label)
    setLastAnalyzedTimestamp(timestamp)
    setIsLoading(false)

    return { validCount: validRecords.length, invalidCount: errors.length }
  }, [thresholds])

  // Load built-in demo dataset
  const loadDemoData = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      const demoCsv = generateSampleCsvString()
      const rawRows = parseCsvFileContent(demoCsv)
      const { validRecords, invalidRows: errors } = validateCsvRows(rawRows, thresholds)
      const timestamp = new Date().toISOString()

      setRecords(validRecords)
      setInvalidRows(errors)
      setDataSourceType('DEMO')
      setDataSourceName('Built-in Demo Dataset')
      setLastAnalyzedTimestamp(timestamp)
      setIsLoading(false)

      toast.success('Loaded sample cloud storage dataset! 41 objects analyzed.', {
        icon: '📊',
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 400)
  }, [thresholds])

  // Reset to empty state (explicitly cleans localStorage)
  const resetDataset = useCallback(() => {
    setRecords([])
    setInvalidRows([])
    setDataSourceType('NONE')
    setDataSourceName('No Dataset Loaded')
    setLastAnalyzedTimestamp('None')

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {}

    toast('Dataset removed. Dashboard reset to empty state.', { icon: '🧹' })
  }, [])

  // Update pricing rates
  const updatePricing = useCallback((newPricing: Partial<PricingConfig>) => {
    setPricing(prev => ({ ...prev, ...newPricing }))
    toast.success('Storage tier pricing updated! All ROI calculations refreshed.', { icon: '💰' })
  }, [])

  // Update thresholds
  const updateThresholds = useCallback((newThresholds: Partial<ThresholdConfig>) => {
    setThresholds(prev => ({ ...prev, ...newThresholds }))
    toast.success('Inspection thresholds updated! Re-evaluating inactivity rules.', { icon: '⚙️' })
  }, [])

  // Delete a single file record
  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  // Update a single file record
  const updateRecord = useCallback((id: string, updates: Partial<StorageRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [])

  // Download Sample CSV
  const downloadSampleCsv = useCallback(() => {
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(generateSampleCsvString())
    const link = document.createElement("a")
    link.setAttribute("href", csvContent)
    link.setAttribute("download", "cloudcut_sample_storage_dataset.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Downloaded sample CSV template!', { icon: '📥' })
  }, [])

  // Download Invalid Rows CSV
  const downloadInvalidRowsCsv = useCallback(() => {
    if (invalidRows.length === 0) {
      toast('No invalid rows detected in current import.', { icon: 'ℹ️' })
      return
    }
    let csv = "Row Number,File Name,Errors,Raw Row Data\n"
    invalidRows.forEach(ir => {
      const rawJson = JSON.stringify(ir.rawRow).replace(/"/g, '""')
      csv += `"${ir.rowNumber}","${ir.fileName}","${ir.errors.join('; ')}","${rawJson}"\n`
    })
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    const link = document.createElement("a")
    link.setAttribute("href", csvContent)
    link.setAttribute("download", "cloudcut_invalid_rows_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Downloaded invalid rows report!', { icon: '📥' })
  }, [invalidRows])

  return (
    <StorageDataContext.Provider
      value={{
        records,
        invalidRows,
        analysisResult,
        pricing,
        thresholds,
        dataSourceType,
        dataSourceName,
        recordsAnalyzedCount: records.length,
        lastAnalyzedTimestamp,
        hasData: records.length > 0 && dataSourceType !== 'NONE',
        isLoading,
        isHydrated,
        importCsvText,
        importMultipleCsvFiles,
        loadDemoData,
        resetDataset,
        updatePricing,
        updateThresholds,
        deleteRecord,
        updateRecord,
        downloadSampleCsv,
        downloadInvalidRowsCsv
      }}
    >
      {children}
    </StorageDataContext.Provider>
  )
}

export function useStorageData() {
  const context = useContext(StorageDataContext)
  if (!context) {
    throw new Error('useStorageData must be used within a StorageDataProvider')
  }
  return context
}
