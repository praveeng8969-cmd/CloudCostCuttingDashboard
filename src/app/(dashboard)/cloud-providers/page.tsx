'use client'

import { type ReactNode, useState } from 'react'
import { CheckCircle2, Cloud, Database, MapPin, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useStorageData } from '@/context/StorageDataContext'
import { useMLAnalysis } from '@/context/MLAnalysisContext'
import { generateSampleAwsDataset, SAMPLE_AWS_ACCOUNT } from '@/lib/services/sampleAwsDataset'

export default function CloudProvidersPage() {
  const {
    activateExternalDataset,
    analysisResult,
    dataSourceType,
    lastAnalyzedTimestamp,
    pricing,
    records,
    resetDataset
  } = useStorageData()
  const { isAnalyzing, jobStatus } = useMLAnalysis()
  const [isConnecting, setIsConnecting] = useState(false)
  const isConnected = dataSourceType === 'AWS_SAMPLE'
  const isProcessing = isConnected && (isAnalyzing || ['PENDING', 'VALIDATING', 'PROCESSING'].includes(jobStatus))

  async function connectSampleAws() {
    if (isConnecting || isConnected) return
    setIsConnecting(true)
    await new Promise(resolve => window.setTimeout(resolve, 500))
    const sampleRecords = generateSampleAwsDataset(pricing)
    activateExternalDataset(sampleRecords, `${SAMPLE_AWS_ACCOUNT.name} · Amazon S3 · Sample Data`, 'AWS_SAMPLE')
    setIsConnecting(false)
    toast.success('Sample S3 storage connected. Analysis started automatically.')
  }

  function disconnectSampleAws() {
    resetDataset()
    toast.success('Sample AWS connection disconnected.')
  }

  const buttonLabel = isConnecting
    ? 'Connecting...'
    : isProcessing
      ? 'Analyzing storage...'
      : isConnected
        ? 'Connected'
        : 'Connect AWS'

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Cloud Connections"
        subtitle="Connect the built-in sample S3 environment and explore CloudCut with realistic storage data."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={connectSampleAws}
              disabled={isConnecting || isConnected}
              className="btn-primary text-xs min-w-[142px] justify-center"
            >
              {isConnecting || isProcessing ? <LoadingSpinner size={14} className="text-white" /> : isConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
              {buttonLabel}
            </button>
            {isConnected && (
              <button onClick={disconnectSampleAws} className="btn-secondary text-xs text-red-600">
                <Trash2 className="w-3.5 h-3.5" />Disconnect
              </button>
            )}
          </div>
        }
      />

      <div className="card p-5 border-blue-200 bg-blue-50/50 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-900">Safe demonstration environment</p>
            <span className="badge-accent">Sample Data</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">This experience uses simulated S3 metadata for demonstration. It does not authenticate or access a real AWS account.</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="card p-12 text-center">
          <Database className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-base font-semibold text-slate-900 mt-3">Explore Amazon S3 analysis</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto">Connect the built-in CloudCut demo account to load realistic backups, assets, logs, and documents. No credentials are required.</p>
        </div>
      ) : (
        <div className="card p-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center font-bold text-xs">AWS</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap"><h2 className="text-sm font-semibold text-slate-900">{SAMPLE_AWS_ACCOUNT.name}</h2><span className="badge-accent">Sample Data</span></div>
                  <p className="text-xs text-slate-500 mt-0.5">{SAMPLE_AWS_ACCOUNT.provider} · {SAMPLE_AWS_ACCOUNT.region}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-xs">
                <Info label="Connection" value={isProcessing ? 'Analyzing storage' : 'Connected'} icon={isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} />
                <Info label="Region" value={SAMPLE_AWS_ACCOUNT.region} icon={<MapPin className="w-3.5 h-3.5" />} />
                <Info label="Buckets" value={SAMPLE_AWS_ACCOUNT.buckets.length.toString()} />
                <Info label="Objects" value={records.length.toLocaleString()} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
            {SAMPLE_AWS_ACCOUNT.buckets.map(bucket => {
              const bucketRecords = records.filter(record => record.bucket === bucket)
              const storage = bucketRecords.reduce((sum, record) => sum + record.sizeGB, 0)
              return <div key={bucket} className="bg-slate-50 border border-slate-200 rounded-md p-3"><p className="text-xs font-medium text-slate-800 truncate" title={bucket}>{bucket}</p><p className="text-[11px] text-slate-500 mt-1">{bucketRecords.length} objects · {storage.toFixed(1)} GB</p></div>
            })}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-slate-500">
            <span>Total storage: <strong className="text-slate-800">{analysisResult.totalStorageGB.toLocaleString()} GB</strong></span>
            <span>Estimated monthly cost: <strong className="text-slate-800">₹{analysisResult.currentMonthlyCost.toLocaleString('en-IN')}</strong></span>
            <span>Last refreshed: <strong className="text-slate-800">{lastAnalyzedTimestamp === 'None' ? 'Processing' : new Date(lastAnalyzedTimestamp).toLocaleString()}</strong></span>
          </div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return <div className="bg-slate-50 border border-slate-200 rounded p-3"><span className="text-slate-500 block">{label}</span><strong className="text-slate-900 flex items-center gap-1.5 mt-1 truncate">{icon}{value}</strong></div>
}
