'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database, UploadCloud, RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useStorageData } from '@/context/StorageDataContext'
import Modal from '@/components/ui/Modal'

export default function DataSourceBanner() {
  const router = useRouter()
  const {
    dataSourceType,
    dataSourceName,
    recordsAnalyzedCount,
    lastAnalyzedTimestamp,
    hasData,
    loadDemoData,
    resetDataset
  } = useStorageData()

  const [resetModal, setResetModal] = useState(false)

  function confirmReset() {
    resetDataset()
    setResetModal(false)
    router.push('/import')
  }

  function handleLoadDemo() {
    loadDemoData()
    router.push('/dashboard')
  }

  const formattedTimestamp = lastAnalyzedTimestamp !== 'None'
    ? lastAnalyzedTimestamp.includes('T')
      ? new Date(lastAnalyzedTimestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
      : lastAnalyzedTimestamp
    : 'None'

  return (
    <>
      <div className="card p-3.5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Status & Source Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {hasData ? dataSourceName : 'No Dataset Loaded'}
              </span>

              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {dataSourceType === 'CSV' ? 'CSV Upload' : dataSourceType === 'DEMO' ? 'Demo Dataset' : 'Inactive'}
              </span>

              {hasData ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertCircle className="w-3 h-3" /> Awaiting Upload
                </span>
              )}
            </div>

            {hasData && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                <span><strong>{recordsAnalyzedCount.toLocaleString()}</strong> objects analyzed</span>
                <span className="text-slate-300">•</span>
                <span>Analyzed: {formattedTimestamp}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0 self-start md:self-center">
          <Link
            href="/import"
            className="btn-primary"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Import Storage Data
          </Link>

          {!hasData ? (
            <button
              onClick={handleLoadDemo}
              className="btn-secondary"
            >
              Load Demo Dataset
            </button>
          ) : (
            <button
              onClick={() => setResetModal(true)}
              className="btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Remove current dataset"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Dataset
            </button>
          )}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        open={resetModal}
        onClose={() => setResetModal(false)}
        title="Confirm Dataset Reset"
        size="sm"
        footer={
          <>
            <button onClick={() => setResetModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={confirmReset} className="btn-danger">
              Remove Dataset
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            Are you sure you want to remove the current storage dataset?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
            This will clear your local dataset cache and return the dashboard to its initial empty state.
          </div>
        </div>
      </Modal>
    </>
  )
}
