'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  UploadCloud, FileText, Download, CheckCircle2, AlertTriangle,
  Trash2, RefreshCw, X, FolderOpen
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
  const [importStats, setImportStats] = useState<{ validCount: number; invalidCount: number } | null>(null)
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

  function handleRemoveFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  function handleProcessFiles() {
    if (files.length === 0) return

    setProcessing(true)
    setTimeout(() => {
      try {
        const filePayload = files.map(f => ({ name: f.name, content: f.content }))
        const stats = importMultipleCsvFiles(filePayload)

        setImportStats(stats)
        setProcessing(false)

        if (stats.validCount > 0) {
          toast.success(`Successfully analyzed ${stats.validCount} records!`)
        } else {
          toast.error('No valid records found in the provided CSV file(s).')
        }
      } catch (err: any) {
        setProcessing(false)
        toast.error(err?.message || 'Error parsing CSV data.')
      }
    }, 400)
  }

  function handleLoadDemo() {
    loadDemoData()
    router.push('/dashboard')
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12 max-w-4xl">
      <PageHeader
        title="Import Storage Data"
        subtitle="Upload a CSV containing cloud storage metadata to analyze usage, estimated cost, and optimization opportunities."
        actions={
          <button
            onClick={downloadSampleCsv}
            className="btn-secondary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV
          </button>
        }
      />

      {/* Upload Section */}
      <div className="card p-6 bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-xl shadow-sm relative overflow-hidden">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            if (e.dataTransfer.files?.length) {
              handleFileSelection(e.dataTransfer.files)
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors select-none shadow-sm',
            isDragging
              ? 'border-blue-500 bg-blue-50/80'
              : 'border-slate-300 hover:border-slate-400 bg-white/95 hover:bg-white'
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".csv,text/csv"
            onChange={(e) => {
              if (e.target.files?.length) {
                handleFileSelection(e.target.files)
              }
            }}
            className="hidden"
          />

          <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-5 h-5 text-blue-600" />
          </div>

          <h3 className="text-sm font-semibold text-slate-900">
            Upload CSV
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Drag and drop your file here, or <span className="text-blue-600 font-medium hover:underline">browse local files</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Supported format: <strong>.csv</strong> (UTF-8 metadata records)
          </p>
        </div>

        {/* Selected Files Queue */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-900">Queued Files ({files.length})</span>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              {files.map(f => (
                <div key={f.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="font-medium text-slate-900 truncate">{f.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({(f.sizeBytes / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(f.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleProcessFiles}
                disabled={processing}
                className="btn-primary"
              >
                {processing ? 'Processing CSV...' : `Analyze ${files.length} File${files.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post-Import Results Banner */}
      {importStats && (
        <div className="card p-5 bg-white border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Import Completed</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Valid Records</span>
              <span className="text-base font-bold text-slate-900">{importStats.validCount.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-slate-500 block">Invalid Rows</span>
              <span className="text-base font-bold text-slate-900">{importStats.invalidCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {importStats.invalidCount > 0 && (
              <button
                onClick={downloadInvalidRowsCsv}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium"
              >
                Download invalid rows report
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary ml-auto text-xs"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Demo Dataset Option */}
      <div className="card p-5 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Need sample data to explore?
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Load our pre-configured demo dataset to test cost analytics, duplicate detection, and reports.
          </p>
        </div>

        <button
          onClick={handleLoadDemo}
          className="btn-secondary text-xs"
        >
          Load Demo Dataset
        </button>
      </div>
    </div>
  )
}
