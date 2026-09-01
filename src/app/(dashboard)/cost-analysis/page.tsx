'use client'

import React, { useState } from 'react'
import {
  DollarSign, TrendingDown, Layers, Sparkles, SlidersHorizontal,
  Download, ArrowRight, ShieldCheck, Database, FileSpreadsheet,
  CheckCircle2, AlertCircle, Info
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import PageHeader from '@/components/layout/PageHeader'
import { useStorageData } from '@/context/StorageDataContext'
import ProgressBar from '@/components/ui/ProgressBar'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const fmtRupee = (v: number) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`

export default function CostAnalysisPage() {
  const { analysisResult, pricing, hasData } = useStorageData()

  // Interactive ROI Simulator slider state (0% to 100% adoption of recommended policies)
  const [adoptionRate, setAdoptionRate] = useState<number>(100)

  const currentMonthly = analysisResult.currentMonthlyCost
  const maxSavings = analysisResult.potentialMonthlySavings
  const simulatedSavings = Math.round(maxSavings * (adoptionRate / 100))
  const simulatedOptimizedBill = Math.max(0, currentMonthly - simulatedSavings)
  const simulatedAnnualSavings = simulatedSavings * 12

  // Simulated 6-Month Trajectory
  const trajectoryData = [
    { month: 'Apr', current: Math.round(currentMonthly * 0.88), optimized: Math.round(simulatedOptimizedBill * 0.95) },
    { month: 'May', current: Math.round(currentMonthly * 0.92), optimized: Math.round(simulatedOptimizedBill * 0.96) },
    { month: 'Jun', current: Math.round(currentMonthly * 0.95), optimized: Math.round(simulatedOptimizedBill * 0.97) },
    { month: 'Jul', current: Math.round(currentMonthly * 0.98), optimized: Math.round(simulatedOptimizedBill * 0.99) },
    { month: 'Aug', current: currentMonthly, optimized: simulatedOptimizedBill },
    { month: 'Sep (Sim)', current: Math.round(currentMonthly * 1.05), optimized: simulatedOptimizedBill },
  ]

  function exportCostReport() {
    let csv = "category,name,storage_gb,estimated_monthly_cost_inr\n"
    analysisResult.byStorageClass.forEach(c => {
      csv += `"Storage Class","${c.name}",${c.storageGB},${c.cost}\n`
    })
    analysisResult.byBucket.forEach(b => {
      csv += `"Bucket Container","${b.name}",${b.storageGB},${b.cost}\n`
    })
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    const link = document.createElement("a")
    link.setAttribute("href", csvContent)
    link.setAttribute("download", "cloudcut_cost_analytics_breakdown.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Downloaded Cost Analytics CSV report!', { icon: '📊' })
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Standardized Page Header */}
      <PageHeader
        title="Cost & Billing Analytics"
        subtitle="Estimated cost breakdown and optimization ROI simulator based on your loaded storage dataset."
        badge="Demo Pricing Model"
        actions={
          <button
            onClick={exportCostReport}
            className="btn-secondary text-xs flex items-center gap-1.5 flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Cost Breakdown (CSV)
          </button>
        }
      />

      {/* Demo Pricing Notice Banner */}
      <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-300 w-full min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="truncate">
            <strong>Demo Pricing Model:</strong> STANDARD ₹{pricing.STANDARD}/GB · STANDARD_IA ₹{pricing.STANDARD_IA}/GB · GLACIER ₹{pricing.GLACIER}/GB · DEEP_ARCHIVE ₹{pricing.DEEP_ARCHIVE}/GB.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-bold flex-shrink-0">Configurable in Settings</span>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        <div className="card p-5 card-glow-purple flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Current Estimated Bill</p>
            <p className="text-2xl font-black text-purple-300 tracking-tight truncate">
              ₹{currentMonthly.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">₹{(currentMonthly * 12).toLocaleString('en-IN')}/year baseline</p>
          </div>
        </div>

        <div className="card p-5 card-glow-emerald flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Estimated Monthly Savings</p>
            <p className="text-2xl font-black text-emerald-400 tracking-tight truncate">
              ₹{maxSavings.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{analysisResult.savingsPercentage}% recoverable spend</p>
          </div>
        </div>

        <div className="card p-5 card-glow-blue flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Estimated Annual Savings</p>
            <p className="text-2xl font-black text-cyan-300 tracking-tight truncate">
              ₹{analysisResult.potentialAnnualSavings.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Over 12 billing cycles</p>
          </div>
        </div>

        <div className="card p-5 card-glow-cyan flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Simulated Optimized Bill</p>
            <p className="text-2xl font-black text-white tracking-tight truncate">
              ₹{analysisResult.potentialMonthlyCost.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Post-policy execution</p>
          </div>
        </div>
      </div>

      {/* Annual Spending Trajectory & ROI Simulator (3 equal columns, no clipping) */}
      <div className="card p-6 border border-slate-700 w-full min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="section-title flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
              Annual Spending Trajectory & ROI Simulator
            </h3>
            <p className="section-sub">
              Adjust policy adoption rate to simulate realized savings across your storage pool.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700/80 self-start sm:self-auto">
            <span className="text-xs font-black text-slate-300">Policy Adoption:</span>
            <span className="text-base font-black text-emerald-400">{adoptionRate}%</span>
          </div>
        </div>

        {/* Slider control */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={adoptionRate}
            onChange={e => setAdoptionRate(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-bold">
            <span>0% (No Optimization)</span>
            <span>50% Partial Adoption</span>
            <span>100% Full Optimization Target</span>
          </div>
        </div>

        {/* 3 Pillar Cards — Strict Equal Widths and Anti-Clipping */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full min-w-0">
          {/* Pillar 1: Current Run-Rate */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">
                Current Monthly Run-Rate
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight truncate">
                ₹{currentMonthly.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 mt-1">₹{(currentMonthly * 12).toLocaleString('en-IN')} / year</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              Unoptimized storage across hot tiers
            </div>
          </div>

          {/* Pillar 2: Simulated Optimized Bill */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between min-w-0">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate">
                Simulated Optimized Bill
              </span>
              <p className="text-2xl sm:text-3xl font-black text-cyan-300 mt-1 tracking-tight truncate">
                ₹{simulatedOptimizedBill.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-400 mt-1">₹{(simulatedOptimizedBill * 12).toLocaleString('en-IN')} / year</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-cyan-300 font-bold">
              {adoptionRate}% optimization policies applied
            </div>
          </div>

          {/* Pillar 3: Net Realized Savings */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-teal-950/60 to-slate-900/80 border border-emerald-500/40 flex flex-col justify-between min-w-0 shadow-lg shadow-emerald-500/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block truncate">
                Net Realized Monthly Savings
              </span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 tracking-tight truncate">
                ₹{simulatedSavings.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-emerald-200 mt-1 font-bold">₹{simulatedAnnualSavings.toLocaleString('en-IN')} / year recovered</p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-500/30 text-[11px] text-emerald-300 font-bold">
              ROI: {currentMonthly > 0 ? Math.round((simulatedSavings / currentMonthly) * 100) : 0}% recurring reduction
            </div>
          </div>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="card p-6 w-full min-w-0">
        <h3 className="section-title mb-1">Projected Spending vs Optimized Path</h3>
        <p className="section-sub mb-4">6-month fiscal trajectory modeling the impact of lifecycle optimizations</p>

        <div className="w-full h-[260px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="costAreaGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="costAreaGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtRupee} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
              <Area type="monotone" dataKey="current" name="Baseline Invoiced (₹)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#costAreaGrad1)" />
              <Area type="monotone" dataKey="optimized" name="Simulated Path (₹)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#costAreaGrad2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdowns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
        {/* Cost by Storage Class */}
        <div className="card p-6 w-full min-w-0">
          <h3 className="section-title mb-1">Cost by Storage Class</h3>
          <p className="section-sub mb-4">Estimated billing generated per storage class tier</p>

          <div className="space-y-3">
            {analysisResult.byStorageClass.map(c => (
              <div key={c.name} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white font-mono">{c.name}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.storageGB} GB ({c.percentage}%)</p>
                </div>
                <span className="font-black text-emerald-400">₹{c.cost.toLocaleString('en-IN')}/mo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cost by Bucket */}
        <div className="card p-6 w-full min-w-0">
          <h3 className="section-title mb-1">Cost by Bucket Container</h3>
          <p className="section-sub mb-4">Estimated billing distribution per storage bucket</p>

          <div className="space-y-3">
            {analysisResult.byBucket.map(b => (
              <div key={b.name} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white font-mono">{b.name}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{b.storageGB} GB ({b.fileCount} files)</p>
                </div>
                <span className="font-black text-cyan-300">₹{b.cost.toLocaleString('en-IN')}/mo</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
