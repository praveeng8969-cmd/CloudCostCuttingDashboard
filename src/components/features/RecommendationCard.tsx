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

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    border: 'border-red-200' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-200' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-200' },
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
    toast.success(`Optimization completed: ${rec.title}`, { duration: 4000 })
  }

  function handleReview() {
    if (rec.id === 'r1') router.push('/duplicates')
    else router.push('/storage')
  }

  return (
    <>
      <div className="card p-5 hover:shadow-md transition-all duration-200">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
            <Icon className={clsx('w-5 h-5', colors.icon)} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{rec.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{rec.description}</p>
              </div>
              <PriorityBadge priority={rec.priority} />
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap gap-4 mt-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Potential Saving</p>
                <p className="text-base font-bold text-green-600">{rec.potentialSaving}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Storage Impact</p>
                <p className="text-base font-bold text-gray-800">{rec.impact}</p>
              </div>
              {rec.files && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Files</p>
                  <p className="text-base font-bold text-gray-800">{rec.files.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Expandable details */}
            {expanded && (
              <ul className="mt-3 space-y-1">
                {rec.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
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
                Optimize
              </button>
              <button
                onClick={() => setExpanded(!expanded)}
                className="btn-ghost text-xs py-1"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? 'Less' : 'Details'}
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
          <p className="text-sm text-gray-600">{rec.description}</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs font-medium text-green-700">Expected savings after optimization</p>
            <p className="text-xl font-bold text-green-600 mt-1">{rec.potentialSaving}</p>
          </div>
          <p className="text-xs text-gray-400">
            This is a prototype demo — no actual files will be modified.
          </p>
        </div>
      </Modal>
    </>
  )
}
