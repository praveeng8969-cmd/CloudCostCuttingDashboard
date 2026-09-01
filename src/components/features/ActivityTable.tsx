'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/components/ui/Badge'
import type { ActivityRow } from '@/types'
import clsx from 'clsx'

interface ActivityTableProps {
  data: ActivityRow[]
}

const typeStyles: Record<string, string> = {
  Duplicate: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  Backup:    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  Snapshot:  'bg-red-500/20 text-red-300 border border-red-500/30',
  Temp:      'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  Inactive:  'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30',
}

export default function ActivityTable({ data }: ActivityTableProps) {
  const router = useRouter()

  function handleView(row: ActivityRow) {
    if (row.type === 'Duplicate') router.push('/duplicates')
    else if (row.type === 'Backup') router.push('/storage')
    else router.push('/recommendations')
  }

  function handleOptimize(row: ActivityRow) {
    toast.success(`Optimization policy scheduled for: ${row.activity}`, {
      icon: '⚡',
      style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-black uppercase tracking-wider">
            <th className="text-left py-3.5 px-5">Activity</th>
            <th className="text-left py-3.5 px-4 hidden md:table-cell">Type</th>
            <th className="text-left py-3.5 px-4 hidden sm:table-cell">Storage Impact</th>
            <th className="text-left py-3.5 px-4 hidden lg:table-cell">Est. Savings</th>
            <th className="text-left py-3.5 px-4">Status</th>
            <th className="text-left py-3.5 px-4 hidden md:table-cell">Time</th>
            <th className="text-right py-3.5 px-5">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-800/50 transition-colors group">
              <td className="py-3.5 px-5 font-bold text-white max-w-[220px] truncate">
                {row.activity}
              </td>
              <td className="py-3.5 px-4 hidden md:table-cell">
                <span className={clsx('px-2.5 py-0.5 rounded-full font-black text-[11px]', typeStyles[row.type] ?? 'bg-slate-800 text-slate-300 border border-slate-700')}>
                  {row.type}
                </span>
              </td>
              <td className="py-3.5 px-4 font-semibold text-slate-200 hidden sm:table-cell">
                {row.storageImpact}
              </td>
              <td className="py-3.5 px-4 font-black text-emerald-400 text-xs hidden lg:table-cell">
                {row.estimatedSavings}
              </td>
              <td className="py-3.5 px-4">
                <StatusBadge status={row.status} />
              </td>
              <td className="py-3.5 px-4 text-slate-400 font-medium text-[11px] whitespace-nowrap hidden md:table-cell">
                {row.time}
              </td>
              <td className="py-3.5 px-5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleView(row)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleOptimize(row)}
                    className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all"
                  >
                    Optimize
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
