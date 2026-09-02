'use client'

import React, { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, HardDrive, DollarSign, TrendingDown,
  CheckCircle2, AlertTriangle, Database
} from 'lucide-react'
import MetricCard from '@/components/ui/MetricCard'
import ProgressBar from '@/components/ui/ProgressBar'
import { useStorageData } from '@/context/StorageDataContext'
import { getUserById, getReportsForUser } from '@/lib/services/authService'
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
  const { records, analysis, sourceName } = useMemo(() => {
    return getCustomerDatasetSnapshot(userId)
  }, [getCustomerDatasetSnapshot, userId])

  // Retrieve customer reports
  const customerReports = useMemo(() => {
    return getReportsForUser(userId)
  }, [userId])

  if (!customer) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h3 className="text-base font-semibold text-slate-900">Customer Account Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested customer tenant ID does not exist or has been removed.
        </p>
        <button onClick={() => router.push('/admin/users')} className="btn-primary text-xs">
          Return to Customer Directory
        </button>
      </div>
    )
  }

  const totalStorageDisplay = analysis.totalStorageGB >= 1000
    ? `${(analysis.totalStorageGB / 1000).toFixed(2)} TB`
    : `${analysis.totalStorageGB} GB`

  const mostUsed = [...analysis.byFileType].sort((a, b) => b.storageGB - a.storageGB)

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => router.push('/admin/users')}
          className="font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customer Directory
        </button>

        <span className="text-slate-400 font-mono text-[11px]">
          Tenant ID: {customer.id}
        </span>
      </div>

      {/* Customer Header Banner */}
      <div className="card p-5 bg-white border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-lg">
            {customer.companyName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{customer.companyName}</h2>
              <span className={clsx(
                'px-2 py-0.5 rounded text-[11px] font-medium border',
                customer.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              )}>
                {customer.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>Contact: <strong className="text-slate-700">{customer.name}</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-slate-700">{customer.email}</strong></span>
              <span>•</span>
              <span>Dataset: <strong className="text-slate-700">{sourceName}</strong></span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-500 font-medium block">Optimization Health</span>
          <span className="text-base font-bold text-slate-900">{analysis.optimizationScore} / 100</span>
        </div>
      </div>

      {/* 4 Financial & Storage KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Storage"
          value={totalStorageDisplay}
          subtitle={`${analysis.totalObjects.toLocaleString()} objects indexed`}
          icon={<HardDrive className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Estimated Monthly Cost"
          value={`₹${analysis.currentMonthlyCost.toLocaleString('en-IN')}`}
          subtitle="Baseline tiering projection"
          icon={<DollarSign className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Optimized Monthly Cost"
          value={`₹${analysis.potentialMonthlyCost.toLocaleString('en-IN')}`}
          subtitle="Post-tiering estimate"
          icon={<CheckCircle2 className="w-4 h-4 text-blue-600" />}
        />

        <MetricCard
          title="Potential Monthly Savings"
          value={`₹${analysis.potentialMonthlySavings.toLocaleString('en-IN')}`}
          change={`${analysis.savingsPercentage}%`}
          changeType="positive"
          changeLabel="recoverable"
          icon={<TrendingDown className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Most Used vs Low Activity Storage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Storage */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="section-title">Most Used Storage</h3>
              <span className="text-xs text-slate-500">{mostUsed.length} categories</span>
            </div>
            <p className="section-sub mb-4">Categories consuming the largest share of capacity.</p>

            <div className="space-y-3">
              {mostUsed.map((cat) => (
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

        {/* Waste Vectors & Inactivity */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="section-title">Optimization Candidates</h3>
              <span className="text-xs font-semibold text-emerald-700">₹{analysis.potentialMonthlySavings}/mo recoverable</span>
            </div>
            <p className="section-sub mb-4">Breakdown of redundant or stale storage ready for transition.</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                <p className="text-xs font-medium text-slate-500">Duplicate Candidates</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{analysis.duplicateRecoverableStorageGB} GB</p>
                <p className="text-[11px] text-slate-400">{analysis.duplicateCandidatesCount} redundant copies</p>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                <p className="text-xs font-medium text-slate-500">Inactive Storage (&gt;180d)</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">{analysis.inactiveStorageGB} GB</p>
                <p className="text-[11px] text-slate-400">{analysis.inactiveObjectsCount} stale objects</p>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                <p className="text-xs font-medium text-slate-500">Standard Tier Inactive</p>
                <p className="text-lg font-semibold text-slate-900 mt-1">
                  {records.filter(r => r.storageClass === 'STANDARD' && r.isInactive).length} files
                </p>
                <p className="text-[11px] text-slate-400">Ready for Glacier down-tier</p>
              </div>

              <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-medium text-emerald-800">Annual Waste Projection</p>
                <p className="text-lg font-semibold text-emerald-700 mt-1">
                  ₹{(analysis.potentialMonthlySavings * 12).toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-emerald-600">Annual potential</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Recommendations */}
      <div className="card p-5">
        <h3 className="section-title">Remediation Recommendations</h3>
        <p className="section-sub mb-4">Calculated lifecycle transition opportunities for this customer</p>

        <div className="divide-y divide-slate-100">
          {analysis.recommendations.map((rec, i) => (
            <div key={rec.id} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0 text-xs">
              <div className="flex items-start gap-3">
                <span className="font-semibold text-slate-400">#{i + 1}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{rec.title}</p>
                    <span className={clsx(
                      'text-[10px] font-medium px-1.5 py-0.2 rounded border',
                      rec.priority === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    )}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">{rec.recommendedAction}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-semibold text-emerald-700">+₹{rec.estimatedMonthlySavings}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports Generated by this Customer */}
      <div className="card p-5">
        <h3 className="section-title">Customer Generated Reports</h3>
        <p className="section-sub mb-4">Audits compiled by {customer.name} or their organization</p>

        {customerReports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-md">
            No reports generated by this customer yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {customerReports.map(rep => (
              <div key={rep.id} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                <div>
                  <p className="font-semibold text-slate-900">{rep.reportTitle}</p>
                  <p className="text-[11px] text-slate-400">
                    Compiled {new Date(rep.generatedAt).toLocaleString('en-GB')} • {rep.totalFiles} objects
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-700">₹{rep.potentialMonthlySavings}/mo savings</span>
                  <p className="text-[11px] text-slate-400">Score: {rep.optimizationScore}/100</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
