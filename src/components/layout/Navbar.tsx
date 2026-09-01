'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Search, Sun, Moon, Menu, RefreshCw, ChevronDown, X } from 'lucide-react'
import clsx from 'clsx'
import { DATE_RANGES } from '@/lib/constants'
import type { DateRange } from '@/types'

const pageLabels: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/storage':         'Storage Analysis',
  '/cost-analysis':   'Cost Analysis',
  '/recommendations': 'Recommendations',
  '/duplicates':      'Duplicate Files',
  '/reports':         'Reports',
  '/cloud-providers': 'Cloud Providers',
  '/settings':        'Settings',
}

interface NavbarProps {
  onMenuClick: () => void
  dateRange: DateRange
  onDateRangeChange: (r: DateRange) => void
}

const notifications = [
  { id: 1, text: '1,284 duplicate files found', time: '2h ago',  dot: 'bg-red-500' },
  { id: 2, text: 'Storage exceeds 80% threshold', time: '5h ago', dot: 'bg-orange-500' },
  { id: 3, text: 'Monthly budget alert: 85% used', time: '1d ago', dot: 'bg-yellow-500' },
  { id: 4, text: 'AWS S3 sync completed', time: '2d ago',          dot: 'bg-green-500' },
]

export default function Navbar({ onMenuClick, dateRange, onDateRangeChange }: NavbarProps) {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const pageTitle = pageLabels[pathname] ?? 'CloudCut'
  const unread = notifications.length

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }

  function handleDark() {
    setDark(!dark)
    document.documentElement.classList.toggle('dark')
  }

  const selectedLabel = DATE_RANGES.find(r => r.value === dateRange)?.label ?? 'Last 30 days'

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 sticky top-0 z-40">
      {/* Hamburger */}
      <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <Menu className="w-5 h-5 text-gray-500" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-gray-900 truncate">{pageTitle}</h1>
      </div>

      {/* Search (desktop) */}
      <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-48 lg:w-64">
        <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
        />
      </div>

      {/* Date range */}
      <div className="relative">
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span>{selectedLabel}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
        {showDatePicker && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDatePicker(false)} />
            <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44">
              {DATE_RANGES.map(r => (
                <button
                  key={r.value}
                  onClick={() => { onDateRangeChange(r.value as DateRange); setShowDatePicker(false) }}
                  className={clsx(
                    'w-full text-left px-4 py-2 text-sm transition-colors',
                    dateRange === r.value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Refresh */}
      <button
        onClick={handleRefresh}
        title="Refresh data"
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <RefreshCw className={clsx('w-4 h-4 text-gray-500', refreshing && 'spinner text-blue-500')} />
      </button>

      {/* Dark mode */}
      <button onClick={handleDark} title="Toggle dark mode" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        {dark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-gray-500" />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4 text-gray-500" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        {showNotifications && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
            <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-xl w-80">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">Mark all read</span>
                  <button onClick={() => setShowNotifications(false)}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', n.dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View all notifications</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Demo badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs font-medium text-amber-700">Demo Mode</span>
      </div>
    </header>
  )
}
