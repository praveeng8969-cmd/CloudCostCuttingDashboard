'use client'

import { useMemo, useState } from 'react'
import { Archive, Eye, Filter, Search, TrendingDown } from 'lucide-react'
import clsx from 'clsx'
import PageHeader from '@/components/layout/PageHeader'
import MetricCard from '@/components/ui/MetricCard'
import Modal from '@/components/ui/Modal'
import AnalysisStatus from '@/components/features/AnalysisStatus'
import { useStorageData } from '@/context/StorageDataContext'
import { useMLAnalysis } from '@/context/MLAnalysisContext'
import { OptimizationScenario } from '@/types/ml'

type FilterType = 'ALL' | 'AUTOMATED' | 'RULE' | 'ARCHIVE_CANDIDATE' | 'REVIEW' | 'KEEP'
type SortType = 'SAVINGS' | 'SIZE' | 'PRIORITY'

export default function RecommendationsPage() {
  const { records, analysisResult, hasData } = useStorageData()
  const { analysis, optimization } = useMLAnalysis()
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [sort, setSort] = useState<SortType>('SAVINGS')
  const [details, setDetails] = useState<OptimizationScenario | null>(null)
  const recordMap = useMemo(() => new Map(records.map(record => [record.id, record])), [records])
  const predictionMap = useMemo(() => new Map((analysis?.predictions || []).map(item => [item.fileId, item])), [analysis])

  const visibleScenarios = useMemo(() => optimization.scenarios
    .filter(item => filter === 'ALL' || filter === 'AUTOMATED' || item.prediction === filter)
    .sort((left, right) => {
      if (sort === 'SIZE') return (recordMap.get(right.fileId)?.sizeGB || 0) - (recordMap.get(left.fileId)?.sizeGB || 0)
      if (sort === 'PRIORITY') return ({ HIGH: 3, MEDIUM: 2, LOW: 1 }[right.priority] - { HIGH: 3, MEDIUM: 2, LOW: 1 }[left.priority])
      return right.grossMonthlySavings - left.grossMonthlySavings
    }), [filter, optimization.scenarios, recordMap, sort])
  const showRules = filter === 'ALL' || filter === 'RULE'

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader title="Optimization Recommendations" subtitle="Actionable storage reviews, lifecycle suggestions, and existing storage rules." badge={`${optimization.scenarios.length + analysisResult.recommendations.length} Items`} />

      <AnalysisStatus />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Storage Review Items" value={optimization.scenarios.length.toLocaleString()} subtitle={analysis ? 'Current dataset results' : 'Analysis in progress'} icon={<Search className="w-4 h-4 text-blue-600" />} />
        <MetricCard title="Archive Candidates" value={optimization.counts.ARCHIVE_CANDIDATE.toLocaleString()} subtitle="Requires workload verification" icon={<Archive className="w-4 h-4 text-purple-600" />} />
        <MetricCard title="Review Candidates" value={optimization.counts.REVIEW.toLocaleString()} subtitle="Manual investigation required" icon={<Search className="w-4 h-4 text-amber-600" />} />
        <MetricCard title="Gross Monthly Scenario" value={`₹${optimization.grossPotentialMonthlySavings.toLocaleString('en-IN')}`} subtitle="Storage-only; non-overlapping" icon={<TrendingDown className="w-4 h-4 text-emerald-600" />} />
      </div>

      <div className="card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap"><Filter className="w-4 h-4 text-slate-400" />{([
          ['ALL', 'All'], ['AUTOMATED', 'Storage Reviews'], ['RULE', 'Storage Rules'], ['ARCHIVE_CANDIDATE', 'Consider Archiving'], ['REVIEW', 'Needs Review'], ['KEEP', 'No Immediate Action']
        ] as [FilterType, string][]).map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={clsx('px-2.5 py-1.5 rounded text-xs font-medium', filter === value ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100')}>{label}</button>)}</div>
        <select value={sort} onChange={event => setSort(event.target.value as SortType)} className="input w-full lg:w-56"><option value="SAVINGS">Highest Estimated Savings</option><option value="SIZE">Largest Storage Size</option><option value="PRIORITY">Highest Priority</option></select>
      </div>

      {filter !== 'RULE' && <section className="space-y-3">
        <div><h2 className="section-title">File-Level Storage Recommendations</h2><p className="section-sub">Review statuses combined with storage activity, size, pricing, and business constraints.</p></div>
        {visibleScenarios.length === 0 ? <div className="card p-8 text-center text-xs text-slate-500">{hasData ? 'No storage recommendations match this filter.' : 'No dataset loaded.'}</div> : visibleScenarios.map(scenario => {
          const record = recordMap.get(scenario.fileId)
          const prediction = predictionMap.get(scenario.fileId)
          if (!record || !prediction) return null
          return <article key={scenario.fileId} className="card p-5">
            <div className="flex flex-col lg:flex-row justify-between gap-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-semibold text-slate-900 truncate" title={record.fileName}>{record.fileName}</h3><span className="badge-accent">Storage Review</span><PredictionBadge value={scenario.prediction} /><span className="badge-neutral">{scenario.priority} priority</span></div><p className="text-xs text-slate-600 mt-2">{prediction.explanation}</p><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs"><Detail label="Size" value={`${record.sizeGB} GB`} /><Detail label="Current tier" value={record.storageClass} /><Detail label="Last accessed" value={record.lastAccessed || 'Unknown'} /></div><div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded text-xs"><strong>Suggested action:</strong> {scenario.action}. Review access requirements and retention policies before any change.</div></div><div className="lg:w-56 flex-shrink-0 lg:text-right"><p className="text-xs text-slate-500">Estimated storage-only savings</p><p className="text-xl font-bold text-emerald-700">₹{scenario.grossMonthlySavings.toLocaleString('en-IN')}/mo</p><p className="text-[11px] text-slate-500 mt-1">₹{scenario.currentMonthlyCost} → ₹{scenario.proposedMonthlyCost}</p><button onClick={() => setDetails(scenario)} className="btn-secondary mt-3 lg:ml-auto"><Eye className="w-3.5 h-3.5" />View Details</button></div></div>
          </article>
        })}
      </section>}

      {showRules && <section className="space-y-3"><div><h2 className="section-title">Storage Rule Recommendations</h2><p className="section-sub">Lifecycle, possible duplicate, log-retention, and compression checks remain available independently.</p></div>{analysisResult.recommendations.map(rec => <article key={rec.id} className="card p-5"><div className="flex flex-col sm:flex-row justify-between gap-4"><div><div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-semibold text-slate-900">{rec.title}</h3><span className="badge-neutral">Storage Rule</span><span className="badge-warning">{rec.priority}</span></div><p className="text-xs text-slate-600 mt-2">{rec.description}</p><p className="text-xs mt-2"><strong>Action:</strong> {rec.recommendedAction}</p></div><div className="sm:text-right flex-shrink-0"><p className="text-xs text-slate-500">Conditional estimate</p><p className="text-lg font-bold text-emerald-700">₹{rec.estimatedMonthlySavings.toLocaleString('en-IN')}/mo</p></div></div></article>)}</section>}

      <Modal open={Boolean(details)} onClose={() => setDetails(null)} title="Storage Recommendation Details" size="lg" footer={<button onClick={() => setDetails(null)} className="btn-primary">Close</button>}>
        {details && <div className="space-y-4 text-xs text-slate-600"><div className="grid grid-cols-2 gap-3"><Detail label="Review status" value={customerStatus(details.prediction)} /><Detail label="Current cost" value={`₹${details.currentMonthlyCost}/month`} /><Detail label="Proposed cost" value={`₹${details.proposedMonthlyCost}/month`} /><Detail label="Estimated savings" value={`₹${details.grossMonthlySavings}/month`} /></div><div><p className="font-semibold text-slate-900">Supporting storage signals</p><p>{details.ruleSignals.length ? details.ruleSignals.join(' • ') : 'No additional storage rule signal.'}</p></div><div><p className="font-semibold text-slate-900">Required checks</p><ul className="list-disc pl-5 mt-1 space-y-1">{details.constraints.map(item => <li key={item}>{item}</li>)}</ul></div><div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-800">Savings use configured per-GB storage rates only. Retrieval, request, transition, early-deletion, and provider-specific charges are excluded.</div></div>}
      </Modal>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-[11px] text-slate-500">{label}</p><p className="font-medium text-slate-900 mt-0.5">{value}</p></div> }
function customerStatus(value: OptimizationScenario['prediction']) { return value === 'KEEP' ? 'No Immediate Action' : value === 'REVIEW' ? 'Needs Review' : 'Consider Archiving' }
function PredictionBadge({ value }: { value: OptimizationScenario['prediction'] }) { const className = value === 'KEEP' ? 'badge-success' : value === 'REVIEW' ? 'badge-warning' : 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200'; return <span className={className}>{customerStatus(value)}</span> }
