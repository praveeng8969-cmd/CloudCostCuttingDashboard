'use client'

import { type ReactNode, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Cloud, Database, MapPin, RefreshCw, Repeat2, ShieldCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useStorageData } from '@/context/StorageDataContext'
import { useMLAnalysis } from '@/context/MLAnalysisContext'
import { useAuth } from '@/context/AuthContext'
import { generateSampleAwsDataset, getSampleAwsAccount, sampleConnectionStorageKey, SampleAwsAccount } from '@/lib/services/sampleAwsDataset'

interface PersistedConnection {
  accountId: string
  connectedAt: string
  lastRefreshed: string
}

export default function CloudProvidersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { activateExternalDataset, analysisResult, dataSourceType, pricing, records, resetDataset } = useStorageData()
  const { isAnalyzing, jobStatus } = useMLAnalysis()
  const [account, setAccount] = useState<SampleAwsAccount | null>(null)
  const [connection, setConnection] = useState<PersistedConnection | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const storageKey = sampleConnectionStorageKey(user?.id || 'guest_user')

  const loadConnection = useCallback(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      const stored = raw ? JSON.parse(raw) as PersistedConnection : null
      const selected = stored ? getSampleAwsAccount(stored.accountId) : null
      setConnection(selected ? stored : null)
      setAccount(selected)
    } catch {
      setConnection(null)
      setAccount(null)
    }
  }, [storageKey])

  useEffect(() => { loadConnection() }, [loadConnection])

  const isConnected = dataSourceType === 'AWS_SAMPLE' && Boolean(account && connection)
  const isProcessing = isConnected && (isAnalyzing || ['PENDING', 'VALIDATING', 'PROCESSING'].includes(jobStatus))

  async function refreshData() {
    if (!account || refreshing) return
    setRefreshing(true)
    await new Promise(resolve => window.setTimeout(resolve, 350))
    const refreshedAt = new Date().toISOString()
    activateExternalDataset(generateSampleAwsDataset(pricing, account.id), `${account.company} · Amazon S3 · Sample Data`, 'AWS_SAMPLE', account.company)
    const updated = { accountId: account.id, connectedAt: connection?.connectedAt || refreshedAt, lastRefreshed: refreshedAt }
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setConnection(updated)
    setRefreshing(false)
    toast.success(`${account.company} sample data refreshed. Analysis restarted automatically.`)
  }

  async function disconnect() {
    await fetch('/api/demo-aws/session', { method: 'DELETE' }).catch(() => undefined)
    localStorage.removeItem(storageKey)
    setAccount(null)
    setConnection(null)
    resetDataset()
    toast.success('Sample AWS connection disconnected.')
  }

  function changeAccount() {
    router.push('/import?connect=aws')
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Cloud Connections"
        subtitle="Manage the active CloudCut sample S3 environment and its analyzed storage metadata."
        actions={isConnected ? <div className="flex items-center gap-2 flex-wrap"><button onClick={refreshData} disabled={refreshing || isProcessing} className="btn-primary text-xs">{refreshing || isProcessing ? <LoadingSpinner size={14} className="text-white" /> : <RefreshCw className="w-3.5 h-3.5" />}{refreshing ? 'Refreshing...' : isProcessing ? 'Analyzing storage...' : 'Refresh Data'}</button><button onClick={changeAccount} className="btn-secondary text-xs"><Repeat2 className="w-3.5 h-3.5" />Change Account</button><button onClick={disconnect} className="btn-secondary text-xs text-red-600"><Trash2 className="w-3.5 h-3.5" />Disconnect</button></div> : <button onClick={changeAccount} className="btn-primary text-xs"><Cloud className="w-3.5 h-3.5" />Connect AWS</button>}
      />

      <div className="card p-5 border-orange-200 bg-orange-50/50 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-orange-700 shrink-0" />
        <div><div className="flex items-center gap-2 flex-wrap"><p className="text-sm font-semibold text-slate-900">Sample AWS Environment — Demonstration</p><span className="badge-accent">Sample Data</span></div><p className="text-xs text-slate-600 mt-1">This CloudCut-branded demonstration uses synthetic S3 metadata. No real AWS account or AWS credential is authenticated.</p></div>
      </div>

      {!isConnected || !account ? (
        <div className="card p-12 text-center"><Database className="w-10 h-10 text-slate-300 mx-auto" /><h2 className="text-base font-semibold text-slate-900 mt-3">No sample AWS account connected</h2><p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto">Use Connect AWS to sign in with one of the three fictional demonstration accounts.</p></div>
      ) : (
        <div className="card p-5">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-md bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center font-bold text-xs">AWS</div><div><div className="flex items-center gap-2 flex-wrap"><h2 className="text-sm font-semibold text-slate-900">{account.company}</h2><span className="badge-accent">Sample Data</span></div><p className="text-xs text-slate-500 mt-0.5">Amazon S3 · {account.profile}</p></div></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-5 text-xs">
            <Info label="Connection" value={isProcessing ? 'Analyzing storage' : 'Connected'} icon={isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} />
            <Info label="Region" value={account.region} icon={<MapPin className="w-3.5 h-3.5" />} />
            <Info label="Buckets" value={account.buckets.length.toString()} />
            <Info label="Objects" value={records.length.toLocaleString()} />
            <Info label="Last refreshed" value={connection ? new Date(connection.lastRefreshed).toLocaleString() : '—'} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
            {account.buckets.map(bucket => {
              const bucketRecords = records.filter(record => record.bucket === bucket)
              const storage = bucketRecords.reduce((sum, record) => sum + record.sizeGB, 0)
              return <div key={bucket} className="bg-slate-50 border border-slate-200 rounded-md p-3"><p className="text-xs font-medium text-slate-800 truncate" title={bucket}>{bucket}</p><p className="text-[11px] text-slate-500 mt-1">{bucketRecords.length.toLocaleString()} objects · {storage.toFixed(1)} GB</p></div>
            })}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-slate-500"><span>Total storage: <strong className="text-slate-800">{analysisResult.totalStorageGB.toLocaleString()} GB</strong></span><span>Estimated monthly storage cost: <strong className="text-slate-800">₹{analysisResult.currentMonthlyCost.toLocaleString('en-IN')}</strong></span><span>Potential savings: <strong className="text-slate-800">₹{analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}/mo</strong></span></div>
        </div>
      )}
    </div>
  )
}

function Info({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return <div className="bg-slate-50 border border-slate-200 rounded p-3"><span className="text-slate-500 block">{label}</span><strong className="text-slate-900 flex items-center gap-1.5 mt-1 truncate">{icon}{value}</strong></div>
}
