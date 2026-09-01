'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  HardDrive, DollarSign, TrendingDown, Gauge, Copy, Clock,
  Sparkles, ArrowRight, RefreshCw, Zap, ShieldCheck, CheckCircle2,
  SlidersHorizontal, Download
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts'
import MetricCard from '@/components/ui/MetricCard'
import ChartCard from '@/components/ui/ChartCard'
import ActivityTable from '@/components/features/ActivityTable'
import AIScanPanel from '@/components/features/AIScanPanel'
import ProgressBar from '@/components/ui/ProgressBar'
import { useDateRange } from '@/app/(dashboard)/layout'
import {
  kpiSummary, costTrendData, storageGrowthData, fileTypeData,
  departmentData, costBreakdown, activityData
} from '@/lib/mockData'
import toast from 'react-hot-toast'

// Score Ring with Glowing Radial Meter
function ScoreRing({ score }: { score: number }) {
  const r = 32
  const c = 2 * Math.PI * r
  const dash = (score / 100) * c
  return (
    <div className="relative flex items-center justify-center my-2">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="8" />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="8"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center flex flex-col items-center">
        <span className="text-xl font-black text-gray-900 dark:text-white leading-none">{score}</span>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">/ 100</span>
      </div>
    </div>
  )
}

const fmtRupee = (v: number) => `₹${(v / 1000).toFixed(0)}K`

export default function DashboardPage() {
  const router = useRouter()
  const dateRange = useDateRange()
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-scan'>('overview')
  const [currentScore, setCurrentScore] = useState(kpiSummary.optimizationScore)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  function triggerQuickOptimize() {
    setCurrentScore(88)
    toast.success('Quick Optimization Applied! Score increased to 88/100 (+16 pts)', {
      icon: '🚀',
      duration: 5000,
      style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
    })
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header with Hero Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 rounded-3xl text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-blue-100 mb-2 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              CloudCost Intelligence Engine v2.4
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{greeting}, Admin 👋</h2>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              CloudCut has identified <strong className="text-white underline decoration-emerald-400 underline-offset-2">₹31,800/mo</strong> in recoverable cloud spend across AWS, GCP & Azure storage buckets.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => router.push('/recommendations')}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-xs font-extrabold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              Review 5 Optimizations
            </button>
            <button
              onClick={triggerQuickOptimize}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Quick Fix
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards — 6 Vibrant Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Storage"
          value={kpiSummary.totalStorage}
          change={kpiSummary.totalStorageChange}
          changeType="negative"
          changeLabel="vs last month"
          icon={<HardDrive className="w-5 h-5 text-cyan-600" />}
          iconBg="bg-cyan-500/15 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400"
          glowColor="cyan"
          onClick={() => router.push('/storage')}
        />
        <MetricCard
          title="Monthly Cost"
          value={kpiSummary.monthlyCost}
          change={kpiSummary.monthlyCostChange}
          changeType="negative"
          changeLabel="vs last month"
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-500/15 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
          glowColor="purple"
          onClick={() => router.push('/cost-analysis')}
        />
        <MetricCard
          title="Potential Savings"
          value={kpiSummary.potentialSavings}
          change="25.5%"
          changeType="positive"
          changeLabel="opportunity"
          icon={<TrendingDown className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-500/15 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          glowColor="emerald"
          onClick={() => router.push('/recommendations')}
        />

        {/* Optimization Score Card with Dynamic Ring */}
        <div
          onClick={() => router.push('/recommendations')}
          className="card p-5 card-glow-blue hover:shadow-blue-500/10 cursor-pointer hover:scale-[1.02] transition-transform select-none"
        >
          <div className="flex items-start justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Health Score</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/15 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <ScoreRing score={currentScore} />
          <div className="text-center">
            <span className="inline-block px-2.5 py-0.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
              {currentScore >= 80 ? 'Excellent' : 'Good Opportunity'}
            </span>
          </div>
        </div>

        <MetricCard
          title="Duplicate Waste"
          value={kpiSummary.duplicateStorage}
          subtitle={`${kpiSummary.duplicateFiles.toLocaleString()} files redundant`}
          icon={<Copy className="w-5 h-5 text-amber-600" />}
          iconBg="bg-amber-500/15 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          glowColor="amber"
          onClick={() => router.push('/duplicates')}
        />
        <MetricCard
          title="Inactive Files"
          value={kpiSummary.inactiveStorage}
          subtitle={`${kpiSummary.inactiveFiles.toLocaleString()} cold files`}
          icon={<Clock className="w-5 h-5 text-rose-600" />}
          iconBg="bg-rose-500/15 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
          glowColor="rose"
          onClick={() => router.push('/storage')}
        />
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Cost Trend with Area Fill & Glow */}
        <div className="xl:col-span-2">
          <ChartCard
            title="Cloud Storage Cost Trajectory"
            subtitle={`Monthly billing expenditure vs projected curve (${dateRange.toUpperCase()})`}
            action={
              <button
                onClick={() => router.push('/cost-analysis')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Cost Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={costTrendData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="currentCostGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="projCostGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtRupee} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                <Area type="monotone" dataKey="current" name="Current Spend (₹)" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#currentCostGrad)" activeDot={{ r: 6, fill: '#2563eb' }} />
                <Area type="monotone" dataKey="projected" name="Projected Trajectory (₹)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#projCostGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Storage Growth */}
        <ChartCard
          title="Storage Consumption Growth"
          subtitle="Total TB under management (5.0 → 12.8 TB)"
          action={
            <button onClick={() => router.push('/storage')} className="text-xs font-bold text-purple-600 hover:underline">
              Analyze →
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={storageGrowthData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" TB" axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`${v} TB`, 'Storage']}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="storage" name="Total Storage" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#storageGrad)" activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Storage by File Type Donut */}
        <ChartCard title="Storage by File Category" subtitle="12.8 TB distributed by mime-type">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fileTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {fileTypeData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} TB`, '']}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full space-y-2.5">
              {fileTypeData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md shadow-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 dark:text-white">{d.value} TB</span>
                    <span className="text-gray-400 text-[10px]">({Math.round((d.value / 12.8) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Department Distribution */}
        <ChartCard title="Department Storage Allocation" subtitle="GB usage per business department">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={departmentData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 75 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} opacity={0.6} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${v} GB`} />
              <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} width={75} />
              <Tooltip
                formatter={(v: number) => [`${v.toLocaleString()} GB (₹${Math.round(v * 9.8).toLocaleString('en-IN')}/mo)`, 'Usage']}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="storage" fill="url(#deptGrad)" radius={[0, 8, 8, 0]}>
                <defs>
                  <linearGradient id="deptGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Cost Breakdown + AI Insight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cost Breakdown Cards */}
        <div className="lg:col-span-2">
          <ChartCard title="Where Your Cloud Money Goes" subtitle="Direct cost allocation across storage classes and egress">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {costBreakdown.map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    {item.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.label}</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white ml-2">{item.amount}</span>
                    </div>
                    <ProgressBar value={item.percentage} size="sm" color={`bg-[${item.color}]`} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* AI Scan & Insights Side Panel */}
        <div className="space-y-4">
          <AIScanPanel />

          {/* Quick Storage Meter */}
          <div className="card p-5 card-glow-cyan">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Storage Pool Health</span>
              <span className="text-xs font-extrabold text-cyan-600">{kpiSummary.utilizationPercent}% Used</span>
            </div>
            <ProgressBar value={kpiSummary.utilizationPercent} color="bg-gradient-to-r from-cyan-500 to-blue-600" size="lg" />
            <div className="flex justify-between mt-2 text-[11px] font-semibold text-gray-400">
              <span>Used: {kpiSummary.usedStorage}</span>
              <span>Available: {kpiSummary.availableStorage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="section-title flex items-center gap-2">
              <span>Recent Waste Events & Detections</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-xs font-bold rounded-full">5 Pending</span>
            </h3>
            <p className="section-sub">Latest automated scanner alerts across all connected buckets</p>
          </div>
          <button onClick={() => router.push('/recommendations')} className="btn-secondary text-xs">
            View All Actions →
          </button>
        </div>
        <ActivityTable data={activityData} />
      </div>
    </div>
  )
}
