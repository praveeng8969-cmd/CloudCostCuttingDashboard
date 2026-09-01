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
  children?: ReactNode
}

export default function MetricCard({
  title, value, change, changeType = 'neutral', changeLabel,
  subtitle, icon, iconBg = 'bg-blue-50', children
}: MetricCardProps) {
  const trendIcon =
    changeType === 'positive' ? <TrendingUp className="w-3 h-3" /> :
    changeType === 'negative' ? <TrendingDown className="w-3 h-3" /> :
    <Minus className="w-3 h-3" />

  const trendColor =
    changeType === 'positive' ? 'text-green-600 bg-green-50' :
    changeType === 'negative' ? 'text-red-600 bg-red-50' :
    'text-gray-500 bg-gray-100'

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
          {icon}
        </div>
      </div>

      <div className="mt-1">
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      {children}

      {change && (
        <div className="flex items-center gap-1.5 mt-3">
          <span className={clsx('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold', trendColor)}>
            {trendIcon}
            {change}
          </span>
          {changeLabel && <span className="text-xs text-gray-400">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}
