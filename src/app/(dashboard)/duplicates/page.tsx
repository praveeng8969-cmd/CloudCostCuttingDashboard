'use client'

import React, { useState, useMemo } from 'react'
import {
  Search, Copy, HardDrive, DollarSign, CheckCircle2,
  AlertTriangle, Eye, ShieldCheck, Filter
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import Modal from '@/components/ui/Modal'
import MetricCard from '@/components/ui/MetricCard'
import { useStorageData } from '@/context/StorageDataContext'
import { DuplicateCandidateGroup } from '@/types/storage'
import toast from 'react-hot-toast'

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
    toast.success(`Simulated deduplication for "${group.baseName}"! Estimated savings: ₹${group.estimatedMonthlySavings.toLocaleString('en-IN')}/mo.`)
    setReviewGroup(null)
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Duplicate File Candidates"
        subtitle="Identify redundant files and exact byte replicas to recover storage capacity."
        badge={`${groups.length} Candidate Sets`}
      />

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Detected Redundancy"
          value={`${groups.length} Sets`}
          subtitle={`${analysisResult.duplicateCandidatesCount} redundant copies identified`}
          icon={<Copy className="w-4 h-4 text-amber-600" />}
        />

        <MetricCard
          title="Recoverable Storage"
          value={`${analysisResult.duplicateRecoverableStorageGB} GB`}
          subtitle="Zero data loss target candidates"
          icon={<HardDrive className="w-4 h-4 text-blue-600" />}
        />

        <MetricCard
          title="Potential Monthly Savings"
          value={`₹${analysisResult.duplicateEstimatedSavings.toLocaleString('en-IN')}`}
          subtitle={`₹${(analysisResult.duplicateEstimatedSavings * 12).toLocaleString('en-IN')} annual recovery`}
          icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Main Table Card */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search duplicates by name, bucket, type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 text-xs py-1.5"
            />
          </div>

          <span className="text-xs text-slate-500 flex-shrink-0">
            Showing <strong>{filteredGroups.length}</strong> duplicate sets
          </span>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No Duplicate Candidates Detected</p>
            <p className="text-slate-500 mt-0.5">All indexed objects in the current dataset appear unique.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
                  <th className="py-3 px-4">Primary File Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Bucket</th>
                  <th className="py-3 px-4 text-right">Copies</th>
                  <th className="py-3 px-4 text-right">Recoverable GB</th>
                  <th className="py-3 px-4 text-right">Monthly Savings</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.map(group => (
                  <tr key={group.baseName} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-[240px] truncate" title={group.baseName}>
                      {group.baseName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {group.fileType}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {group.canonicalFile.bucket}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {group.totalCopies}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {group.recoverableSizeGB} GB
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      +₹{group.estimatedMonthlySavings}/mo
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setReviewGroup(group)}
                        className="btn-secondary py-1 px-2.5 text-xs"
                      >
                        Inspect Copies
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Group Modal */}
      <Modal
        open={Boolean(reviewGroup)}
        onClose={() => setReviewGroup(null)}
        title={reviewGroup ? `Duplicate Set: ${reviewGroup.baseName}` : 'Inspect Copies'}
        size="lg"
        footer={
          <>
            <button onClick={() => setReviewGroup(null)} className="btn-secondary text-xs">
              Close
            </button>
            <button
              onClick={() => reviewGroup && handleSimulateCleanup(reviewGroup)}
              className="btn-primary text-xs"
            >
              Simulate Deduplication (+₹{reviewGroup?.estimatedMonthlySavings}/mo)
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[11px] text-slate-500">Duplicate Copies</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{reviewGroup?.totalCopies}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Recoverable Storage</p>
              <p className="text-base font-bold text-blue-600 mt-0.5">{reviewGroup?.recoverableSizeGB} GB</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Monthly Savings</p>
              <p className="text-base font-bold text-emerald-700 mt-0.5">₹{reviewGroup?.estimatedMonthlySavings}/mo</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Itemized Instances in Cluster:</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden">
              {reviewGroup && [reviewGroup.canonicalFile, ...reviewGroup.duplicates].map((f, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50 text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-medium text-slate-900 truncate">{f.fileName}</p>
                    <p className="text-[11px] text-slate-500">{f.bucket} • {f.storageClass}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-slate-900">{f.sizeGB} GB</p>
                    {idx === 0 ? (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                        Primary Canonical
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                        Duplicate Replica
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
