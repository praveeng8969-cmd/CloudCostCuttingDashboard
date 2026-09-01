'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react'
import {
  StorageRecord, InvalidRow, StorageAnalysisResult,
  PricingConfig, ThresholdConfig
} from '@/types/storage'
import { parseCsvFileContent } from '@/lib/services/dataParser'
import { validateCsvRows } from '@/lib/services/dataValidator'
import { analyzeStorageDataset } from '@/lib/services/storageAnalyzer'
import { generateSampleCsvString, SAMPLE_CSV_HEADER } from '@/lib/services/demoDataset'
import toast from 'react-hot-toast'

interface StorageDataContextType {
  records: StorageRecord[]
  invalidRows: InvalidRow[]
  analysisResult: StorageAnalysisResult
  pricing: PricingConfig
  thresholds: ThresholdConfig
  dataSourceName: string
  recordsAnalyzedCount: number
  lastAnalyzedTimestamp: string
  hasData: boolean
  isLoading: boolean

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
  const [dataSourceName, setDataSourceName] = useState<string>('Demo Dataset')
  const [lastAnalyzedTimestamp, setLastAnalyzedTimestamp] = useState<string>('Just now')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Initialize with realistic demo dataset on initial client load
  useEffect(() => {
    try {
      const demoCsv = generateSampleCsvString()
      const rawRows = parseCsvFileContent(demoCsv)
      const { validRecords, invalidRows } = validateCsvRows(rawRows, defaultThresholds)
      setRecords(validRecords)
      setInvalidRows(invalidRows)
      setDataSourceName('Demo Cloud Storage Dataset (Built-in)')
      setLastAnalyzedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      console.error('Failed to load initial demo dataset', e)
    }
  }, [])

  // Single source of truth calculation engine
  const analysisResult = useMemo(() => {
    return analyzeStorageDataset(records, pricing, thresholds)
  }, [records, pricing, thresholds])

  // Single CSV text import
  const importCsvText = useCallback((text: string, sourceName = 'Uploaded Dataset.csv') => {
    setIsLoading(true)
    const rawRows = parseCsvFileContent(text)
    const { validRecords, invalidRows: errors } = validateCsvRows(rawRows, thresholds)

    setRecords(validRecords)
    setInvalidRows(errors)
    setDataSourceName(sourceName)
    setLastAnalyzedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    setIsLoading(false)

    return { validCount: validRecords.length, invalidCount: errors.length }
  }, [thresholds])

  // Multi-CSV files import (combining and deduplicating rows)
  const importMultipleCsvFiles = useCallback((files: { name: string; content: string }[]) => {
    setIsLoading(true)
    let allRawRows: Record<string, string>[] = []

    files.forEach(f => {
      const rows = parseCsvFileContent(f.content)
      allRawRows = allRawRows.concat(rows)
    })

    const { validRecords, invalidRows: errors } = validateCsvRows(allRawRows, thresholds)
    setRecords(validRecords)
    setInvalidRows(errors)
    
    const label = files.length === 1
      ? files[0].name
      : `${files.length} Combined Datasets (${files.map(f => f.name).join(', ')})`
      
    setDataSourceName(label)
    setLastAnalyzedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
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
      setRecords(validRecords)
      setInvalidRows(errors)
      setDataSourceName('Demo Cloud Storage Dataset (Built-in)')
      setLastAnalyzedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      setIsLoading(false)
      toast.success('Loaded sample cloud storage dataset! 41 objects analyzed.', {
        icon: '📊',
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 400)
  }, [thresholds])

  // Reset to empty state
  const resetDataset = useCallback(() => {
    setRecords([])
    setInvalidRows([])
    setDataSourceName('No Dataset Loaded')
    setLastAnalyzedTimestamp('None')
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
        dataSourceName,
        recordsAnalyzedCount: records.length,
        lastAnalyzedTimestamp,
        hasData: records.length > 0,
        isLoading,
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
