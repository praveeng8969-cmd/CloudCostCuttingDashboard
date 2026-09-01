'use client'

import { useState, useMemo } from 'react'
import { Search, Trash2, CheckSquare, Square, Copy, HardDrive, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { duplicateFilesData } from '@/lib/mockData'
import type { DuplicateFile } from '@/types'
import clsx from 'clsx'

export default function DuplicatesPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleted, setDeleted] = useState<Set<string>>(new Set())

  const filtered = useMemo(() =>
    duplicateFilesData.filter(f =>
      !deleted.has(f.id) &&
      (f.name.toLowerCase().includes(search.toLowerCase()) ||
       f.type.toLowerCase().includes(search.toLowerCase()))
    ),
    [search, deleted]
  )

  const totalSavings = filtered
    .filter(f => selected.has(f.id))
    .reduce((s, f) => s + f.potentialSavingAmount, 0)

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
    const saves = totalSavings
    setDeleted(prev => new Set([...prev, ...selected]))
    setSelected(new Set())
    setDeleteModal(false)
    toast.success(`${count} duplicate file${count > 1 ? 's' : ''} removed. Saving ₹${saves.toLocaleString('en-IN')}/month.`, { duration: 5000 })
  }

  const allSelected = filtered.length > 0 && selected.size === filtered.length

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Duplicate Files</h2>
        <p className="text-sm text-gray-500 mt-0.5">Identify and remove redundant files to recover storage and reduce costs.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Duplicate Files', value: `${filtered.length}`, full: `${duplicateFilesData.length} total`, icon: Copy, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Recoverable Storage', value: '284 GB', full: 'across all duplicates', icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Est. Monthly Savings', value: '₹12,000', full: 'if all duplicates removed', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(c => (
          <div key={c.label} className="card p-4 flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', c.bg)}>
              <c.icon className={clsx('w-5 h-5', c.color)} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className={clsx('text-xl font-bold', c.color)}>{c.value}</p>
              <p className="text-xs text-gray-400">{c.full}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 w-52"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <span className="text-xs text-gray-500">
                  {selected.size} selected · Saving <span className="font-semibold text-green-600">₹{totalSavings.toLocaleString('en-IN')}</span>
                </span>
              )}
              <button onClick={selectAll} className="btn-secondary text-xs">
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={() => selected.size > 0 && setDeleteModal(true)}
                disabled={selected.size === 0}
                className={clsx(
                  'btn-danger text-xs',
                  selected.size === 0 && 'opacity-40 cursor-not-allowed'
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected ({selected.size})
              </button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No files found' : 'No duplicates remaining!'}
            description={search ? 'Try a different search term.' : 'All duplicate files have been removed.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-4 w-10">
                    <button onClick={selectAll}>
                      {allSelected
                        ? <CheckSquare className="w-4 h-4 text-blue-600" />
                        : <Square className="w-4 h-4 text-gray-300" />}
                    </button>
                  </th>
                  {['File Name', 'Type', 'Original Location', 'Copies', 'Total Size', 'Potential Saving', 'Action'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(f => (
                  <tr
                    key={f.id}
                    onClick={() => toggleSelect(f.id)}
                    className={clsx(
                      'cursor-pointer transition-colors',
                      selected.has(f.id) ? 'bg-blue-50' : 'hover:bg-gray-50/60'
                    )}
                  >
                    <td className="py-3 px-4">
                      {selected.has(f.id)
                        ? <CheckSquare className="w-4 h-4 text-blue-600" />
                        : <Square className="w-4 h-4 text-gray-300" />}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-800 text-xs max-w-[180px] block truncate" title={f.name}>{f.name}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{f.type}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 max-w-[120px] truncate" title={f.original}>{f.original}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{f.copies} copies</span>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-700">{f.size}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-green-600">{f.potentialSaving}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(new Set([f.id])); setDeleteModal(true) }}
                        className="text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium"
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

      {/* Confirm delete modal */}
      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Confirm Deletion"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={confirmDelete} className="btn-danger">Delete Files</button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            You are about to delete <strong>{selected.size} duplicate file{selected.size > 1 ? 's' : ''}</strong>. This action cannot be undone.
          </p>
          {totalSavings > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700 font-medium">Estimated monthly savings after deletion</p>
              <p className="text-xl font-bold text-green-600 mt-1">₹{totalSavings.toLocaleString('en-IN')} / month</p>
            </div>
          )}
          <p className="text-xs text-gray-400">
            This is a prototype demo — no actual files will be deleted.
          </p>
        </div>
      </Modal>
    </div>
  )
}
