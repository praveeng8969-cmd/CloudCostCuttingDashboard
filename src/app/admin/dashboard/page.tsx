'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, Users, HardDrive, DollarSign, TrendingDown,
  Sparkles, ArrowRight, Zap, Building2, CheckCircle2,
  AlertTriangle, Copy, ArrowUpRight, BarChart3, PieChart as PieIcon,
  Filter, Search
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import MetricCard from '@/components/ui/MetricCard'
import ChartCard from '@/components/ui/ChartCard'
import { useStorageData, CustomerSummaryItem } from '@/context/StorageDataContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const CUSTOMER_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899']

export default function AdminDashboardPage() {
  const router = useRouter()
  const { getAllCustomerSummaries } = useStorageData()

  const [sortField, setSortField] = useState<'cost' | 'savings' | 'storage' | 'score'>('cost')
  const [sortAsc, setSortAsc] = useState(false)

  // Live summaries across all customers
  const summaries: CustomerSummaryItem[] = useMemo(() => {
    return getAllCustomerSummaries()
  }, [getAllCustomerSummaries])

  // Aggregate platform metrics
  const totalCustomers = summaries.length
  const activeCustomers = summaries.filter(s => s.status === 'active').length
  const totalStorageGB = summaries.reduce((acc, s) => acc + s.totalStorageGB, 0)
  const totalMonthlyCost = summaries.reduce((acc, s) => acc + s.currentMonthlyCost, 0)
  const totalPotentialSavings = summaries.reduce((acc, s) => acc + s.potentialMonthlySavings, 0)
  const totalObjectsCount = summaries.reduce((acc, s) => acc + s.totalObjects, 0)

  const totalStorageDisplay = totalStorageGB >= 1000
    ? `${(totalStorageGB / 1000).toFixed(2)} TB`
    : `${totalStorageGB.toFixed(0)} GB`

  // Highest cost, largest storage, highest savings customer
  const highestCostCustomer = useMemo(() => {
    return [...summaries].sort((a, b) => b.currentMonthlyCost - a.currentMonthlyCost)[0]
  }, [summaries])

  const highestSavingsCustomer = useMemo(() => {
    return [...summaries].sort((a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings)[0]
  }, [summaries])

  const largestStorageCustomer = useMemo(() => {
    return [...summaries].sort((a, b) => b.totalStorageGB - a.totalStorageGB)[0]
  }, [summaries])

  // Sorted list for customer ranking table
  const rankedCustomers = useMemo(() => {
    const list = [...summaries]
    list.sort((a, b) => {
      let diff = 0
      if (sortField === 'cost') diff = b.currentMonthlyCost - a.currentMonthlyCost
      else if (sortField === 'savings') diff = b.potentialMonthlySavings - a.potentialMonthlySavings
      else if (sortField === 'storage') diff = b.totalStorageGB - a.totalStorageGB
      else if (sortField === 'score') diff = b.optimizationScore - a.optimizationScore
      return sortAsc ? -diff : diff
    })
    return list
  }, [summaries, sortField, sortAsc])

  // Chart data: Cost & Savings by customer
  const customerChartData = useMemo(() => {
    return summaries.map((s, idx) => ({
      name: s.companyName.split(' ')[0],
      fullName: s.companyName,
      cost: s.currentMonthlyCost,
      savings: s.potentialMonthlySavings,
      storageGB: s.totalStorageGB,
      score: s.optimizationScore,
      fill: CUSTOMER_COLORS[idx % CUSTOMER_COLORS.length]
    }))
  }, [summaries])

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Admin Platform Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-slate-950/95 rounded-3xl text-white shadow-2xl border border-purple-500/30 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-black text-purple-300 mb-2.5">
              <Shield className="w-3.5 h-3.5 text-purple-300" />
              CloudCut Administration Console
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Platform Overview & Multi-Tenant FinOps
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Monitoring <strong className="text-white">{totalCustomers} registered client companies</strong> with <strong className="text-cyan-400">{totalStorageDisplay}</strong> storage under management and <strong className="text-emerald-400">₹{totalPotentialSavings.toLocaleString('en-IN')}/mo</strong> in platform-wide potential savings.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            <button
              onClick={() => router.push('/admin/users')}
              className="btn-primary py-2.5 px-4 text-xs font-black flex items-center gap-2 shadow-lg"
            >
              <Users className="w-4 h-4" />
              Manage All Customers
            </button>
            <button
              onClick={() => router.push('/admin/reports')}
              className="btn-secondary py-2.5 px-4 text-xs font-bold flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Platform Reports
            </button>
          </div>
        </div>
      </div>

      {/* Platform Aggregated KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 w-full min-w-0">
        <MetricCard
          title="Total Customers"
          value={`${totalCustomers}`}
          subtitle={`${activeCustomers} active / ${totalCustomers - activeCustomers} disabled`}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/20 text-blue-300"
          glowColor="blue"
          onClick={() => router.push('/admin/users')}
        />

        <MetricCard
          title="Total Storage Managed"
          value={totalStorageDisplay}
          subtitle={`${totalObjectsCount.toLocaleString()} total objects`}
          icon={<HardDrive className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-cyan-500/20 text-cyan-300"
          glowColor="cyan"
        />

        <MetricCard
          title="Platform Monthly Cost"
          value={`₹${totalMonthlyCost.toLocaleString('en-IN')}`}
          subtitle="Aggregated client spend"
          icon={<DollarSign className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/20 text-purple-300"
          glowColor="purple"
        />

        <MetricCard
          title="Total Potential Savings"
          value={`₹${totalPotentialSavings.toLocaleString('en-IN')}`}
          change={`${totalMonthlyCost > 0 ? Math.round((totalPotentialSavings / totalMonthlyCost) * 100) : 0}%`}
          changeType="positive"
          changeLabel="platform-wide"
          icon={<TrendingDown className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/20 text-emerald-300"
          glowColor="emerald"
        />

        <MetricCard
          title="Annual Savings Pool"
          value={`₹${(totalPotentialSavings * 12).toLocaleString('en-IN')}`}
          subtitle="Target annual recovery"
          icon={<Zap className="w-5 h-5 text-yellow-400" />}
          iconBg="bg-yellow-500/20 text-yellow-300"
          glowColor="yellow"
        />

        <MetricCard
          title="Active Accounts"
          value={`${activeCustomers} / ${totalCustomers}`}
          subtitle="100% tenant isolation"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/20 text-emerald-300"
          glowColor="emerald"
          onClick={() => router.push('/admin/users')}
        />
      </div>

      {/* Top Client Spotlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {highestCostCustomer && (
          <div className="card p-4 border border-purple-500/30 bg-purple-950/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">Highest Invoiced Client</span>
              <p className="text-sm font-black text-white mt-0.5">{highestCostCustomer.companyName}</p>
              <p className="text-xs text-slate-300 font-semibold mt-1">₹{highestCostCustomer.currentMonthlyCost.toLocaleString('en-IN')}/mo</p>
            </div>
            <button
              onClick={() => router.push(`/admin/users/${highestCostCustomer.id}`)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Inspect →
            </button>
          </div>
        )}

        {highestSavingsCustomer && (
          <div className="card p-4 border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Top Savings Opportunity</span>
              <p className="text-sm font-black text-white mt-0.5">{highestSavingsCustomer.companyName}</p>
              <p className="text-xs text-emerald-300 font-semibold mt-1">₹{highestSavingsCustomer.potentialMonthlySavings.toLocaleString('en-IN')}/mo recoverable</p>
            </div>
            <button
              onClick={() => router.push(`/admin/users/${highestSavingsCustomer.id}`)}
              className="btn-emerald text-xs py-1.5 px-3"
            >
              Inspect →
            </button>
          </div>
        )}

        {largestStorageCustomer && (
          <div className="card p-4 border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Largest Storage Pool</span>
              <p className="text-sm font-black text-white mt-0.5">{largestStorageCustomer.companyName}</p>
              <p className="text-xs text-cyan-300 font-semibold mt-1">
                {(largestStorageCustomer.totalStorageGB / 1000).toFixed(2)} TB ({largestStorageCustomer.totalObjects} objects)
              </p>
            </div>
            <button
              onClick={() => router.push(`/admin/users/${largestStorageCustomer.id}`)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Inspect →
            </button>
          </div>
        )}
      </div>

      {/* Analytics Charts: Customer Cost Breakdown & Storage Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full min-w-0">
        {/* Cost vs Savings by Customer */}
        <ChartCard
          title="Customer Cost vs Recoverable Savings (₹)"
          subtitle="Monthly spend compared against identified waste per customer"
        >
          <div className="w-full h-[280px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerChartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${v}`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number, name: string) => [`₹${v.toLocaleString('en-IN')}`, name === 'cost' ? 'Current Spend' : 'Potential Savings']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid rgba(147, 51, 234, 0.3)',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} />
                <Bar dataKey="cost" name="Estimated Cost (₹)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="savings" name="Potential Savings (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Storage Share by Customer */}
        <ChartCard
          title="Managed Storage Distribution by Customer"
          subtitle="Proportion of the total storage pool allocated to each client workspace"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full min-w-0">
            <div className="w-52 h-52 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="storageGB"
                    paddingAngle={4}
                  >
                    {customerChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} GB`, 'Storage']}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 w-full space-y-3 min-w-0">
              {customerChartData.map(c => {
                const share = totalStorageGB > 0 ? Math.round((c.storageGB / totalStorageGB) * 100) : 0
                return (
                  <div key={c.fullName} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-3 h-3 rounded-md flex-shrink-0" style={{ backgroundColor: c.fill }} />
                      <span className="font-bold text-white truncate">{c.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="font-black text-cyan-300">{c.storageGB} GB</span>
                      <span className="text-slate-400 text-[10px]">({share}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Admin Customer Cost Ranking Table */}
      <div className="card p-6 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="section-title">Customer Cost & Storage Ranking</h3>
            <p className="section-sub">Sort and review individual tenant economics and optimization health scores</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400">Sort By:</span>
            <button
              onClick={() => { setSortField('cost'); setSortAsc(!sortAsc) }}
              className={clsx('btn-secondary text-xs py-1.5 px-2.5', sortField === 'cost' && 'bg-purple-600/30 text-purple-300 border-purple-500')}
            >
              Cost {sortField === 'cost' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => { setSortField('savings'); setSortAsc(!sortAsc) }}
              className={clsx('btn-secondary text-xs py-1.5 px-2.5', sortField === 'savings' && 'bg-emerald-600/30 text-emerald-300 border-emerald-500')}
            >
              Savings {sortField === 'savings' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => { setSortField('storage'); setSortAsc(!sortAsc) }}
              className={clsx('btn-secondary text-xs py-1.5 px-2.5', sortField === 'storage' && 'bg-blue-600/30 text-blue-300 border-blue-500')}
            >
              Storage {sortField === 'storage' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Company & Customer</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Total Storage</th>
                <th className="py-3 px-3">Estimated Cost</th>
                <th className="py-3 px-3">Potential Savings</th>
                <th className="py-3 px-3">Optimization Score</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rankedCustomers.map((cust, idx) => (
                <tr key={cust.id} className="hover:bg-slate-900/50 transition-colors group">
                  <td className="py-3.5 px-3 font-bold text-slate-400">#{idx + 1}</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                      {cust.companyName}
                    </p>
                    <p className="text-[11px] text-slate-400">{cust.name} • {cust.email}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-[10px] font-black uppercase',
                      cust.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    )}>
                      {cust.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-cyan-300">
                      {cust.totalStorageGB >= 1000
                        ? `${(cust.totalStorageGB / 1000).toFixed(2)} TB`
                        : `${cust.totalStorageGB} GB`}
                    </span>
                    <p className="text-[10px] text-slate-400">{cust.totalObjects} objects</p>
                  </td>
                  <td className="py-3.5 px-3 font-black text-white">
                    ₹{cust.currentMonthlyCost.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                  </td>
                  <td className="py-3.5 px-3 font-black text-emerald-400">
                    ₹{cust.potentialMonthlySavings.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white">{cust.optimizationScore}</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            cust.optimizationScore >= 75 ? 'bg-emerald-400' : cust.optimizationScore >= 50 ? 'bg-yellow-400' : 'bg-rose-500'
                          )}
                          style={{ width: `${cust.optimizationScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => router.push(`/admin/users/${cust.id}`)}
                      className="btn-secondary py-1.5 px-3 text-xs font-bold hover:bg-purple-600 hover:text-white transition-colors"
                    >
                      View Workspace →
                    </button>
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
