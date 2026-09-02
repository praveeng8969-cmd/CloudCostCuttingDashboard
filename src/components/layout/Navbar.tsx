'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell, Search, Sun, Moon, Menu, RefreshCw, ChevronDown,
  X, Check, Sparkles, HardDrive, DollarSign, Copy, FileText, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { DATE_RANGES } from '@/lib/constants'
import type { DateRange } from '@/types'
import { useAuth } from '@/context/AuthContext'

const pageLabels: Record<string, string> = {
  '/dashboard':       'Enterprise Dashboard',
  '/storage':         'Storage Analysis',
  '/storage-analysis':'Storage Analysis',
  '/cost-analysis':   'Cost & Billing Analytics',
  '/recommendations': 'Cost Optimization Recommendations',
  '/duplicates':      'Duplicate File Manager',
  '/reports':         'Automated Cloud Reports',
  '/cloud-providers': 'Connected Cloud Providers',
  '/settings':        'Governance & Settings',
}

interface NavbarProps {
  onMenuClick: () => void
  dateRange: DateRange
  onDateRangeChange: (r: DateRange) => void
}

const initialNotifications = [
  { id: 1, text: '1,284 duplicate files found in AWS S3 buckets', time: '2h ago', dot: 'bg-rose-500', route: '/duplicates', read: false },
  { id: 2, text: 'Storage usage reached 83% of allocated capacity', time: '5h ago', dot: 'bg-amber-500', route: '/storage', read: false },
  { id: 3, text: 'Monthly budget alert: ₹1,24,500 spent (83% of ₹1.5L)', time: '1d ago', dot: 'bg-purple-500', route: '/cost-analysis', read: false },
  { id: 4, text: 'Google Cloud Storage sync completed successfully', time: '2d ago', dot: 'bg-emerald-500', route: '/cloud-providers', read: false },
]

export default function Navbar({ onMenuClick, dateRange, onDateRangeChange }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)

  const pageTitle = pageLabels[pathname] ?? 'CloudCut'
  const unreadCount = notifications.filter(n => !n.read).length

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success('All cloud metrics and bucket indices refreshed!', {
        icon: '⚡',
        style: { background: '#1e293b', color: '#fff', borderRadius: '12px' }
      })
    }, 1000)
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  function clearAllNotifs() {
    setNotifications([])
    setShowNotifications(false)
    toast('Notifications cleared', { icon: '🧹' })
  }

  const selectedLabel = DATE_RANGES.find(r => r.value === dateRange)?.label ?? 'Last 30 days'

  const searchResults = [
    { title: 'Duplicate Files (1,284 files)', category: 'Storage', href: '/duplicates', icon: Copy },
    { title: 'Cost Trajectory & Service Breakdown', category: 'Cost', href: '/cost-analysis', icon: DollarSign },
    { title: 'Old Backups (>180 days)', category: 'Recommendations', href: '/recommendations', icon: Sparkles },
    { title: 'AWS S3 Production Bucket', category: 'Cloud', href: '/cloud-providers', icon: HardDrive },
    { title: 'Monthly Cost Report (Sep 2026)', category: 'Reports', href: '/reports', icon: FileText },
  ].filter(item =>
    searchQuery === '' ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <header className="h-16 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/80 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-40">
        {/* Hamburger (mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-slate-300" />
        </button>

        {/* Page title */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h1 className="text-base font-black text-white tracking-tight truncate">
            {pageTitle}
          </h1>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Live Stream
          </span>
        </div>

        {/* Search trigger button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="hidden md:flex items-center justify-between gap-3 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 w-52 lg:w-64 text-xs font-semibold text-slate-400 transition-all shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search cloud assets...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded shadow-sm text-slate-400">
            Ctrl K
          </kbd>
        </button>

        {/* Date range picker */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-900/80 border border-slate-700/80 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>{selectedLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {showDatePicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDatePicker(false)} />
              <div className="absolute right-0 top-11 z-20 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl py-1.5 w-48 backdrop-blur-xl animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Time Range</div>
                {DATE_RANGES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => {
                      onDateRangeChange(r.value as DateRange)
                      setShowDatePicker(false)
                      toast.success(`Filter updated: ${r.label}`)
                    }}
                    className={clsx(
                      'w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between transition-colors',
                      dateRange === r.value
                        ? 'bg-blue-600/30 text-blue-400'
                        : 'text-slate-300 hover:bg-slate-800'
                    )}
                  >
                    <span>{r.label}</span>
                    {dateRange === r.value && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          title="Refresh live bucket telemetry"
          className="p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-300"
        >
          <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin text-blue-400')} />
        </button>

        {/* Notifications dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 hover:bg-slate-800 rounded-xl transition-colors text-slate-300"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 z-20 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl w-84 sm:w-96 overflow-hidden backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm font-bold">Cloud Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-white/20 text-white text-[10px] font-black rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button onClick={markAllRead} className="text-white/80 hover:text-white font-medium underline">
                      Mark read
                    </button>
                    <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-white/10 rounded-lg">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No active alerts</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifications(false)
                          router.push(n.route)
                        }}
                        className={clsx(
                          'flex items-start gap-3 px-4 py-3 hover:bg-slate-800/80 transition-colors cursor-pointer group',
                          !n.read && 'bg-blue-950/30'
                        )}
                      >
                        <span className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', n.dot)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                            {n.text}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex justify-between items-center px-4">
                    <button
                      onClick={clearAllNotifs}
                      className="text-[11px] font-bold text-rose-400 hover:underline"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => { setShowNotifications(false); router.push('/recommendations') }}
                      className="text-[11px] font-bold text-blue-400 hover:underline"
                    >
                      View All Opportunities →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Customer Identity Badge */}
        {user && (
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow">
              {user.name.charAt(0)}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-white leading-none">{user.name}</p>
              <p className="text-[10px] font-semibold text-cyan-400 leading-tight">{user.companyName}</p>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 uppercase">
              Customer
            </span>
          </div>
        )}

        {/* Demo Mode / Active Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-black text-emerald-300">Live Workspace</span>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden backdrop-blur-xl">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search storage buckets, duplicate files, cost reports..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder-slate-400"
              />
              <button onClick={() => setShowSearchModal(false)} className="p-1 hover:bg-slate-800 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1.5">Direct Navigation</p>
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No matching assets or pages found.</div>
              ) : (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowSearchModal(false)
                      router.push(item.href)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-950/40 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400">{item.title}</p>
                        <p className="text-[10px] text-slate-400">{item.category}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>Press ESC to close</span>
              <span>CloudCut QuickJump</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
