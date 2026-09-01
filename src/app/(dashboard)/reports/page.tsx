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

const colorMap: Record<string, { bg: string; icon: string; glow: string; border: string }> = {
  blue:   { bg: 'bg-blue-500/20',   icon: 'text-blue-400',   glow: 'card-glow-blue', border: 'border-blue-500/30' },
  purple: { bg: 'bg-purple-500/20', icon: 'text-purple-400', glow: 'card-glow-purple', border: 'border-purple-500/30' },
  orange: { bg: 'bg-amber-500/20',  icon: 'text-amber-300',  glow: 'card-glow-amber', border: 'border-amber-500/30' },
  red:    { bg: 'bg-rose-500/20',   icon: 'text-rose-400',   glow: 'card-glow-rose', border: 'border-rose-500/30' },
  green:  { bg: 'bg-emerald-500/20', icon: 'text-emerald-400', glow: 'card-glow-emerald', border: 'border-emerald-500/30' },
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
      toast.success(`${report.title} successfully compiled!`, {
        icon: '⚡',
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 2200)
  }

  // Client-side CSV download trigger
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
          <h2 className="text-xl font-black text-white tracking-tight">Cloud Audit & Executive Reports</h2>
          <p className="text-xs text-slate-300 mt-0.5">Export presentation-ready PDF summaries and CSV raw telemetry datasets.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4.5 card-glow-blue flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Reports Generated</p>
            <p className="text-2xl font-black text-white">24 Invoices</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Updated for FY 2026-27</p>
          </div>
        </div>

        <div className="card p-4.5 card-glow-purple flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Downloads</p>
            <p className="text-2xl font-black text-white">68 Exports</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PDF and CSV format</p>
          </div>
        </div>

        <div className="card p-4.5 card-glow-emerald flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Telemetry History</p>
            <p className="text-2xl font-black text-white">12 Months</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Full multi-cloud coverage</p>
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
                  <div className={clsx('w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border', colors.bg, colors.border)}>
                    <Icon className={clsx('w-5 h-5', colors.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-white tracking-tight">{report.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{report.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 bg-slate-900/80 p-2.5 rounded-xl mb-4 border border-slate-700/80">
                  <span className="text-slate-400">Compiled: <strong className="text-slate-200">{report.lastGenerated}</strong></span>
                  <span className="font-mono text-cyan-300 font-black">{report.size}</span>
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
                    <Download className="w-3.5 h-3.5 text-rose-400" />
                    PDF Doc
                  </button>
                  <button
                    onClick={() => handleDownload(report, 'CSV')}
                    className="btn-secondary text-xs py-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
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
            <LoadingSpinner size={42} className="text-blue-400" />
            <div className="text-center">
              <h4 className="text-sm font-bold text-white">Compiling {genReport?.title}</h4>
              <p className="text-xs text-slate-400 mt-1">Aggregating AWS S3, GCP & Azure Blob object metadata</p>
            </div>

            <div className="w-full space-y-2 pt-2">
              {[
                { step: 1, text: 'Fetching bucket storage allocations' },
                { step: 2, text: 'Calculating unit cost and pricing curves' },
                { step: 3, text: 'Rendering charts & formatting tables' },
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
              Your report has been compiled and is ready for immediate download or presentation.
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
