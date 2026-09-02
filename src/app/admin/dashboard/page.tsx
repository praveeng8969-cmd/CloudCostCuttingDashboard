'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, HardDrive, DollarSign, TrendingDown,
  ArrowRight, Building2, CheckCircle2, Shield, ArrowUpDown
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import MetricCard from '@/components/ui/MetricCard'
import PageHeader from '@/components/layout/PageHeader'
import { useStorageData, CustomerSummaryItem } from '@/context/StorageDataContext'
import clsx from 'clsx'

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

  const totalStorageDisplay = totalStorageGB >= 1000
    ? `${(totalStorageGB / 1000).toFixed(2)} TB`
    : `${totalStorageGB.toFixed(0)} GB`

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

  function handleToggleSort(field: 'cost' | 'savings' | 'storage' | 'score') {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // Chart data
  const chartData = summaries.map(s => ({
    name: s.companyName.split(' ')[0],
    Cost: s.currentMonthlyCost,
    Savings: s.potentialMonthlySavings,
  }))

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Platform Overview"
        subtitle="Monitor customer usage, storage costs, and optimization opportunities across all client tenancies."
        badge={`${totalCustomers} Customer Tenants`}
        actions={
          <Link href="/admin/users" className="btn-primary text-xs">
            <Users className="w-3.5 h-3.5" />
            Manage Customers
          </Link>
        }
      />

      {/* 5 Core Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Customers"
          value={`${totalCustomers}`}
          subtitle={`${activeCustomers} active accounts`}
          icon={<Users className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Active Accounts"
          value={`${activeCustomers}`}
          subtitle="100% operational"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />

        <MetricCard
          title="Total Managed Storage"
          value={totalStorageDisplay}
          subtitle="Across all customer buckets"
          icon={<HardDrive className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Platform Monthly Spend"
          value={`₹${totalMonthlyCost.toLocaleString('en-IN')}`}
          subtitle="Aggregated baseline spend"
          icon={<DollarSign className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Platform Savings Target"
          value={`₹${totalPotentialSavings.toLocaleString('en-IN')}`}
          change={`${Math.round((totalPotentialSavings / (totalMonthlyCost || 1)) * 100)}%`}
          changeType="positive"
          changeLabel="recoverable"
          icon={<TrendingDown className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Customer Spend vs Savings Comparison Chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Customer Cost & Savings Comparison</h3>
            <p className="section-sub">Monthly storage spend versus recoverable optimization potential per customer</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
              <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px' }}
                itemStyle={{ color: '#FFFFFF' }}
                formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              <Bar dataKey="Cost" name="Current Spend" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Savings" name="Potential Savings" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Ranking Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="section-title">Customer Cost & Storage Breakdown</h3>
            <p className="section-sub">Sortable directory of client tenancies and estimated monthly spend</p>
          </div>
          <Link href="/admin/users" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View directory <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right cursor-pointer select-none" onClick={() => handleToggleSort('storage')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Storage</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer select-none" onClick={() => handleToggleSort('cost')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Monthly Spend</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer select-none" onClick={() => handleToggleSort('savings')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Potential Savings</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer select-none" onClick={() => handleToggleSort('score')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedCustomers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {s.companyName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {s.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className={clsx(
                      'inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium border',
                      s.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    )}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {s.totalStorageGB >= 1000 ? `${(s.totalStorageGB / 1000).toFixed(2)} TB` : `${s.totalStorageGB} GB`}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    ₹{s.currentMonthlyCost.toLocaleString('en-IN')}/mo
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                    ₹{s.potentialMonthlySavings.toLocaleString('en-IN')}/mo
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      {s.optimizationScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/users/${s.id}`}
                      className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1"
                    >
                      Inspect
                    </Link>
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
