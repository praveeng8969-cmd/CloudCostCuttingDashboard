'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BrainCircuit, CheckCircle2, Loader2, Play, ShieldAlert } from 'lucide-react'
import clsx from 'clsx'
import PageHeader from '@/components/layout/PageHeader'
import { useStorageData } from '@/context/StorageDataContext'

type PredictionClass = 'KEEP' | 'REVIEW' | 'ARCHIVE_CANDIDATE'

interface Prediction {
  file_id: string
  predicted_class: PredictionClass
  confidence: number
  explanation: string
}

interface ModelInfo {
  model_name: string
  model_version: string
  algorithm: string
  training_dataset_type: string
  model_loaded: boolean
  model: { accuracy: number; precision_weighted: number; recall_weighted: number; f1_weighted: number }
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'The ML request failed.')
  return data
}

export default function MlInsightsPage() {
  const { records, hasData, dataSourceName, lastAnalyzedTimestamp, isHydrated } = useStorageData()
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
  const [status, setStatus] = useState<'checking' | 'ready' | 'offline'>('checking')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([fetch('/api/ml/health', { cache: 'no-store' }), fetch('/api/ml/model-info', { cache: 'no-store' })])
      .then(async ([healthResponse, infoResponse]) => {
        const health = await readJson(healthResponse)
        const info = await readJson(infoResponse)
        if (active) {
          setStatus(health.model_loaded ? 'ready' : 'offline')
          setModelInfo(info)
        }
      })
      .catch(() => active && setStatus('offline'))
    return () => { active = false }
  }, [])

  useEffect(() => {
    setPredictions([])
    setError('')
  }, [dataSourceName, lastAnalyzedTimestamp])

  const summary = useMemo(() => ({
    KEEP: predictions.filter(item => item.predicted_class === 'KEEP').length,
    REVIEW: predictions.filter(item => item.predicted_class === 'REVIEW').length,
    ARCHIVE_CANDIDATE: predictions.filter(item => item.predicted_class === 'ARCHIVE_CANDIDATE').length
  }), [predictions])

  const predictionMap = useMemo(() => new Map(predictions.map(item => [item.file_id, item])), [predictions])

  async function analyzeDataset() {
    if (!hasData || running) return
    setRunning(true)
    setError('')
    setPredictions([])
    try {
      const allPredictions: Prediction[] = []
      for (let start = 0; start < records.length; start += 500) {
        const files = records.slice(start, start + 500).map(record => ({
          file_id: record.id,
          size_gb: record.sizeGB,
          days_since_last_accessed: Number.isFinite(record.ageDays) ? record.ageDays : null,
          storage_class: record.storageClass,
          file_type: record.fileType
        }))
        const response = await fetch('/api/ml/predict', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files })
        })
        const data = await readJson(response)
        allPredictions.push(...data.predictions)
      }
      setPredictions(allPredictions)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to analyze the current dataset.')
    } finally {
      setRunning(false)
    }
  }

  const metrics = [
    ['Accuracy', modelInfo?.model.accuracy], ['Precision', modelInfo?.model.precision_weighted],
    ['Recall', modelInfo?.model.recall_weighted], ['F1 score', modelInfo?.model.f1_weighted]
  ] as const

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader title="ML Insights" subtitle="Optional machine-learning review signals for the currently selected CloudCut dataset." badge={dataSourceName} actions={
        <button onClick={analyzeDataset} disabled={!hasData || running || status !== 'ready'} className="btn-primary">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? 'Analyzing...' : 'Analyze Current Dataset'}
        </button>
      } />

      <section className="card p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div><h2 className="section-title">Model Information</h2><p className="section-sub">Live status and held-out evaluation results.</p></div>
          <span className={clsx('inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border', status === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : status === 'checking' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-red-50 text-red-700 border-red-200')}>
            {status === 'ready' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {status === 'checking' ? 'Checking' : status === 'ready' ? 'Ready' : 'Offline'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Info label="Model" value={modelInfo?.model_name || 'Unavailable'} />
          <Info label="Algorithm" value={modelInfo?.algorithm || 'Random Forest Classifier'} />
          <Info label="Version" value={modelInfo?.model_version || '—'} />
          <Info label="Training data" value={modelInfo?.training_dataset_type || 'Synthetic storage metadata'} />
          {metrics.map(([label, value]) => <Info key={label} label={label} value={value === undefined ? '—' : `${(value * 100).toFixed(2)}%`} />)}
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Summary label="Files analyzed" value={predictions.length} color="text-blue-700" />
        <Summary label="Keep" value={summary.KEEP} color="text-emerald-700" />
        <Summary label="Review" value={summary.REVIEW} color="text-amber-700" />
        <Summary label="Archive candidates" value={summary.ARCHIVE_CANDIDATE} color="text-purple-700" />
      </section>

      {error && <div className="p-4 rounded-md border border-red-200 bg-red-50 text-sm text-red-700 flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}</div>}

      <section className="card p-0">
        <div className="p-5 border-b border-slate-200"><h2 className="section-title">Prediction Results</h2><p className="section-sub">Advisory classifications only; CloudCut never moves or deletes files automatically.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Filename</th><th className="p-3 text-right">Size</th><th className="p-3">Storage class</th><th className="p-3">Last access</th><th className="p-3">Prediction</th><th className="p-3 text-right">Confidence</th><th className="p-3 min-w-[280px]">Explanation</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {!isHydrated || running ? <tr><td colSpan={7} className="p-12 text-center text-slate-500">{running ? 'Analyzing current dataset…' : 'Loading dataset…'}</td></tr> : predictions.length === 0 ? <tr><td colSpan={7} className="p-12 text-center text-slate-500">{hasData ? 'Run ML analysis to generate predictions.' : 'Import or load a dataset before running ML analysis.'}</td></tr> : records.map(record => {
                const prediction = predictionMap.get(record.id)
                if (!prediction) return null
                return <tr key={record.id} className="hover:bg-slate-50"><td className="p-3 font-medium text-slate-900 max-w-[220px] truncate" title={record.fileName}>{record.fileName}</td><td className="p-3 text-right whitespace-nowrap">{record.sizeGB} GB</td><td className="p-3 font-mono text-[11px]">{record.storageClass}</td><td className="p-3 whitespace-nowrap">{record.lastAccessed || 'Unknown'}</td><td className="p-3"><PredictionBadge value={prediction.predicted_class} /></td><td className="p-3 text-right font-medium">{(prediction.confidence * 100).toFixed(1)}%</td><td className="p-3 text-slate-600">{prediction.explanation}</td></tr>
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5 bg-amber-50/70 border-amber-200">
        <div className="flex gap-3"><ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0" /><div><h2 className="text-sm font-semibold text-amber-900">Model limitations</h2><p className="text-xs text-amber-800 mt-1 leading-relaxed">This model is trained only on synthetic storage metadata and has not learned from customer cloud bills. Validate it with representative, labeled real-world data before production use. Predictions are review suggestions, not automatic storage actions.</p></div></div>
      </section>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-slate-200 bg-slate-50 p-3"><p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p><p className="text-sm font-semibold text-slate-900 mt-1">{value}</p></div>
}

function Summary({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="card p-4"><p className="text-xs text-slate-500">{label}</p><p className={clsx('text-2xl font-bold mt-1', color)}>{value.toLocaleString()}</p></div>
}

function PredictionBadge({ value }: { value: PredictionClass }) {
  const styles = value === 'KEEP' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : value === 'REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-purple-50 text-purple-700 border-purple-200'
  return <span className={clsx('inline-flex px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap', styles)}>{value.replace('_', ' ')}</span>
}
