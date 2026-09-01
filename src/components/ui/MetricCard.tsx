'use client'

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  changeLabel?: string
  subtitle?: string
  icon: ReactNode
  iconBg?: string
  glowColor?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'cyan'
  children?: ReactNode
  onClick?: () => void
}

export default function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  changeLabel,
  subtitle,
  icon,
  iconBg = 'bg-blue-50 text-blue-600',
  glowColor = 'blue',
  children,
  onClick,
}: MetricCardProps) {
  const trendIcon =
    changeType === 'positive' ? <TrendingUp className="w-3.5 h-3.5" /> :
    changeType === 'negative' ? <TrendingDown className="w-3.5 h-3.5" /> :
    <Minus className="w-3.5 h-3.5" />

  const trendColor =
    changeType === 'positive' ? 'text-emerald-700 bg-emerald-100/80 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800' :
    changeType === 'negative' ? 'text-rose-700 bg-rose-100/80 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800' :
    'text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-400'

  const glowClass = {
    blue: 'card-glow-blue hover:shadow-blue-500/10',
    purple: 'card-glow-purple hover:shadow-purple-500/10',
    emerald: 'card-glow-emerald hover:shadow-emerald-500/10',
    amber: 'card-glow-amber hover:shadow-amber-500/10',
    rose: 'card-glow-rose hover:shadow-rose-500/10',
    cyan: 'card-glow-cyan hover:shadow-cyan-500/10',
  }[glowColor]

  return (
    <div
      onClick={onClick}
      className={clsx(
        'card p-5 relative overflow-hidden group cursor-pointer select-none',
        glowClass,
        onClick && 'hover:scale-[1.02]'
      )}
    >
      {/* Background Aura Glow */}
      <div className={clsx(
        'absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-15 transition-opacity duration-300 group-hover:opacity-30',
        glowColor === 'blue' && 'bg-blue-500',
        glowColor === 'purple' && 'bg-purple-500',
        glowColor === 'emerald' && 'bg-emerald-500',
        glowColor === 'amber' && 'bg-amber-500',
        glowColor === 'rose' && 'bg-rose-500',
        glowColor === 'cyan' && 'bg-cyan-500'
      )} />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</p>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shadow-sm font-semibold transition-transform duration-200 group-hover:scale-110', iconBg)}>
          {icon}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>

      {children}

      {change && (
        <div className="flex items-center gap-2 mt-3.5 relative z-10">
          <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border', trendColor)}>
            {trendIcon}
            {change}
          </span>
          {changeLabel && <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
