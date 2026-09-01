'use client'

import { useState } from 'react'
import { Download, FileText, BarChart3, Zap, Copy, TrendingDown, HardDrive } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { reportsData } from '@/lib/mockData'
import type { Report } from '@/types'
import clsx from 'clsx'

const iconMap: Record<string, React.ElementType> = {
  BarChart3, FileText, Zap, Copy, TrendingDown, HardDrive
}

const colorMap: Record<string, { bg: string; icon: string }> = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600' },
}

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null)
  const [genDone, setGenDone] = useState(false)
  const [genReport, setGenReport] = useState<Report | null>(null)

  function handleGenerate(report: Report) {
    setGenReport(report)
    setGenerating(report.id)
    setGenDone(false)
    setTimeout(() => {
      setGenerating(null)
      setGenDone(true)
    }, 2500)
  }

  function handleDownload(report: Report, format: 'PDF' | 'CSV') {
    toast.success(`${report.title} downloaded as ${format}`)
  }

  function closeModal() {
    setGenReport(null)
    setGenDone(false)
    setGenerating(null)
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-500 mt-0.5">Generate, view, and download detailed cloud storage reports.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Reports Generated', value: '24', sub: 'This month' },
          { label: 'Total Downloads', value: '68', sub: 'PDF & CSV' },
          { label: 'Data Coverage', value: '12 months', sub: 'Jan–Sep 2026' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportsData.map(report => {
          const Icon = iconMap[report.icon] ?? FileText
          const colors = colorMap[report.color] ?? colorMap.blue
          return (
            <div key={report.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
                  <Icon className={clsx('w-5 h-5', colors.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{report.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <span>Last generated: {report.lastGenerated}</span>
                <span>{report.size}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleGenerate(report)}
                  className="btn-primary text-xs flex-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Generate Report
                </button>
                <button
                  onClick={() => handleDownload(report, 'PDF')}
                  className="btn-secondary text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
                <button
                  onClick={() => handleDownload(report, 'CSV')}
                  className="btn-secondary text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Generate modal */}
      <Modal
        open={!!genReport}
        onClose={closeModal}
        title={genDone ? 'Report Generated' : 'Generating Report...'}
        size="sm"
        footer={genDone ? (
          <>
            <button onClick={closeModal} className="btn-secondary">Close</button>
            <button
              onClick={() => { handleDownload(genReport!, 'PDF'); closeModal() }}
              className="btn-primary"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </>
        ) : undefined}
      >
        {!genDone ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <LoadingSpinner size={40} />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800">Generating {genReport?.title}...</p>
              <p className="text-xs text-gray-400 mt-1">Collecting data from all cloud providers</p>
            </div>
            <div className="w-full space-y-1.5">
              {['Fetching storage metrics', 'Computing cost analysis', 'Generating visualizations', 'Exporting report'].map((step, i) => (
                <div key={step} className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Report Generated Successfully</p>
            <p className="text-xs text-gray-500">{genReport?.title} is ready for download.</p>
            <p className="text-xs text-gray-400 mt-1">Size: {genReport?.size}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
