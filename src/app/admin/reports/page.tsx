'use client'

import React, { useState, useMemo } from 'react'
import {
  FileText, Download, Eye, Building2,
  HardDrive, DollarSign, TrendingDown,
  Printer, Search
} from 'lucide-react'
import { useStorageData, CustomerSummaryItem } from '@/context/StorageDataContext'
import { getAllReports } from '@/lib/services/authService'
import type { UserReportRecord } from '@/types/auth'
import PageHeader from '@/components/layout/PageHeader'
import MetricCard from '@/components/ui/MetricCard'
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
    let csv = "CLOUDCUT PLATFORM-WIDE MULTI-TENANT AUDIT REPORT\n"
    csv += `Compiled Date:,"${new Date().toISOString()}"\n`
    csv += `Total Active Customer Tenants:,"${summaries.length}"\n`
    csv += `Total Managed Platform Storage:,"${totalStorageGB} GB"\n`
    csv += `Total Platform Estimated Spend:,"₹${totalCost}"\n`
    csv += `Total Platform Monthly Recoverable Savings:,"₹${totalSavings}"\n\n`

    csv += "--- TENANT BREAKDOWN ---\n"
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
    toast.success('Downloaded Platform Audit CSV!')
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Customer & Platform Reports"
        subtitle="Audit reports compiled by customers across the platform and aggregated multi-tenant executive reports."
        badge={`${customerReports.length} Registered Reports`}
        actions={
          <button
            onClick={() => setPlatformModalOpen(true)}
            className="btn-primary text-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Compile Platform Executive Audit
          </button>
        }
      />

      {/* Top 3 Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Customer Tenancies"
          value={`${summaries.length} Companies`}
          subtitle="100% data isolated"
          icon={<Building2 className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Platform Savings Target"
          value={`₹${totalSavings.toLocaleString('en-IN')}`}
          subtitle={`₹${(totalSavings * 12).toLocaleString('en-IN')} annual recovery`}
          icon={<TrendingDown className="w-4 h-4 text-emerald-600" />}
        />

        <MetricCard
          title="Monitored Storage Pool"
          value={totalStorageGB >= 1000 ? `${(totalStorageGB / 1000).toFixed(2)} TB` : `${totalStorageGB} GB`}
          subtitle="Across all customer buckets"
          icon={<HardDrive className="w-4 h-4 text-slate-600" />}
        />
      </div>

      {/* Search & Action Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer reports by company or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-8 text-xs py-1.5 w-full"
          />
        </div>
        <button
          onClick={handleExportPlatformCSV}
          className="btn-secondary text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          Export All as CSV
        </button>
      </div>

      {/* Customer Reports Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="section-title">Customer Reports Registry</h3>
          <span className="text-xs text-slate-500">{filteredReports.length} reports logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
                <th className="py-3 px-4">Report & Company</th>
                <th className="py-3 px-4">Compiled By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Spend</th>
                <th className="py-3 px-4 text-right">Recoverable</th>
                <th className="py-3 px-4 text-right">Health Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No customer reports registered yet.
                  </td>
                </tr>
              ) : (
                filteredReports.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{rep.reportTitle}</p>
                      <p className="text-[11px] text-slate-500">{rep.companyName}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {rep.userName}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(rep.generatedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      ₹{rep.currentMonthlyCost.toLocaleString('en-IN')}/mo
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      ₹{rep.potentialMonthlySavings.toLocaleString('en-IN')}/mo
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {rep.optimizationScore} / 100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenReport(rep)}
                        className="btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
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

      {/* PLATFORM AUDIT MODAL */}
      <Modal
        open={platformModalOpen}
        onClose={() => setPlatformModalOpen(false)}
        title="Platform-Wide Multi-Tenant Storage Audit"
        size="lg"
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-slate-500">{summaries.length} Client Companies</span>
            <div className="flex gap-2">
              <button onClick={() => setPlatformModalOpen(false)} className="btn-secondary text-xs">
                Close
              </button>
              <button onClick={handleExportPlatformCSV} className="btn-secondary text-xs">
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
              <button onClick={() => window.print()} className="btn-primary text-xs">
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4 text-xs text-slate-900 bg-white p-2">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
            <div>
              <p className="font-bold text-slate-900 text-sm">CloudCut Multi-Tenant Audit</p>
              <p className="text-slate-500 text-xs">Aggregated Platform Overview</p>
            </div>
            <p className="text-slate-400">{new Date().toLocaleDateString('en-GB')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-md border border-slate-200">
            <div>
              <p className="text-[11px] text-slate-500">Total Tenancies</p>
              <p className="text-base font-bold text-slate-900">{summaries.length}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Managed Storage</p>
              <p className="text-base font-bold text-slate-900">{(totalStorageGB / 1000).toFixed(2)} TB</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Platform Spend</p>
              <p className="text-base font-bold text-slate-900">₹{totalCost.toLocaleString('en-IN')}/mo</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Identified Savings</p>
              <p className="text-base font-bold text-emerald-700">₹{totalSavings.toLocaleString('en-IN')}/mo</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800">Tenant Economics</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden">
              {summaries.map(s => (
                <div key={s.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-900">{s.companyName}</p>
                    <p className="text-[11px] text-slate-500">{s.name} • {s.totalStorageGB} GB storage</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">₹{s.currentMonthlyCost.toLocaleString('en-IN')}/mo</p>
                    <p className="text-[11px] font-medium text-emerald-700">₹{s.potentialMonthlySavings}/mo recoverable</p>
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
        <div className="space-y-4 text-xs text-slate-900 bg-white p-2">
          <div className="flex justify-between items-start border-b border-slate-200 pb-3">
            <div>
              <p className="font-bold text-slate-900 text-sm">{selectedReport?.companyName}</p>
              <p className="text-slate-500">{selectedReport?.userName}</p>
            </div>
            <span className="text-[11px] text-slate-400">
              {selectedReport && new Date(selectedReport.generatedAt).toLocaleString('en-GB')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-md border border-slate-200">
            <div>
              <p className="text-[11px] text-slate-500">Storage Pool</p>
              <p className="text-sm font-bold text-slate-900">{selectedReport?.totalStorageGB} GB</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Monthly Spend</p>
              <p className="text-sm font-bold text-slate-900">₹{selectedReport?.currentMonthlyCost}/mo</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">Monthly Savings</p>
              <p className="text-sm font-bold text-emerald-700">₹{selectedReport?.potentialMonthlySavings}/mo</p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            {selectedReport?.summaryText}
          </p>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button onClick={() => setPreviewOpen(false)} className="btn-secondary text-xs">
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
