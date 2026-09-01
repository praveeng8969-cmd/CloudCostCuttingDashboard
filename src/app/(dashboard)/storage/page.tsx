'use client'

import React, { useState, useMemo } from 'react'
import {
  Search, Filter, ArrowUpDown, ChevronDown, Download,
  HardDrive, AlertTriangle, CheckCircle2, Clock, Copy,
  ArrowRight, Sparkles, ChevronLeft, ChevronRight, Layers, Database
} from 'lucide-react'
import PageHeader from '@/components/layout/PageHeader'
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

  // Extract unique filter options dynamically from current records
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

  // Export filtered CSV
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

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Standardized Page Header */}
      <PageHeader
        title="Cloud Storage Inventory & Object Explorer"
        subtitle="Search, filter, and inspect individual storage objects across all monitored bucket containers."
        badge={`${records.length.toLocaleString()} Objects Indexed`}
        actions={
          <button
            onClick={exportFilteredData}
            disabled={filteredRecords.length === 0}
            className="btn-secondary text-xs flex items-center gap-1.5 flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Filtered CSV ({filteredRecords.length})
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        <div className="card p-5 card-glow-cyan flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Total Storage</p>
            <p className="text-2xl font-black text-cyan-300 tracking-tight truncate">
              {analysisResult.totalStorageGB >= 1000 ? `${(analysisResult.totalStorageGB / 1000).toFixed(2)} TB` : `${analysisResult.totalStorageGB} GB`}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{analysisResult.totalObjects} total objects</p>
          </div>
        </div>

        <div className="card p-5 card-glow-blue flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Average File Size</p>
            <p className="text-2xl font-black text-blue-300 tracking-tight truncate">
              {analysisResult.averageFileSizeGB} GB
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              Largest: {analysisResult.largestFile?.sizeGB ?? 0} GB
            </p>
          </div>
        </div>

        <div className="card p-5 card-glow-red flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-300 flex items-center justify-center flex-shrink-0 border border-red-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Inactive Storage</p>
            <p className="text-2xl font-black text-red-400 tracking-tight truncate">
              {analysisResult.inactiveStorageGB} GB
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {analysisResult.inactiveObjectsCount} unaccessed objects (&gt;180d)
            </p>
          </div>
        </div>

        <div className="card p-5 card-glow-orange flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/20 text-orange-300 flex items-center justify-center flex-shrink-0 border border-orange-500/30">
            <Copy className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 truncate">Duplicate Candidates</p>
            <p className="text-2xl font-black text-orange-300 tracking-tight truncate">
              {analysisResult.duplicateRecoverableStorageGB} GB
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {analysisResult.duplicateCandidatesCount} redundant copies
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Card with Search & Filters */}
      <div className="card overflow-hidden w-full min-w-0">
        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by file name, bucket, class, or type..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                className="input pl-9"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
              {/* File Type Filter */}
              <select
                value={selectedType}
                onChange={e => { setSelectedType(e.target.value); setCurrentPage(1) }}
                className="input text-xs py-1.5 px-3 max-w-[140px]"
              >
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>{t === 'All' ? 'All File Types' : t}</option>
                ))}
              </select>

              {/* Bucket Filter */}
              <select
                value={selectedBucket}
                onChange={e => { setSelectedBucket(e.target.value); setCurrentPage(1) }}
                className="input text-xs py-1.5 px-3 max-w-[160px]"
              >
                {uniqueBuckets.map(b => (
                  <option key={b} value={b}>{b === 'All' ? 'All Buckets' : b}</option>
                ))}
              </select>

              {/* Storage Class Filter */}
              <select
                value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setCurrentPage(1) }}
                className="input text-xs py-1.5 px-3 max-w-[140px]"
              >
                {uniqueClasses.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1) }}
                className="input text-xs py-1.5 px-3 max-w-[140px]"
              >
                {uniqueStatuses.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>
              Showing <strong className="text-white">{filteredRecords.length}</strong> of {records.length} total objects
            </span>
            <span className="text-[11px]">
              Sorted by: <strong className="text-cyan-400 capitalize">{sortBy}</strong> ({sortOrder.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Records Table */}
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No matching storage objects found</p>
            <p className="text-xs text-slate-400 mt-1">Try broadening your search query or reset active filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-black uppercase tracking-wider">
                  <th
                    onClick={() => toggleSort('fileName')}
                    className="text-left py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      File Name
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('sizeGB')}
                    className="text-left py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Size
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="text-left py-3.5 px-4">File Type</th>
                  <th className="text-left py-3.5 px-4">Bucket</th>
                  <th className="text-left py-3.5 px-4">Storage Class</th>
                  <th
                    onClick={() => toggleSort('lastAccessed')}
                    className="text-left py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Last Accessed
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('ageDays')}
                    className="text-left py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Age
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="text-left py-3.5 px-4">Status</th>
                  <th className="text-right py-3.5 px-4">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {paginatedRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white max-w-[220px] truncate" title={rec.fileName}>
                      {rec.fileName}
                    </td>
                    <td className="py-3.5 px-4 font-black text-cyan-300">
                      {rec.sizeGB} GB
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-bold text-slate-300">
                        {rec.fileType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 max-w-[150px] truncate" title={rec.bucket}>
                      {rec.bucket}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {rec.storageClass}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {rec.lastAccessed}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      {rec.ageDays}d
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={clsx(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-black border',
                        rec.status === 'Active' && 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                        rec.status === 'Inactive' && 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                        rec.status === 'Highly Inactive' && 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                        rec.status === 'Duplicate Candidate' && 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      )}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-lg text-xs font-black',
                        rec.recommendation === 'Archive' && 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
                        rec.recommendation === 'Tier Down' && 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
                        rec.recommendation === 'Delete' && 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
                        rec.recommendation === 'Compress' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
                        rec.recommendation === 'Keep' && 'bg-slate-800 text-slate-400 border border-slate-700'
                      )}>
                        {rec.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredRecords.length > pageSize && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
