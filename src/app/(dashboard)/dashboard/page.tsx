'use client'

import { useRouter } from 'next/navigation'
import {
  HardDrive, DollarSign, TrendingDown, Gauge, Copy, Clock,
  Sparkles, ArrowRight, RefreshCw
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts'
import MetricCard from '@/components/ui/MetricCard'
import ChartCard from '@/components/ui/ChartCard'
import ActivityTable from '@/components/features/ActivityTable'
import ProgressBar from '@/components/ui/ProgressBar'
import {
  kpiSummary, costTrendData, storageGrowthData, fileTypeData,
  departmentData, costBreakdown, activityData
} from '@/lib/mockData'

// Circular progress for optimization score
function ScoreRing({ score }: { score: number }) {
  const r = 28; const c = 2 * Math.PI * r
  const dash = (score / 100) * c
  return (
    <div className="relative flex items-center justify-center mt-2">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="#2563eb" strokeWidth="6"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" />
      </svg>
      <div className="absolute text-center">
        <span className="text-base font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-400 block -mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

const fmtRupee = (v: number) => `₹${(v / 1000).toFixed(0)}K`

export default function DashboardPage() {
  const router = useRouter()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{greeting}, Admin 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Here&apos;s what&apos;s happening with your cloud storage.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Last updated</p>
          <p className="text-xs font-medium text-gray-600">{now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Storage"
          value={kpiSummary.totalStorage}
          change={kpiSummary.totalStorageChange}
          changeType="negative"
          changeLabel="vs last month"
          icon={<HardDrive className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <MetricCard
          title="Monthly Cost"
          value={kpiSummary.monthlyCost}
          change={kpiSummary.monthlyCostChange}
          changeType="negative"
          changeLabel="vs last month"
          icon={<DollarSign className="w-4 h-4 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <MetricCard
          title="Potential Savings"
          value={kpiSummary.potentialSavings}
          change="25.5%"
          changeType="positive"
          changeLabel="opportunity"
          icon={<TrendingDown className="w-4 h-4 text-green-600" />}
          iconBg="bg-green-50"
        />

        {/* Optimization Score card with ring */}
        <div className="card p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm font-medium text-gray-500">Optimization Score</p>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50">
              <Gauge className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <ScoreRing score={kpiSummary.optimizationScore} />
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Good</span>
        </div>

        <MetricCard
          title="Duplicate Storage"
          value={kpiSummary.duplicateStorage}
          subtitle={`${kpiSummary.duplicateFiles.toLocaleString()} duplicate files`}
          icon={<Copy className="w-4 h-4 text-orange-600" />}
          iconBg="bg-orange-50"
          changeType="negative"
        />
        <MetricCard
          title="Inactive Storage"
          value={kpiSummary.inactiveStorage}
          subtitle={`${kpiSummary.inactiveFiles.toLocaleString()} inactive files`}
          icon={<Clock className="w-4 h-4 text-red-500" />}
          iconBg="bg-red-50"
          changeType="negative"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Cost Trend */}
        <div className="xl:col-span-2">
          <ChartCard title="Cloud Storage Cost Trend" subtitle="Monthly cost vs projected trajectory (₹)">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={costTrendData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtRupee} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="current" name="Current Cost" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="projected" name="Projected" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Storage Growth */}
        <ChartCard title="Storage Growth" subtitle="TB consumed over 12 months">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={storageGrowthData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} unit=" TB" axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`${v} TB`, 'Storage']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="storage" name="Storage" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} fill="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Distribution row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* File Type donut */}
        <ChartCard title="Storage by File Type" subtitle="Breakdown of 12.8 TB total storage">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={180} height={200}>
              <PieChart>
                <Pie data={fileTypeData} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                  dataKey="value" paddingAngle={2}>
                  {fileTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} TB`, '']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {fileTypeData.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-600">{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">{d.value} TB</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Department bar */}
        <ChartCard title="Storage by Department" subtitle="GB allocated per department">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={departmentData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v} GB`} />
              <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString()} GB`, 'Storage']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="storage" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Cost breakdown + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cost breakdown */}
        <div className="lg:col-span-2">
          <ChartCard title="Where Your Money Goes" subtitle="Monthly cost breakdown by storage service">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {costBreakdown.map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${item.color}18` }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 truncate">{item.label}</span>
                      <span className="text-xs font-semibold text-gray-900 ml-2 flex-shrink-0">{item.amount}</span>
                    </div>
                    <ProgressBar value={item.percentage} size="sm" animated
                      color={`bg-[${item.color}]`} />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Insights panel */}
        <div className="space-y-4">
          {/* CloudCut Insights */}
          <div className="card p-5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-200" />
              <h3 className="text-sm font-semibold">CloudCut Insights</h3>
            </div>
            <p className="text-sm text-blue-100 mb-4">
              We found <strong className="text-white">3 major opportunities</strong> to reduce your storage bill.
            </p>
            <div className="space-y-2 mb-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-200">Potential monthly savings</p>
                <p className="text-xl font-bold text-white">₹31,800</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-200">Potential annual savings</p>
                <p className="text-xl font-bold text-white">₹3,81,600</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/recommendations')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Recommendations
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Storage utilization */}
          <div className="card p-5">
            <h3 className="section-title mb-3">Storage Utilization</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Used: {kpiSummary.usedStorage}</span>
              <span className="text-sm font-bold text-gray-900">{kpiSummary.utilizationPercent}%</span>
            </div>
            <ProgressBar
              value={kpiSummary.utilizationPercent}
              color={kpiSummary.utilizationPercent > 85 ? 'bg-red-500' : 'bg-blue-500'}
              size="lg"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">0 TB</span>
              <span className="text-xs text-gray-400">Available: {kpiSummary.availableStorage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="section-title">Recent Activity</h3>
            <p className="section-sub">Latest storage events and optimization opportunities</p>
          </div>
          <button onClick={() => router.push('/recommendations')} className="btn-secondary text-xs">
            View All
          </button>
        </div>
        <ActivityTable data={activityData} />
      </div>
    </div>
  )
}
