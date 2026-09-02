'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell, Search, Menu, RefreshCw, ChevronDown,
  X, Check, Shield, Users, ArrowRight, DollarSign, HardDrive, LogOut
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'

interface AdminNavbarProps {
  onMenuClick: () => void
}

const adminNotifications = [
  { id: 1, text: 'High-cost customer detected: ByteWorks Systems (₹2,840/mo)', time: '1h ago', dot: 'bg-rose-500', route: '/admin/users' },
  { id: 2, text: 'New storage dataset ingested for StartFlow Cloud', time: '3h ago', dot: 'bg-blue-500', route: '/admin/users' },
  { id: 3, text: 'Platform storage threshold passed 7.5 TB total pool', time: '1d ago', dot: 'bg-purple-500', route: '/admin/dashboard' },
  { id: 4, text: 'Customer NovaTech generated executive cost report', time: '2d ago', dot: 'bg-emerald-500', route: '/admin/reports' },
]

export default function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const [showNotifications, setShowNotifications] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [notifications, setNotifications] = useState(adminNotifications)

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success('All customer telemetry & platform aggregations refreshed!', {
        icon: '⚡',
        style: { background: '#1e293b', color: '#fff', borderRadius: '12px' }
      })
    }, 800)
  }

  function clearAll() {
    setNotifications([])
    setShowNotifications(false)
    toast('Notifications cleared', { icon: '🧹' })
  }

  const pageTitle = pathname === '/admin/dashboard'
    ? 'Platform Overview'
    : pathname === '/admin/users'
    ? 'Customer Management'
    : pathname.startsWith('/admin/users/')
    ? 'Customer Deep Dive'
    : pathname === '/admin/reports'
    ? 'Platform & Customer Reports'
    : pathname === '/admin/settings'
    ? 'Platform Settings'
    : 'CloudCut Administration'

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-purple-900/30 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-40">
      {/* Hamburger for mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-slate-900 rounded-xl transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-slate-300" />
      </button>

      {/* Page Title & Admin Pill */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <h1 className="text-base font-black text-white tracking-tight truncate">
          {pageTitle}
        </h1>
        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Admin Console
        </span>
      </div>

      {/* Refresh */}
      <button
        onClick={handleRefresh}
        title="Refresh customer telemetry"
        className="p-2.5 hover:bg-slate-900 rounded-xl transition-colors text-slate-300"
      >
        <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin text-purple-400')} />
      </button>

      {/* Admin Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2.5 hover:bg-slate-900 rounded-xl transition-colors text-slate-300"
          aria-label="Admin Notifications"
        >
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
          )}
        </button>

        {showNotifications && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
            <div className="absolute right-0 top-12 z-20 bg-slate-900/95 border border-purple-900/40 rounded-2xl shadow-2xl w-84 sm:w-96 overflow-hidden backdrop-blur-xl animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-bold">Platform Alerts</span>
                  <span className="px-1.5 py-0.2 bg-white/20 text-white text-[10px] font-black rounded-full">
                    {notifications.length}
                  </span>
                </div>
                <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
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
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/80 transition-colors cursor-pointer group"
                    >
                      <span className={clsx('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', n.dot)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                          {n.text}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex justify-between items-center px-4">
                  <button onClick={clearAll} className="text-[11px] font-bold text-rose-400 hover:underline">
                    Clear all
                  </button>
                  <button
                    onClick={() => { setShowNotifications(false); router.push('/admin/users') }}
                    className="text-[11px] font-bold text-purple-400 hover:underline"
                  >
                    View All Customers →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Admin Identity Badge */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-purple-950/50 border border-purple-500/30 rounded-2xl">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-black shadow">
          {user?.name ? user.name.charAt(0) : 'A'}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-xs font-bold text-white leading-none">{user?.name || 'Sarah Chen'}</p>
          <p className="text-[10px] font-medium text-purple-300 leading-tight">Platform Administrator</p>
        </div>
        <button
          onClick={() => logout()}
          title="Logout"
          className="ml-1 p-1 hover:bg-rose-950/40 rounded-lg group transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
        </button>
      </div>
    </header>
  )
}
