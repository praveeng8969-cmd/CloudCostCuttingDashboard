'use client'

import { useState } from 'react'
import { Zap, TrendingDown, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react'
import RecommendationCard from '@/components/features/RecommendationCard'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { recommendationsData } from '@/lib/mockData'
import type { Recommendation } from '@/types'
import toast from 'react-hot-toast'

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>(recommendationsData)
  const [batchModal, setBatchModal] = useState(false)
  const [optimizingAll, setOptimizingAll] = useState(false)
  const [optimizeComplete, setOptimizeComplete] = useState(false)

  const activeRecs = recs
  const totalSavingsPerMonth = activeRecs.reduce((s, r) => s + r.potentialSavingAmount, 0)
  const annualSavings = totalSavingsPerMonth * 12

  function handleOptimizeAll() {
    setOptimizingAll(true)
    setTimeout(() => {
      setOptimizingAll(false)
      setOptimizeComplete(true)
      toast.success('All 5 Optimization Policies Deployed! Saving ₹31,800/mo.', {
        icon: '🎉',
        duration: 5000,
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 2500)
  }

  function resetAll() {
    setRecs(recommendationsData)
    setBatchModal(false)
    setOptimizeComplete(false)
    toast('Recommendations reset to initial demo state', { icon: '🔄' })
  }

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Cost Optimization Recommendations</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">High-confidence, automated actions to reduce cloud storage billing without downtime.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBatchModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            Optimize All ({recs.length})
          </button>
        </div>
      </div>

      {/* Hero Savings Summary Banner */}
      <div className="card p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-xl shadow-emerald-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <TrendingDown className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Total Actionable Savings</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight">₹{totalSavingsPerMonth.toLocaleString('en-IN')}</span>
                <span className="text-sm font-semibold text-emerald-200">/ month</span>
              </div>
              <p className="text-emerald-100 text-xs mt-1">
                Projected to recover <strong className="text-white">₹{annualSavings.toLocaleString('en-IN')}</strong> in annual storage overhead.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 w-full md:w-auto">
            <p className="text-xs font-bold text-emerald-100 mb-2">Priority Distribution</p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-rose-500/30 text-white text-xs rounded-lg font-bold border border-rose-300/40">
                2 High Priority
              </span>
              <span className="px-2.5 py-1 bg-amber-400/30 text-white text-xs rounded-lg font-bold border border-amber-300/40">
                2 Medium
              </span>
              <span className="px-2.5 py-1 bg-emerald-400/30 text-white text-xs rounded-lg font-bold border border-emerald-300/40">
                1 Low
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="mt-6 pt-5 border-t border-white/15 space-y-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">Savings Contribution per Policy</p>
          {recs.map(r => (
            <div key={r.id} className="flex items-center gap-3 text-xs">
              <span className="text-emerald-100 font-semibold w-48 truncate">{r.title}</span>
              <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-300 to-white rounded-full transition-all duration-700"
                  style={{ width: `${(r.potentialSavingAmount / totalSavingsPerMonth) * 100}%` }}
                />
              </div>
              <span className="text-white font-extrabold w-28 text-right">{r.potentialSaving}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {recs.map(rec => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>

      {/* Batch Optimization Modal */}
      <Modal
        open={batchModal}
        onClose={() => setBatchModal(false)}
        title={optimizeComplete ? 'Optimization Policies Deployed' : 'Deploy All 5 Storage Optimizations'}
        size="md"
        footer={
          optimizeComplete ? (
            <button onClick={resetAll} className="btn-secondary w-full justify-center">
              Done & Reset Demo State
            </button>
          ) : (
            <>
              <button onClick={() => setBatchModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleOptimizeAll} disabled={optimizingAll} className="btn-emerald">
                {optimizingAll ? 'Executing Policies...' : 'Confirm & Deploy All'}
              </button>
            </>
          )
        }
      >
        {!optimizingAll && !optimizeComplete && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              CloudCut will execute all 5 optimization routines concurrently across connected storage buckets:
            </p>
            <div className="space-y-2">
              {[
                { name: '1. Deduplication Engine', desc: 'Purges 1,284 redundant copies (-284 GB)', saving: '₹12,000/mo' },
                { name: '2. Lifecycle Transition', desc: 'Moves 620 GB old backups to Archive Tier', saving: '₹8,500/mo' },
                { name: '3. Snapshot Reaper', desc: 'Removes 32 unattached EBS/disk snapshots', saving: '₹5,200/mo' },
                { name: '4. GZIP Log Compression', desc: 'Compresses 156 raw server log files', saving: '₹4,100/mo' },
                { name: '5. Build Cache Purge', desc: 'Cleans 95 GB orphan CI/CD build artifacts', saving: '₹2,000/mo' },
              ].map(item => (
                <div key={item.name} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{item.name}</span>
                    <p className="text-gray-400 text-[11px]">{item.desc}</p>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">{item.saving}</span>
                </div>
              ))}
            </div>
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex justify-between items-center font-bold">
              <span>Total Recovered Monthly Spend:</span>
              <span className="text-base text-emerald-600">₹31,800 / month</span>
            </div>
          </div>
        )}

        {optimizingAll && (
          <div className="py-8 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner size={44} className="text-emerald-500" />
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Deploying Automated Optimization Policies...</p>
              <p className="text-xs text-gray-400 mt-1">Applying S3 lifecycle rules & deleting byte-identical duplicates</p>
            </div>
          </div>
        )}

        {optimizeComplete && (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white">All 5 Policies Successfully Applied!</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Your cloud storage bills will reflect an immediate savings of <strong>₹31,800/mo (₹3,81,600/yr)</strong>.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
