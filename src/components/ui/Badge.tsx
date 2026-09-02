import React from 'react'
import clsx from 'clsx'
import type { Priority } from '@/types'

interface BadgeProps {
  label: string
  variant?: 'high' | 'medium' | 'low' | 'connected' | 'disconnected' | 'info' | 'warning' | 'purple' | 'cyan' | 'success' | 'neutral'
}

const variantMap: Record<string, string> = {
  high:         'bg-red-50 text-red-700 border-red-200',
  medium:       'bg-amber-50 text-amber-700 border-amber-200',
  low:          'bg-slate-100 text-slate-700 border-slate-200',
  connected:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  disconnected: 'bg-slate-100 text-slate-600 border-slate-200',
  info:         'bg-blue-50 text-blue-700 border-blue-200',
  warning:      'bg-amber-50 text-amber-700 border-amber-200',
  purple:       'bg-purple-50 text-purple-700 border-purple-200',
  cyan:         'bg-sky-50 text-sky-700 border-sky-200',
  success:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  neutral:      'bg-slate-100 text-slate-700 border-slate-200',
}

export default function Badge({ label, variant = 'info' }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', variantMap[variant] || variantMap.info)}>
      {label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, 'high' | 'medium' | 'low'> = {
    HIGH: 'high', MEDIUM: 'medium', LOW: 'low'
  }
  return <Badge label={priority} variant={map[priority]} />
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, 'warning' | 'info' | 'connected' | 'disconnected'> = {
    'Needs Review': 'warning',
    'Recommended':  'info',
    'Completed':    'connected',
    'Dismissed':    'disconnected',
  }
  return <Badge label={status} variant={map[status] || 'disconnected'} />
}
