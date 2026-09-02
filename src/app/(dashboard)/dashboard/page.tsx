'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HardDrive, DollarSign, TrendingDown, Gauge, Copy, Clock,
  Sparkles, ArrowRight, RefreshCw, Zap, ShieldCheck, CheckCircle2,
  SlidersHorizontal, Download, Layers, Flame, Database, UploadCloud,
  FileSpreadsheet, AlertTriangle, Archive, ArrowUpRight
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
import { useAuth } from '@/context/AuthContext'
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
  const { analysisResult, records, hasData, dataSourceName, dataSourceType, loadDemoData } = useStorageData()
  const { user } = useAuth()

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

  // Sorted most used categories
  const mostUsedCategories = [...analysisResult.byFileType].sort((a, b) => b.storageGB - a.storageGB)

  // Low activity & optimization candidate metrics
  const highlyInactiveCount = records.filter(r => r.isHighlyInactive).length
  const highlyInactiveGB = Math.round(records.filter(r => r.isHighlyInactive).reduce((acc, r) => acc + r.sizeGB, 0))
  const archiveCandidatesCount = records.filter(r => r.storageClass === 'STANDARD' && (r.isInactive || r.isHighlyInactive)).length
  const archiveCandidatesGB = Math.round(records.filter(r => r.storageClass === 'STANDARD' && (r.isInactive || r.isHighlyInactive)).reduce((acc, r) => acc + r.sizeGB, 0))

  // If no dataset loaded, display the empty state prompt
  if (!hasData) {
    return (
      <div className="card p-12 text-center max-w-2xl mx-auto my-12 space-y-5 border border-slate-800 card-glow-blue">
        <div className="w-16 h-16 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">No Dataset Loaded for {user?.companyName || 'Your Account'}</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Upload your cloud storage usage CSV metadata or load the built-in demo dataset to analyze costs, waste, and optimization opportunities.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/import" className="btn-primary text-xs py-2.5 px-5 font-black">
            <UploadCloud className="w-4 h-4 mr-1.5" />
            Upload Storage CSV
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
      {/* Hero Header Banner with Company Identity */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 rounded-3xl text-white shadow-2xl border border-blue-500/30 backdrop-blur-xl relative overflow-hidden w-full min-w-0">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="px-3 py-1 bg-yellow-400/20 border border-yellow-400/30 backdrop-blur-md rounded-full text-xs font-black text-yellow-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Active Storage Audit
              </span>
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-bold text-cyan-300">
                Company: <strong className="text-white">{user?.companyName || 'NovaTech Solutions'}</strong>
              </span>
              <span className="px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-full text-xs font-medium text-slate-300">
                Source: {dataSourceName}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {greeting}, {user?.name?.split(' ')[0] || 'Customer'} 👋
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Identified <strong className="text-emerald-400 font-extrabold underline underline-offset-4 decoration-emerald-500">₹{analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}/mo</strong> in recoverable storage spend across {analysisResult.totalObjects} analyzed objects.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            <button
              onClick={() => router.push('/recommendations')}
              className="btn-yellow text-xs font-black shadow-lg"
            >
              <Zap className="w-4 h-4 text-gray-950" />
              Review {analysisResult.recommendations.length} Actionable Fixes
            </button>
            <button
              onClick={() => router.push('/reports')}
              className="btn-secondary text-xs font-bold flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards — User-Specific Storage & Cost Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full min-w-0">
        {/* 1. Total Storage */}
        <MetricCard
          title="Total Storage"
          value={totalStorageDisplay}
          subtitle={`${analysisResult.totalObjects.toLocaleString()} objects indexed`}
          icon={<HardDrive className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-cyan-500/20 text-cyan-300"
          glowColor="cyan"
          onClick={() => router.push('/storage')}
        />

        {/* 2. Estimated Monthly Cost */}
        <MetricCard
          title="Estimated Monthly Cost"
          value={`₹${analysisResult.currentMonthlyCost.toLocaleString('en-IN')}`}
          subtitle="Demo pricing model"
          icon={<DollarSign className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/20 text-purple-300"
          glowColor="purple"
          onClick={() => router.push('/cost-analysis')}
        />

        {/* 3. Estimated Optimized Cost */}
        <MetricCard
          title="Estimated Optimized Cost"
          value={`₹${analysisResult.potentialMonthlyCost.toLocaleString('en-IN')}`}
          subtitle={`After recommended tiering`}
          icon={<TrendingDown className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/20 text-blue-300"
          glowColor="blue"
          onClick={() => router.push('/cost-analysis')}
        />

        {/* 4. Potential Monthly Savings */}
        <MetricCard
          title="Potential Monthly Savings"
          value={`₹${analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}`}
          change={`${analysisResult.savingsPercentage}%`}
          changeType="positive"
          changeLabel="recoverable"
          icon={<Zap className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/20 text-emerald-300"
          glowColor="emerald"
          onClick={() => router.push('/recommendations')}
        />

        {/* 5. Optimization Score */}
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
      </div>

      {/* SECTION 7 & 8: MOST USED STORAGE VS LEAST USED STORAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        {/* Most Used Storage */}
        <div className="card p-6 card-glow-blue flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Most Used Storage</h3>
                  <p className="text-xs text-slate-400">Categories consuming the largest share of capacity</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">{mostUsedCategories.length} Categories</span>
            </div>

            <div className="divide-y divide-slate-800/80 mt-4">
              {mostUsedCategories.slice(0, 5).map((cat, idx) => (
                <div key={cat.name} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-500 w-4">#{idx + 1}</span>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <div className="min-w-0 truncate">
                      <p className="text-xs font-bold text-white truncate">{cat.name}</p>
                      <p className="text-[10px] text-slate-400">{cat.fileCount} files indexed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 text-right">
                    <div>
                      <p className="text-xs font-black text-white">{cat.storageGB} GB</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{cat.percentage}% of pool</p>
                    </div>
                    <div className="min-w-[80px]">
                      <span className="text-xs font-black text-purple-300">₹{cat.cost.toLocaleString('en-IN')}</span>
                      <p className="text-[10px] text-slate-500">/month</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Monitored Category Pool</span>
            <Link href="/storage" className="text-blue-400 hover:underline font-bold flex items-center gap-1">
              Deep Category Audit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Least Used / Low Activity Storage */}
        <div className="card p-6 card-glow-emerald flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Least Used / Low Activity Storage</h3>
                  <p className="text-xs text-slate-400">Identified optimization candidates and idle assets</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                Savings Target
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {/* Inactive Storage */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Inactive Storage</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-lg font-black text-white">{analysisResult.inactiveStorageGB} GB</p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {analysisResult.inactiveObjectsCount} objects unaccessed &gt; 180 days
                </p>
                <div className="mt-2 text-[10px] font-bold text-amber-400 flex items-center gap-1">
                  <span>Optimization Candidate</span>
                </div>
              </div>

              {/* Duplicate Candidates */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Duplicate Candidates</span>
                  <Copy className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <p className="text-lg font-black text-orange-300">{analysisResult.duplicateRecoverableStorageGB} GB</p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {analysisResult.duplicateCandidatesCount} redundant file copies
                </p>
                <div className="mt-2 text-[10px] font-bold text-orange-400 flex items-center gap-1">
                  <span>₹{analysisResult.duplicateEstimatedSavings}/mo recoverable</span>
                </div>
              </div>

              {/* Archive Candidates */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Archive Candidates</span>
                  <Archive className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-lg font-black text-white">{archiveCandidatesGB} GB</p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {archiveCandidatesCount} Standard tier files ready for Glacier
                </p>
                <div className="mt-2 text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                  <span>Move to Cold Tier</span>
                </div>
              </div>

              {/* Highly Inactive (>365d) */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Highly Inactive Storage</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <p className="text-lg font-black text-rose-300">{highlyInactiveGB} GB</p>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {highlyInactiveCount} objects unaccessed &gt; 1 year
                </p>
                <div className="mt-2 text-[10px] font-bold text-rose-400 flex items-center gap-1">
                  <span>Deep Archive Candidate</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Actionable Opportunities</span>
            <Link href="/recommendations" className="text-emerald-400 hover:underline font-bold flex items-center gap-1">
              Apply Recommended Tiering <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Analytics Charts: Cost Trajectory & Age Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full min-w-0">
        {/* Cost Trajectory */}
        <div className="xl:col-span-2 min-w-0">
          <ChartCard
            title="Estimated Cloud Storage Cost Trajectory (₹)"
            subtitle="Current spending vs simulated post-optimization curve (Demo Pricing Model)"
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

      {/* Storage Class Allocation */}
      <div className="card p-6 w-full min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title mb-1">Storage Class Allocation & Invoiced Estimates</h3>
            <p className="section-sub">Direct cost allocation calculated across active storage classes (Demo Pricing)</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Total: {totalStorageDisplay}</span>
        </div>

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
