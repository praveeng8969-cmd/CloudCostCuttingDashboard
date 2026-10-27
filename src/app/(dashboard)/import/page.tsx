'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  UploadCloud, FileText, Download, CheckCircle2, AlertTriangle
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import { useStorageData } from '@/context/StorageDataContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import AnalysisStatus from '@/components/features/AnalysisStatus'

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

  async function handleFileSelection(selectedFiles: FileList | File[]) {
    const fileArray = Array.from(selectedFiles)
    const invalidFile = fileArray.find(file => !file.name.endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text'))
    if (invalidFile) {
      toast.error(`"${invalidFile.name}" is not a CSV file.`)
      return
    }
    setProcessing(true)
    setImportStats(null)
    try {
      const uploadedFiles = await Promise.all(fileArray.map(async file => ({
        id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        name: file.name,
        sizeBytes: file.size,
        content: await file.text()
      })))
      setFiles(uploadedFiles)
      const stats = importMultipleCsvFiles(uploadedFiles.map(file => ({ name: file.name, content: file.content })))
      setImportStats(stats)
      if (stats.validCount > 0) {
        toast.success(`${stats.validCount} records imported. Storage analysis started automatically.`)
      } else {
        toast.error('No valid records were found. Your current dataset was not replaced.')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The CSV file could not be imported.')
    } finally {
      setProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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

        {/* Imported Files */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
              <span className="font-semibold text-slate-900">Selected Files ({files.length})</span>
              <span>{processing ? 'Importing and checking data…' : 'Import complete'}</span>
            </div>

            <div className="space-y-2">
              {files.map(f => (
                <div key={f.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="font-medium text-slate-900 truncate">{f.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">({(f.sizeBytes / 1024).toFixed(1)} KB)</span>
                  </div>
                </div>
              ))}
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

      {hasData && <AnalysisStatus />}

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
