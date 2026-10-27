'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, Cloud, Download, Eye, EyeOff, FileText, LockKeyhole, Mail, UploadCloud } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import PageHeader from '@/components/layout/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import AnalysisStatus from '@/components/features/AnalysisStatus'
import { useStorageData } from '@/context/StorageDataContext'
import { useAuth } from '@/context/AuthContext'
import { generateSampleAwsDataset, sampleConnectionStorageKey, SampleAwsAccount } from '@/lib/services/sampleAwsDataset'

interface UploadedFileItem {
  id: string
  name: string
  sizeBytes: number
  content: string
}

interface AvailableCredential {
  id: string
  company: string
  email: string
  password: string
}

export default function ImportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    activateExternalDataset,
    dataSourceType,
    downloadInvalidRowsCsv,
    downloadSampleCsv,
    hasData,
    importMultipleCsvFiles,
    invalidRows,
    pricing
  } = useStorageData()
  const [files, setFiles] = useState<UploadedFileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [availableAccounts, setAvailableAccounts] = useState<AvailableCredential[]>([])
  const [uploadVisible, setUploadVisible] = useState(false)
  const [importStats, setImportStats] = useState<{ validCount: number; invalidCount: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const awsConnected = dataSourceType === 'AWS_SAMPLE'

  useEffect(() => {
    if (window.location.search.includes('connect=aws')) setLoginOpen(true)
  }, [])

  useEffect(() => {
    if (!loginOpen || availableAccounts.length > 0) return
    fetch('/api/demo-aws/session', { cache: 'no-store' })
      .then(response => response.json())
      .then(data => setAvailableAccounts(Array.isArray(data.accounts) ? data.accounts : []))
      .catch(() => setAvailableAccounts([]))
  }, [availableAccounts.length, loginOpen])

  async function handleFileSelection(selectedFiles: FileList | File[]) {
    const fileArray = Array.from(selectedFiles)
    const invalidFile = fileArray.find(file => !file.name.toLowerCase().endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text'))
    if (invalidFile) {
      toast.error(`"${invalidFile.name}" is not a CSV file.`)
      return
    }
    setProcessing(true)
    setImportStats(null)
    try {
      const uploadedFiles = await Promise.all(fileArray.map(async file => ({
        id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        sizeBytes: file.size,
        content: await file.text()
      })))
      setFiles(uploadedFiles)
      const stats = importMultipleCsvFiles(uploadedFiles.map(file => ({ name: file.name, content: file.content })))
      setImportStats(stats)
      if (stats.validCount > 0) toast.success(`${stats.validCount} records imported. Storage analysis started automatically.`)
      else toast.error('No valid records were found. Your current dataset was not replaced.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The CSV file could not be imported.')
    } finally {
      setProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function openAwsConnection() {
    if (awsConnected) {
      router.push('/cloud-providers')
      return
    }
    setLoginError('')
    setLoginOpen(true)
  }

  async function connectAwsSample() {
    if (connecting) return
    if (!email.trim() || password.length < 8) {
      setLoginError('Enter a valid sample account email and password.')
      return
    }
    setConnecting(true)
    setLoginError('')
    try {
      const response = await fetch('/api/demo-aws/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), password })
      })
      const data = await response.json().catch(() => ({})) as { detail?: string; account?: SampleAwsAccount }
      if (!response.ok || !data.account) throw new Error(data.detail || 'Invalid sample account credentials.')
      const account = data.account
      const records = generateSampleAwsDataset(pricing, account.id)
      const timestamp = new Date().toISOString()
      activateExternalDataset(records, `${account.company} · Amazon S3 · Sample Data`, 'AWS_SAMPLE', account.company)
      localStorage.setItem(sampleConnectionStorageKey(user?.id || 'guest_user'), JSON.stringify({ accountId: account.id, connectedAt: timestamp, lastRefreshed: timestamp }))
      toast.success(`${account.company} sample storage connected. Analysis started automatically.`)
      setLoginOpen(false)
      router.push('/cloud-providers')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Invalid sample account credentials.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12 max-w-6xl">
      <PageHeader
        title="Import Data"
        subtitle="Choose how you want to add your cloud storage data."
        actions={<button onClick={downloadSampleCsv} className="btn-secondary text-xs"><Download className="w-3.5 h-3.5" />Download Sample CSV</button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ImportChoiceCard
          icon={<UploadCloud className="w-6 h-6" />}
          title="Upload Dataset"
          description="Upload a CSV file containing storage metadata to analyze usage, costs, and optimization opportunities."
          note="CSV Upload"
          buttonLabel="Upload CSV"
          onClick={() => setUploadVisible(true)}
        />
        <ImportChoiceCard
          icon={<Cloud className="w-6 h-6" />}
          title="Connect AWS"
          description="Connect your cloud storage and automatically analyze storage usage and estimated costs."
          note="Sample Data"
          buttonLabel={awsConnected ? 'View Connection' : connecting ? 'Connecting...' : 'Connect AWS'}
          onClick={openAwsConnection}
        />
      </div>

      {uploadVisible && (
        <div className="card p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div><h2 className="text-base font-semibold text-slate-900">Upload Dataset</h2><p className="text-xs text-slate-500 mt-1">Files are validated and activated immediately; analysis starts automatically.</p></div>
            <span className="badge-neutral">CSV</span>
          </div>
          <div
            onDragOver={event => { event.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={event => { event.preventDefault(); setIsDragging(false); if (event.dataTransfer.files?.length) void handleFileSelection(event.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            className={clsx('border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors select-none', isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30')}
          >
            <input type="file" ref={fileInputRef} multiple accept=".csv,text/csv" onChange={event => { if (event.target.files?.length) void handleFileSelection(event.target.files) }} className="hidden" />
            <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3"><UploadCloud className="w-5 h-5" /></div>
            <h3 className="text-sm font-semibold text-slate-900">{processing ? 'Importing and checking data...' : 'Drop CSV files here'}</h3>
            <p className="text-xs text-slate-600 mt-1">or <span className="text-blue-600 font-medium">browse local files</span></p>
            <p className="text-[11px] text-slate-400 mt-2">Supported format: .csv with UTF-8 metadata records</p>
          </div>

          {files.length > 0 && <div className="mt-5 space-y-2"><p className="text-xs font-semibold text-slate-800">Selected Files ({files.length})</p>{files.map(file => <div key={file.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center gap-2.5 text-xs"><FileText className="w-4 h-4 text-slate-500 shrink-0" /><span className="font-medium text-slate-900 truncate">{file.name}</span><span className="text-slate-400 ml-auto">{(file.sizeBytes / 1024).toFixed(1)} KB</span></div>)}</div>}
        </div>
      )}

      {importStats && (
        <div className="card p-5 bg-white border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">{importStats.validCount > 0 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}<h3 className="text-sm font-semibold text-slate-900">Import {importStats.validCount > 0 ? 'Completed' : 'Needs Attention'}</h3></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <Stat label="Valid Records" value={importStats.validCount.toLocaleString()} />
            <Stat label="Invalid Rows" value={importStats.invalidCount.toLocaleString()} />
          </div>
          <div className="flex items-center justify-between pt-2">
            {importStats.invalidCount > 0 && <button onClick={downloadInvalidRowsCsv} className="text-xs text-amber-700 hover:text-amber-800 font-medium">Download invalid rows report</button>}
            {importStats.validCount > 0 && <button onClick={() => router.push('/dashboard')} className="btn-primary ml-auto text-xs">Open Dashboard</button>}
          </div>
        </div>
      )}

      {hasData && <AnalysisStatus />}
      {invalidRows.length > 0 && !importStats && <p className="text-xs text-amber-700">The most recent import contains {invalidRows.length} invalid rows.</p>}

      <Modal
        open={loginOpen}
        onClose={() => { if (!connecting) setLoginOpen(false) }}
        title="Connect AWS"
        size="md"
        footer={<><button onClick={() => setLoginOpen(false)} disabled={connecting} className="btn-secondary text-xs">Cancel</button><button onClick={connectAwsSample} disabled={connecting} className="btn-primary text-xs min-w-[120px] justify-center">{connecting ? <LoadingSpinner size={14} className="text-white" /> : <Cloud className="w-3.5 h-3.5" />}{connecting ? 'Connecting...' : 'Connect AWS'}</button></>}
      >
        <div className="space-y-5">
          <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
            <p className="text-xs font-semibold text-orange-800">Sample AWS Environment — Demonstration</p>
            <p className="text-xs text-orange-700 mt-1">This CloudCut demo does not connect to AWS or accept real AWS credentials.</p>
          </div>
          <div><h3 className="text-sm font-semibold text-slate-900">Connect your cloud storage account</h3><p className="text-xs text-slate-500 mt-1">Enter one of the sample accounts to analyze storage usage and costs.</p></div>
          <div className="space-y-3">
            <div><label className="label">Account Email</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type="email" value={email} onChange={event => setEmail(event.target.value)} className="input pl-9" placeholder="company@cloudcut.demo" autoComplete="username" /></div></div>
            <div><label className="label">Password</label><div className="relative"><LockKeyhole className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} className="input pl-9 pr-10" placeholder="Sample account password" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
          </div>
          {loginError && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-3">{loginError}</div>}
          <div><p className="text-xs font-semibold text-slate-800 mb-2">Available Sample Accounts</p><div className="space-y-2">{availableAccounts.map(account => <button type="button" key={account.id} onClick={() => { setEmail(account.email); setPassword(account.password); setLoginError('') }} className="w-full text-left p-3 border border-slate-200 rounded-md hover:border-blue-300 hover:bg-blue-50/40 transition-colors"><span className="text-xs font-semibold text-slate-900 block">{account.company}</span><span className="text-[11px] text-slate-500 block mt-0.5">{account.email} · {account.password}</span></button>)}</div></div>
        </div>
      </Modal>
    </div>
  )
}

function ImportChoiceCard({ icon, title, description, note, buttonLabel, onClick, loading = false }: { icon: ReactNode; title: string; description: string; note: string; buttonLabel: string; onClick: () => void; loading?: boolean }) {
  return <div className="card p-6 flex flex-col min-h-[250px]"><div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">{icon}</div><div className="flex items-center gap-2 mt-5"><h2 className="text-base font-semibold text-slate-900">{title}</h2><span className="badge-neutral">{note}</span></div><p className="text-sm text-slate-600 mt-2 leading-relaxed flex-1">{description}</p><button onClick={onClick} disabled={loading} className="btn-primary mt-6 w-full sm:w-fit justify-center">{loading ? <LoadingSpinner size={14} className="text-white" /> : icon}{buttonLabel}</button></div>
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="p-3 bg-slate-50 border border-slate-200 rounded"><span className="text-slate-500 block">{label}</span><span className="text-base font-bold text-slate-900">{value}</span></div>
}
