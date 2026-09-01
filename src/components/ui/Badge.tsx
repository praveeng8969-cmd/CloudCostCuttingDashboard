import clsx from 'clsx'
import type { Priority } from '@/types'

interface BadgeProps {
  label: string
  variant?: 'high' | 'medium' | 'low' | 'connected' | 'disconnected' | 'info' | 'warning' | 'purple' | 'cyan'
}

const variantMap: Record<string, string> = {
  high:         'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30',
  medium:       'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30',
  low:          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  connected:    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  disconnected: 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700',
  info:         'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30',
  warning:      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-500/20 text-orange-400 border border-orange-500/30',
  purple:       'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/30',
  cyan:         'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
}

export default function Badge({ label, variant = 'info' }: BadgeProps) {
  return <span className={clsx(variantMap[variant])}>{label}</span>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, 'high' | 'medium' | 'low'> = {
    HIGH: 'high', MEDIUM: 'medium', LOW: 'low'
  }
  return <Badge label={priority} variant={map[priority]} />
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Needs Review': 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30',
    'Recommended':  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/30',
    'Completed':    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    'Dismissed':    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700',
  }
  return <span className={clsx(map[status] ?? 'badge-disconnected')}>{status}</span>
}
