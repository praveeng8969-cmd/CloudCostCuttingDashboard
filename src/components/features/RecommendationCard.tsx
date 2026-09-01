'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import { PriorityBadge } from '@/components/ui/Badge'
import { Copy, Archive, Camera, FileArchive, Trash2, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import type { Recommendation } from '@/types'

const iconMap: Record<string, React.ElementType> = {
  Copy, Archive, Camera, FileArchive, Trash2
}

const colorMap: Record<string, { bg: string; icon: string; border: string; glow: string }> = {
  red:    { bg: 'bg-red-500/20',    icon: 'text-red-400',    border: 'border-red-500/30', glow: 'card-glow-red' },
  orange: { bg: 'bg-orange-500/20', icon: 'text-orange-400', border: 'border-orange-500/30', glow: 'card-glow-orange' },
  purple: { bg: 'bg-purple-500/20', icon: 'text-purple-400', border: 'border-purple-500/30', glow: 'card-glow-purple' },
  blue:   { bg: 'bg-blue-500/20',   icon: 'text-blue-400',   border: 'border-blue-500/30', glow: 'card-glow-blue' },
  green:  { bg: 'bg-emerald-500/20', icon: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'card-glow-emerald' },
}

interface RecommendationCardProps {
  rec: Recommendation
}

export default function RecommendationCard({ rec }: RecommendationCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  const Icon = iconMap[rec.icon] ?? Trash2
  const colors = colorMap[rec.color] ?? colorMap.blue

  function handleOptimize() {
    setConfirmOpen(false)
    toast.success(`Optimization completed: ${rec.title}`, {
      icon: '✨',
      duration: 4000,
      style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
    })
  }

  function handleReview() {
    if (rec.id === 'r1') router.push('/duplicates')
    else router.push('/storage')
  }

  return (
    <>
      <div className={clsx('card p-5 hover:shadow-xl transition-all duration-200', colors.glow)}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={clsx('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border', colors.bg, colors.border)}>
            <Icon className={clsx('w-5 h-5', colors.icon)} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-black text-white">{rec.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{rec.description}</p>
              </div>
              <PriorityBadge priority={rec.priority} />
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap gap-5 mt-3.5">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Potential Saving</p>
                <p className="text-base font-black text-emerald-400">{rec.potentialSaving}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Storage Impact</p>
                <p className="text-base font-black text-white">{rec.impact}</p>
              </div>
              {rec.files && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Files Affected</p>
                  <p className="text-base font-black text-white">{rec.files.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Expandable details */}
            {expanded && (
              <ul className="mt-3.5 space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                {rec.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button onClick={handleReview} className="btn-secondary text-xs py-1.5">
                Review Files
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="btn-primary text-xs py-1.5"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Optimize Policy
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="btn-ghost text-xs py-1 text-slate-400 hover:text-white"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? 'Less Details' : 'View Action Steps'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Confirm: ${rec.title}`}
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleOptimize} className="btn-primary">Confirm & Optimize</button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
          <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3.5 flex justify-between items-center">
            <span className="text-xs font-bold text-emerald-300">Recovered Savings:</span>
            <span className="text-base font-black text-emerald-400">{rec.potentialSaving}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            This is a prototype demo — changes will take effect in simulated telemetry.
          </p>
        </div>
      </Modal>
    </>
  )
}
