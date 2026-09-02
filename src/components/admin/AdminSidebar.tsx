'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, HardDrive, DollarSign, FileText,
  Settings, LogOut, Shield, ChevronLeft, ChevronRight,
  TrendingDown, Sparkles, Building2, Layers
} from 'lucide-react'
import clsx from 'clsx'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import { useStorageData } from '@/context/StorageDataContext'
import toast from 'react-hot-toast'

interface AdminSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { getAllCustomerSummaries } = useStorageData()

  const customerSummaries = getAllCustomerSummaries()
  const totalCustomers = customerSummaries.length

  const adminNavItems = [
    { label: 'Platform Overview',  href: '/admin/dashboard', icon: LayoutDashboard, badge: 'Live', badgeColor: 'bg-purple-600 text-white', color: 'text-purple-400' },
    { label: 'All Customers',      href: '/admin/users',     icon: Users,           badge: `${totalCustomers}`, badgeColor: 'bg-blue-600 text-white', color: 'text-blue-400' },
    { label: 'Customer Reports',   href: '/admin/reports',   icon: FileText,        badge: null, color: 'text-indigo-400' },
    { label: 'Platform Settings',  href: '/admin/settings',  icon: Settings,        badge: null, color: 'text-slate-400' },
  ]

  const SidebarContent = (
    <div className={clsx(
      'flex flex-col h-full bg-slate-950/80 backdrop-blur-xl border-r border-purple-900/30 sidebar-transition overflow-hidden select-none',
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Admin Brand Header */}
      <div className="flex items-center justify-between px-4 py-4.5 border-b border-purple-900/30 flex-shrink-0">
        <Link
          href="/admin/dashboard"
          className={clsx('flex items-center gap-3 overflow-hidden group', collapsed && 'justify-center w-full')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform border border-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight leading-tight">
                  {APP_NAME}
                </span>
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-purple-300 leading-tight block uppercase tracking-wider">
                Admin Control Center
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pb-1">
            Platform Administration
          </p>
        )}
        {adminNavItems.map(({ label, href, icon: Icon, badge, badgeColor, color }) => {
          const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group relative',
                active
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/40'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className={clsx(
                'w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110',
                active ? 'text-white' : color
              )} />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && badge && (
                <span className={clsx(
                  'ml-auto text-[10px] font-black px-2 py-0.5 rounded-full',
                  active ? 'bg-white/25 text-white' : (badgeColor ?? 'bg-slate-800 text-slate-300')
                )}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Admin Notice Widget */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3.5 bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-extrabold text-purple-300">Admin Privileges Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Managing {totalCustomers} client workspaces with live aggregated FinOps telemetry.
          </p>
          <Link
            href="/admin/users"
            className="mt-2.5 block text-center py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-lg shadow transition-colors"
          >
            Manage Accounts →
          </Link>
        </div>
      )}

      {/* Admin Footer Profile */}
      <div className="border-t border-purple-900/30 px-3 py-3 space-y-1 flex-shrink-0">
        <div className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800',
          collapsed && 'justify-center px-2'
        )}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Sarah Chen'}</p>
              <p className="text-[10px] font-semibold text-purple-400 truncate">Platform Administrator</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => logout()}
              title="Logout"
              className="p-1 hover:bg-rose-950/40 rounded-lg group transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center w-full py-2 border-t border-purple-900/30 hover:bg-slate-900 transition-colors text-slate-400 hover:text-white"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  )

  return (
    <>
      <div className="hidden lg:flex h-screen sticky top-0 flex-shrink-0 z-30">
        {SidebarContent}
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative flex-shrink-0 animate-fade-in">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
