'use client'

import { useState } from 'react'
import {
  Download, FileText, BarChart3, Zap, Copy, TrendingDown,
  HardDrive, CheckCircle2, Sparkles, Calendar, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { reportsData } from '@/lib/mockData'
import type { Report } from '@/types'
import clsx from 'clsx'

const iconMap: Record<string, React.ElementType> = {
  BarChart3, FileText, Zap, Copy, TrendingDown, HardDrive
}

const colorMap: Record<string, { bg: string; icon: string; glow: string }> = {
  blue:   { bg: 'bg-blue-500/15',   icon: 'text-blue-600',   glow: 'card-glow-blue' },
  purple: { bg: 'bg-purple-500/15', icon: 'text-purple-600', glow: 'card-glow-purple' },
  orange: { bg: 'bg-amber-500/15',  icon: 'text-amber-600',  glow: 'card-glow-amber' },
  red:    { bg: 'bg-rose-500/15',   icon: 'text-rose-600',   glow: 'card-glow-rose' },
  green:  { bg: 'bg-emerald-500/15', icon: 'text-emerald-600', glow: 'card-glow-emerald' },
}

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null)
  const [genDone, setGenDone] = useState(false)
  const [genReport, setGenReport] = useState<Report | null>(null)
  const [reportStep, setReportStep] = useState(0)

  function handleGenerate(report: Report) {
    setGenReport(report)
    setGenerating(report.id)
    setGenDone(false)
    setReportStep(1)

    setTimeout(() => setReportStep(2), 700)
    setTimeout(() => setReportStep(3), 1400)
    setTimeout(() => {
      setGenerating(null)
      setGenDone(true)
      toast.success(`${report.title} successfully compiled!`)
    }, 2200)
  }

  // Real client-side CSV download trigger
  function handleDownload(report: Report, format: 'PDF' | 'CSV') {
    if (format === 'CSV') {
      const csvContent = "data:text/csv;charset=utf-8," +
        "Category,Item,Monthly Spend (INR),Savings Opportunity (INR)\n" +
        "Standard Storage,AWS S3 Main Bucket,62400,12000\n" +
        "Backup Tier,GCP Daily Backups,28500,8500\n" +
        "Snapshots,EBS Unattached,14800,5200\n" +
        "Archive Tier,Glacier Deep,11200,4100\n" +
        "Egress Data,Transfer,7600,2000\n" +
        "TOTAL,All Storage Pools,124500,31800\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${report.title.replace(/\s+/g, '_')}_Sep2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded CSV: ${report.title}.csv`, { icon: '📊' });
    } else {
      toast.success(`Exporting PDF: ${report.title}.pdf`, { icon: '📄' });
    }
  }

  function closeModal() {
    setGenReport(null)
    setGenDone(false)
    setGenerating(null)
    setReportStep(0)
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Cloud Audit & Executive Reports</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Export presentation-ready PDF summaries and CSV raw telemetry datasets.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4.5 card-glow-blue flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Reports Generated</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">24 Invoices</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Updated for FY 2026-27</p>
          </div>
        </div>

        <div className="card p-4.5 card-glow-purple flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Downloads</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">68 Exports</p>
            <p className="text-[10px] text-gray-400 mt-0.5">PDF and CSV format</p>
          </div>
        </div>

        <div className="card p-4.5 card-glow-emerald flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Telemetry History</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">12 Months</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Full multi-cloud coverage</p>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportsData.map(report => {
          const Icon = iconMap[report.icon] ?? FileText
          const colors = colorMap[report.color] ?? colorMap.blue
          return (
            <div
              key={report.id}
              className={clsx('card p-5.5 flex flex-col justify-between hover:scale-[1.02] transition-all', colors.glow)}
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div className={clsx('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm', colors.bg)}>
                    <Icon className={clsx('w-5 h-5', colors.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">{report.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{report.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl mb-4 border border-gray-100 dark:border-gray-800">
                  <span>Compiled: {report.lastGenerated}</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">{report.size}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleGenerate(report)}
                  className="w-full btn-primary text-xs py-2 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Latest Report
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownload(report, 'PDF')}
                    className="btn-secondary text-xs py-2"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-500" />
                    PDF Doc
                  </button>
                  <button
                    onClick={() => handleDownload(report, 'CSV')}
                    className="btn-secondary text-xs py-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    CSV Data
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Generation Progress Modal */}
      <Modal
        open={!!genReport}
        onClose={closeModal}
        title={genDone ? 'Report Ready for Export' : 'Compiling Real-Time Telemetry...'}
        size="sm"
        footer={
          genDone ? (
            <div className="flex gap-2 w-full">
              <button onClick={closeModal} className="btn-secondary flex-1">
                Close
              </button>
              <button
                onClick={() => { handleDownload(genReport!, 'CSV'); closeModal() }}
                className="btn-emerald flex-1"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </div>
          ) : undefined
        }
      >
        {!genDone ? (
          <div className="py-6 flex flex-col items-center gap-4">
            <LoadingSpinner size={42} className="text-blue-600" />
            <div className="text-center">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Compiling {genReport?.title}</h4>
              <p className="text-xs text-gray-400 mt-1">Aggregating AWS S3, GCP & Azure Blob object metadata</p>
            </div>

            <div className="w-full space-y-2 pt-2">
              {[
                { step: 1, text: 'Fetching bucket storage allocations' },
                { step: 2, text: 'Calculating unit cost and pricing curves' },
                { step: 3, text: 'Rendering charts & formatting tables' },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  {reportStep >= s.step ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
                  )}
                  <span className={clsx(reportStep >= s.step ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-400')}>
                    {s.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-gray-900 dark:text-white">{genReport?.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Your report has been compiled and is ready for immediate download or presentation.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
