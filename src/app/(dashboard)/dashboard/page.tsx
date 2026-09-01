'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HardDrive, DollarSign, TrendingDown, Gauge, Copy, Clock,
  Sparkles, ArrowRight, RefreshCw, Zap, ShieldCheck, CheckCircle2,
  SlidersHorizontal, Download, Layers, Flame, Database, UploadCloud
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts'
import MetricCard from '@/components/ui/MetricCard'
import ChartCard from '@/components/ui/ChartCard'
import CloudArchitectureDiagram from '@/components/features/CloudArchitectureDiagram'
import ProgressBar from '@/components/ui/ProgressBar'
import { useDateRange } from '@/app/(dashboard)/layout'
import { useStorageData } from '@/context/StorageDataContext'
import toast from 'react-hot-toast'

// Score Ring with Glowing Radial Meter
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

const fmtRupee = (v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`

export default function DashboardPage() {
  const router = useRouter()
  const dateRange = useDateRange()
  const { analysisResult, records, hasData, loadDemoData } = useStorageData()

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Dynamic storage display
  const totalStorageDisplay = analysisResult.totalStorageGB >= 1000
    ? `${(analysisResult.totalStorageGB / 1000).toFixed(2)} TB`
    : `${analysisResult.totalStorageGB.toFixed(1)} GB`

  // Dynamic simulated cost trajectory curve
  const currentCost = analysisResult.currentMonthlyCost
  const optimizedCost = analysisResult.potentialMonthlyCost
  const trajectoryData = [
    { month: 'Apr', current: Math.round(currentCost * 0.88), projected: Math.round(optimizedCost * 0.95) },
    { month: 'May', current: Math.round(currentCost * 0.92), projected: Math.round(optimizedCost * 0.96) },
    { month: 'Jun', current: Math.round(currentCost * 0.95), projected: Math.round(optimizedCost * 0.97) },
    { month: 'Jul', current: Math.round(currentCost * 0.98), projected: Math.round(optimizedCost * 0.99) },
    { month: 'Aug', current: currentCost, projected: optimizedCost },
    { month: 'Sep (Sim)', current: Math.round(currentCost * 1.05), projected: optimizedCost },
  ]

  // If no dataset loaded, display the empty state prompt
  if (!hasData) {
    return (
      <div className="card p-12 text-center max-w-2xl mx-auto my-12 space-y-5 border border-slate-800 card-glow-blue">
        <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">No Cloud Storage Data Loaded</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Upload your cloud storage usage CSV or load the built-in demo dataset to inspect real calculated costs and savings.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/import" className="btn-primary text-xs py-2.5 px-5 font-black">
            <UploadCloud className="w-4 h-4 mr-1.5" />
            Import CSV Dataset
          </Link>
          <button onClick={loadDemoData} className="btn-yellow text-xs py-2.5 px-5 font-black">
            <Sparkles className="w-4 h-4 mr-1.5 text-gray-950" />
            Load Demo Dataset
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Hero Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 rounded-3xl text-white shadow-2xl border border-blue-500/30 backdrop-blur-xl relative overflow-hidden w-full min-w-0">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 backdrop-blur-md rounded-full text-xs font-black text-yellow-300 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Dataset Analysis Engine Active
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{greeting}, Admin 👋</h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Calculated <strong className="text-emerald-400 font-extrabold underline underline-offset-4 decoration-emerald-500">₹{analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}/mo</strong> in recoverable storage spend across {analysisResult.totalObjects} analyzed objects.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            <button
              onClick={() => router.push('/recommendations')}
              className="btn-yellow text-xs font-black"
            >
              <Zap className="w-4 h-4 text-gray-950" />
              Review {analysisResult.recommendations.length} Actionable Fixes
            </button>
            <button
              onClick={() => router.push('/cost-analysis')}
              className="btn-emerald text-xs font-extrabold"
            >
              <TrendingDown className="w-4 h-4" />
              Cost Explorer
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards — 6 Colorful Metric Cards dynamically derived from dataset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full min-w-0">
        {/* 1. Total Storage */}
        <MetricCard
          title="Total Storage"
          value={totalStorageDisplay}
          subtitle={`${analysisResult.totalObjects.toLocaleString()} objects`}
          icon={<HardDrive className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-cyan-500/20 text-cyan-300"
          glowColor="cyan"
          onClick={() => router.push('/storage')}
        />

        {/* 2. Monthly Cost */}
        <MetricCard
          title="Estimated Monthly Cost"
          value={`₹${analysisResult.currentMonthlyCost.toLocaleString('en-IN')}`}
          subtitle="Demo pricing model"
          icon={<DollarSign className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/20 text-purple-300"
          glowColor="purple"
          onClick={() => router.push('/cost-analysis')}
        />

        {/* 3. Potential Savings */}
        <MetricCard
          title="Potential Savings"
          value={`₹${analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}`}
          change={`${analysisResult.savingsPercentage}%`}
          changeType="positive"
          changeLabel="recoverable"
          icon={<TrendingDown className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/20 text-emerald-300"
          glowColor="emerald"
          onClick={() => router.push('/recommendations')}
        />

        {/* 4. Optimization Score */}
        <div
          onClick={() => router.push('/recommendations')}
          className="card p-5 card-glow-yellow hover:shadow-yellow-500/20 cursor-pointer hover:scale-[1.03] transition-transform select-none min-w-0"
        >
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Optimization Score</p>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-yellow-400/20 text-yellow-300 font-bold border border-yellow-400/30 flex-shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <ScoreRing score={analysisResult.optimizationScore} />
          <div className="text-center">
            <span className="inline-block px-2.5 py-0.5 bg-yellow-400/20 text-yellow-300 text-xs font-black rounded-full border border-yellow-400/30">
              {analysisResult.scoreStatus}
            </span>
          </div>
        </div>

        {/* 5. Duplicate Waste */}
        <MetricCard
          title="Duplicate Waste"
          value={`${analysisResult.duplicateRecoverableStorageGB} GB`}
          subtitle={`${analysisResult.duplicateCandidatesCount} redundant copies`}
          icon={<Copy className="w-5 h-5 text-orange-400" />}
          iconBg="bg-orange-500/20 text-orange-300"
          glowColor="orange"
          onClick={() => router.push('/duplicates')}
        />

        {/* 6. Inactive Storage */}
        <MetricCard
          title="Inactive Storage"
          value={`${analysisResult.inactiveStorageGB} GB`}
          subtitle={`${analysisResult.inactiveObjectsCount} stale objects (>180d)`}
          icon={<Clock className="w-5 h-5 text-red-400" />}
          iconBg="bg-red-500/20 text-red-300"
          glowColor="red"
          onClick={() => router.push('/storage')}
        />
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full min-w-0">
        {/* Cost Trajectory */}
        <div className="xl:col-span-2 min-w-0">
          <ChartCard
            title="Cloud Storage Cost Trajectory (₹)"
            subtitle="Current spending vs simulated post-optimization curve (Demo Pricing)"
            action={
              <button
                onClick={() => router.push('/cost-analysis')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Cost Explorer <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="w-full h-[260px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="currentCostGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="projCostGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
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
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="current" name="Current Spend (₹)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#currentCostGrad)" activeDot={{ r: 6, fill: '#38bdf8' }} />
                  <Area type="monotone" dataKey="projected" name="Optimized Trajectory (₹)" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#projCostGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Age Distribution Chart */}
        <div className="min-w-0">
          <ChartCard
            title="Storage Age Distribution"
            subtitle="Storage classification by last-accessed date"
            action={
              <button onClick={() => router.push('/storage')} className="text-xs font-bold text-emerald-400 hover:underline">
                Filter Records →
              </button>
            }
          >
            <div className="w-full h-[260px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisResult.byAge} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit=" GB" axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => [`${v} GB`, 'Storage']}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#fff' }}
                  />
                  <Bar dataKey="storageGB" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Cloud Architecture Flow Diagram */}
      <CloudArchitectureDiagram />

      {/* Dynamic Breakdowns by File Type and Bucket */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        {/* Storage by File Category Donut */}
        <ChartCard title="Storage by File Category" subtitle={`${totalStorageDisplay} distributed across file types`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full min-w-0">
            <div className="w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysisResult.byFileType}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={80}
                    dataKey="storageGB"
                    paddingAngle={3}
                  >
                    {analysisResult.byFileType.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} GB`, '']}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full space-y-2.5 min-w-0">
              {analysisResult.byFileType.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs min-w-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-3 h-3 rounded-md shadow-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="font-semibold text-slate-300 truncate">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="font-black text-white">{d.storageGB} GB</span>
                    <span className="text-slate-400 text-[10px]">({d.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Bucket Storage Allocation */}
        <ChartCard title="Bucket Storage Allocation" subtitle="GB usage per bucket container">
          <div className="w-full h-[220px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisResult.byBucket} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v} GB`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#f8fafc', fontWeight: 700 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  formatter={(v: number) => [`${v} GB`, 'Storage']}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="storageGB" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Storage Class Breakdown Cards */}
      <div className="card p-6 w-full min-w-0">
        <h3 className="section-title mb-1">Storage Class Allocation & Invoiced Estimates</h3>
        <p className="section-sub mb-4">Direct cost allocation calculated across active storage classes</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analysisResult.byStorageClass.map(item => (
            <div
              key={item.name}
              className="p-4 rounded-2xl border border-slate-700/80 bg-slate-900/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white font-mono">{item.name}</span>
                  <span className="text-xs font-black text-cyan-400">{item.storageGB} GB</span>
                </div>
                <ProgressBar value={item.percentage} size="sm" color="bg-blue-500" />
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px]">{item.fileCount} files</span>
                <span className="font-black text-white">₹{item.cost.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
