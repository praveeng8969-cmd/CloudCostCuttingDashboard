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
  glowColor?: 'blue' | 'purple' | 'emerald' | 'amber' | 'orange' | 'red' | 'yellow' | 'rose' | 'cyan'
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
  iconBg = 'bg-blue-500/20 text-blue-400',
  glowColor = 'blue',
  children,
  onClick,
}: MetricCardProps) {
  const trendIcon =
    changeType === 'positive' ? <TrendingUp className="w-3.5 h-3.5" /> :
    changeType === 'negative' ? <TrendingDown className="w-3.5 h-3.5" /> :
    <Minus className="w-3.5 h-3.5" />

  const trendColor =
    changeType === 'positive' ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' :
    changeType === 'negative' ? 'text-rose-400 bg-rose-500/15 border-rose-500/30' :
    'text-slate-400 bg-slate-800 border-slate-700'

  const glowClass = {
    blue: 'card-glow-blue hover:shadow-blue-500/20',
    purple: 'card-glow-purple hover:shadow-purple-500/20',
    emerald: 'card-glow-emerald hover:shadow-emerald-500/20',
    amber: 'card-glow-orange hover:shadow-amber-500/20',
    orange: 'card-glow-orange hover:shadow-orange-500/20',
    red: 'card-glow-red hover:shadow-red-500/20',
    yellow: 'card-glow-yellow hover:shadow-yellow-500/20',
    rose: 'card-glow-red hover:shadow-rose-500/20',
    cyan: 'card-glow-cyan hover:shadow-cyan-500/20',
  }[glowColor]

  return (
    <div
      onClick={onClick}
      className={clsx(
        'card p-5 relative overflow-hidden group cursor-pointer select-none',
        glowClass,
        onClick && 'hover:scale-[1.03] active:scale-[0.98]'
      )}
    >
      {/* Background Glow Halo */}
      <div className={clsx(
        'absolute -top-8 -right-8 w-24 h-24 rounded-full blur-xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 pointer-events-none',
        glowColor === 'blue' && 'bg-blue-500',
        glowColor === 'purple' && 'bg-purple-500',
        glowColor === 'emerald' && 'bg-emerald-500',
        (glowColor === 'amber' || glowColor === 'orange') && 'bg-orange-500',
        (glowColor === 'red' || glowColor === 'rose') && 'bg-red-500',
        glowColor === 'yellow' && 'bg-yellow-400',
        glowColor === 'cyan' && 'bg-cyan-400'
      )} />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{title}</p>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center font-black transition-transform duration-200 group-hover:scale-110 shadow-sm border border-white/10', iconBg)}>
          {icon}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-2xl font-black text-white tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {children}

      {change && (
        <div className="flex items-center gap-2 mt-3.5 relative z-10">
          <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-black border', trendColor)}>
            {trendIcon}
            {change}
          </span>
          {changeLabel && <span className="text-[11px] font-semibold text-slate-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
