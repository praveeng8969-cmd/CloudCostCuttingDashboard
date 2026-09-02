'use client'

import { useState } from 'react'
import {
  Bell, Search, Menu, Cloud, Shield, CheckCircle2,
  DollarSign, HardDrive, User, LogOut, ChevronDown
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useStorageData } from '@/context/StorageDataContext'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/storage': 'Storage Analysis',
  '/storage-analysis': 'Storage Analysis',
  '/cost-analysis': 'Cost Analysis',
  '/recommendations': 'Optimization Recommendations',
  '/duplicates': 'Duplicate File Candidates',
  '/reports': 'Storage Reports',
  '/cloud-providers': 'Connected Cloud Providers',
  '/import': 'Import Storage Data',
  '/settings': 'Workspace Settings',
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const pathname = usePathname()
  const { analysisResult, hasData } = useStorageData()
  const { user, logout } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const pageTitle = pageTitles[pathname] || 'Dashboard'

  const notifications = [
    {
      id: '1',
      title: 'Deduplication Candidate',
      desc: `${analysisResult.duplicateCandidatesCount} redundant files identified across storage buckets.`,
      time: '10m ago',
    },
    {
      id: '2',
      title: 'Inactive Storage Alert',
      desc: `${analysisResult.inactiveStorageGB} GB storage unaccessed for >180 days.`,
      time: '1h ago',
    },
    {
      id: '3',
      title: 'Potential Monthly Savings',
      desc: `₹${analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}/mo estimated reduction available.`,
      time: 'Today',
    }
  ]

  return (
    <header className="sticky top-0 z-20 h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-900 truncate">
            {pageTitle}
          </span>
          {user?.companyName && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {user.companyName}
            </span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Quick Search */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-slate-400 text-xs w-52">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate">Search files, buckets...</span>
          <kbd className="ml-auto text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 font-mono">⌘K</kbd>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-700 relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-0 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[11px] text-slate-500">{notifications.length} alerts</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors text-left">
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.desc}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
            className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-md transition-colors text-slate-700"
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                {user?.name || 'Customer'}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                {user?.companyName || 'Workspace'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-1.5 overflow-hidden animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="text-xs">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-slate-100 text-red-600 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
