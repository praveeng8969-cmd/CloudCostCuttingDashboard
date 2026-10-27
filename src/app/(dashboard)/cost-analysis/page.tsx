'use client'

import { useMemo } from 'react'
import { DollarSign, Download, Search, ShieldCheck, TrendingDown } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '@/components/layout/PageHeader'
import MetricCard from '@/components/ui/MetricCard'
import { useStorageData } from '@/context/StorageDataContext'
import { useMLAnalysis } from '@/context/MLAnalysisContext'
import AnalysisStatus from '@/components/features/AnalysisStatus'

const COLORS = { KEEP: '#10b981', REVIEW: '#f59e0b', ARCHIVE_CANDIDATE: '#8b5cf6' }

export default function CostAnalysisPage() {
  const { analysisResult, records, pricing } = useStorageData()
  const { analysis, optimization } = useMLAnalysis()
  const recordMap = useMemo(() => new Map(records.map(record => [record.id, record])), [records])
  const predictionMap = useMemo(() => new Map((analysis?.predictions || []).map(item => [item.fileId, item.prediction])), [analysis])
  const scenarioSavings = analysis ? optimization.grossPotentialMonthlySavings : 0
  const optimizedMonthlyCost = Math.max(0, analysisResult.currentMonthlyCost - scenarioSavings)

  const categoryCosts = useMemo(() => (['KEEP', 'REVIEW', 'ARCHIVE_CANDIDATE'] as const).map(category => ({
    name: category.replace('_', ' '), key: category,
    value: Math.round(optimization.scenarios.filter(item => item.prediction === category).reduce((sum, item) => sum + item.currentMonthlyCost, 0) * 100) / 100
  })), [optimization.scenarios])
  const savingsByClass = useMemo(() => Array.from(optimization.scenarios.filter(item => item.eligible).reduce((map, item) => map.set(item.currentStorageClass, (map.get(item.currentStorageClass) || 0) + item.grossMonthlySavings), new Map<string, number>())).map(([name, savings]) => ({ name, savings: Math.round(savings * 100) / 100 })), [optimization.scenarios])
  const comparison = [{ name: 'Current', cost: analysisResult.currentMonthlyCost }, { name: 'Optimized scenario', cost: optimizedMonthlyCost }]

  function exportCostReport() {
    let csv = 'file_name,current_storage_class,proposed_storage_class,size_gb,review_status,current_cost,proposed_cost,estimated_storage_only_savings,status\n'
    optimization.scenarios.forEach(item => {
      const record = recordMap.get(item.fileId)
      csv += `"${record?.fileName || item.fileId}","${item.currentStorageClass}","${item.proposedStorageClass || ''}",${record?.sizeGB || 0},"${customerStatus(item.prediction)}",${item.currentMonthlyCost},${item.proposedMonthlyCost},${item.grossMonthlySavings},"${item.eligible ? 'Eligible scenario' : 'Review only'}"\n`
    })
    const link = document.createElement('a')
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    link.download = 'cloudcut_storage_cost_scenarios.csv'
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader title="Cost Analysis" subtitle="Current storage pricing and automatically generated lower-cost storage scenarios." actions={<button onClick={exportCostReport} disabled={!analysis} className="btn-secondary"><Download className="w-3.5 h-3.5" />Export Cost Scenarios</button>} />

      <AnalysisStatus />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Current Estimated Monthly Cost" value={`₹${analysisResult.currentMonthlyCost.toLocaleString('en-IN')}`} subtitle="Existing CloudCut pricing engine" icon={<DollarSign className="w-4 h-4 text-slate-600" />} />
        <MetricCard title="Storage Requiring Review" value={`₹${optimization.mlFlaggedStorageCost.toLocaleString('en-IN')}`} subtitle="Needs review + archive opportunities" icon={<Search className="w-4 h-4 text-blue-600" />} />
        <MetricCard title="Potential Monthly Savings" value={`₹${scenarioSavings.toLocaleString('en-IN')}`} subtitle="Estimated storage-only savings" icon={<TrendingDown className="w-4 h-4 text-emerald-600" />} />
        <MetricCard title="Estimated Optimized Monthly Cost" value={`₹${optimizedMonthlyCost.toLocaleString('en-IN')}`} subtitle="Excludes retrieval and transition fees" icon={<ShieldCheck className="w-4 h-4 text-blue-600" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Chart title="Current vs Optimized Cost"><BarChart data={comparison}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} tickFormatter={value => `₹${value}`} /><Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} /><Bar dataKey="cost" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart></Chart>
        <Chart title="Cost Distribution by Review Status"><PieChart><Pie data={categoryCosts.map(item => ({ ...item, name: customerStatus(item.key) }))} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>{categoryCosts.map(item => <Cell key={item.key} fill={COLORS[item.key]} />)}</Pie><Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} /><Legend wrapperStyle={{ fontSize: 11 }} /></PieChart></Chart>
        <Chart title="Potential Savings by Current Tier"><BarChart data={savingsByClass} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" width={90} fontSize={10} /><Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} /><Bar dataKey="savings" fill="#10b981" radius={[0, 4, 4, 0]} /></BarChart></Chart>
      </div>

      <section className="card p-0"><div className="p-5 border-b border-slate-200"><h2 className="section-title">Storage Optimization Scenarios</h2><p className="section-sub">One primary tier-transition scenario per file prevents savings from being counted twice.</p></div><div className="overflow-x-auto max-h-[620px]"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-600 sticky top-0"><tr><th className="p-3">File</th><th className="p-3">Current tier</th><th className="p-3">Proposed tier</th><th className="p-3 text-right">Size</th><th className="p-3">Review status</th><th className="p-3 text-right">Current</th><th className="p-3 text-right">Proposed</th><th className="p-3 text-right">Estimated savings</th><th className="p-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{!analysis ? <tr><td colSpan={9} className="p-12 text-center text-slate-500">Storage recommendations are being prepared.</td></tr> : optimization.scenarios.map(item => { const record = recordMap.get(item.fileId); return <tr key={item.fileId} className="hover:bg-slate-50"><td className="p-3 font-medium max-w-[220px] truncate" title={record?.fileName}>{record?.fileName}</td><td className="p-3 font-mono text-[11px]">{item.currentStorageClass}</td><td className="p-3 font-mono text-[11px]">{item.proposedStorageClass || '—'}</td><td className="p-3 text-right">{record?.sizeGB} GB</td><td className="p-3">{customerStatus(predictionMap.get(item.fileId) || item.prediction)}</td><td className="p-3 text-right">₹{item.currentMonthlyCost}</td><td className="p-3 text-right">₹{item.proposedMonthlyCost}</td><td className="p-3 text-right font-semibold text-emerald-700">₹{item.grossMonthlySavings}</td><td className="p-3">{item.eligible ? <span className="badge-success">Eligible scenario</span> : <span className="badge-neutral">Review only</span>}</td></tr> })}</tbody></table></div></section>

      <section className="card p-5"><h2 className="section-title">Pricing and calculation assumptions</h2><p className="section-sub mb-3">Current cost = size × configured current-tier rate. Proposed cost = size × configured target-tier rate. Gross savings = max(0, current − proposed).</p><div className="flex flex-wrap gap-2">{Object.entries(pricing).filter((entry): entry is [string, number] => typeof entry[1] === 'number').map(([name, rate]) => <span key={name} className="badge-neutral">{name}: ₹{rate}/GB-month</span>)}</div><p className="text-xs text-amber-700 mt-3">Actual bills may include retrieval charges, minimum storage duration, early deletion fees, transition requests, API charges, provider restrictions, and retention requirements.</p></section>

      <section className="card p-5"><h2 className="section-title">Independent Storage Rule Estimate</h2><p className="section-sub">Available even when additional recommendations cannot be prepared. Original potential monthly estimate: <strong>₹{analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}</strong>. This aggregate may include overlapping categories and is not added to the primary scenario headline.</p></section>
    </div>
  )
}

function Chart({ title, children }: { title: string; children: React.ReactElement }) { return <div className="card p-4"><h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></div> }
function customerStatus(value: 'KEEP' | 'REVIEW' | 'ARCHIVE_CANDIDATE') { return value === 'KEEP' ? 'No Immediate Action' : value === 'REVIEW' ? 'Needs Review' : 'Consider Archiving' }
