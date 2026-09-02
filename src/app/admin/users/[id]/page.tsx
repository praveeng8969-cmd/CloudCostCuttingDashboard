'use client'

import React, { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Building2, User, Mail, Shield, HardDrive,
  DollarSign, TrendingDown, Clock, Copy, Zap, CheckCircle2,
  AlertTriangle, Database, Archive, FileSpreadsheet, Sparkles
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import MetricCard from '@/components/ui/MetricCard'
import ChartCard from '@/components/ui/ChartCard'
import ProgressBar from '@/components/ui/ProgressBar'
import { useStorageData } from '@/context/StorageDataContext'
import { getUserById, getReportsForUser } from '@/lib/services/authService'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.id as string

  const { getCustomerDatasetSnapshot } = useStorageData()

  // Retrieve customer user profile
  const customer = useMemo(() => {
    return getUserById(userId)
  }, [userId])

  // Retrieve customer dataset snapshot
  const { records, analysis, sourceName, sourceType } = useMemo(() => {
    return getCustomerDatasetSnapshot(userId)
  }, [getCustomerDatasetSnapshot, userId])

  // Retrieve customer reports
  const customerReports = useMemo(() => {
    return getReportsForUser(userId)
  }, [userId])

  if (!customer) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Customer Account Not Found</h3>
        <p className="text-xs text-slate-400">
          The requested customer tenant ID <code className="text-purple-300">{userId}</code> does not exist or has been deleted.
        </p>
        <button onClick={() => router.push('/admin/users')} className="btn-primary text-xs">
          Return to All Customers
        </button>
      </div>
    )
  }

  const totalStorageDisplay = analysis.totalStorageGB >= 1000
    ? `${(analysis.totalStorageGB / 1000).toFixed(2)} TB`
    : `${analysis.totalStorageGB} GB`

  const mostUsed = [...analysis.byFileType].sort((a, b) => b.storageGB - a.storageGB)

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Back Button & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/users')}
          className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer Directory
        </button>

        <span className="text-xs text-slate-400 font-mono">
          Tenant ID: {customer.id}
        </span>
      </div>

      {/* Customer Header Banner */}
      <div className="card p-6 bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/20">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-white">{customer.companyName}</h2>
              <span className={clsx(
                'px-2 py-0.5 rounded-full text-[10px] font-black uppercase border',
                customer.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              )}>
                {customer.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
              <span>Contact: <strong className="text-slate-200">{customer.name}</strong></span>
              <span>Email: <strong className="text-slate-200">{customer.email}</strong></span>
              <span>Dataset: <strong className="text-cyan-300">{sourceName}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-slate-400">Optimization Health</span>
            <p className="text-lg font-black text-yellow-400">{analysis.optimizationScore} / 100</p>
          </div>
        </div>
      </div>

      {/* 4 Core Financial & Storage KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Storage"
          value={totalStorageDisplay}
          subtitle={`${analysis.totalObjects} objects analyzed`}
          icon={<HardDrive className="w-5 h-5 text-cyan-400" />}
          iconBg="bg-cyan-500/20 text-cyan-300"
          glowColor="cyan"
        />

        <MetricCard
          title="Estimated Monthly Cost"
          value={`₹${analysis.currentMonthlyCost.toLocaleString('en-IN')}`}
          subtitle="Demo pricing tier model"
          icon={<DollarSign className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/20 text-purple-300"
          glowColor="purple"
        />

        <MetricCard
          title="Optimized Monthly Cost"
          value={`₹${analysis.potentialMonthlyCost.toLocaleString('en-IN')}`}
          subtitle="Post-tiering estimate"
          icon={<CheckCircle2 className="w-5 h-5 text-blue-400" />}
          iconBg="bg-blue-500/20 text-blue-300"
          glowColor="blue"
        />

        <MetricCard
          title="Potential Monthly Savings"
          value={`₹${analysis.potentialMonthlySavings.toLocaleString('en-IN')}`}
          change={`${analysis.savingsPercentage}%`}
          changeType="positive"
          changeLabel="recoverable"
          icon={<TrendingDown className="w-5 h-5 text-emerald-400" />}
          iconBg="bg-emerald-500/20 text-emerald-300"
          glowColor="emerald"
        />
      </div>

      {/* Most Used vs Least Used Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Storage */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                Most Used Storage Categories
              </h3>
              <span className="text-xs text-slate-400">{mostUsed.length} categories</span>
            </div>

            <div className="space-y-3 mt-4">
              {mostUsed.map((cat, i) => (
                <div key={cat.name} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <div>
                      <p className="text-xs font-bold text-white">{cat.name}</p>
                      <p className="text-[10px] text-slate-400">{cat.fileCount} files</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white">{cat.storageGB} GB ({cat.percentage}%)</p>
                    <p className="text-[10px] font-semibold text-purple-300">₹{cat.cost}/mo</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Waste & Optimization Candidates */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Identified Waste Vectors & Inactivity
              </h3>
              <span className="text-xs text-emerald-400 font-bold">₹{analysis.potentialMonthlySavings}/mo opportunity</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400">Duplicate Candidates</p>
                <p className="text-lg font-black text-orange-400 mt-1">{analysis.duplicateRecoverableStorageGB} GB</p>
                <p className="text-[10px] text-slate-400">{analysis.duplicateCandidatesCount} redundant copies</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400">Inactive Storage (&gt;180d)</p>
                <p className="text-lg font-black text-amber-400 mt-1">{analysis.inactiveStorageGB} GB</p>
                <p className="text-[10px] text-slate-400">{analysis.inactiveObjectsCount} stale objects</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400">Standard Tier Inactive</p>
                <p className="text-lg font-black text-cyan-400 mt-1">
                  {records.filter(r => r.storageClass === 'STANDARD' && r.isInactive).length} files
                </p>
                <p className="text-[10px] text-slate-400">Ready for Glacier down-tiering</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <p className="text-[10px] font-black uppercase text-slate-400">Annual Waste Projection</p>
                <p className="text-lg font-black text-emerald-400 mt-1">
                  ₹{(analysis.potentialMonthlySavings * 12).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400">Recoverable annually</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customer Recommendations */}
      <div className="card p-6">
        <h3 className="section-title mb-1">Top Remediation Recommendations</h3>
        <p className="section-sub mb-4">Actionable lifecycle transitions calculated for this specific customer</p>

        <div className="space-y-2.5">
          {analysis.recommendations.map((rec, i) => (
            <div key={rec.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-bold text-slate-500 mt-0.5">#{i + 1}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white">{rec.title}</p>
                    <span className={clsx(
                      'text-[9px] font-black px-1.5 py-0.2 rounded uppercase',
                      rec.priority === 'HIGH' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    )}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">{rec.recommendedAction}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-black text-emerald-400">+₹{rec.estimatedMonthlySavings}/mo</span>
                <p className="text-[10px] text-slate-500">recoverable</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports Generated by this Customer */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Customer Generated Reports</h3>
            <p className="section-sub">Audits generated by {customer.name} or their team</p>
          </div>
        </div>

        {customerReports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
            This customer has not generated custom reports yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {customerReports.map(rep => (
              <div key={rep.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{rep.reportTitle}</p>
                  <p className="text-[10px] text-slate-400">
                    Compiled {new Date(rep.generatedAt).toLocaleString('en-GB')} • {rep.totalFiles} objects
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-400">₹{rep.potentialMonthlySavings}/mo savings</span>
                  <p className="text-[10px] text-slate-400 font-mono">Score: {rep.optimizationScore}/100</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
