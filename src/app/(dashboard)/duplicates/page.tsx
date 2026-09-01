'use client'

import React, { useState, useMemo } from 'react'
import {
  Search, Copy, HardDrive, DollarSign, CheckCircle2,
  AlertTriangle, Eye, ShieldCheck, Sparkles, Filter, ExternalLink
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import Modal from '@/components/ui/Modal'
import { useStorageData } from '@/context/StorageDataContext'
import { DuplicateCandidateGroup } from '@/types/storage'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function DuplicatesPage() {
  const { analysisResult, hasData } = useStorageData()
  const [search, setSearch] = useState('')
  const [reviewGroup, setReviewGroup] = useState<DuplicateCandidateGroup | null>(null)

  const groups = analysisResult.duplicateGroups

  const filteredGroups = useMemo(() => {
    if (!search) return groups
    const q = search.toLowerCase()
    return groups.filter(g =>
      g.baseName.toLowerCase().includes(q) ||
      g.fileType.toLowerCase().includes(q) ||
      g.canonicalFile.bucket.toLowerCase().includes(q)
    )
  }, [groups, search])

  function handleSimulateCleanup(group: DuplicateCandidateGroup) {
    toast.success(`Simulated deduplication for "${group.baseName}"! Estimated savings: ₹${group.estimatedMonthlySavings.toLocaleString('en-IN')}/mo.`, {
      icon: '✨',
      duration: 5000,
      style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
    })
    setReviewGroup(null)
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Page Header */}
      <PageHeader
        title="Duplicate Candidate Detection & Deduplicator"
        subtitle="Detect byte-identical and duplicate file candidates across all connected cloud storage buckets."
        badge={`${groups.length} Candidate Sets Detected`}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full min-w-0">
        <div className="card p-5 card-glow-amber flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
            <Copy className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Detected Redundancy</p>
            <p className="text-2xl font-black text-amber-300 tracking-tight truncate">{groups.length} Sets</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{analysisResult.duplicateCandidatesCount} redundant copies</p>
          </div>
        </div>

        <div className="card p-5 card-glow-blue flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Recoverable Storage</p>
            <p className="text-2xl font-black text-blue-400 tracking-tight truncate">{analysisResult.duplicateRecoverableStorageGB} GB</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Zero data loss candidate targets</p>
          </div>
        </div>

        <div className="card p-5 card-glow-emerald flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Estimated Monthly Savings</p>
            <p className="text-2xl font-black text-emerald-400 tracking-tight truncate">₹{analysisResult.duplicateEstimatedSavings.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">₹{(analysisResult.duplicateEstimatedSavings * 12).toLocaleString('en-IN')} annual recovery</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card overflow-hidden w-full min-w-0">
        <div className="p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter duplicate candidate groups by filename, bucket or type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>

            <span className="text-xs text-slate-400 flex-shrink-0">
              Showing <strong className="text-white">{filteredGroups.length}</strong> groups
            </span>
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">No Duplicate Candidates Found</h3>
            <p className="text-xs text-slate-400 mt-1">All objects in the current dataset appear distinct and non-redundant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-black uppercase tracking-wider">
                  <th className="text-left py-3.5 px-4">Primary Candidate File</th>
                  <th className="text-left py-3.5 px-4">Type</th>
                  <th className="text-left py-3.5 px-4">Master Bucket</th>
                  <th className="text-left py-3.5 px-4">Redundant Copies</th>
                  <th className="text-left py-3.5 px-4">Recoverable Storage</th>
                  <th className="text-left py-3.5 px-4">Estimated Savings</th>
                  <th className="text-left py-3.5 px-4">Priority</th>
                  <th className="text-right py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredGroups.map(group => (
                  <tr key={group.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white max-w-[200px] truncate" title={group.baseName}>
                      {group.baseName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-bold text-slate-300">
                        {group.fileType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 max-w-[140px] truncate" title={group.canonicalFile.bucket}>
                      {group.canonicalFile.bucket}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-black rounded-full border border-amber-500/30">
                        {group.duplicates.length} replicas ({group.totalCopies} total)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-cyan-300">
                      {group.recoverableSizeGB} GB
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-400 text-xs">
                      ₹{group.estimatedMonthlySavings.toLocaleString('en-IN')}/mo
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={clsx(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-black border',
                        group.priority === 'HIGH' && 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                        group.priority === 'MEDIUM' && 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                        group.priority === 'LOW' && 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      )}>
                        {group.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setReviewGroup(group)}
                        className="btn-secondary py-1 px-3 text-xs font-bold"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Duplicate Review Inspection Modal */}
      <Modal
        open={!!reviewGroup}
        onClose={() => setReviewGroup(null)}
        title={`Inspect Duplicate Candidate Group — ${reviewGroup?.baseName}`}
        size="md"
        footer={
          reviewGroup ? (
            <div className="flex items-center justify-between w-full">
              <button onClick={() => setReviewGroup(null)} className="btn-secondary text-xs">
                Close
              </button>
              <button onClick={() => handleSimulateCleanup(reviewGroup)} className="btn-emerald text-xs">
                Simulate Purge (+₹{reviewGroup.estimatedMonthlySavings.toLocaleString('en-IN')}/mo)
              </button>
            </div>
          ) : undefined
        }
      >
        {reviewGroup && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>
                Prototype Notice: Primary file is preserved. Candidate replicas can be queued for automated lifecycle purging.
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Primary Canonical File:</p>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-white truncate max-w-sm">{reviewGroup.canonicalFile.fileName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Bucket: <span className="text-slate-200 font-mono">{reviewGroup.canonicalFile.bucket}</span> · Size: {reviewGroup.canonicalFile.sizeGB} GB</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-black text-[10px]">PRESERVE</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Redundant Replicas ({reviewGroup.duplicates.length}):</p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {reviewGroup.duplicates.map(dup => (
                  <div key={dup.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-200 truncate max-w-xs">{dup.fileName}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Bucket: <span className="text-slate-300 font-mono">{dup.bucket}</span> · Last accessed: {dup.lastAccessed}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-black text-[10px]">CANDIDATE PURGE</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs flex justify-between items-center font-bold text-emerald-300">
              <span>Potential Group Savings:</span>
              <span className="text-base font-black text-emerald-400">₹{reviewGroup.estimatedMonthlySavings.toLocaleString('en-IN')} / mo</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
