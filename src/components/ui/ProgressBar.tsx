import clsx from 'clsx'

interface ProgressBarProps {
  value: number       // 0 – 100
  color?: string      // tailwind bg class
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const sizeMap = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' }

export default function ProgressBar({
  value,
  color = 'bg-blue-600',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          {label && <span className="font-medium text-slate-600">{label}</span>}
          {showLabel && <span className="font-semibold text-slate-900">{clamped}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-slate-100 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={clsx(color, sizeMap[size], 'rounded-full', animated && 'transition-all duration-500 ease-out')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
