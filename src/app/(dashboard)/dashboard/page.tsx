'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  HardDrive, DollarSign, TrendingDown, Gauge, Copy, Clock,
  Sparkles, ArrowRight, RefreshCw, Zap, ShieldCheck, CheckCircle2,
  SlidersHorizontal, Download, Layers, Flame, Database
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
import CloudArchitectureDiagram from '@/components/features/CloudArchitectureDiagram'
import ProgressBar from '@/components/ui/ProgressBar'
import { useDateRange } from '@/app/(dashboard)/layout'
import {
  kpiSummary, costTrendData, storageGrowthData, fileTypeData,
  departmentData, costBreakdown, activityData
} from '@/lib/mockData'
import toast from 'react-hot-toast'

// Score Ring with Glowing Golden Yellow / Cyan Radial Meter
function ScoreRing({ score }: { score: number }) {
  const r = 32
  const c = 2 * Math.PI * r
  const dash = (score / 100) * c
  return (
    <div className="relative flex items-center justify-center my-2">
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="url(#goldenScoreGrad)"
          strokeWidth="8"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="goldenScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center flex flex-col items-center">
        <span className="text-xl font-black text-white leading-none">{score}</span>
        <span className="text-[10px] font-bold text-yellow-400 uppercase">/ 100</span>
      </div>
    </div>
  )
}

const fmtRupee = (v: number) => `₹${(v / 1000).toFixed(0)}K`

export default function DashboardPage() {
  const router = useRouter()
  const dateRange = useDateRange()
  const [currentScore, setCurrentScore] = useState(kpiSummary.optimizationScore)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  function triggerQuickOptimize() {
    setCurrentScore(88)
    toast.success('Quick Optimization Applied! Health Score upgraded to 88/100 (+16 pts)', {
      icon: '🚀',
      duration: 5000,
      style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
    })
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Hero Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 rounded-3xl text-white shadow-2xl border border-blue-500/30 backdrop-blur-xl relative overflow-hidden">
        {/* Glowing Background Orbs */}
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 backdrop-blur-md rounded-full text-xs font-black text-yellow-300 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              CloudCut AI Optimization Engine Active
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{greeting}, Admin 👋</h2>
            <p className="text-slate-200 text-sm mt-1 max-w-2xl leading-relaxed">
              Real-time audit identified <strong className="text-emerald-400 font-extrabold underline underline-offset-4 decoration-emerald-500">₹31,800/mo</strong> in recoverable spend across AWS S3, GCP & Azure Blob storage.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => router.push('/recommendations')}
              className="btn-yellow text-xs font-black"
            >
              <Zap className="w-4 h-4 text-gray-950" />
              Review 5 Optimizations
            </button>
            <button
              onClick={triggerQuickOptimize}
              className="btn-emerald text-xs font-extrabold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Quick Auto-Tune
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards — 6 Colorful Metric Cards with Distinct Glow Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Storage (Blue / Cyan) */}
        <MetricCard
          title="Total Storage"
          value={kpiSummary.totalStorage}
          change={kpiSummary.totalStorageChange}
          changeType="negative"
          changeLabel="vs last month"
          icon={<HardDrive className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-cyan-500/20 text-cyan-300"
          glowColor="cyan"
          onClick={() => router.push('/storage')}
        />

        {/* 2. Monthly Cost (Purple) */}
        <MetricCard
          title="Monthly Cost"
          value={kpiSummary.monthlyCost}
          change={kpiSummary.monthlyCostChange}
          changeType="negative"
          changeLabel="vs last month"
          icon={<DollarSign className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/20 text-purple-300"
          glowColor="purple"
          onClick={() => router.push('/cost-analysis')}
        />

        {/* 3. Potential Savings (Emerald) */}
        <MetricCard
          title="Potential Savings"
          value={kpiSummary.potentialSavings}
          change="25.5%"
          changeType="positive"
          changeLabel="opportunity"
          icon={<TrendingDown className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/20 text-emerald-300"
          glowColor="emerald"
          onClick={() => router.push('/recommendations')}
        />

        {/* 4. Health Score (Golden Yellow) */}
        <div
          onClick={() => router.push('/recommendations')}
          className="card p-5 card-glow-yellow hover:shadow-yellow-500/20 cursor-pointer hover:scale-[1.03] transition-transform select-none"
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Health Score</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/30">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <ScoreRing score={currentScore} />
          <div className="text-center">
            <span className="inline-block px-2.5 py-0.5 bg-yellow-400/20 text-yellow-300 text-xs font-black rounded-full border border-yellow-400/30">
              {currentScore >= 80 ? 'Optimal Status' : 'Good Opportunity'}
            </span>
          </div>
        </div>

        {/* 5. Duplicate Waste (Orange) */}
        <MetricCard
          title="Duplicate Waste"
          value={kpiSummary.duplicateStorage}
          subtitle={`${kpiSummary.duplicateFiles.toLocaleString()} redundant files`}
          icon={<Copy className="w-5 h-5 text-orange-400" />}
          iconBg="bg-orange-500/20 text-orange-300"
          glowColor="orange"
          onClick={() => router.push('/duplicates')}
        />

        {/* 6. Inactive Cold Files (Red) */}
        <MetricCard
          title="Inactive Files"
          value={kpiSummary.inactiveStorage}
          subtitle={`${kpiSummary.inactiveFiles.toLocaleString()} stale objects`}
          icon={<Clock className="w-5 h-5 text-red-400" />}
          iconBg="bg-red-500/20 text-red-300"
          glowColor="red"
          onClick={() => router.push('/storage')}
        />
      </div>

      {/* Main Analytics Charts with Colorful Gradients */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Cost Trend with Area Fill & Glow */}
        <div className="xl:col-span-2">
          <ChartCard
            title="Cloud Storage Cost Trajectory (₹)"
            subtitle={`Monthly billing expenditure vs projected curve (${dateRange.toUpperCase()})`}
            action={
              <button
                onClick={() => router.push('/cost-analysis')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Cost Explorer <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={costTrendData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="currentCostGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="projCostGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtRupee} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#fff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                <Area type="monotone" dataKey="current" name="Current Invoiced (₹)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#currentCostGrad)" activeDot={{ r: 6, fill: '#38bdf8' }} />
                <Area type="monotone" dataKey="projected" name="Projected Trajectory (₹)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#projCostGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Storage Growth with Emerald/Cyan Gradient */}
        <ChartCard
          title="Storage Consumption Growth"
          subtitle="Total TB under management (5.0 → 12.8 TB)"
          action={
            <button onClick={() => router.push('/storage')} className="text-xs font-bold text-emerald-400 hover:underline">
              Analyze →
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={storageGrowthData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="storageAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" TB" axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`${v} TB`, 'Storage']}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#fff' }}
              />
              <Area type="monotone" dataKey="storage" name="Total Storage" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#storageAreaGrad)" activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* NEW: Interactive Cloud Storage Architecture Flow Diagram */}
      <CloudArchitectureDiagram />

      {/* Distribution Section with Colorful Palettes */}
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
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full space-y-2.5">
              {fileTypeData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md shadow-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-semibold text-slate-300">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">{d.value} TB</span>
                    <span className="text-slate-400 text-[10px]">({Math.round((d.value / 12.8) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Department Distribution (Multi-color bar chart) */}
        <ChartCard title="Department Storage Allocation" subtitle="GB usage per business unit">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={departmentData} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 75 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v} GB`} />
              <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#f8fafc', fontWeight: 700 }} axisLine={false} tickLine={false} width={75} />
              <Tooltip
                formatter={(v: number) => [`${v.toLocaleString()} GB (₹${Math.round(v * 9.8).toLocaleString('en-IN')}/mo)`, 'Usage']}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="storage" fill="url(#deptGradVibrant)" radius={[0, 8, 8, 0]}>
                <defs>
                  <linearGradient id="deptGradVibrant" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#f59e0b" />
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
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/80 hover:shadow-lg transition-all group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-105 border border-white/10"
                    style={{ backgroundColor: `${item.color}25`, color: item.color }}
                  >
                    {item.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200 truncate">{item.label}</span>
                      <span className="text-xs font-black text-white ml-2">{item.amount}</span>
                    </div>
                    <ProgressBar value={item.percentage} size="sm" color={`bg-[${item.color}]`} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* AI Scan Side Panel */}
        <div className="space-y-4">
          <AIScanPanel />

          {/* Quick Storage Meter with Cyan / Emerald Glow */}
          <div className="card p-5 card-glow-cyan">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Bucket Pool Capacity</span>
              <span className="text-xs font-black text-cyan-400">{kpiSummary.utilizationPercent}% In Use</span>
            </div>
            <ProgressBar value={kpiSummary.utilizationPercent} color="bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-500" size="lg" />
            <div className="flex justify-between mt-2 text-[11px] font-bold text-slate-400">
              <span>Used: {kpiSummary.usedStorage}</span>
              <span>Available: {kpiSummary.availableStorage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-700/80">
          <div>
            <h3 className="section-title flex items-center gap-2">
              <span>Recent Waste Events & Detections</span>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-black rounded-full border border-blue-500/30">5 Pending</span>
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
