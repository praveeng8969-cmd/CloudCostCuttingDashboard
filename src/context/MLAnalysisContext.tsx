'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useStorageData } from '@/context/StorageDataContext'
import { buildOptimizationSummary } from '@/lib/services/mlOptimization'
import { AnalysisJobStatus, MLModelInfo, MLPrediction, SharedMLAnalysis } from '@/types/ml'

interface MLAnalysisContextType {
  analysis: SharedMLAnalysis | null
  modelInfo: MLModelInfo | null
  modelStatus: 'checking' | 'ready' | 'offline'
  isAnalyzing: boolean
  error: string
  isFresh: boolean
  jobStatus: AnalysisJobStatus
  statusMessage: string
  optimization: ReturnType<typeof buildOptimizationSummary>
  retryAnalysis: () => Promise<void>
}

const MLAnalysisContext = createContext<MLAnalysisContextType | undefined>(undefined)

function fingerprintDataset(userId: string, datasetName: string, records: ReturnType<typeof useStorageData>['records'], pricing: ReturnType<typeof useStorageData>['pricing']): string {
  let hash = 2166136261
  const source = `${userId}|${datasetName}|${JSON.stringify(pricing)}|${records.length}|${records.map(record => `${record.id}:${record.sizeGB}:${record.ageDays}:${record.storageClass}:${record.fileType}`).join('|')}`
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error('Storage analysis could not be completed.')
  return data
}

export function MLAnalysisProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { records, pricing, dataSourceName, hasData, isHydrated } = useStorageData()
  const customerId = user?.id || 'guest_user'
  const datasetFingerprint = useMemo(
    () => fingerprintDataset(customerId, dataSourceName, records, pricing),
    [customerId, dataSourceName, pricing, records]
  )
  const storageKey = `cloudcut_ml_analysis_${customerId}`
  const jobStorageKey = `cloudcut_analysis_job_${customerId}`
  const [analysis, setAnalysis] = useState<SharedMLAnalysis | null>(null)
  const [modelInfo, setModelInfo] = useState<MLModelInfo | null>(null)
  const [modelStatus, setModelStatus] = useState<'checking' | 'ready' | 'offline'>('checking')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [jobStatus, setJobStatus] = useState<AnalysisJobStatus>('PENDING')

  useEffect(() => {
    if (!isHydrated) return
    try {
      const raw = localStorage.getItem(storageKey)
      const stored = raw ? JSON.parse(raw) as SharedMLAnalysis : null
      const valid = stored?.customerId === customerId && stored.datasetFingerprint === datasetFingerprint
      setAnalysis(valid ? stored : null)
      setJobStatus(valid ? 'COMPLETED' : 'PENDING')
      if (!valid) {
        localStorage.removeItem(storageKey)
        localStorage.setItem(jobStorageKey, JSON.stringify({ datasetFingerprint, status: 'PENDING' }))
      }
    } catch {
      setAnalysis(null)
      setJobStatus('PENDING')
    }
  }, [customerId, datasetFingerprint, isHydrated, jobStorageKey, storageKey])

  useEffect(() => {
    let active = true
    Promise.all([fetch('/api/ml/health', { cache: 'no-store' }), fetch('/api/ml/model-info', { cache: 'no-store' })])
      .then(async ([healthResponse, infoResponse]) => {
        const health = await readJson(healthResponse)
        const info = await readJson(infoResponse)
        if (!active) return
        const normalized: MLModelInfo = {
          modelName: info.model_name,
          modelVersion: info.model_version,
          algorithm: info.algorithm,
          trainingDatasetType: info.training_dataset_type,
          metrics: {
            accuracy: info.model.accuracy,
            precision: info.model.precision_weighted,
            recall: info.model.recall_weighted,
            f1: info.model.f1_weighted
          }
        }
        setModelInfo(normalized)
        setModelStatus(health.model_loaded ? 'ready' : 'offline')
        setAnalysis(current => current?.modelVersion === normalized.modelVersion ? current : null)
      })
      .catch(() => active && setModelStatus('offline'))
    return () => { active = false }
  }, [])

  const analyzeCurrentDataset = useCallback(async () => {
    if (!hasData || isAnalyzing) return
    setIsAnalyzing(true)
    setError('')
    setJobStatus('VALIDATING')
    localStorage.setItem(jobStorageKey, JSON.stringify({ datasetFingerprint, status: 'VALIDATING' }))
    try {
      if (records.length === 0 || records.some(record => !record.id || !Number.isFinite(record.sizeGB) || record.sizeGB < 0)) {
        throw new Error('The active storage dataset contains invalid records.')
      }
      setJobStatus('PROCESSING')
      localStorage.setItem(jobStorageKey, JSON.stringify({ datasetFingerprint, status: 'PROCESSING' }))
      const predictions: MLPrediction[] = []
      let responseModelVersion = modelInfo?.modelVersion || 'unknown'
      for (let start = 0; start < records.length; start += 500) {
        const files = records.slice(start, start + 500).map(record => ({
          file_id: record.id,
          size_gb: record.sizeGB,
          days_since_last_accessed: typeof record.ageDays === 'number' && Number.isFinite(record.ageDays) ? record.ageDays : null,
          storage_class: record.storageClass,
          file_type: record.fileType
        }))
        const response = await fetch('/api/ml/predict', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files })
        })
        const data = await readJson(response)
        responseModelVersion = data.model_version || responseModelVersion
        predictions.push(...data.predictions.map((item: any) => ({
          fileId: item.file_id,
          prediction: item.predicted_class,
          confidence: item.confidence,
          explanation: item.explanation,
          probabilities: item.probabilities
        })))
      }
      const nextAnalysis: SharedMLAnalysis = {
        customerId,
        datasetId: dataSourceName,
        datasetFingerprint,
        modelVersion: responseModelVersion,
        analyzedAt: new Date().toISOString(),
        predictions
      }
      localStorage.setItem(storageKey, JSON.stringify(nextAnalysis))
      localStorage.setItem(jobStorageKey, JSON.stringify({ datasetFingerprint, status: 'COMPLETED', completedAt: nextAnalysis.analyzedAt }))
      setAnalysis(nextAnalysis)
      setJobStatus('COMPLETED')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Storage analysis could not be completed.')
      setModelStatus('offline')
      setJobStatus('FAILED')
      localStorage.setItem(jobStorageKey, JSON.stringify({ datasetFingerprint, status: 'FAILED' }))
    } finally {
      setIsAnalyzing(false)
    }
  }, [customerId, dataSourceName, datasetFingerprint, hasData, isAnalyzing, jobStorageKey, modelInfo?.modelVersion, records, storageKey])

  const isFresh = Boolean(analysis && analysis.datasetFingerprint === datasetFingerprint && analysis.customerId === customerId && (!modelInfo || analysis.modelVersion === modelInfo.modelVersion))
  const optimization = useMemo(
    () => buildOptimizationSummary(records, isFresh ? analysis?.predictions || [] : [], pricing),
    [analysis?.predictions, isFresh, pricing, records]
  )

  useEffect(() => {
    if (!isHydrated || !hasData || isFresh || isAnalyzing || jobStatus === 'FAILED') return
    if (modelStatus === 'ready') void analyzeCurrentDataset()
    if (modelStatus === 'offline') {
      setJobStatus('FAILED')
      setError('Storage optimization recommendations are temporarily unavailable. Current usage and cost calculations remain available.')
    }
  }, [analyzeCurrentDataset, hasData, isAnalyzing, isFresh, isHydrated, jobStatus, modelStatus])

  const retryAnalysis = useCallback(async () => {
    setJobStatus('PENDING')
    setModelStatus('checking')
    setError('')
    try {
      const response = await fetch('/api/ml/health', { cache: 'no-store' })
      const health = await readJson(response)
      if (!health.model_loaded) throw new Error('Storage optimization recommendations are temporarily unavailable.')
      setModelStatus('ready')
    } catch (caught) {
      setModelStatus('offline')
      setJobStatus('FAILED')
      setError(caught instanceof Error ? caught.message : 'Storage analysis could not be completed.')
    }
  }, [])

  const statusMessage = !hasData
    ? 'Upload your storage data to get started.'
    : jobStatus === 'VALIDATING'
      ? 'Checking uploaded data'
      : jobStatus === 'PROCESSING' || jobStatus === 'PENDING'
        ? 'Analyzing your storage data. Results will appear automatically.'
        : jobStatus === 'COMPLETED'
          ? 'Storage analysis completed.'
          : 'Storage analysis could not be completed.'

  return <MLAnalysisContext.Provider value={{ analysis: isFresh ? analysis : null, modelInfo, modelStatus, isAnalyzing, error, isFresh, jobStatus, statusMessage, optimization, retryAnalysis }}>{children}</MLAnalysisContext.Provider>
}

export function useMLAnalysis() {
  const context = useContext(MLAnalysisContext)
  if (!context) throw new Error('useMLAnalysis must be used within MLAnalysisProvider')
  return context
}
