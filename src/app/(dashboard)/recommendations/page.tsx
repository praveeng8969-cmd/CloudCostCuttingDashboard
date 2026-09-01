'use client'

import React, { useState } from 'react'
import {
  TrendingDown, Sparkles, CheckCircle2, ShieldCheck,
  ArrowRight, RefreshCw, AlertTriangle, Zap, Copy, Archive, Trash2, FileArchive
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

  const highCount = recs.filter(r => r.priority === 'HIGH').length
  const medCount = recs.filter(r => r.priority === 'MEDIUM').length
  const lowCount = recs.filter(r => r.priority === 'LOW').length

  const filteredRecs = recs.filter(r => {
    if (selectedFilter === 'ALL') return true
    return r.priority === selectedFilter
  })

  function handleDeploySingle(rec: RecommendationItem) {
    setDeploying(true)
    setTimeout(() => {
      setDeploying(false)
      setDeployModal(null)
      toast.success(`Policy "${rec.title}" simulated successfully! Saving ₹${rec.estimatedMonthlySavings.toLocaleString('en-IN')}/mo.`, {
        icon: '🎉',
        duration: 5000,
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 1200)
  }

  function handleDeployAll() {
    setBatchDeploying(true)
    setTimeout(() => {
      setBatchDeploying(false)
      setBatchModal(false)
      toast.success(`All ${recs.length} Optimization Policies Simulated! Saving ₹${totalMonthlySavings.toLocaleString('en-IN')}/mo.`, {
        icon: '🚀',
        duration: 5000,
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 1800)
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Standardized Page Header */}
      <PageHeader
        title="Cost Optimization Recommendations"
        subtitle="Rule-based, high-impact recommendations derived dynamically from your storage dataset."
        badge={`${recs.length} Actionable Recommendations`}
        actions={
          <button
            onClick={() => setBatchModal(true)}
            disabled={recs.length === 0}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Apply All ({recs.length})
          </button>
        }
      />

      {/* Hero Savings Summary Banner */}
      <div className="card p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden w-full min-w-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner flex-shrink-0">
              <TrendingDown className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <p className="text-emerald-100 text-xs font-black uppercase tracking-wider">Total Actionable Savings</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight">₹{totalMonthlySavings.toLocaleString('en-IN')}</span>
                <span className="text-sm font-semibold text-emerald-200">/ month</span>
              </div>
              <p className="text-emerald-100 text-xs mt-1">
                Projected to recover <strong className="text-white font-black">₹{totalAnnualSavings.toLocaleString('en-IN')}</strong> in annual cloud storage overhead.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 w-full md:w-auto">
            <p className="text-xs font-bold text-emerald-100 mb-2">Priority Distribution</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedFilter('HIGH')}
                className={clsx('px-2.5 py-1 rounded-lg text-xs font-black transition-all border', selectedFilter === 'HIGH' ? 'bg-rose-500 text-white border-white' : 'bg-rose-500/30 text-white border-rose-300/40')}
              >
                {highCount} High Priority
              </button>
              <button
                onClick={() => setSelectedFilter('MEDIUM')}
                className={clsx('px-2.5 py-1 rounded-lg text-xs font-black transition-all border', selectedFilter === 'MEDIUM' ? 'bg-amber-500 text-white border-white' : 'bg-amber-400/30 text-white border-amber-300/40')}
              >
                {medCount} Medium
              </button>
              <button
                onClick={() => setSelectedFilter('LOW')}
                className={clsx('px-2.5 py-1 rounded-lg text-xs font-black transition-all border', selectedFilter === 'LOW' ? 'bg-emerald-500 text-white border-white' : 'bg-emerald-400/30 text-white border-emerald-300/40')}
              >
                {lowCount} Low
              </button>
              {selectedFilter !== 'ALL' && (
                <button
                  onClick={() => setSelectedFilter('ALL')}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/20 text-white hover:bg-white/30"
                >
                  Show All ({recs.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Cards List */}
      {filteredRecs.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Recommendations in this Category</h3>
          <p className="text-xs text-slate-400 mt-1">Select &ldquo;Show All&rdquo; to view recommendations across all priority tiers.</p>
        </div>
      ) : (
        <div className="space-y-4 w-full min-w-0">
          {filteredRecs.map(rec => {
            const Icon = iconMap[rec.icon] || Zap
            return (
              <div
                key={rec.id}
                className={clsx(
                  'card p-6 transition-all hover:scale-[1.01]',
                  rec.priority === 'HIGH' && 'border-l-4 border-l-rose-500 card-glow-rose',
                  rec.priority === 'MEDIUM' && 'border-l-4 border-l-amber-500 card-glow-amber',
                  rec.priority === 'LOW' && 'border-l-4 border-l-emerald-500 card-glow-emerald'
                )}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left: Problem & Description */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className={clsx(
                      'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border',
                      rec.priority === 'HIGH' && 'bg-rose-500/20 text-rose-400 border-rose-500/30',
                      rec.priority === 'MEDIUM' && 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                      rec.priority === 'LOW' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-black text-white tracking-tight">{rec.title}</h3>
                        <span className={clsx(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider',
                          rec.priority === 'HIGH' && 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                          rec.priority === 'MEDIUM' && 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                          rec.priority === 'LOW' && 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        )}>
                          {rec.priority} Priority
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-semibold leading-relaxed">{rec.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Identified Problem:</span>
                          <span className="text-white font-bold">{rec.problem}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Action:</span>
                          <span className="text-cyan-300 font-bold">{rec.recommendedAction}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Savings & Deploy Action */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estimated Savings</p>
                      <p className="text-2xl font-black text-emerald-400 tracking-tight">
                        ₹{rec.estimatedMonthlySavings.toLocaleString('en-IN')}
                        <span className="text-xs font-semibold text-slate-400">/mo</span>
                      </p>
                      <p className="text-[11px] text-slate-400">₹{(rec.estimatedMonthlySavings * 12).toLocaleString('en-IN')}/year</p>
                    </div>

                    <button
                      onClick={() => setDeployModal(rec)}
                      className="btn-primary text-xs py-2 px-4 font-black flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Simulate Policy
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Single Policy Simulation Modal */}
      <Modal
        open={!!deployModal}
        onClose={() => setDeployModal(null)}
        title={`Deploy Optimization — ${deployModal?.title}`}
        size="md"
        footer={
          deployModal ? (
            <div className="flex items-center justify-between w-full">
              <button onClick={() => setDeployModal(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleDeploySingle(deployModal)} disabled={deploying} className="btn-emerald">
                {deploying ? 'Applying Simulation...' : 'Confirm Simulation'}
              </button>
            </div>
          ) : undefined
        }
      >
        {deployModal && (
          <div className="space-y-4 text-xs text-slate-300">
            <p>{deployModal.description}</p>
            <div className="space-y-2">
              {deployModal.details.map((d, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex justify-between items-center font-bold text-emerald-300">
              <span>Monthly Recurring Recovery:</span>
              <span className="text-base font-black text-emerald-400">₹{deployModal.estimatedMonthlySavings.toLocaleString('en-IN')}/mo</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Batch Optimization Modal */}
      <Modal
        open={batchModal}
        onClose={() => setBatchModal(false)}
        title="Deploy All Dataset Optimizations"
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <button onClick={() => setBatchModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleDeployAll} disabled={batchDeploying} className="btn-emerald">
              {batchDeploying ? 'Applying All Policies...' : 'Confirm All Simulations'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p>This will simulate applying lifecycle transition rules, deduplication, and log expirations across all {recs.length} recommended policies.</p>
          <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-xl flex justify-between items-center font-bold text-emerald-300">
            <span>Total Estimated Monthly Savings:</span>
            <span className="text-base font-black text-emerald-400">₹{totalMonthlySavings.toLocaleString('en-IN')} / mo</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}
