'use client'

import React, { useState, useMemo } from 'react'
import {
  Search, Download, HardDrive, AlertTriangle, CheckCircle2,
  Clock, Copy, ArrowUpDown, ChevronLeft, ChevronRight, Layers, Filter
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
import MetricCard from '@/components/ui/MetricCard'
import { useStorageData } from '@/context/StorageDataContext'
import { StorageRecord } from '@/types/storage'
import clsx from 'clsx'

export default function StoragePage() {
  const { records, analysisResult, hasData } = useStorageData()

  // Filter & Search states
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [selectedBucket, setSelectedBucket] = useState('All')
  const [selectedClass, setSelectedClass] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState<'sizeGB' | 'ageDays' | 'fileName' | 'lastAccessed'>('sizeGB')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 15

  const uniqueTypes = useMemo(() => ['All', ...Array.from(new Set(records.map(r => r.fileType)))], [records])
  const uniqueBuckets = useMemo(() => ['All', ...Array.from(new Set(records.map(r => r.bucket)))], [records])
  const uniqueClasses = useMemo(() => ['All', ...Array.from(new Set(records.map(r => r.storageClass)))], [records])
  const uniqueStatuses = ['All', 'Active', 'Inactive', 'Highly Inactive', 'Duplicate Candidate']

  // Filter & Sort
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => {
        if (search) {
          const q = search.toLowerCase()
          const matchName = r.fileName.toLowerCase().includes(q)
          const matchBucket = r.bucket.toLowerCase().includes(q)
          const matchType = r.fileType.toLowerCase().includes(q)
          const matchClass = r.storageClass.toLowerCase().includes(q)
          if (!matchName && !matchBucket && !matchType && !matchClass) return false
        }
        if (selectedType !== 'All' && r.fileType !== selectedType) return false
        if (selectedBucket !== 'All' && r.bucket !== selectedBucket) return false
        if (selectedClass !== 'All' && r.storageClass !== selectedClass) return false
        if (selectedStatus !== 'All' && r.status !== selectedStatus) return false
        return true
      })
      .sort((a, b) => {
        let valA: any = a[sortBy]
        let valB: any = b[sortBy]
        if (sortBy === 'lastAccessed') {
          valA = new Date(a.lastAccessed).getTime()
          valB = new Date(b.lastAccessed).getTime()
        }
        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA
      })
  }, [records, search, selectedType, selectedBucket, selectedClass, selectedStatus, sortBy, sortOrder])

  // Pagination slice
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [filteredRecords, currentPage, pageSize])

  function toggleSort(field: 'sizeGB' | 'ageDays' | 'fileName' | 'lastAccessed') {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  function exportFilteredData() {
    let csv = "file_name,size_gb,last_accessed,age_days,storage_class,file_type,bucket,status,recommendation,est_monthly_cost\n"
    filteredRecords.forEach(r => {
      csv += `"${r.fileName}",${r.sizeGB},"${r.lastAccessed}",${r.ageDays},"${r.storageClass}","${r.fileType}","${r.bucket}","${r.status}","${r.recommendation}",${r.estimatedMonthlyCost}\n`
    })
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    const link = document.createElement("a")
    link.setAttribute("href", csvContent)
    link.setAttribute("download", `cloudcut_storage_inventory_export_${filteredRecords.length}_rows.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalStorageDisplay = analysisResult.totalStorageGB >= 1000
    ? `${(analysisResult.totalStorageGB / 1000).toFixed(2)} TB`
    : `${analysisResult.totalStorageGB} GB`

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Storage Analysis"
        subtitle="Search, filter, and inspect individual storage objects across all monitored bucket containers."
        badge={`${records.length.toLocaleString()} Objects`}
        actions={
          <button
            onClick={exportFilteredData}
            disabled={filteredRecords.length === 0}
            className="btn-secondary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filteredRecords.length})
          </button>
        }
      />

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Storage"
          value={totalStorageDisplay}
          subtitle={`${analysisResult.totalObjects.toLocaleString()} total objects`}
          icon={<HardDrive className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Average Object Size"
          value={`${analysisResult.averageFileSizeGB} GB`}
          subtitle="Across all file types"
          icon={<Layers className="w-4 h-4 text-slate-600" />}
        />

        <MetricCard
          title="Inactive Storage (>180d)"
          value={`${analysisResult.inactiveStorageGB} GB`}
          subtitle={`${analysisResult.inactiveObjectsCount} stale objects`}
          icon={<Clock className="w-4 h-4 text-amber-600" />}
        />

        <MetricCard
          title="Duplicate Candidates"
          value={`${analysisResult.duplicateRecoverableStorageGB} GB`}
          subtitle={`${analysisResult.duplicateCandidatesCount} redundant copies`}
          icon={<Copy className="w-4 h-4 text-slate-600" />}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file, bucket..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="input pl-8 text-xs py-1.5"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => { setSelectedType(e.target.value); setCurrentPage(1); }}
              className="input text-xs py-1.5"
            >
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
              ))}
            </select>
          </div>

          {/* Bucket Filter */}
          <div>
            <select
              value={selectedBucket}
              onChange={e => { setSelectedBucket(e.target.value); setCurrentPage(1); }}
              className="input text-xs py-1.5"
            >
              {uniqueBuckets.map(b => (
                <option key={b} value={b}>{b === 'All' ? 'All Buckets' : b}</option>
              ))}
            </select>
          </div>

          {/* Storage Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={e => { setSelectedClass(e.target.value); setCurrentPage(1); }}
              className="input text-xs py-1.5"
            >
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Storage Classes' : c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="input text-xs py-1.5"
            >
              {uniqueStatuses.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing <strong>{filteredRecords.length}</strong> matching objects</span>
          {(search || selectedType !== 'All' || selectedBucket !== 'All' || selectedClass !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearch('')
                setSelectedType('All')
                setSelectedBucket('All')
                setSelectedClass('All')
                setSelectedStatus('All')
                setCurrentPage(1)
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
                <th className="py-3 px-4 cursor-pointer select-none" onClick={() => toggleSort('fileName')}>
                  <div className="flex items-center gap-1.5">
                    <span>File Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer select-none text-right" onClick={() => toggleSort('sizeGB')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Size</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Bucket</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4 cursor-pointer select-none text-right" onClick={() => toggleSort('ageDays')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Age</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No objects match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => {
                  const isInactive = r.status === 'Inactive' || r.status === 'Highly Inactive'
                  const isDup = r.status === 'Duplicate Candidate'
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-[280px] truncate" title={r.fileName}>
                        {r.fileName}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900 whitespace-nowrap">
                        {r.sizeGB} GB
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                        {r.bucket}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200">
                          {r.storageClass}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
                        {r.ageDays}d
                      </td>
                      <td className="py-3 px-4">
                        <span className={clsx(
                          'inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium border',
                          isDup
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : isInactive
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        )}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900 whitespace-nowrap">
                        ₹{r.estimatedMonthlyCost}/mo
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary py-1 px-2 text-xs disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary py-1 px-2 text-xs disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
