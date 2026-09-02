'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'
import {
  StorageRecord, InvalidRow, StorageAnalysisResult,
  PricingConfig, ThresholdConfig
} from '@/types/storage'
import { parseCsvFileContent } from '@/lib/services/dataParser'
import { validateCsvRows } from '@/lib/services/dataValidator'
import { analyzeStorageDataset } from '@/lib/services/storageAnalyzer'
import { getDemoDatasetForUser, generateSampleCsvString } from '@/lib/services/demoDataset'
import { useAuth } from '@/context/AuthContext'
import { getAllUsers } from '@/lib/services/authService'
import toast from 'react-hot-toast'

export type DataSourceType = 'CSV' | 'DEMO' | 'NONE'

interface PersistedState {
  userId: string
  source: 'CSV' | 'DEMO'
  fileName: string
  recordCount: number
  dataset: StorageRecord[]
  lastAnalyzed: string
  pricing?: PricingConfig
  thresholds?: ThresholdConfig
}

export interface CustomerSummaryItem {
  id: string
  name: string
  companyName: string
  email: string
  status: 'active' | 'disabled'
  totalStorageGB: number
  totalObjects: number
  currentMonthlyCost: number
  potentialMonthlySavings: number
  optimizationScore: number
  lastActivity: string
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

  // Admin Multi-user Helpers
  getCustomerDatasetSnapshot: (userId: string) => {
    records: StorageRecord[]
    analysis: StorageAnalysisResult
    sourceName: string
    sourceType: DataSourceType
  }
  getAllCustomerSummaries: () => CustomerSummaryItem[]
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
  const { user } = useAuth()
  const activeUserId = user?.id || 'guest_user'

  const [records, setRecords] = useState<StorageRecord[]>([])
  const [invalidRows, setInvalidRows] = useState<InvalidRow[]>([])
  const [pricing, setPricing] = useState<PricingConfig>(defaultPricing)
  const [thresholds, setThresholds] = useState<ThresholdConfig>(defaultThresholds)
  const [dataSourceType, setDataSourceType] = useState<DataSourceType>('NONE')
  const [dataSourceName, setDataSourceName] = useState<string>('No Dataset Loaded')
  const [lastAnalyzedTimestamp, setLastAnalyzedTimestamp] = useState<string>('None')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isHydrated, setIsHydrated] = useState<boolean>(false)

  // Determine user storage key
  const userStorageKey = `cloudcut_dataset_${activeUserId}`

  // STEP 1: Load or Seed user-specific dataset when user changes or mounts
  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsHydrated(false)
    try {
      const raw = localStorage.getItem(userStorageKey)
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.dataset) && parsed.dataset.length > 0) {
          setRecords(parsed.dataset)
          setDataSourceType(parsed.source || 'CSV')
          setDataSourceName(parsed.fileName || 'Active Dataset.csv')
          setLastAnalyzedTimestamp(parsed.lastAnalyzed || new Date().toISOString())
          if (parsed.pricing) setPricing(parsed.pricing)
          if (parsed.thresholds) setThresholds(parsed.thresholds)
          setIsHydrated(true)
          return
        }
      }

      // If this is a known demo customer without saved data yet, pre-populate their specific demo dataset
      if (user && user.role === 'user') {
        const demoCsv = getDemoDatasetForUser(user.id)
        const rawRows = parseCsvFileContent(demoCsv)
        const { validRecords, invalidRows: errors } = validateCsvRows(rawRows, defaultThresholds)
        const timestamp = new Date().toISOString()
        const defaultName = `${user.companyName} Initial Dataset`

        setRecords(validRecords)
        setInvalidRows(errors)
        setDataSourceType('DEMO')
        setDataSourceName(defaultName)
        setLastAnalyzedTimestamp(timestamp)

        // Save immediately for this user
        const stateToSave: PersistedState = {
          userId: user.id,
          source: 'DEMO',
          fileName: defaultName,
          recordCount: validRecords.length,
          dataset: validRecords,
          lastAnalyzed: timestamp,
          pricing: defaultPricing,
          thresholds: defaultThresholds
        }
        localStorage.setItem(userStorageKey, JSON.stringify(stateToSave))
        setIsHydrated(true)
        return
      }
    } catch (e) {
      console.error('Failed to parse persisted dataset from localStorage:', e)
    }

    // Default empty state
    setRecords([])
    setDataSourceType('NONE')
    setDataSourceName('No Dataset Loaded')
    setLastAnalyzedTimestamp('None')
    setIsHydrated(true)
  }, [activeUserId, user, userStorageKey])

  // Auto-persist dataset whenever user changes records, source, pricing, or thresholds
  useEffect(() => {
    if (!isHydrated || !user) return

    try {
      if (typeof window !== 'undefined') {
        if (records.length > 0 && dataSourceType !== 'NONE') {
          const stateToSave: PersistedState = {
            userId: user.id,
            source: dataSourceType,
            fileName: dataSourceName,
            recordCount: records.length,
            dataset: records,
            lastAnalyzed: lastAnalyzedTimestamp,
            pricing,
            thresholds
          }
          localStorage.setItem(userStorageKey, JSON.stringify(stateToSave))
        } else {
          localStorage.removeItem(userStorageKey)
        }
      }
    } catch (e: any) {
      console.error('Failed to save dataset to localStorage:', e)
    }
  }, [records, dataSourceType, dataSourceName, lastAnalyzedTimestamp, pricing, thresholds, isHydrated, user, userStorageKey])

  // Single source of truth calculation engine for active user
  const analysisResult = useMemo(() => {
    return analyzeStorageDataset(records, pricing, thresholds)
  }, [records, pricing, thresholds])

  // Single CSV text import for active user
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

  // Multi-CSV files import for active user
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

  // Load built-in demo dataset for active user
  const loadDemoData = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      const demoCsv = user ? getDemoDatasetForUser(user.id) : generateSampleCsvString()
      const rawRows = parseCsvFileContent(demoCsv)
      const { validRecords, invalidRows: errors } = validateCsvRows(rawRows, thresholds)
      const timestamp = new Date().toISOString()
      const dsName = user ? `${user.companyName} Demo Dataset` : 'Built-in Demo Dataset'

      setRecords(validRecords)
      setInvalidRows(errors)
      setDataSourceType('DEMO')
      setDataSourceName(dsName)
      setLastAnalyzedTimestamp(timestamp)
      setIsLoading(false)

      toast.success(`Loaded ${validRecords.length} objects for ${user?.companyName || 'Demo Account'}!`, {
        icon: '📊',
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 400)
  }, [thresholds, user])

  // Reset to empty state for active user only
  const resetDataset = useCallback(() => {
    setRecords([])
    setInvalidRows([])
    setDataSourceType('NONE')
    setDataSourceName('No Dataset Loaded')
    setLastAnalyzedTimestamp('None')

    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(userStorageKey)
      }
    } catch {}

    toast('Your dataset was removed. Workspace reset to empty state.', { icon: '🧹' })
  }, [userStorageKey])

  const updatePricing = useCallback((newPricing: Partial<PricingConfig>) => {
    setPricing(prev => ({ ...prev, ...newPricing }))
    toast.success('Storage tier pricing updated! ROI calculations refreshed.', { icon: '💰' })
  }, [])

  const updateThresholds = useCallback((newThresholds: Partial<ThresholdConfig>) => {
    setThresholds(prev => ({ ...prev, ...newThresholds }))
    toast.success('Inspection thresholds updated! Re-evaluating inactivity rules.', { icon: '⚙️' })
  }, [])

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  const updateRecord = useCallback((id: string, updates: Partial<StorageRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
  }, [])

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

  // Admin Helper: Load dataset snapshot for any user without altering session state
  const getCustomerDatasetSnapshot = useCallback((targetUserId: string) => {
    let custRecords: StorageRecord[] = []
    let sourceName = 'Customer Dataset'
    let sourceType: DataSourceType = 'NONE'

    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`cloudcut_dataset_${targetUserId}`)
      if (raw) {
        try {
          const parsed: PersistedState = JSON.parse(raw)
          if (parsed && Array.isArray(parsed.dataset)) {
            custRecords = parsed.dataset
            sourceName = parsed.fileName
            sourceType = parsed.source
          }
        } catch {}
      }
    }

    // If still empty and it's a known demo user, generate demo data
    if (custRecords.length === 0) {
      const demoCsv = getDemoDatasetForUser(targetUserId)
      const rawRows = parseCsvFileContent(demoCsv)
      const { validRecords } = validateCsvRows(rawRows, defaultThresholds)
      custRecords = validRecords
      sourceName = 'Demo Dataset'
      sourceType = 'DEMO'
    }

    const analysis = analyzeStorageDataset(custRecords, defaultPricing, defaultThresholds)
    return { records: custRecords, analysis, sourceName, sourceType }
  }, [])

  // Admin Helper: Get summary of all registered customer accounts and their live metrics
  const getAllCustomerSummaries = useCallback((): CustomerSummaryItem[] => {
    const allUsers = getAllUsers().filter(u => u.role === 'user')
    return allUsers.map(u => {
      const { records: userRecords, analysis } = getCustomerDatasetSnapshot(u.id)
      return {
        id: u.id,
        name: u.name,
        companyName: u.companyName,
        email: u.email,
        status: u.status,
        totalStorageGB: analysis.totalStorageGB,
        totalObjects: userRecords.length,
        currentMonthlyCost: analysis.currentMonthlyCost,
        potentialMonthlySavings: analysis.potentialMonthlySavings,
        optimizationScore: analysis.optimizationScore,
        lastActivity: u.lastLogin || u.createdAt
      }
    })
  }, [getCustomerDatasetSnapshot])

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
        downloadInvalidRowsCsv,
        getCustomerDatasetSnapshot,
        getAllCustomerSummaries
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
