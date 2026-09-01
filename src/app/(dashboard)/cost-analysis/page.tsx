'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'
import ChartCard from '@/components/ui/ChartCard'
import ProgressBar from '@/components/ui/ProgressBar'
import {
  kpiSummary, costTrendData, costByServiceData, costByClassData, costBreakdown
} from '@/lib/mockData'
import { TrendingUp, TrendingDown, DollarSign, Zap } from 'lucide-react'
import clsx from 'clsx'

const fmtRupee = (v: number) => `₹${(v / 1000).toFixed(0)}K`

const SERVICE_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']
const CLASS_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']

export default function CostAnalysisPage() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Cost Analysis</h2>
        <p className="text-sm text-gray-500 mt-0.5">Deep dive into your cloud storage billing and cost trends.</p>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Month', value: '₹1,24,500', sub: 'September 2026', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', trend: null },
          { label: 'Previous Month', value: '₹1,10,600', sub: 'August 2026', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', trend: null },
          { label: 'Monthly Increase', value: '+12.6%', sub: '₹13,900 more', icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50', trend: 'up' },
          { label: 'Potential Savings', value: '₹31,800', sub: '25.5% of total cost', icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-50', trend: 'down' },
        ].map(c => (
          <div key={c.label} className="card p-4">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', c.bg)}>
              <c.icon className={clsx('w-4 h-4', c.color)} />
            </div>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={clsx('text-xl font-bold mt-0.5', c.color)}>{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Projected vs Optimized */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Annual Cost Projection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Projected Annual Cost', value: '₹14.8 Lakhs', sub: 'At current growth rate', bar: 100, color: 'bg-red-400' },
            { label: 'Optimized Annual Cost', value: '₹11.0 Lakhs', sub: 'After all optimizations', bar: 74, color: 'bg-green-500' },
            { label: 'Potential Annual Saving', value: '₹3.8 Lakhs', sub: '₹31,800/month × 12', bar: 26, color: 'bg-blue-500' },
          ].map(p => (
            <div key={p.label} className="space-y-2">
              <p className="text-xs font-medium text-gray-500">{p.label}</p>
              <p className="text-2xl font-bold text-gray-900">{p.value}</p>
              <p className="text-xs text-gray-400">{p.sub}</p>
              <ProgressBar value={p.bar} color={p.color} size="md" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Monthly Cost Trend" subtitle="Jan–Dec 2026 (₹)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={costTrendData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtRupee} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="current" name="Actual Cost" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="projected" name="Projected" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cost by Service" subtitle="Monthly breakdown by service type (₹)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={costByServiceData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="service" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtRupee} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Cost']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {costByServiceData.map((_, i) => <Cell key={i} fill={SERVICE_COLORS[i % SERVICE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Cost by Storage Class" subtitle="Monthly cost distribution">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={200}>
              <PieChart>
                <Pie data={costByClassData} cx="50%" cy="50%" innerRadius={50} outerRadius={76}
                  dataKey="cost" paddingAngle={2}>
                  {costByClassData.map((_, i) => <Cell key={i} fill={CLASS_COLORS[i % CLASS_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {costByClassData.map((d, i) => (
                <div key={d.class} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLASS_COLORS[i] }} />
                    <span className="text-xs text-gray-600">{d.class}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800">₹{d.cost.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Cost breakdown detail */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Cost Breakdown Detail</h3>
          <div className="space-y-3">
            {costBreakdown.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs font-bold text-gray-900">{item.amount}</span>
                  </div>
                  <ProgressBar value={item.percentage} size="sm"
                    color={`bg-[${item.color}]`} />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{item.percentage}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
            <span className="text-sm font-semibold text-gray-700">Total</span>
            <span className="text-sm font-bold text-gray-900">₹1,24,500</span>
          </div>
        </div>
      </div>
    </div>
  )
}
