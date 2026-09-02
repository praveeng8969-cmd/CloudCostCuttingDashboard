'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HardDrive, DollarSign, TrendingDown, Copy, Clock,
  ArrowRight, ShieldCheck, CheckCircle2,
  Database, UploadCloud, AlertCircle, Archive, Zap, FileText
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import MetricCard from '@/components/ui/MetricCard'
import ChartCard from '@/components/ui/ChartCard'
import ProgressBar from '@/components/ui/ProgressBar'
import { useStorageData } from '@/context/StorageDataContext'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { analysisResult, records, hasData, dataSourceName, loadDemoData } = useStorageData()
  const { user } = useAuth()

  if (!hasData) {
    return (
      <div className="space-y-6 w-full min-w-0 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Dashboard
              </h1>
              {user?.companyName && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {user.companyName}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Monitor storage usage, estimated costs, and optimization opportunities.
            </p>
          </div>
        </div>

        {/* Empty Dashboard State */}
        <div className="min-h-[460px] w-full rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/90 flex flex-col items-center justify-center p-8 text-center shadow-sm relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            No Dataset Loaded
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-1.5 mb-6 leading-relaxed">
            Upload your storage metadata CSV to begin analyzing your cloud storage usage and estimated costs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/import" className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Dataset
            </Link>
            <button
              onClick={() => {
                loadDemoData()
                toast.success('Loaded demo storage dataset!')
              }}
              className="btn-secondary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              Load Demo Dataset
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentMonthly = analysisResult.currentMonthlyCost
  const optimizedMonthly = analysisResult.potentialMonthlyCost
  const potentialSavings = analysisResult.potentialMonthlySavings
  const annualSavings = analysisResult.potentialAnnualSavings

  const totalStorageDisplay = analysisResult.totalStorageGB >= 1000
    ? `${(analysisResult.totalStorageGB / 1000).toFixed(2)} TB`
    : `${analysisResult.totalStorageGB} GB`

  // 6-Month Trajectory
  const trajectoryData = [
    { month: 'Apr', current: Math.round(currentMonthly * 0.90), optimized: Math.round(optimizedMonthly * 0.95) },
    { month: 'May', current: Math.round(currentMonthly * 0.94), optimized: Math.round(optimizedMonthly * 0.96) },
    { month: 'Jun', current: Math.round(currentMonthly * 0.96), optimized: Math.round(optimizedMonthly * 0.97) },
    { month: 'Jul', current: Math.round(currentMonthly * 0.98), optimized: Math.round(optimizedMonthly * 0.99) },
    { month: 'Aug', current: currentMonthly, optimized: optimizedMonthly },
    { month: 'Sep (Est)', current: Math.round(currentMonthly * 1.04), optimized: optimizedMonthly },
  ]

  // Storage Type Palette (Professional, non-neon)
  const PALETTE = ['#2563EB', '#64748B', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6']

  const pieData = analysisResult.byFileType.map((item, index) => ({
    name: item.name,
    value: item.storageGB,
    color: PALETTE[index % PALETTE.length]
  }))

  const mostUsed = [...analysisResult.byFileType].sort((a, b) => b.storageGB - a.storageGB)

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      {/* Top Greeting & Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            {user?.companyName && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {user.companyName}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor storage usage, estimated costs, and optimization opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Link href="/reports" className="btn-secondary text-xs">
            <FileText className="w-3.5 h-3.5" />
            Generate Report
          </Link>
          <Link href="/import" className="btn-primary text-xs">
            <UploadCloud className="w-3.5 h-3.5" />
            Import Data
          </Link>
        </div>
      </div>

      {/* 4 Core Financial & Storage KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Storage"
          value={totalStorageDisplay}
          subtitle={`${analysisResult.totalObjects.toLocaleString()} objects analyzed`}
          icon={<HardDrive className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Estimated Monthly Cost"
          value={`₹${currentMonthly.toLocaleString('en-IN')}`}
          subtitle="Current active storage rate"
          icon={<DollarSign className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Potential Monthly Savings"
          value={`₹${potentialSavings.toLocaleString('en-IN')}`}
          change={`${analysisResult.savingsPercentage}%`}
          changeType="positive"
          changeLabel="recoverable"
          subtitle={`₹${annualSavings.toLocaleString('en-IN')} / year`}
          icon={<TrendingDown className="w-4 h-4 text-emerald-600" />}
        />

        <MetricCard
          title="Optimization Health Score"
          value={`${analysisResult.optimizationScore} / 100`}
          subtitle="Based on tiering & duplicate efficiency"
          icon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Projection Chart */}
        <div className="card p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title">Cost Trajectory & Savings Projection</h3>
                <p className="section-sub">Current monthly spend versus optimized lifecycle tiering</p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                ₹{potentialSavings.toLocaleString('en-IN')}/mo opportunity
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="currentSpendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="optSpendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF' }}
                    formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                  <Area type="monotone" dataKey="current" name="Current Spend" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#currentSpendGrad)" />
                  <Area type="monotone" dataKey="optimized" name="Optimized Spend" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#optSpendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Storage Class Donut */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="section-title">Storage Breakdown</h3>
              <span className="text-xs text-slate-500">{pieData.length} categories</span>
            </div>
            <p className="section-sub mb-4">Distribution by file category</p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} GB`, 'Capacity']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-2">
              {pieData.slice(0, 4).map((entry) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 truncate">{entry.name}</span>
                  </div>
                  <span className="font-medium text-slate-900">{entry.value} GB</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Most Used Storage vs Low Activity Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Storage */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="section-title">Most Used Storage</h3>
              <Link href="/storage" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all files <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="section-sub mb-4">Storage categories consuming the largest share of capacity.</p>

            <div className="space-y-3.5">
              {mostUsed.slice(0, 5).map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{cat.name}</span>
                    <span className="text-slate-500">{cat.storageGB} GB ({cat.percentage}%) • ₹{cat.cost}/mo</span>
                  </div>
                  <ProgressBar value={cat.percentage} color="bg-blue-600" size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Activity / Inactive Storage */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="section-title">Low Activity Storage</h3>
              <Link href="/recommendations" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Remediate <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="section-sub mb-4">Storage with limited recent activity or potential optimization opportunities.</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <p className="text-xs font-medium text-slate-500">Inactive Storage (&gt;180d)</p>
                <p className="text-xl font-semibold text-slate-900 mt-1">{analysisResult.inactiveStorageGB} GB</p>
                <p className="text-xs text-slate-500">{analysisResult.inactiveObjectsCount} stale objects</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <p className="text-xs font-medium text-slate-500">Duplicate Candidates</p>
                <p className="text-xl font-semibold text-slate-900 mt-1">{analysisResult.duplicateRecoverableStorageGB} GB</p>
                <p className="text-xs text-slate-500">{analysisResult.duplicateCandidatesCount} redundant copies</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <p className="text-xs font-medium text-slate-500">Standard Tier Inactive</p>
                <p className="text-xl font-semibold text-slate-900 mt-1">
                  {records.filter(r => r.storageClass === 'STANDARD' && r.isInactive).length} files
                </p>
                <p className="text-xs text-slate-500">Eligible for Glacier down-tier</p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                <p className="text-xs font-medium text-emerald-800">Recoverable Spend</p>
                <p className="text-xl font-semibold text-emerald-700 mt-1">₹{potentialSavings}/mo</p>
                <p className="text-xs text-emerald-600">₹{annualSavings.toLocaleString('en-IN')} annual</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Preview */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="section-title">Top Optimization Recommendations</h3>
          <Link href="/recommendations" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all {analysisResult.recommendations.length} recommendations <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <p className="section-sub mb-4">Recommended lifecycle rules and cleanup actions to reduce monthly spend.</p>

        <div className="divide-y divide-slate-100">
          {analysisResult.recommendations.slice(0, 3).map((rec) => (
            <div key={rec.id} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{rec.title}</p>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{rec.recommendedAction}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-emerald-700">+₹{rec.estimatedMonthlySavings.toLocaleString('en-IN')}/mo</p>
                <p className="text-[11px] text-slate-400">recoverable</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
