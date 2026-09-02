'use client'

import React, { useState } from 'react'
import {
  TrendingDown, CheckCircle2, ArrowRight, AlertTriangle,
  Zap, Copy, Archive, Trash2, FileArchive, Check
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useStorageData } from '@/context/StorageDataContext'
import { RecommendationItem } from '@/types/storage'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const iconMap: Record<string, React.ElementType> = {
  Copy, Archive, Zap, Trash2, FileArchive
}

export default function RecommendationsPage() {
  const { analysisResult, hasData } = useStorageData()
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL')
  const [deployModal, setDeployModal] = useState<RecommendationItem | null>(null)
  const [deploying, setDeploying] = useState(false)
  const [batchModal, setBatchModal] = useState(false)
  const [batchDeploying, setBatchDeploying] = useState(false)

  const recs = analysisResult.recommendations
  const totalMonthlySavings = analysisResult.potentialMonthlySavings
  const totalAnnualSavings = analysisResult.potentialAnnualSavings

  const filteredRecs = recs.filter(r => {
    if (selectedFilter === 'ALL') return true
    return r.priority === selectedFilter
  })

  function handleDeploySingle(rec: RecommendationItem) {
    setDeploying(true)
    setTimeout(() => {
      setDeploying(false)
      setDeployModal(null)
      toast.success(`Policy "${rec.title}" simulated successfully! Saving ₹${rec.estimatedMonthlySavings.toLocaleString('en-IN')}/mo.`)
    }, 800)
  }

  function handleDeployAll() {
    setBatchDeploying(true)
    setTimeout(() => {
      setBatchDeploying(false)
      setBatchModal(false)
      toast.success(`All ${recs.length} optimization policies simulated! Saving ₹${totalMonthlySavings.toLocaleString('en-IN')}/mo.`)
    }, 1000)
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Optimization Recommendations"
        subtitle="Actionable storage lifecycle transitions and deduplication policies to reduce cloud spend."
        badge={`${recs.length} Action Items`}
        actions={
          <button
            onClick={() => setBatchModal(true)}
            disabled={recs.length === 0}
            className="btn-primary text-xs"
          >
            <Check className="w-3.5 h-3.5" />
            Apply All Recommendations
          </button>
        }
      />

      {/* Summary Opportunity Banner */}
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Total Identified Monthly Savings
            </h3>
            <p className="text-xs text-slate-500">
              Implementing all recommended transitions recovers ₹{totalAnnualSavings.toLocaleString('en-IN')} annually.
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-700">
            ₹{totalMonthlySavings.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/month</span>
          </p>
        </div>
      </div>

      {/* Priority Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs">
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => (
          <button
            key={p}
            onClick={() => setSelectedFilter(p)}
            className={clsx(
              'px-3 py-1.5 rounded-md font-medium transition-colors',
              selectedFilter === p
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            {p === 'ALL' ? `All (${recs.length})` : `${p} Priority (${recs.filter(r => r.priority === p).length})`}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {filteredRecs.length === 0 ? (
          <div className="card p-8 text-center text-slate-500 text-xs">
            No recommendations match this priority filter.
          </div>
        ) : (
          filteredRecs.map((rec) => {
            const Icon = iconMap[rec.icon] || Zap
            return (
              <div key={rec.id} className="card p-5 hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-slate-900">{rec.title}</h4>
                        <span className={clsx(
                          'px-1.5 py-0.2 rounded text-[10px] font-medium border',
                          rec.priority === 'HIGH'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : rec.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        )}>
                          {rec.priority} Priority
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {rec.affectedFilesCount} affected objects
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="mt-2.5 p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                        <strong className="text-slate-800">Action: </strong>{rec.recommendedAction}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="sm:text-right">
                      <span className="text-xs text-slate-500 block">Potential Recovery</span>
                      <p className="text-base font-bold text-emerald-700">
                        +₹{rec.estimatedMonthlySavings.toLocaleString('en-IN')}/mo
                      </p>
                    </div>

                    <button
                      onClick={() => setDeployModal(rec)}
                      className="btn-primary text-xs self-start sm:self-auto"
                    >
                      Review Policy
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Review & Apply Single Modal */}
      <Modal
        open={Boolean(deployModal)}
        onClose={() => setDeployModal(null)}
        title={deployModal?.title || 'Review Recommendation'}
        size="md"
        footer={
          <>
            <button onClick={() => setDeployModal(null)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button
              onClick={() => deployModal && handleDeploySingle(deployModal)}
              disabled={deploying}
              className="btn-primary text-xs"
            >
              {deploying ? 'Simulating Policy...' : 'Simulate Policy'}
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>{deployModal?.description}</p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
            <p><strong>Action:</strong> {deployModal?.recommendedAction}</p>
            <p><strong>Affected Objects:</strong> {deployModal?.affectedFilesCount}</p>
            <p><strong>Estimated Monthly Savings:</strong> <span className="text-emerald-700 font-semibold">₹{deployModal?.estimatedMonthlySavings}/mo</span></p>
          </div>
        </div>
      </Modal>

      {/* Batch Deploy Modal */}
      <Modal
        open={batchModal}
        onClose={() => setBatchModal(false)}
        title="Simulate All Recommendations"
        size="md"
        footer={
          <>
            <button onClick={() => setBatchModal(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button
              onClick={handleDeployAll}
              disabled={batchDeploying}
              className="btn-primary text-xs"
            >
              {batchDeploying ? 'Applying Policies...' : 'Confirm Simulation'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            This action will simulate the adoption of all {recs.length} lifecycle transitions and deduplication policies.
          </p>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800">
            Total forecasted reduction: <strong>₹{totalMonthlySavings.toLocaleString('en-IN')}/mo</strong> (₹{totalAnnualSavings.toLocaleString('en-IN')} annually).
          </div>
        </div>
      </Modal>
    </div>
  )
}
