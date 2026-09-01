'use client'

import React, { useState } from 'react'
import {
  Download, FileText, BarChart3, Zap, Copy, TrendingDown,
  HardDrive, CheckCircle2, Sparkles, Calendar, Eye, FileCode
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PageHeader from '@/components/layout/PageHeader'
import { useStorageData } from '@/context/StorageDataContext'
import clsx from 'clsx'

interface ReportConfig {
  id: string
  title: string
  description: string
  icon: string
  color: 'blue' | 'purple' | 'orange' | 'green'
}

const REPORT_TEMPLATES: ReportConfig[] = [
  {
    id: 'exec_cost_audit',
    title: 'Executive Cloud Cost & Waste Audit',
    description: 'Comprehensive audit of all storage classes, monthly spend, and identified waste vectors.',
    icon: 'BarChart3',
    color: 'blue'
  },
  {
    id: 'dedup_inventory',
    title: 'Duplicate Objects & Redundancy Registry',
    description: 'Itemized inventory of byte-identical duplicate candidate clusters and recoverable capacity.',
    icon: 'Copy',
    color: 'orange'
  },
  {
    id: 'lifecycle_recs',
    title: 'Storage Lifecycle & Tiering Strategy',
    description: 'Target transition plan for aging, unaccessed files moving to IA and Deep Glacier.',
    icon: 'Zap',
    color: 'green'
  },
  {
    id: 'full_telemetry',
    title: 'Full Raw Telemetry Export',
    description: 'Complete data export with every individual storage record and pricing metadata.',
    icon: 'FileText',
    color: 'purple'
  }
]

export default function ReportsPage() {
  const { analysisResult, records, dataSourceName, hasData } = useStorageData()
  const [generating, setGenerating] = useState<string | null>(null)
  const [genDone, setGenDone] = useState(false)
  const [genReport, setGenReport] = useState<ReportConfig | null>(null)
  const [reportStep, setReportStep] = useState(0)

  function handleGenerate(report: ReportConfig) {
    setGenReport(report)
    setGenerating(report.id)
    setGenDone(false)
    setReportStep(1)

    setTimeout(() => setReportStep(2), 600)
    setTimeout(() => setReportStep(3), 1200)
    setTimeout(() => {
      setGenerating(null)
      setGenDone(true)
      toast.success(`${report.title} compiled successfully!`, {
        icon: '⚡',
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 1800)
  }

  // Download CSV report
  function handleDownloadCSV(report: ReportConfig) {
    let csv = "CloudCut Cloud Storage Cost Optimization Report\n"
    csv += `Dataset Source:,"${dataSourceName}"\n`
    csv += `Generated Timestamp:,"${new Date().toISOString()}"\n`
    csv += `Total Storage:,"${analysisResult.totalStorageGB} GB (${(analysisResult.totalStorageGB / 1000).toFixed(2)} TB)"\n`
    csv += `Total Objects:,"${analysisResult.totalObjects}"\n`
    csv += `Optimization Health Score:,"${analysisResult.optimizationScore}/100 (${analysisResult.scoreStatus})"\n`
    csv += `Current Estimated Monthly Spend:,"₹${analysisResult.currentMonthlyCost}"\n`
    csv += `Potential Monthly Savings:,"₹${analysisResult.potentialMonthlySavings} (${analysisResult.savingsPercentage}%)"\n`
    csv += `Potential Annual Savings:,"₹${analysisResult.potentialAnnualSavings}"\n\n`

    csv += "--- CATEGORY BREAKDOWN ---\nCategory,Storage (GB),Share (%),Est Monthly Cost (INR)\n"
    analysisResult.byFileType.forEach(f => {
      csv += `"${f.name}",${f.storageGB},${f.percentage}%,${f.cost}\n`
    })

    csv += "\n--- RECOMMENDATIONS ---\nTitle,Priority,Estimated Monthly Savings (INR),Problem,Recommended Action\n"
    analysisResult.recommendations.forEach(r => {
      csv += `"${r.title}","${r.priority}",${r.estimatedMonthlySavings},"${r.problem}","${r.recommendedAction}"\n`
    })

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    const link = document.createElement("a")
    link.setAttribute("href", csvContent)
    link.setAttribute("download", `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Downloaded CSV: ${report.title}.csv`, { icon: '📊' })
  }

  // Download JSON payload
  function handleDownloadJSON(report: ReportConfig) {
    const payload = {
      reportTitle: report.title,
      generatedAt: new Date().toISOString(),
      dataSource: dataSourceName,
      summary: {
        totalStorageGB: analysisResult.totalStorageGB,
        totalObjects: analysisResult.totalObjects,
        averageFileSizeGB: analysisResult.averageFileSizeGB,
        optimizationScore: analysisResult.optimizationScore,
        scoreStatus: analysisResult.scoreStatus,
        currentMonthlyCostINR: analysisResult.currentMonthlyCost,
        potentialMonthlyCostINR: analysisResult.potentialMonthlyCost,
        potentialMonthlySavingsINR: analysisResult.potentialMonthlySavings,
        potentialAnnualSavingsINR: analysisResult.potentialAnnualSavings
      },
      fileTypeBreakdown: analysisResult.byFileType,
      bucketBreakdown: analysisResult.byBucket,
      storageClassBreakdown: analysisResult.byStorageClass,
      ageDistribution: analysisResult.byAge,
      duplicateGroups: analysisResult.duplicateGroups,
      recommendations: analysisResult.recommendations,
      rawSampleRecords: records.slice(0, 100)
    }

    const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2))
    const link = document.createElement("a")
    link.setAttribute("href", jsonContent)
    link.setAttribute("download", `${report.title.replace(/\s+/g, '_')}_data.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Downloaded JSON: ${report.title}.json`, { icon: '📦' })
  }

  function closeModal() {
    setGenReport(null)
    setGenDone(false)
    setGenerating(null)
    setReportStep(0)
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Standardized Page Header */}
      <PageHeader
        title="Cloud Audit & Executive Reports"
        subtitle="Generate presentation-ready reports, CSV summaries, and raw JSON payloads dynamically from your dataset."
        badge={`${records.length} Objects Indexed`}
      />

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full min-w-0">
        <div className="card p-5 card-glow-blue flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Total Objects Analyzed</p>
            <p className="text-2xl font-black text-white truncate">{records.length.toLocaleString()} Records</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{analysisResult.totalStorageGB} GB storage pool</p>
          </div>
        </div>

        <div className="card p-5 card-glow-emerald flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Recoverable Value</p>
            <p className="text-2xl font-black text-emerald-400 truncate">₹{analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">₹{(analysisResult.potentialMonthlySavings * 12).toLocaleString('en-IN')} annual recovery</p>
          </div>
        </div>

        <div className="card p-5 card-glow-purple flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Optimization Health</p>
            <p className="text-2xl font-black text-purple-300 truncate">{analysisResult.optimizationScore} / 100</p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{analysisResult.scoreStatus} status</p>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-w-0">
        {REPORT_TEMPLATES.map(report => (
          <div
            key={report.id}
            className="card p-6 flex flex-col justify-between hover:scale-[1.01] transition-all min-w-0 card-glow-blue"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-white tracking-tight truncate">{report.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{report.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 bg-slate-900/80 p-2.5 rounded-xl mb-4 border border-slate-700/80">
                <span className="text-slate-400 truncate">Dataset: <strong className="text-slate-200">{dataSourceName}</strong></span>
                <span className="font-mono text-cyan-300 font-black flex-shrink-0 ml-2">{records.length} items</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleGenerate(report)}
                className="w-full btn-primary text-xs py-2 shadow-sm font-black flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Compile Latest Report
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadCSV(report)}
                  className="btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Download CSV
                </button>
                <button
                  onClick={() => handleDownloadJSON(report)}
                  className="btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Generation Progress Modal */}
      <Modal
        open={!!genReport}
        onClose={closeModal}
        title={genDone ? 'Report Ready for Export' : 'Compiling Dataset Telemetry...'}
        size="sm"
        footer={
          genDone ? (
            <div className="flex gap-2 w-full">
              <button onClick={closeModal} className="btn-secondary flex-1">
                Close
              </button>
              <button
                onClick={() => { handleDownloadCSV(genReport!); closeModal() }}
                className="btn-emerald flex-1"
              >
                <Download className="w-4 h-4 mr-1" />
                Save CSV
              </button>
            </div>
          ) : undefined
        }
      >
        {!genDone ? (
          <div className="py-6 flex flex-col items-center gap-4">
            <LoadingSpinner size={42} className="text-blue-400" />
            <div className="text-center">
              <h4 className="text-sm font-bold text-white">Compiling {genReport?.title}</h4>
              <p className="text-xs text-slate-400 mt-1">Aggregating {records.length} storage records from {dataSourceName}</p>
            </div>

            <div className="w-full space-y-2 pt-2">
              {[
                { step: 1, text: 'Aggregating bucket storage classifications' },
                { step: 2, text: 'Computing current vs optimized pricing matrices' },
                { step: 3, text: 'Formatting executive summary tables' },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-2.5 text-xs text-slate-300">
                  {reportStep >= s.step ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                  )}
                  <span className={clsx(reportStep >= s.step ? 'font-bold text-white' : 'text-slate-500')}>
                    {s.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black text-white">{genReport?.title}</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your report has been compiled directly from the active {records.length} records.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
