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

const pageLabels: Record<string, string> = {
  '/dashboard':       'Enterprise Dashboard',
  '/storage':         'Storage Analysis',
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
  const [dark, setDark] = useState(false)
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

  function handleDark() {
    const nextDark = !dark
    setDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      toast('Dark theme activated', { icon: '🌙' })
    } else {
      document.documentElement.classList.remove('dark')
      toast('Light theme activated', { icon: '☀️' })
    }
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

  // Quick search results
  const searchResults = [
    { title: 'Duplicate Files (1,284 files)', category: 'Storage', href: '/duplicates', icon: Copy },
    { title: 'Cost Trend & Service Breakdown', category: 'Cost', href: '/cost-analysis', icon: DollarSign },
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
      <header className="h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-40">
        {/* Hamburger (mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Page title with vibrant badge */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <h1 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
            {pageTitle}
          </h1>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
            Live Demo
          </span>
        </div>

        {/* Search trigger button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="hidden md:flex items-center justify-between gap-3 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700/60 rounded-xl px-3.5 py-2 w-52 lg:w-64 text-xs font-medium text-gray-500 dark:text-gray-400 transition-all shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <span>Search cloud assets...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-gray-400">
            Ctrl K
          </kbd>
        </button>

        {/* Date range picker */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-100/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700 rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>{selectedLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showDatePicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDatePicker(false)} />
              <div className="absolute right-0 top-11 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl py-1.5 w-48 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Time Filter</div>
                {DATE_RANGES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => {
                      onDateRangeChange(r.value as DateRange)
                      setShowDatePicker(false)
                      toast.success(`Filter updated: ${r.label}`)
                    }}
                    className={clsx(
                      'w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors',
                      dateRange === r.value
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    )}
                  >
                    <span>{r.label}</span>
                    {dateRange === r.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          title="Refresh real-time data"
          className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-600 dark:text-gray-300"
        >
          <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin text-blue-600')} />
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={handleDark}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-600 dark:text-gray-300"
        >
          {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
        </button>

        {/* Notifications dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-600 dark:text-gray-300"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-84 sm:w-96 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span className="text-sm font-bold">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-white/20 text-white text-[10px] font-extrabold rounded-full">
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

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">No active notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifications(false)
                          router.push(n.route)
                        }}
                        className={clsx(
                          'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group',
                          !n.read && 'bg-blue-50/40 dark:bg-blue-950/20'
                        )}
                      >
                        <span className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', n.dot)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                            {n.text}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center px-4">
                    <button
                      onClick={clearAllNotifs}
                      className="text-[11px] font-semibold text-rose-500 hover:underline"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => { setShowNotifications(false); router.push('/recommendations') }}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View All Opportunities →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Demo Mode Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-full">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Demo Active</span>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-600" />
              <input
                autoFocus
                type="text"
                placeholder="Search storage, duplicate files, cost reports, cloud providers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none placeholder-gray-400"
              />
              <button onClick={() => setShowSearchModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5">Quick Jump</p>
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">No matching assets or pages found.</div>
              ) : (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowSearchModal(false)
                      router.push(item.href)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.title}</p>
                        <p className="text-[10px] text-gray-400">{item.category}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border-t border-gray-100 dark:border-gray-700 text-[11px] text-gray-400 flex justify-between">
              <span>Press ESC to close</span>
              <span>CloudCut Search v1.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
