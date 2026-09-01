'use client'

import { useState, useMemo } from 'react'
import {
  Search, Filter, HardDrive, Database, Archive, FileText,
  Video, Image, AlertCircle, ArrowUpRight, Check, Trash2, Zap
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import ChartCard from '@/components/ui/ChartCard'
import ProgressBar from '@/components/ui/ProgressBar'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/layout/PageHeader'
import { kpiSummary, storageGrowthData, fileTypeData, filesData } from '@/lib/mockData'
import type { FileRow } from '@/types'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const FILE_TYPES = ['All', 'Backup', 'Log', 'Video', 'Document', 'Image', 'Archive', 'Other']
const STORAGE_CLASSES = ['All', 'Standard', 'Infrequent Access', 'Archive', 'Deep Archive']
const RECOMMENDATIONS = ['All', 'Delete', 'Archive', 'Review', 'Compress', 'Keep']

export default function StoragePage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterClass, setFilterClass] = useState('All')
  const [filterRec, setFilterRec] = useState('All')
  const [fileList, setFileList] = useState<FileRow[]>(filesData)

  const filtered = useMemo(() => {
    return fileList.filter(f => {
      const matchSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.owner.toLowerCase().includes(search.toLowerCase()) ||
        f.department.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'All' || f.type === filterType
      const matchClass = filterClass === 'All' || f.storageClass === filterClass
      const matchRec = filterRec === 'All' || f.recommendation === filterRec
      return matchSearch && matchType && matchClass && matchRec
    })
  }, [fileList, search, filterType, filterClass, filterRec])

  function handleFileAction(file: FileRow) {
    if (file.recommendation === 'Delete') {
      setFileList(prev => prev.filter(f => f.id !== file.id))
      toast.success(`Purged stale file "${file.name}" (freed ${file.size})!`, { icon: '🗑️' })
    } else if (file.recommendation === 'Archive') {
      setFileList(prev => prev.map(f => f.id === file.id ? { ...f, storageClass: 'Archive', recommendation: 'Keep' } : f))
      toast.success(`Moved "${file.name}" to Deep Glacier Archive (-80% cost)!`, { icon: '📦' })
    } else if (file.recommendation === 'Compress') {
      setFileList(prev => prev.map(f => f.id === file.id ? { ...f, size: '7 GB', recommendation: 'Keep' } : f))
      toast.success(`GZIP compression applied to "${file.name}" (-75% storage)!`, { icon: '🗜️' })
    } else {
      toast.success(`File "${file.name}" verified!`, { icon: '✅' })
    }
  }

  const recColor: Record<string, string> = {
    Delete: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    Archive: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    Review: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Compress: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    Keep: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Standardized Page Header */}
      <PageHeader
        title="Storage Utilization & Waste Inspector"
        subtitle="Inspect multi-cloud object storage buckets, tier distribution, and identify large stale files."
        badge="12.8 TB Monitored"
        actions={
          <span className="px-3.5 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-black">
            27 Bucket Containers
          </span>
        }
      />

      {/* Top Overview Cards with Colorful Glows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        {[
          { label: 'Total Allocated', value: kpiSummary.totalStorage, sub: 'Across 3 Providers', icon: HardDrive, glow: 'card-glow-cyan', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
          { label: 'Used Storage', value: kpiSummary.usedStorage, sub: 'Active & Inactive', icon: Database, glow: 'card-glow-purple', color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { label: 'Available Free', value: kpiSummary.availableStorage, sub: 'Remaining Quota', icon: Archive, glow: 'card-glow-emerald', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
          { label: 'Utilization', value: `${kpiSummary.utilizationPercent}%`, sub: 'Above 80% threshold', icon: AlertCircle, glow: 'card-glow-amber', color: 'text-amber-400', bg: 'bg-amber-500/20' },
        ].map(c => (
          <div key={c.label} className={clsx('card p-5 min-w-0', c.glow)}>
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm border border-white/10 flex-shrink-0', c.bg)}>
              <c.icon className={clsx('w-5 h-5', c.color)} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">{c.label}</p>
            <p className={clsx('text-2xl font-black mt-1 tracking-tight truncate', c.color)}>{c.value}</p>
            <p className="text-[11px] text-slate-400 mt-1 truncate">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Storage Utilization Bar */}
      <div className="card p-5 card-glow-blue w-full min-w-0">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="section-title">Storage Utilization Progress</h3>
            <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              83% Warning
            </span>
          </div>
          <span className="text-sm font-black text-white">10.6 TB of 12.8 TB</span>
        </div>
        <ProgressBar value={kpiSummary.utilizationPercent} size="lg" color="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />
        <div className="flex flex-col sm:flex-row justify-between mt-2 text-xs font-bold text-slate-400 gap-1">
          <span>Used: 10.6 TB (Standard: 6.8 TB, Archive: 2.2 TB, Backups: 1.6 TB)</span>
          <span>Free Headroom: 2.2 TB</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        <ChartCard title="12-Month Storage Consumption Curve" subtitle="TB usage progression across 2026">
          <div className="w-full h-[240px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storageGrowthData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="storageAreaGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" TB" axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [`${v} TB`, 'Storage']}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#fff' }}
                />
                <Area type="monotone" dataKey="storage" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#storageAreaGrad2)" activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Storage by Media / Object Category" subtitle="Breakdown by file extension and type">
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full min-w-0">
            <div className="w-44 h-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fileTypeData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={3}>
                    {fileTypeData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} TB`, '']}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-2.5 min-w-0">
              {fileTypeData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs min-w-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-semibold text-slate-300 truncate">{d.name}</span>
                  </div>
                  <span className="font-black text-white ml-2 flex-shrink-0">{d.value} TB</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* File Inventory Filterable Table */}
      <div className="card w-full min-w-0">
        <div className="p-5 border-b border-slate-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="section-title">Object Storage File Inventory</h3>
              <p className="section-sub">{filtered.length} files matching current filter criteria</p>
            </div>

            {/* Quick Filter Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {FILE_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={clsx(
                    'px-3 py-1 rounded-xl text-xs font-black transition-all flex-shrink-0',
                    filterType === t
                      ? 'bg-blue-600 text-white shadow-md border border-blue-400/40'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search file name, owner or department..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>

            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="text-xs font-bold border border-slate-700 rounded-xl px-3 py-2.5 bg-slate-900 text-slate-200 outline-none"
            >
              <option value="All">All Storage Classes</option>
              {STORAGE_CLASSES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={filterRec}
              onChange={e => setFilterRec(e.target.value)}
              className="text-xs font-bold border border-slate-700 rounded-xl px-3 py-2.5 bg-slate-900 text-slate-200 outline-none"
            >
              <option value="All">All Recommendations</option>
              {RECOMMENDATIONS.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No files matched your filters" description="Try clearing search keywords or selecting 'All' filters." />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-black uppercase tracking-wider">
                  <th className="text-left py-3.5 px-4">File Name</th>
                  <th className="text-left py-3.5 px-4">Type</th>
                  <th className="text-left py-3.5 px-4">Size</th>
                  <th className="text-left py-3.5 px-4">Last Accessed</th>
                  <th className="text-left py-3.5 px-4">Owner</th>
                  <th className="text-left py-3.5 px-4">Storage Class</th>
                  <th className="text-left py-3.5 px-4">Dept</th>
                  <th className="text-left py-3.5 px-4">Recommendation</th>
                  <th className="text-right py-3.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 px-4 font-bold text-white max-w-[200px] truncate" title={f.name}>
                      {f.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-bold text-slate-300">
                        {f.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-white">{f.size}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{f.lastAccessed}</td>
                    <td className="py-3 px-4 text-slate-300">{f.owner}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                        {f.storageClass}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{f.department}</td>
                    <td className="py-3 px-4">
                      <span className={clsx('px-2.5 py-0.5 rounded-full text-[11px] font-black border', recColor[f.recommendation])}>
                        {f.recommendation}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleFileAction(f)}
                        className={clsx(
                          'px-2.5 py-1 text-xs font-black rounded-lg transition-all',
                          f.recommendation === 'Delete' && 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm',
                          f.recommendation === 'Archive' && 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm',
                          f.recommendation === 'Compress' && 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm',
                          f.recommendation === 'Keep' && 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700',
                          f.recommendation === 'Review' && 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                        )}
                      >
                        {f.recommendation === 'Delete' ? 'Delete' : f.recommendation === 'Archive' ? 'Archive' : f.recommendation === 'Compress' ? 'Compress' : 'Verify'}
                      </button>
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
