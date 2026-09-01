'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, HardDrive } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import ChartCard from '@/components/ui/ChartCard'
import ProgressBar from '@/components/ui/ProgressBar'
import EmptyState from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/Badge'
import { kpiSummary, storageGrowthData, fileTypeData, filesData } from '@/lib/mockData'
import type { FileRow } from '@/types'
import clsx from 'clsx'

const FILE_TYPES = ['All', 'Backup', 'Log', 'Video', 'Document', 'Image', 'Archive', 'Other']
const STORAGE_CLASSES = ['All', 'Standard', 'Infrequent Access', 'Archive', 'Deep Archive']
const RECOMMENDATIONS = ['All', 'Delete', 'Archive', 'Review', 'Compress', 'Keep']

export default function StoragePage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterClass, setFilterClass] = useState('All')
  const [filterRec, setFilterRec] = useState('All')

  const filtered = useMemo(() => {
    return filesData.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.owner.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'All' || f.type === filterType
      const matchClass = filterClass === 'All' || f.storageClass === filterClass
      const matchRec = filterRec === 'All' || f.recommendation === filterRec
      return matchSearch && matchType && matchClass && matchRec
    })
  }, [search, filterType, filterClass, filterRec])

  const recColor: Record<string, string> = {
    Delete: 'bg-red-100 text-red-700',
    Archive: 'bg-blue-100 text-blue-700',
    Review: 'bg-orange-100 text-orange-700',
    Compress: 'bg-purple-100 text-purple-700',
    Keep: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Storage Analysis</h2>
        <p className="text-sm text-gray-500 mt-0.5">Deep dive into your cloud storage usage and identify waste.</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Storage', value: kpiSummary.totalStorage, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Used Storage', value: kpiSummary.usedStorage, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Available', value: kpiSummary.availableStorage, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Utilization', value: `${kpiSummary.utilizationPercent}%`, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-2', c.bg)}>
              <HardDrive className={clsx('w-4 h-4', c.color)} />
            </div>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={clsx('text-xl font-bold mt-0.5', c.color)}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Utilization bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title">Storage Utilization</h3>
          <span className="text-sm font-bold text-gray-700">{kpiSummary.utilizationPercent}% used</span>
        </div>
        <ProgressBar value={kpiSummary.utilizationPercent} size="lg" color="bg-blue-500" />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">Used: {kpiSummary.usedStorage}</span>
          <span className="text-xs text-gray-400">Available: {kpiSummary.availableStorage}</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Storage Growth Over Time" subtitle="TB consumed month by month">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={storageGrowthData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} unit=" TB" axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v} TB`, 'Storage']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="storage" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Storage by File Type" subtitle="Distribution of 12.8 TB">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={180}>
              <PieChart>
                <Pie data={fileTypeData} cx="50%" cy="50%" innerRadius={46} outerRadius={72}
                  dataKey="value" paddingAngle={2}>
                  {fileTypeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} TB`, '']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {fileTypeData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{d.value} TB</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* File table */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="section-title">File Inventory</h3>
              <p className="section-sub">{filtered.length} files shown</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-52"
              />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
              {FILE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
              {STORAGE_CLASSES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterRec} onChange={e => setFilterRec(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
              {RECOMMENDATIONS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['File Name', 'Type', 'Size', 'Last Accessed', 'Owner', 'Storage Class', 'Dept', 'Recommendation'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-800 text-xs max-w-[200px] block truncate" title={f.name}>{f.name}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{f.type}</td>
                    <td className="py-3 px-4 text-xs font-medium text-gray-700">{f.size}</td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">{f.lastAccessed}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{f.owner}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{f.storageClass}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{f.department}</td>
                    <td className="py-3 px-4">
                      <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', recColor[f.recommendation] ?? 'bg-gray-100 text-gray-600')}>
                        {f.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
