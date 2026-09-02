'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Shield, ChevronLeft, ChevronRight, HardDrive, DollarSign
} from 'lucide-react'
import clsx from 'clsx'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import { useStorageData } from '@/context/StorageDataContext'

interface AdminSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

interface AdminNavItemDef {
  label: string
  href: string
  icon: any
  badge?: string | null
}

interface AdminNavGroupDef {
  group: string
  items: AdminNavItemDef[]
}

export default function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { getAllCustomerSummaries } = useStorageData()

  const customerSummaries = getAllCustomerSummaries()
  const totalCustomers = customerSummaries.length

  const adminNavGroups: AdminNavGroupDef[] = [
    {
      group: 'Overview',
      items: [
        { label: 'Platform Overview', href: '/admin/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      group: 'Customers',
      items: [
        { label: 'All Customers', href: '/admin/users', icon: Users, badge: `${totalCustomers}` },
      ]
    },
    {
      group: 'Reports',
      items: [
        { label: 'Customer Reports', href: '/admin/reports', icon: FileText },
      ]
    },
    {
      group: 'System',
      items: [
        { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  ]

  const SidebarContent = (
    <div className={clsx(
      'flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-200 select-none overflow-hidden',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 flex-shrink-0">
        <Link
          href="/admin/dashboard"
          className={clsx('flex items-center gap-2.5 overflow-hidden', collapsed && 'justify-center w-full')}
        >
          <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900 tracking-tight leading-tight block">
                  {APP_NAME}
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  Admin
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 leading-tight block">
                Platform Control
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {adminNavGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="text-[11px] font-medium text-slate-400 px-3 py-1 uppercase tracking-wider">
                {group.group}
              </p>
            )}
            {group.items.map(({ label, href, icon: Icon, badge }) => {
              const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href + '/'))
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onMobileClose}
                  title={collapsed ? label : undefined}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-xs sm:text-sm transition-colors duration-150',
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={clsx(
                    'w-4 h-4 flex-shrink-0',
                    active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  )} />
                  {!collapsed && <span className="truncate">{label}</span>}
                  {!collapsed && badge && (
                    <span className="ml-auto text-[11px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="border-t border-slate-200 p-3 flex-shrink-0 bg-slate-50/50">
        <div className={clsx(
          'flex items-center gap-2.5',
          collapsed && 'justify-center'
        )}>
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0 font-semibold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[11px] text-slate-500 truncate leading-tight">
                Platform Administrator
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={() => logout()}
              title="Sign out"
              className="p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center w-full py-2 border-t border-slate-200 hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-600"
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative flex-shrink-0">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
