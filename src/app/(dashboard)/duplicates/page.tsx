'use client'

import { useState, useMemo } from 'react'
import { Search, Trash2, CheckSquare, Square, Copy, HardDrive, DollarSign, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/layout/PageHeader'
import { duplicateFilesData } from '@/lib/mockData'
import type { DuplicateFile } from '@/types'
import clsx from 'clsx'

export default function DuplicatesPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteModal, setDeleteModal] = useState(false)
  const [fileList, setFileList] = useState<DuplicateFile[]>(duplicateFilesData)

  const filtered = useMemo(() =>
    fileList.filter(f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.type.toLowerCase().includes(search.toLowerCase()) ||
      f.original.toLowerCase().includes(search.toLowerCase())
    ),
    [fileList, search]
  )

  const totalSelectedSavings = fileList
    .filter(f => selected.has(f.id))
    .reduce((s, f) => s + f.potentialSavingAmount, 0)

  const totalRemainingSavings = fileList.reduce((s, f) => s + f.potentialSavingAmount, 0)

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(f => f.id)))
    }
  }

  function confirmDelete() {
    const count = selected.size
    const saved = totalSelectedSavings
    setFileList(prev => prev.filter(f => !selected.has(f.id)))
    setSelected(new Set())
    setDeleteModal(false)
    toast.success(`Removed ${count} duplicate group${count > 1 ? 's' : ''}! Recovered ₹${saved.toLocaleString('en-IN')}/mo.`, {
      icon: '✨',
      duration: 5000,
      style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
    })
  }

  function resetDemo() {
    setFileList(duplicateFilesData)
    setSelected(new Set())
    toast('Duplicate inventory reset to demo baseline', { icon: '🔄' })
  }

  const allSelected = filtered.length > 0 && selected.size === filtered.length

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Standardized Page Header */}
      <PageHeader
        title="Duplicate File Cleaner & Deduplicator"
        subtitle="Detect byte-identical file copies stored across multiple directories and buckets."
        badge={`${fileList.length} Duplicate Sets`}
        actions={
          <button
            onClick={resetDemo}
            className="btn-secondary text-xs flex items-center gap-1.5 flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset Demo Data
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full min-w-0">
        <div className="card p-5 card-glow-amber flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
            <Copy className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Detected Redundancy</p>
            <p className="text-2xl font-black text-amber-300 tracking-tight truncate">{fileList.length} Sets</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">1,284 total duplicate objects</p>
          </div>
        </div>

        <div className="card p-5 card-glow-blue flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Recoverable Storage</p>
            <p className="text-2xl font-black text-blue-400 tracking-tight truncate">284 GB</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Can be reclaimed with zero data loss</p>
          </div>
        </div>

        <div className="card p-5 card-glow-emerald flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Monthly Recoverable</p>
            <p className="text-2xl font-black text-emerald-400 tracking-tight truncate">₹{totalRemainingSavings.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">₹{(totalRemainingSavings * 12).toLocaleString('en-IN')} annual recovery</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card overflow-hidden w-full min-w-0">
        <div className="p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px] w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by file name, original path or type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0">
              {selected.size > 0 && (
                <span className="text-xs font-bold text-slate-200 truncate">
                  {selected.size} selected (<span className="text-emerald-400 font-black">+₹{totalSelectedSavings.toLocaleString('en-IN')}/mo</span>)
                </span>
              )}
              <button onClick={selectAll} className="btn-secondary text-xs flex-shrink-0">
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => selected.size > 0 && setDeleteModal(true)}
                disabled={selected.size === 0}
                className={clsx(
                  'btn-danger text-xs flex-shrink-0',
                  selected.size === 0 && 'opacity-40 cursor-not-allowed hover:scale-100'
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge Selected ({selected.size})
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white">All Duplicate Redundancies Cleaned!</h3>
            <p className="text-xs text-slate-400 mt-1">Zero redundant replicas detected across all connected buckets.</p>
            <button onClick={resetDemo} className="btn-secondary text-xs mt-4">
              Reset Demo Baseline
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">
                    <button onClick={selectAll} className="flex items-center justify-center mx-auto">
                      {allSelected
                        ? <CheckSquare className="w-4 h-4 text-blue-400" />
                        : <Square className="w-4 h-4 text-slate-500" />}
                    </button>
                  </th>
                  <th className="text-left py-3.5 px-4">Duplicate File</th>
                  <th className="text-left py-3.5 px-4">Type</th>
                  <th className="text-left py-3.5 px-4">Master Location</th>
                  <th className="text-left py-3.5 px-4">Redundant Copies</th>
                  <th className="text-left py-3.5 px-4">Total Size</th>
                  <th className="text-left py-3.5 px-4">Est. Savings</th>
                  <th className="text-right py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map(f => (
                  <tr
                    key={f.id}
                    onClick={() => toggleSelect(f.id)}
                    className={clsx(
                      'cursor-pointer transition-colors group select-none',
                      selected.has(f.id) ? 'bg-blue-950/40' : 'hover:bg-slate-800/40'
                    )}
                  >
                    <td className="py-3.5 px-4 text-center">
                      {selected.has(f.id)
                        ? <CheckSquare className="w-4 h-4 text-blue-400 mx-auto" />
                        : <Square className="w-4 h-4 text-slate-600 mx-auto" />}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white max-w-[200px] truncate" title={f.name}>
                      {f.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-bold text-slate-300">
                        {f.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] max-w-[140px] truncate" title={f.original}>
                      {f.original}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-black rounded-full border border-amber-500/30">
                        {f.copies} copies
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-white">{f.size}</td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 text-xs">
                      {f.potentialSaving}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setSelected(new Set([f.id]))
                          setDeleteModal(true)
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Confirm Duplicate Deletion"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={confirmDelete} className="btn-danger">
              Confirm & Purge Copies
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span>Master copies will remain preserved. Only redundant duplicate replicas will be deleted.</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            You are about to purge <strong>{selected.size} duplicate file set{selected.size > 1 ? 's' : ''}</strong>.
          </p>

          <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs flex justify-between items-center font-bold text-emerald-300">
            <span>Estimated Savings Recovered:</span>
            <span className="text-base font-black text-emerald-400">₹{totalSelectedSavings.toLocaleString('en-IN')} / mo</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Demo Mode simulation — no destructive cloud API calls will be executed.
          </p>
        </div>
      </Modal>
    </div>
  )
}
