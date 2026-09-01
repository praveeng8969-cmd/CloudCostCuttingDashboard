'use client'

import { useState } from 'react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import ChartCard from '@/components/ui/ChartCard'
import ProgressBar from '@/components/ui/ProgressBar'
import {
  kpiSummary, costTrendData, costByServiceData, costByClassData, costBreakdown
} from '@/lib/mockData'
import { TrendingUp, TrendingDown, DollarSign, Zap, Sliders, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const fmtRupee = (v: number) => `₹${(v / 1000).toFixed(0)}K`

const SERVICE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']
const CLASS_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function CostAnalysisPage() {
  const [duplicateCut, setDuplicateCut] = useState(true)
  const [backupArchive, setBackupArchive] = useState(true)
  const [snapshotCleanup, setSnapshotCleanup] = useState(true)

  // Dynamic simulation calculation
  const monthlyBase = 124500
  let simulatedSavings = 0
  if (duplicateCut) simulatedSavings += 12000
  if (backupArchive) simulatedSavings += 8500
  if (snapshotCleanup) simulatedSavings += 5200

  const simulatedMonthlyCost = monthlyBase - simulatedSavings
  const simulatedAnnualSpend = simulatedMonthlyCost * 12

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Cloud Cost & Billing Analytics</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Analyze storage invoices, unit pricing, and project post-optimization ROI.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs font-bold">
            Target Annual Savings: ₹3,81,600
          </span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Month Spend', value: '₹1,24,500', sub: 'September 2026 Billing', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-500/15', glow: 'card-glow-blue' },
          { label: 'Previous Month Spend', value: '₹1,10,600', sub: 'August 2026 Invoiced', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-500/15', glow: 'card-glow-purple' },
          { label: 'Monthly Increase', value: '+12.6%', sub: '₹13,900 increase MoM', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-500/15', glow: 'card-glow-rose' },
          { label: 'Identified Savings', value: '₹31,800', sub: '25.5% immediate margin', icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-emerald-500/15', glow: 'card-glow-emerald' },
        ].map(c => (
          <div key={c.label} className={clsx('card p-4.5', c.glow)}>
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm', c.bg)}>
              <c.icon className={clsx('w-5 h-5', c.color)} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{c.label}</p>
            <p className={clsx('text-2xl font-black mt-0.5 tracking-tight', c.color)}>{c.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Annual Cost Projection & Interactive Simulator */}
      <div className="card p-6 card-glow-purple">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="section-title">Annual Spending Trajectory & ROI Simulator</h3>
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-600 text-xs font-bold rounded-full">Interactive</span>
            </div>
            <p className="section-sub">Toggle optimization levers to simulate your yearly cloud invoice reduction.</p>
          </div>

          {/* Toggle Levers */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setDuplicateCut(!duplicateCut); toast.success('Simulation updated!') }}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5',
                duplicateCut
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Deduplicate (-₹12K)
            </button>
            <button
              onClick={() => { setBackupArchive(!backupArchive); toast.success('Simulation updated!') }}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5',
                backupArchive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Archive Cold Backups (-₹8.5K)
            </button>
            <button
              onClick={() => { setSnapshotCleanup(!snapshotCleanup); toast.success('Simulation updated!') }}
              className={clsx(
                'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5',
                snapshotCleanup
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Remove Snapshots (-₹5.2K)
            </button>
          </div>
        </div>

        {/* 3 Large Comparison Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Current Run-Rate (Annual)</span>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">₹14.94 Lakhs</p>
            <p className="text-xs text-gray-500 mt-1">₹1,24,500/mo without optimizations</p>
            <div className="mt-3">
              <ProgressBar value={100} color="bg-rose-500" size="md" />
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Simulated Optimized Bill</span>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
              ₹{(simulatedAnnualSpend / 100000).toFixed(2)} Lakhs
            </p>
            <p className="text-xs text-gray-500 mt-1">₹{simulatedMonthlyCost.toLocaleString('en-IN')}/mo with selected fixes</p>
            <div className="mt-3">
              <ProgressBar value={Math.round((simulatedAnnualSpend / 1494000) * 100)} color="bg-emerald-500" size="md" />
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Net Realized Savings</span>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
              ₹{((simulatedSavings * 12) / 100000).toFixed(2)} Lakhs/yr
            </p>
            <p className="text-xs text-gray-500 mt-1">₹{simulatedSavings.toLocaleString('en-IN')}/mo in direct wallet recovery</p>
            <div className="mt-3">
              <ProgressBar value={Math.round(((simulatedSavings * 12) / 381600) * 100)} color="bg-blue-600" size="md" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title="Monthly Cost Trend Comparison" subtitle="Jan–Dec 2026 Actual vs Projected Curve">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={costTrendData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="costAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtRupee} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
              <Area type="monotone" dataKey="current" name="Current Cost (₹)" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#costAreaGrad)" />
              <Line type="monotone" dataKey="projected" name="Projected (₹)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cost by Cloud Service Type" subtitle="Monthly billing per storage service category">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costByServiceData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />
              <XAxis dataKey="service" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtRupee} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Cost']}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                {costByServiceData.map((_, i) => <Cell key={i} fill={SERVICE_COLORS[i % SERVICE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Cost by Storage Class & Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Cost Share by Storage Class Tier" subtitle="Hot vs Warm vs Archive Tier billing">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-44 h-44 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costByClassData} cx="50%" cy="50%" innerRadius={48} outerRadius={74} dataKey="cost" paddingAngle={3}>
                    {costByClassData.map((_, i) => <Cell key={i} fill={CLASS_COLORS[i % CLASS_COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-2">
              {costByClassData.map((d, i) => (
                <div key={d.class} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLASS_COLORS[i] }} />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{d.class}</span>
                  </div>
                  <span className="font-extrabold text-gray-900 dark:text-white">₹{d.cost.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Detailed Breakdown Card */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Detailed Invoiced Items</h3>
          <div className="space-y-3">
            {costBreakdown.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1 text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="font-black text-gray-900 dark:text-white">{item.amount}</span>
                  </div>
                  <ProgressBar value={item.percentage} size="sm" color={`bg-[${item.color}]`} />
                </div>
                <span className="text-xs font-semibold text-gray-400 w-9 text-right">{item.percentage}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm font-black">
            <span>Total Monthly Invoiced Spend</span>
            <span className="text-blue-600 text-base">₹1,24,500</span>
          </div>
        </div>
      </div>
    </div>
  )
}
