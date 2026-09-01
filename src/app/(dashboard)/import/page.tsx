'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  UploadCloud, FileText, Download, CheckCircle2, AlertTriangle,
  Trash2, ArrowRight, Sparkles, Layers, RefreshCw, X, FileSpreadsheet,
  FolderOpen
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { useStorageData } from '@/context/StorageDataContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface UploadedFileItem {
  id: string
  file: File
  name: string
  sizeBytes: number
  content: string
}

export default function ImportPage() {
  const router = useRouter()
  const {
    importMultipleCsvFiles,
    loadDemoData,
    downloadSampleCsv,
    downloadInvalidRowsCsv,
    invalidRows,
    recordsAnalyzedCount,
    dataSourceName,
    hasData
  } = useStorageData()

  const [files, setFiles] = useState<UploadedFileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [importStats, setImportStats] = useState<{ valid: number; invalid: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  function handleFileSelection(selectedFiles: FileList | File[]) {
    const fileArray = Array.from(selectedFiles)

    fileArray.forEach(f => {
      if (!f.name.endsWith('.csv') && !f.type.includes('csv') && !f.type.includes('text')) {
        toast.error(`"${f.name}" is not a CSV file.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFiles(prev => [
          ...prev,
          {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            file: f,
            name: f.name,
            sizeBytes: f.size,
            content
          }
        ])
      }
      reader.readAsText(f)
    })
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files)
    }
  }

  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  function handleProcessData() {
    if (files.length === 0) {
      toast.error('Please upload or select at least one CSV file to process.')
      return
    }

    setProcessing(true)
    setTimeout(() => {
      const fileData = files.map(f => ({ name: f.name, content: f.content }))
      const { validCount, invalidCount } = importMultipleCsvFiles(fileData)
      setProcessing(false)
      setImportStats({ valid: validCount, invalid: invalidCount })

      if (validCount > 0) {
        toast.success(`Processed ${validCount.toLocaleString()} storage records! Saved locally.`, {
          icon: '✨',
          duration: 4000,
          style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
        })
        // Immediately navigate to dynamic dashboard
        router.push('/dashboard')
      } else {
        toast.error('No valid records found in the provided CSV file(s). Check required columns.')
      }
    }, 600)
  }

  function handleLoadDemo() {
    loadDemoData()
    router.push('/dashboard')
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        title="Import Cloud Storage Data"
        subtitle="Upload a CSV containing your cloud storage usage data."
        badge={hasData ? `${recordsAnalyzedCount} Active Records` : 'No Dataset Loaded'}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={downloadSampleCsv}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Download Sample CSV
            </button>
            <button
              onClick={handleLoadDemo}
              className="btn-yellow text-xs flex items-center gap-1.5 font-black"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-950" />
              Load Demo Dataset
            </button>
          </div>
        }
      />

      {/* Dataset Status Banner if Not Loaded */}
      {!hasData && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white">No Dataset Loaded</p>
              <p className="text-[11px] text-amber-200/80">Upload a CSV dataset to calculate your cloud storage metrics and savings.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
            >
              Browse Files
            </button>
            <button
              onClick={handleLoadDemo}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-xl font-black transition-colors"
            >
              Load Demo Dataset
            </button>
          </div>
        </div>
      )}

      {/* Main Drag-and-Drop Card */}
      <div className="card p-6 md:p-8 w-full min-w-0 card-glow-blue">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFileSelection(e.target.files)}
        />

        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4',
            isDragging
              ? 'border-blue-400 bg-blue-950/40 scale-[1.01]'
              : 'border-slate-700/80 hover:border-blue-500/60 bg-slate-900/60 hover:bg-slate-900/80'
          )}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20">
            <UploadCloud className="w-8 h-8 text-white" />
          </div>

          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Drag & Drop your Cloud Storage CSV file(s) here
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
              Supports single or multi-file uploads. Merges rows, normalizes column headers, and saves locally to your browser.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-blue-500 transition-colors flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Browse Files from Computer
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            Supported columns: <strong className="text-slate-200">file_name, size_gb, last_accessed, storage_class, file_type, bucket</strong>
          </p>
        </div>

        {/* Selected Files Preview List */}
        {files.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Staged Files for Processing ({files.length}):
              </span>
              <button
                onClick={() => setFiles([])}
                className="text-xs text-rose-400 hover:underline font-bold"
              >
                Clear all files
              </button>
            </div>

            <div className="space-y-2">
              {files.map(f => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-bold text-white truncate">{f.name}</span>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 font-mono">
                      ({(f.sizeBytes / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                    className="p-1 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg transition-colors flex-shrink-0 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={handleProcessData}
                disabled={processing}
                className="btn-emerald text-sm py-2.5 px-6 font-black shadow-lg"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-1.5" />
                    Parsing & Analyzing Storage...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Process & Analyze Dataset ({files.length} {files.length === 1 ? 'file' : 'files'})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Results & Feedback Banner */}
      {importStats && (
        <div className="card p-6 border border-slate-700 w-full min-w-0 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="section-title flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Data Validation Summary
              </h3>
              <p className="section-sub">
                Successfully parsed and categorized your uploaded cloud storage dataset.
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 flex-shrink-0"
            >
              Open Dynamic Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Valid Records Indexed</p>
                <p className="text-2xl font-black text-white mt-0.5">{importStats.valid.toLocaleString()}</p>
              </div>
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>

            <div className={clsx(
              'p-4 rounded-xl border flex items-center justify-between',
              importStats.invalid > 0
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-slate-900/60 border-slate-800'
            )}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Invalid / Skipped Rows</p>
                <p className={clsx('text-2xl font-black mt-0.5', importStats.invalid > 0 ? 'text-amber-300' : 'text-slate-400')}>
                  {importStats.invalid}
                </p>
              </div>
              {importStats.invalid > 0 && (
                <button
                  onClick={downloadInvalidRowsCsv}
                  className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export Errors
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expected Format Specification Card */}
      <div className="card p-6 border border-slate-800 w-full min-w-0">
        <h3 className="section-title mb-2">Expected CSV File Structure</h3>
        <p className="section-sub mb-4">Your CSV file should contain standard comma-separated column headers as shown below:</p>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300 font-mono">
                <th className="text-left py-2.5 px-3">file_name</th>
                <th className="text-left py-2.5 px-3">size_gb</th>
                <th className="text-left py-2.5 px-3">last_accessed</th>
                <th className="text-left py-2.5 px-3">storage_class</th>
                <th className="text-left py-2.5 px-3">file_type</th>
                <th className="text-left py-2.5 px-3">bucket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
              <tr>
                <td className="py-2.5 px-3 text-white">backup_2023.zip</td>
                <td className="py-2.5 px-3 text-cyan-300">50</td>
                <td className="py-2.5 px-3">2025-07-01</td>
                <td className="py-2.5 px-3">STANDARD</td>
                <td className="py-2.5 px-3">Backup</td>
                <td className="py-2.5 px-3">company-backups</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-white">report_final.pdf</td>
                <td className="py-2.5 px-3 text-cyan-300">2</td>
                <td className="py-2.5 px-3">2026-08-20</td>
                <td className="py-2.5 px-3">STANDARD</td>
                <td className="py-2.5 px-3">Document</td>
                <td className="py-2.5 px-3">reports</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-white">old_logs.zip</td>
                <td className="py-2.5 px-3 text-cyan-300">30</td>
                <td className="py-2.5 px-3">2025-01-10</td>
                <td className="py-2.5 px-3">STANDARD</td>
                <td className="py-2.5 px-3">Logs</td>
                <td className="py-2.5 px-3">logs-bucket</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
