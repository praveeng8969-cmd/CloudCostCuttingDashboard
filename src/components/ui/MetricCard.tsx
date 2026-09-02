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
  icon?: ReactNode
  iconBg?: string
  glowColor?: string
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
  children,
  onClick,
}: MetricCardProps) {
  const trendIcon =
    changeType === 'positive' ? <TrendingUp className="w-3 h-3" /> :
    changeType === 'negative' ? <TrendingDown className="w-3 h-3" /> :
    <Minus className="w-3 h-3" />

  const trendColor =
    changeType === 'positive' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    changeType === 'negative' ? 'text-red-700 bg-red-50 border-red-200' :
    'text-slate-600 bg-slate-100 border-slate-200'

  return (
    <div
      onClick={onClick}
      className={clsx(
        'card p-5 h-full flex flex-col justify-between select-none',
        onClick && 'cursor-pointer hover:border-slate-300'
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-slate-500 truncate">{title}</span>
          {icon && (
            <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
        </div>

        <div>
          <p className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1 leading-snug">{subtitle}</p>}
        </div>
      </div>

      {children}

      {change && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
          <span className={clsx('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border', trendColor)}>
            {trendIcon}
            {change}
          </span>
          {changeLabel && <span className="text-xs text-slate-500 truncate">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
