'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { StatusBadge } from '@/components/ui/Badge'
import type { ActivityRow } from '@/types'

interface ActivityTableProps {
  data: ActivityRow[]
}

export default function ActivityTable({ data }: ActivityTableProps) {
  const router = useRouter()

  function handleView(row: ActivityRow) {
    if (row.type === 'Duplicate') router.push('/duplicates')
    else if (row.type === 'Backup') router.push('/storage')
    else router.push('/recommendations')
  }

  function handleOptimize(row: ActivityRow) {
    toast.success(`Optimization started for: ${row.activity}`)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Activity</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Storage Impact</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Est. Savings</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Time</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="py-3 px-4 font-medium text-gray-800">{row.activity}</td>
              <td className="py-3 px-4 hidden md:table-cell">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{row.type}</span>
              </td>
              <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{row.storageImpact}</td>
              <td className="py-3 px-4 text-green-600 font-medium hidden lg:table-cell">{row.estimatedSavings}</td>
              <td className="py-3 px-4"><StatusBadge status={row.status} /></td>
              <td className="py-3 px-4 text-gray-400 text-xs hidden md:table-cell">{row.time}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleView(row)}
                    className="text-xs px-2.5 py-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleOptimize(row)}
                    className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium"
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
