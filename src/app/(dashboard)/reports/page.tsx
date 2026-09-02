'use client'

import React, { useState } from 'react'
import {
  Download, FileText, BarChart3, Zap, Copy, TrendingDown,
  HardDrive, CheckCircle2, Sparkles, Calendar, Eye, FileCode,
  Printer, Building2, User, Clock, AlertTriangle, ShieldCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PageHeader from '@/components/layout/PageHeader'
import { useStorageData } from '@/context/StorageDataContext'
import { useAuth } from '@/context/AuthContext'
import { saveReportRecord } from '@/lib/services/authService'
import type { UserReportRecord } from '@/types/auth'
import clsx from 'clsx'

export default function ReportsPage() {
  const { analysisResult, records, dataSourceName, hasData } = useStorageData()
  const { user } = useAuth()

  const [generating, setGenerating] = useState(false)
  const [reportStep, setReportStep] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [activeReport, setActiveReport] = useState<UserReportRecord | null>(null)

  // Derive findings
  const mostUsedFileType = analysisResult.byFileType[0]?.name || 'N/A'
  const mostUsedCategoryStorage = analysisResult.byFileType[0]?.storageGB || 0
  const mostUsedBucket = analysisResult.byBucket[0]?.name || 'N/A'
  const leastActiveCategory = analysisResult.byFileType[analysisResult.byFileType.length - 1]?.name || 'N/A'
  const largeFilesCount = records.filter(r => r.isLarge).length
  const archiveCandidatesCount = records.filter(r => r.storageClass === 'STANDARD' && (r.isInactive || r.isHighlyInactive)).length

  function handleCompileReport() {
    if (!hasData) {
      toast.error('No dataset loaded to compile report from.')
      return
    }

    setGenerating(true)
    setReportStep(1)

    setTimeout(() => setReportStep(2), 500)
    setTimeout(() => setReportStep(3), 1000)
    setTimeout(() => {
      setGenerating(false)
      const newReport: UserReportRecord = {
        id: `rep_${Date.now()}`,
        userId: user?.id || 'guest',
        companyName: user?.companyName || 'NovaTech Solutions',
        userName: user?.name || 'Authorized Customer',
        reportTitle: `Cloud Storage Cost & Waste Audit (${new Date().toLocaleDateString('en-GB')})`,
        generatedAt: new Date().toISOString(),
        totalStorageGB: analysisResult.totalStorageGB,
        totalFiles: analysisResult.totalObjects,
        currentMonthlyCost: analysisResult.currentMonthlyCost,
        potentialMonthlySavings: analysisResult.potentialMonthlySavings,
        potentialAnnualSavings: analysisResult.potentialAnnualSavings,
        optimizationScore: analysisResult.optimizationScore,
        summaryText: `Storage audit compiled for ${user?.companyName || 'Workspace'}. ${analysisResult.totalObjects} objects analyzed.`
      }

      saveReportRecord(newReport)
      setActiveReport(newReport)
      setPreviewOpen(true)

      toast.success('Executive Report compiled and registered!', {
        icon: '⚡',
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 1500)
  }

  // Download formatted CSV Report
  function handleDownloadCSV() {
    let csv = "CLOUDCUT CLOUD STORAGE USAGE & COST REPORT\n"
    csv += `Company Name:,"${user?.companyName || 'NovaTech Solutions'}"\n`
    csv += `User Name:,"${user?.name || 'Customer'}"\n`
    csv += `Report Date:,"${new Date().toLocaleDateString('en-GB')}"\n`
    csv += `Dataset Source:,"${dataSourceName}"\n\n`

    csv += "--- 1. STORAGE SUMMARY ---\n"
    csv += `Total Files:,"${analysisResult.totalObjects}"\n`
    csv += `Total Storage:,"${analysisResult.totalStorageGB} GB (${(analysisResult.totalStorageGB / 1000).toFixed(2)} TB)"\n`
    csv += `Total Buckets:,"${analysisResult.byBucket.length}"\n`
    csv += `Storage Classes Monitored:,"${analysisResult.byStorageClass.map(s => s.name).join(', ')}"\n\n`

    csv += "--- 2. USAGE ANALYSIS ---\n"
    csv += `Most Used File Type:,"${mostUsedFileType} (${mostUsedCategoryStorage} GB)"\n`
    csv += `Most Used Bucket:,"${mostUsedBucket}"\n`
    csv += `Least Active Category:,"${leastActiveCategory}"\n\n`

    csv += "--- 3. COST ANALYSIS (DEMO PRICING) ---\n"
    csv += `Estimated Monthly Cost:,"₹${analysisResult.currentMonthlyCost}"\n`
    csv += `Estimated Optimized Monthly Cost:,"₹${analysisResult.potentialMonthlyCost}"\n`
    csv += `Potential Monthly Savings:,"₹${analysisResult.potentialMonthlySavings}"\n`
    csv += `Potential Annual Savings:,"₹${analysisResult.potentialAnnualSavings}"\n\n`

    csv += "--- 4. OPTIMIZATION FINDINGS ---\n"
    csv += `Duplicate Candidates:,"${analysisResult.duplicateCandidatesCount} files (${analysisResult.duplicateRecoverableStorageGB} GB)"\n`
    csv += `Inactive Files (>180d):,"${analysisResult.inactiveObjectsCount} files (${analysisResult.inactiveStorageGB} GB)"\n`
    csv += `Large Files (>10GB):,"${largeFilesCount} files"\n`
    csv += `Archive Candidates:,"${archiveCandidatesCount} files"\n\n`

    csv += "--- 5. RECOMMENDATIONS ---\n"
    csv += "Priority,Title,Estimated Savings (INR),Problem,Recommended Action\n"
    analysisResult.recommendations.forEach(r => {
      csv += `"${r.priority}","${r.title}",${r.estimatedMonthlySavings},"${r.problem}","${r.recommendedAction}"\n`
    })
    csv += "\n"

    csv += "--- 6. SAVINGS SUMMARY ---\n"
    csv += `Current Estimated Cost:,"₹${analysisResult.currentMonthlyCost}/mo"\n`
    csv += `Optimized Estimated Cost:,"₹${analysisResult.potentialMonthlyCost}/mo"\n`
    csv += `Monthly Savings:,"₹${analysisResult.potentialMonthlySavings}/mo"\n`
    csv += `Annual Savings:,"₹${analysisResult.potentialAnnualSavings}/yr"\n`

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    const link = document.createElement("a")
    link.setAttribute("href", csvContent)
    link.setAttribute("download", `CloudCut_Report_${user?.companyName?.replace(/\s+/g, '_') || 'Customer'}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Downloaded executive CSV report!', { icon: '📊' })
  }

  // Download raw telemetry JSON
  function handleDownloadJSON() {
    const payload = {
      reportTitle: 'CLOUDCUT STORAGE USAGE REPORT',
      company: user?.companyName || 'NovaTech Solutions',
      user: user?.name || 'Customer',
      generatedDate: new Date().toISOString(),
      datasetSource: dataSourceName,
      storageSummary: {
        totalFiles: analysisResult.totalObjects,
        totalStorageGB: analysisResult.totalStorageGB,
        totalBuckets: analysisResult.byBucket.length,
        storageClasses: analysisResult.byStorageClass
      },
      usageAnalysis: {
        mostUsedFileType,
        mostUsedBucket,
        leastActiveCategory
      },
      costAnalysis: {
        currentMonthlyCostINR: analysisResult.currentMonthlyCost,
        potentialMonthlyCostINR: analysisResult.potentialMonthlyCost,
        potentialMonthlySavingsINR: analysisResult.potentialMonthlySavings,
        potentialAnnualSavingsINR: analysisResult.potentialAnnualSavings
      },
      optimizationFindings: {
        duplicateCopiesCount: analysisResult.duplicateCandidatesCount,
        duplicateRecoverableGB: analysisResult.duplicateRecoverableStorageGB,
        inactiveObjectsCount: analysisResult.inactiveObjectsCount,
        inactiveStorageGB: analysisResult.inactiveStorageGB,
        largeFilesCount,
        archiveCandidatesCount
      },
      recommendations: analysisResult.recommendations
    }

    const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2))
    const link = document.createElement("a")
    link.setAttribute("href", jsonContent)
    link.setAttribute("download", `CloudCut_Telemetry_${user?.companyName?.replace(/\s+/g, '_') || 'Customer'}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported raw JSON telemetry!', { icon: '📦' })
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Standardized Page Header */}
      <PageHeader
        title="CloudCut Storage Usage & Cost Reports"
        subtitle={`Generate, preview, and export executive cost audits specifically for ${user?.companyName || 'your company'}.`}
        badge={`${records.length} Objects Indexed`}
      />

      {/* Primary Report Generator Hero Card */}
      <div className="card p-8 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 rounded-full text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            Executive FinOps Audit
          </div>
          <h2 className="text-xl font-black text-white">Generate Official CloudCut Storage Usage Report</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Compiles a 6-part executive audit covering storage summaries, usage patterns, pricing breakdowns, duplication vectors, and remediation plans for <strong className="text-cyan-300">{user?.companyName}</strong>.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
            <span>Pool: <strong className="text-white">{analysisResult.totalStorageGB} GB</strong></span>
            <span>Savings Target: <strong className="text-emerald-400">₹{analysisResult.potentialMonthlySavings}/mo</strong></span>
            <span>Score: <strong className="text-yellow-400">{analysisResult.optimizationScore}/100</strong></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCompileReport}
            disabled={generating}
            className="w-full sm:w-auto btn-primary py-3 px-6 text-xs font-black shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <LoadingSpinner size={16} className="text-white" />
                Compiling...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Generate Executive Report
              </>
            )}
          </button>

          <button
            onClick={() => {
              setActiveReport({
                id: 'preview_current',
                userId: user?.id || 'guest',
                companyName: user?.companyName || 'NovaTech Solutions',
                userName: user?.name || 'Customer User',
                reportTitle: 'CloudCut Storage Usage Report',
                generatedAt: new Date().toISOString(),
                totalStorageGB: analysisResult.totalStorageGB,
                totalFiles: analysisResult.totalObjects,
                currentMonthlyCost: analysisResult.currentMonthlyCost,
                potentialMonthlySavings: analysisResult.potentialMonthlySavings,
                potentialAnnualSavings: analysisResult.potentialAnnualSavings,
                optimizationScore: analysisResult.optimizationScore,
                summaryText: 'Executive Storage Report'
              })
              setPreviewOpen(true)
            }}
            className="w-full sm:w-auto btn-secondary py-3 px-5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            Preview Report
          </button>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 card-glow-emerald flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Full CSV Usage & Cost Report</h3>
            <p className="text-xs text-slate-400 mt-1">
              Formatted spreadsheet with storage allocations, individual category shares, and itemized priority recommendations.
            </p>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="btn-emerald text-xs mt-4 py-2 flex items-center justify-center gap-1.5 font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV Report
          </button>
        </div>

        <div className="card p-5 card-glow-blue flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Printable Executive Summary (PDF)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Clean, professional visual document formatted for PDF export or executive stakeholder presentations.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveReport({
                id: 'print_current',
                userId: user?.id || 'guest',
                companyName: user?.companyName || 'NovaTech Solutions',
                userName: user?.name || 'Customer User',
                reportTitle: 'CloudCut Storage Usage Report',
                generatedAt: new Date().toISOString(),
                totalStorageGB: analysisResult.totalStorageGB,
                totalFiles: analysisResult.totalObjects,
                currentMonthlyCost: analysisResult.currentMonthlyCost,
                potentialMonthlySavings: analysisResult.potentialMonthlySavings,
                potentialAnnualSavings: analysisResult.potentialAnnualSavings,
                optimizationScore: analysisResult.optimizationScore,
                summaryText: 'Executive Storage Report'
              })
              setPreviewOpen(true)
            }}
            className="btn-primary text-xs mt-4 py-2 flex items-center justify-center gap-1.5 font-bold"
          >
            <Printer className="w-3.5 h-3.5" />
            Open Print / PDF Layout
          </button>
        </div>

        <div className="card p-5 card-glow-purple flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">JSON Telemetry Export</h3>
            <p className="text-xs text-slate-400 mt-1">
              Machine-readable JSON schema containing the entire analysis tree, storage breakdowns, and recommendations.
            </p>
          </div>
          <button
            onClick={handleDownloadJSON}
            className="btn-secondary text-xs mt-4 py-2 flex items-center justify-center gap-1.5 font-bold"
          >
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
            Export JSON Schema
          </button>
        </div>
      </div>

      {/* Compiling Progress Modal */}
      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card p-8 max-w-md w-full text-center space-y-4 border border-blue-500/40">
            <LoadingSpinner size={44} className="text-blue-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Compiling Executive Cloud Audit</h3>
              <p className="text-xs text-slate-400 mt-1">Aggregating {records.length} storage records for {user?.companyName}</p>
            </div>
            <div className="space-y-2 pt-2 text-left">
              {[
                { step: 1, text: 'Auditing bucket storage classes & cost matrices' },
                { step: 2, text: 'Evaluating inactivity & duplicate cluster candidate savings' },
                { step: 3, text: 'Compiling executive recommendations & ROI summary' }
              ].map(s => (
                <div key={s.step} className="flex items-center gap-2.5 text-xs">
                  {reportStep >= s.step ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                  )}
                  <span className={clsx(reportStep >= s.step ? 'text-white font-bold' : 'text-slate-500')}>
                    {s.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULL EXECUTIVE REPORT PREVIEW MODAL */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Official CloudCut Storage Usage & Cost Report"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400 font-mono">
              Dataset: {dataSourceName}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPreviewOpen(false)} className="btn-secondary text-xs">
                Close
              </button>
              <button onClick={handleDownloadCSV} className="btn-secondary text-xs flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                CSV
              </button>
              <button onClick={handlePrint} className="btn-primary text-xs flex items-center gap-1 font-bold">
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        }
      >
        <div id="printable-report" className="p-6 bg-slate-950 text-slate-200 space-y-6 rounded-xl border border-slate-800 text-xs sm:text-sm">
          {/* Report Header */}
          <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white tracking-tight">CLOUDCUT</span>
                <span className="px-2 py-0.5 bg-blue-500/20 text-cyan-300 text-[10px] font-black rounded border border-blue-500/30">
                  OFFICIAL AUDIT REPORT
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">Storage Usage & Cost Optimization Report</h2>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-white">{user?.companyName || 'NovaTech Solutions'}</p>
              <p className="text-slate-400">Customer: {user?.name || 'Customer'}</p>
              <p className="text-slate-400">Date: {new Date().toLocaleDateString('en-GB')}</p>
              <p className="text-cyan-400 text-[11px] font-mono mt-0.5">Source: {dataSourceName}</p>
            </div>
          </div>

          {/* 1. Storage Summary */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-2">
              1. STORAGE SUMMARY
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Files</p>
                <p className="text-base font-black text-white">{analysisResult.totalObjects}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Storage</p>
                <p className="text-base font-black text-white">
                  {analysisResult.totalStorageGB >= 1000
                    ? `${(analysisResult.totalStorageGB / 1000).toFixed(2)} TB`
                    : `${analysisResult.totalStorageGB} GB`}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Buckets</p>
                <p className="text-base font-black text-white">{analysisResult.byBucket.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Storage Classes</p>
                <p className="text-xs font-bold text-cyan-300 mt-1">
                  {analysisResult.byStorageClass.map(s => s.name).join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Usage Analysis */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-2">
              2. USAGE ANALYSIS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Most Used File Type</p>
                <p className="text-xs font-bold text-white mt-1">{mostUsedFileType}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Largest Category Size</p>
                <p className="text-xs font-bold text-white mt-1">{mostUsedCategoryStorage} GB</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Most Used Bucket</p>
                <p className="text-xs font-bold text-white mt-1 truncate">{mostUsedBucket}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Least Active Category</p>
                <p className="text-xs font-bold text-amber-300 mt-1">{leastActiveCategory}</p>
              </div>
            </div>
          </div>

          {/* 3. Cost Analysis */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 mb-2">
              3. COST ANALYSIS (DEMO PRICING)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Monthly Cost</p>
                <p className="text-base font-black text-white">₹{analysisResult.currentMonthlyCost.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Optimized Cost</p>
                <p className="text-base font-black text-blue-300">₹{analysisResult.potentialMonthlyCost.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Potential Monthly Savings</p>
                <p className="text-base font-black text-emerald-400">₹{analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Potential Annual Savings</p>
                <p className="text-base font-black text-emerald-400">₹{analysisResult.potentialAnnualSavings.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* 4. Optimization Findings */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-400 mb-2">
              4. OPTIMIZATION FINDINGS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Duplicate Candidates</p>
                <p className="text-xs font-bold text-orange-300 mt-1">
                  {analysisResult.duplicateCandidatesCount} files ({analysisResult.duplicateRecoverableStorageGB} GB)
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Inactive Storage (&gt;180d)</p>
                <p className="text-xs font-bold text-amber-300 mt-1">
                  {analysisResult.inactiveObjectsCount} files ({analysisResult.inactiveStorageGB} GB)
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Large Files (&gt;10GB)</p>
                <p className="text-xs font-bold text-white mt-1">{largeFilesCount} files</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Archive Candidates</p>
                <p className="text-xs font-bold text-cyan-300 mt-1">{archiveCandidatesCount} files</p>
              </div>
            </div>
          </div>

          {/* 5. Highest Priority Recommendations */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
              5. HIGHEST PRIORITY RECOMMENDATIONS
            </h3>
            <div className="space-y-2">
              {analysisResult.recommendations.slice(0, 4).map((rec, i) => (
                <div key={rec.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                      <p className="text-xs font-bold text-white truncate">{rec.title}</p>
                      <span className={clsx('text-[9px] font-black px-1.5 py-0.2 rounded uppercase', rec.priority === 'HIGH' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300')}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{rec.recommendedAction}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-emerald-400">+₹{rec.estimatedMonthlySavings}/mo</span>
                    <p className="text-[10px] text-slate-500">recoverable</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Savings Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">6. SAVINGS SUMMARY</h4>
              <p className="text-xs text-slate-300 mt-1">
                By executing the recommended tiering and duplicate cleanup, your estimated spend reduces from <strong className="text-white">₹{analysisResult.currentMonthlyCost}</strong> to <strong className="text-emerald-300">₹{analysisResult.potentialMonthlyCost}</strong> per month.
              </p>
            </div>
            <div className="text-center sm:text-right flex-shrink-0">
              <p className="text-xl font-black text-emerald-400">₹{analysisResult.potentialMonthlySavings.toLocaleString('en-IN')} /mo</p>
              <p className="text-xs text-emerald-300 font-bold">₹{analysisResult.potentialAnnualSavings.toLocaleString('en-IN')} /year recovery</p>
            </div>
          </div>

          {/* Legal / Prototype Disclaimer */}
          <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800/80 pt-3">
            NOTE: These are estimated values based on the uploaded metadata and configured demo pricing. They are not actual cloud billing charges.
          </p>
        </div>
      </Modal>
    </div>
  )
}
