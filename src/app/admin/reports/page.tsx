'use client'

import React, { useState, useMemo } from 'react'
import {
  FileText, Download, Eye, Sparkles, Building2, User,
  Calendar, Shield, HardDrive, DollarSign, TrendingDown,
  Printer, CheckCircle2, Search, Filter
} from 'lucide-react'
import { useStorageData, CustomerSummaryItem } from '@/context/StorageDataContext'
import { getAllReports } from '@/lib/services/authService'
import type { UserReportRecord } from '@/types/auth'
import PageHeader from '@/components/layout/PageHeader'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminReportsPage() {
  const { getAllCustomerSummaries } = useStorageData()

  const [search, setSearch] = useState('')
  const [selectedReport, setSelectedReport] = useState<UserReportRecord | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [platformModalOpen, setPlatformModalOpen] = useState(false)

  // Live summaries across all customers
  const summaries: CustomerSummaryItem[] = useMemo(() => {
    return getAllCustomerSummaries()
  }, [getAllCustomerSummaries])

  // Customer reports registry
  const customerReports = useMemo(() => {
    return getAllReports()
  }, [])

  // Aggregate platform stats
  const totalStorageGB = summaries.reduce((acc, s) => acc + s.totalStorageGB, 0)
  const totalCost = summaries.reduce((acc, s) => acc + s.currentMonthlyCost, 0)
  const totalSavings = summaries.reduce((acc, s) => acc + s.potentialMonthlySavings, 0)

  // Filter customer reports
  const filteredReports = customerReports.filter(r =>
    r.companyName.toLowerCase().includes(search.toLowerCase()) ||
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.reportTitle.toLowerCase().includes(search.toLowerCase())
  )

  function handleOpenReport(rep: UserReportRecord) {
    setSelectedReport(rep)
    setPreviewOpen(true)
  }

  function handleExportPlatformCSV() {
    let csv = "CLOUDCUT PLATFORM-WIDE MULTI-TENANT FINOPS AUDIT REPORT\n"
    csv += `Compiled Date:,"${new Date().toISOString()}"\n`
    csv += `Total Active Customer Tenants:,"${summaries.length}"\n`
    csv += `Total Managed Platform Storage:,"${totalStorageGB} GB (${(totalStorageGB / 1000).toFixed(2)} TB)"\n`
    csv += `Total Platform Estimated Monthly Spend:,"₹${totalCost}"\n`
    csv += `Total Platform Monthly Recoverable Savings:,"₹${totalSavings}"\n`
    csv += `Total Platform Annual Recoverable Savings:,"₹${totalSavings * 12}"\n\n`

    csv += "--- TENANT SUMMARY BREAKDOWN ---\n"
    csv += "Tenant ID,Company Name,Contact Name,Status,Storage (GB),Est Cost (INR),Potential Savings (INR),Score\n"
    summaries.forEach(s => {
      csv += `"${s.id}","${s.companyName}","${s.name}","${s.status}",${s.totalStorageGB},${s.currentMonthlyCost},${s.potentialMonthlySavings},${s.optimizationScore}\n`
    })

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    const link = document.createElement("a")
    link.setAttribute("href", csvContent)
    link.setAttribute("download", `CloudCut_Platform_Audit_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Downloaded Platform FinOps CSV report!', { icon: '📊' })
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Platform & Customer Reports Registry"
          subtitle="Audit reports compiled by customers across the platform, plus compile unified multi-tenant executive audits."
          badge={`${customerReports.length} Customer Reports`}
        />

        <button
          onClick={() => setPlatformModalOpen(true)}
          className="btn-primary py-2.5 px-4 text-xs font-black flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-purple-600/30"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          Compile Platform Executive Report
        </button>
      </div>

      {/* Top 3 Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 card-glow-purple flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-slate-400">Total Customer Tenancies</p>
            <p className="text-2xl font-black text-white">{summaries.length} Companies</p>
            <p className="text-[10px] text-slate-400">100% data isolated</p>
          </div>
        </div>

        <div className="card p-5 card-glow-emerald flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-slate-400">Platform Savings Target</p>
            <p className="text-2xl font-black text-emerald-400">₹{totalSavings.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-slate-400">₹{(totalSavings * 12).toLocaleString('en-IN')} annual potential</p>
          </div>
        </div>

        <div className="card p-5 card-glow-blue flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase text-slate-400">Storage Under Analysis</p>
            <p className="text-2xl font-black text-cyan-300">
              {totalStorageGB >= 1000 ? `${(totalStorageGB / 1000).toFixed(2)} TB` : `${totalStorageGB} GB`}
            </p>
            <p className="text-[10px] text-slate-400">Across all customer buckets</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer reports by company or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 text-xs w-full"
          />
        </div>
        <button
          onClick={handleExportPlatformCSV}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Export All as CSV
        </button>
      </div>

      {/* Customer Reports Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Registered Customer Reports</h3>
          <span className="text-xs text-slate-400">{filteredReports.length} reports logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3.5 px-4">Report & Company</th>
                <th className="py-3.5 px-4">Generated By</th>
                <th className="py-3.5 px-4">Report Date</th>
                <th className="py-3.5 px-4">Estimated Spend</th>
                <th className="py-3.5 px-4">Recoverable Savings</th>
                <th className="py-3.5 px-4">Health Score</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customer reports generated yet. When customers click &quot;Generate Report&quot; on their reports page, they appear here.
                  </td>
                </tr>
              ) : (
                filteredReports.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{rep.reportTitle}</p>
                      <p className="text-[11px] text-purple-400 font-semibold">{rep.companyName}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {rep.userName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(rep.generatedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{rep.currentMonthlyCost.toLocaleString('en-IN')}/mo
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ₹{rep.potentialMonthlySavings.toLocaleString('en-IN')}/mo
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                        {rep.optimizationScore} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenReport(rep)}
                        className="btn-secondary py-1.5 px-3 text-xs font-bold hover:bg-purple-600 hover:text-white transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLATFORM EXECUTIVE REPORT MODAL */}
      <Modal
        open={platformModalOpen}
        onClose={() => setPlatformModalOpen(false)}
        title="Unified Platform Executive FinOps Audit"
        size="lg"
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-slate-400">{summaries.length} Client Companies Audited</span>
            <div className="flex gap-2">
              <button onClick={() => setPlatformModalOpen(false)} className="btn-secondary text-xs">
                Close
              </button>
              <button onClick={handleExportPlatformCSV} className="btn-emerald text-xs flex items-center gap-1 font-bold">
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
              <button onClick={() => window.print()} className="btn-primary text-xs flex items-center gap-1 font-bold">
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        }
      >
        <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-5 text-xs">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <span className="text-base font-black text-white">CLOUDCUT PLATFORM AUDIT</span>
              <p className="text-slate-400 text-xs">Multi-Tenant Cloud Storage Cost Overview</p>
            </div>
            <div className="text-right text-slate-400">
              <p className="font-bold text-white">Platform Administration</p>
              <p>{new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 p-3 rounded-xl">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Clients</p>
              <p className="text-base font-black text-white">{summaries.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Managed Storage</p>
              <p className="text-base font-black text-cyan-300">
                {(totalStorageGB / 1000).toFixed(2)} TB
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Platform Spend</p>
              <p className="text-base font-black text-white">₹{totalCost.toLocaleString('en-IN')}/mo</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Identified Savings</p>
              <p className="text-base font-black text-emerald-400">₹{totalSavings.toLocaleString('en-IN')}/mo</p>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-purple-300 mb-2">
              Individual Tenant Economics
            </h4>
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden">
              {summaries.map(s => (
                <div key={s.id} className="p-3 flex items-center justify-between bg-slate-900/50">
                  <div>
                    <p className="font-bold text-white">{s.companyName}</p>
                    <p className="text-[10px] text-slate-400">{s.name} • {s.totalStorageGB} GB storage</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">₹{s.currentMonthlyCost.toLocaleString('en-IN')}/mo</p>
                    <p className="text-[10px] font-bold text-emerald-400">₹{s.potentialMonthlySavings}/mo recoverable</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* SINGLE REPORT PREVIEW MODAL */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={selectedReport?.reportTitle || 'Customer Report Preview'}
        size="md"
      >
        <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div>
              <p className="text-sm font-bold text-white">{selectedReport?.companyName}</p>
              <p className="text-slate-400">{selectedReport?.userName}</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {selectedReport && new Date(selectedReport.generatedAt).toLocaleString('en-GB')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-900 p-3 rounded-xl">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Storage Pool</p>
              <p className="text-sm font-bold text-white">{selectedReport?.totalStorageGB} GB</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Monthly Spend</p>
              <p className="text-sm font-bold text-white">₹{selectedReport?.currentMonthlyCost}/mo</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Monthly Savings</p>
              <p className="text-sm font-bold text-emerald-400">₹{selectedReport?.potentialMonthlySavings}/mo</p>
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed">
            {selectedReport?.summaryText}
          </p>

          <div className="flex justify-end pt-2">
            <button onClick={() => setPreviewOpen(false)} className="btn-secondary text-xs">
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
