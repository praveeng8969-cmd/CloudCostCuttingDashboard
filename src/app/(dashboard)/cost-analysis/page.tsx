'use client'

import React, { useState } from 'react'
import {
  DollarSign, TrendingDown, Layers, SlidersHorizontal,
  Download, ArrowRight, ShieldCheck, Database, FileText
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import PageHeader from '@/components/layout/PageHeader'
import MetricCard from '@/components/ui/MetricCard'
import { useStorageData } from '@/context/StorageDataContext'
import ProgressBar from '@/components/ui/ProgressBar'
import toast from 'react-hot-toast'

export default function CostAnalysisPage() {
  const { analysisResult, pricing, hasData } = useStorageData()

  // Interactive ROI Simulator slider (0% to 100% policy adoption)
  const [adoptionRate, setAdoptionRate] = useState<number>(100)

  const currentMonthly = analysisResult.currentMonthlyCost
  const maxSavings = analysisResult.potentialMonthlySavings
  const simulatedSavings = Math.round(maxSavings * (adoptionRate / 100))
  const simulatedOptimizedBill = Math.max(0, currentMonthly - simulatedSavings)
  const simulatedAnnualSavings = simulatedSavings * 12

  // Simulated Trajectory
  const trajectoryData = [
    { month: 'Apr', current: Math.round(currentMonthly * 0.90), optimized: Math.round(simulatedOptimizedBill * 0.95) },
    { month: 'May', current: Math.round(currentMonthly * 0.93), optimized: Math.round(simulatedOptimizedBill * 0.96) },
    { month: 'Jun', current: Math.round(currentMonthly * 0.95), optimized: Math.round(simulatedOptimizedBill * 0.97) },
    { month: 'Jul', current: Math.round(currentMonthly * 0.98), optimized: Math.round(simulatedOptimizedBill * 0.99) },
    { month: 'Aug', current: currentMonthly, optimized: simulatedOptimizedBill },
    { month: 'Sep (Sim)', current: Math.round(currentMonthly * 1.04), optimized: simulatedOptimizedBill },
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
    toast.success('Downloaded Cost Analytics CSV report!')
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Cost Analysis"
        subtitle="Financial breakdown of storage spend across tiers and simulated savings from lifecycle optimization."
        actions={
          <button
            onClick={exportCostReport}
            className="btn-secondary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Cost CSV
          </button>
        }
      />

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Estimated Monthly Cost"
          value={`₹${currentMonthly.toLocaleString('en-IN')}`}
          subtitle="Active storage tier baseline"
          icon={<DollarSign className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Estimated Optimized Cost"
          value={`₹${simulatedOptimizedBill.toLocaleString('en-IN')}`}
          subtitle={`At ${adoptionRate}% remediation adoption`}
          icon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
        />

        <MetricCard
          title="Potential Monthly Savings"
          value={`₹${simulatedSavings.toLocaleString('en-IN')}`}
          change={`${Math.round((simulatedSavings / (currentMonthly || 1)) * 100)}%`}
          changeType="positive"
          changeLabel="reduction"
          icon={<TrendingDown className="w-4 h-4 text-emerald-600" />}
        />

        <MetricCard
          title="Potential Annual Savings"
          value={`₹${simulatedAnnualSavings.toLocaleString('en-IN')}`}
          subtitle="Compounded annual recovery"
          icon={<TrendingDown className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Interactive ROI Simulator */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="section-title flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Lifecycle Adoption Simulator
            </h3>
            <p className="section-sub">Adjust the policy adoption rate to forecast monthly and annual cost impact.</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
              {adoptionRate}% Policy Adoption
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={adoptionRate}
            onChange={e => setAdoptionRate(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0% (Current baseline)</span>
            <span>50% (Partial lifecycle rules)</span>
            <span>100% (Full automated tiering)</span>
          </div>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">6-Month Spend Trajectory</h3>
            <p className="section-sub">Historical trend vs projected post-optimization cost</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="currentSpendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="optSpendArea" x1="0" y1="0" x2="0" y2="1">
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
              <Area type="monotone" dataKey="current" name="Baseline Cost" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#currentSpendArea)" />
              <Area type="monotone" dataKey="optimized" name="Optimized Projection" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#optSpendArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Storage Class Breakdown Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="section-title">Storage Tier Cost Breakdown</h3>
          <p className="section-sub">Detailed allocation across standard, infrequent access, and archive tiers</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
                <th className="py-3 px-4">Storage Class</th>
                <th className="py-3 px-4 text-right">Capacity</th>
                <th className="py-3 px-4 text-right">Share</th>
                <th className="py-3 px-4 text-right">Rate (₹/GB)</th>
                <th className="py-3 px-4 text-right">Monthly Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analysisResult.byStorageClass.map(c => (
                <tr key={c.name} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900 font-mono">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {c.storageGB} GB
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    {c.percentage}%
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">
                    ₹{(pricing as any)[c.name] ?? 2.0}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    ₹{c.cost.toLocaleString('en-IN')}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
