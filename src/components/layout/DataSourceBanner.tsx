'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Database, UploadCloud, RefreshCw, Trash2, CheckCircle2, AlertTriangle, FileSpreadsheet, Sparkles } from 'lucide-react'
import { useStorageData } from '@/context/StorageDataContext'
import Modal from '@/components/ui/Modal'

export default function DataSourceBanner() {
  const {
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
  }

  return (
    <>
      <div className="mb-6 p-4 rounded-2xl bg-slate-900/85 border border-slate-700/80 shadow-lg backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full min-w-0">
        {/* Left Status & Source Indicator */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Data Source:</span>
              <span className="text-xs font-black text-white truncate max-w-[280px] sm:max-w-md">
                {dataSourceName}
              </span>
              {hasData ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3" /> Live Telemetry
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                  <AlertTriangle className="w-3 h-3" /> Empty State
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 truncate">
              {hasData ? (
                <>
                  <strong className="text-white font-bold">{recordsAnalyzedCount.toLocaleString()}</strong> records analyzed · Last updated: <span className="text-slate-300">{lastAnalyzedTimestamp}</span>
                </>
              ) : (
                <span>No storage data loaded. Upload a CSV dataset to calculate metrics.</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0 w-full md:w-auto justify-end">
          <Link
            href="/import"
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Import Storage Data
          </Link>

          {!hasData ? (
            <button
              onClick={loadDemoData}
              className="btn-yellow text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-950" />
              Load Demo Dataset
            </button>
          ) : (
            <button
              onClick={() => setResetModal(true)}
              className="btn-ghost text-xs py-1.5 px-2.5 text-rose-400 hover:bg-rose-950/40 border border-rose-500/30 rounded-xl"
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
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Are you sure you want to clear the currently loaded cloud storage dataset?
          </p>
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300">
            All dynamically calculated metrics and charts will return to an empty state until a new CSV dataset is imported.
          </div>
        </div>
      </Modal>
    </>
  )
}
