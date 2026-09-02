'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Bell, Search, Menu, RefreshCw, ChevronDown,
  Shield, Users, LogOut, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'

interface AdminNavbarProps {
  onMenuClick: () => void
}

const adminNotifications = [
  { id: 1, text: 'High-cost customer detected: ByteWorks Systems', time: '1h ago' },
  { id: 2, text: 'New storage dataset ingested for StartFlow Cloud', time: '3h ago' },
  { id: 3, text: 'Customer NovaTech compiled executive cost report', time: '1d ago' },
]

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const [showNotifications, setShowNotifications] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success('Platform metrics refreshed!')
    }, 600)
  }

  const pageTitle = pathname === '/admin/dashboard'
    ? 'Platform Overview'
    : pathname === '/admin/users'
    ? 'Customer Directory'
    : pathname.startsWith('/admin/users/')
    ? 'Customer Analysis'
    : pathname === '/admin/reports'
    ? 'Customer & Platform Reports'
    : pathname === '/admin/settings'
    ? 'Platform Settings'
    : 'Admin Control'

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

        <div className="lg:hidden w-6 h-6 flex-shrink-0 flex items-center justify-center">
          <Image
            src="/images/cloudcut-icon.png"
            alt="CloudCut"
            width={284}
            height={284}
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-slate-900 truncate">
            {pageTitle}
          </span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Admin Console
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button
          onClick={handleRefresh}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700 transition-colors"
          title="Refresh platform telemetry"
        >
          <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin text-blue-600')} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setProfileOpen(false); }}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-slate-700 relative"
            aria-label="Admin notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-0 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-semibold text-slate-900">Platform Notifications</span>
                <span className="text-[11px] text-slate-500">{adminNotifications.length} alerts</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {adminNotifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors text-left">
                    <p className="text-xs font-medium text-slate-800">{n.text}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setShowNotifications(false); }}
            className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-md transition-colors text-slate-700"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-semibold text-slate-800 leading-tight">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                Platform Admin
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
