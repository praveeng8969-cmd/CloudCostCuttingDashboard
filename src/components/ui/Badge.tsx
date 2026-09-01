import clsx from 'clsx'
import type { Priority } from '@/types'

interface BadgeProps {
  label: string
  variant?: 'high' | 'medium' | 'low' | 'connected' | 'disconnected' | 'info' | 'warning'
}

const variantMap: Record<string, string> = {
  high:         'badge-high',
  medium:       'badge-medium',
  low:          'badge-low',
  connected:    'badge-connected',
  disconnected: 'badge-disconnected',
  info:         'bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full',
  warning:      'bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full',
}

export default function Badge({ label, variant = 'info' }: BadgeProps) {
  return <span className={clsx(variantMap[variant])}>{label}</span>
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const variantMap: Record<Priority, 'high' | 'medium' | 'low'> = {
    HIGH: 'high', MEDIUM: 'medium', LOW: 'low'
  }
  return <Badge label={priority} variant={variantMap[priority]} />
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Needs Review': 'badge-medium',
    'Recommended':  'bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full',
    'Completed':    'badge-low',
    'Dismissed':    'badge-disconnected',
  }
  return <span className={clsx(map[status] ?? 'badge-disconnected')}>{status}</span>
}
