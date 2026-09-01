import clsx from 'clsx'

interface ProgressBarProps {
  value: number       // 0 – 100
  color?: string      // tailwind bg class
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  animated?: boolean
}

const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' }

export default function ProgressBar({
  value,
  color = 'bg-blue-500',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-xs text-gray-600">{label}</span>}
          {showLabel && <span className="text-xs font-semibold text-gray-700">{clamped}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-gray-100 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className={clsx(color, sizeMap[size], 'rounded-full', animated && 'transition-all duration-700 ease-out')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
