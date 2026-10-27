'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, HardDrive, DollarSign, Zap, Copy,
  FileText, Cloud, Settings, LogOut, ChevronLeft, ChevronRight,
  UploadCloud
} from 'lucide-react'
import clsx from 'clsx'
import { APP_NAME } from '@/lib/constants'
import { useStorageData } from '@/context/StorageDataContext'
import { useAuth } from '@/context/AuthContext'

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

interface NavItemDef {
  label: string
  href: string
  icon: any
  badge?: string | null
  badgeAccent?: boolean
}

interface NavGroupDef {
  group: string
  items: NavItemDef[]
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { analysisResult, hasData } = useStorageData()
  const { user, logout } = useAuth()

  const navGroups: NavGroupDef[] = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ]
    },
    {
      group: 'Storage',
      items: [
        {
          label: 'Storage Analysis',
          href: '/storage',
          icon: HardDrive,
          badge: hasData ? `${(analysisResult.totalStorageGB / 1000).toFixed(1)} TB` : null
        },
        {
          label: 'Duplicate Files',
          href: '/duplicates',
          icon: Copy,
          badge: hasData && analysisResult.duplicateCandidatesCount > 0 ? `${analysisResult.duplicateCandidatesCount}` : null
        },
      ]
    },
    {
      group: 'Costs',
      items: [
        { label: 'Cost Analysis', href: '/cost-analysis', icon: DollarSign },
        {
          label: 'Recommendations',
          href: '/recommendations',
          icon: Zap,
          badge: hasData && analysisResult.recommendations.length > 0 ? `${analysisResult.recommendations.length}` : null,
          badgeAccent: true
        },
      ]
    },
    {
      group: 'Reports',
      items: [
        { label: 'Reports', href: '/reports', icon: FileText },
      ]
    },
    {
      group: 'Data',
      items: [
        { label: 'Import Dataset', href: '/import', icon: UploadCloud },
      ]
    },
    {
      group: 'Account',
      items: [
        { label: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ]

  const SidebarContent = (
    <div className={clsx(
      'flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-200 select-none overflow-hidden',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Brand Header with Official CloudCut Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 flex-shrink-0">
        <Link
          href="/dashboard"
          className={clsx('flex items-center overflow-hidden transition-all', collapsed ? 'justify-center w-full' : 'gap-2')}
        >
          {!collapsed ? (
            <div className="w-[142px] py-1 flex items-center">
              <Image
                src="/images/cloudcut-logo-transparent.png"
                alt="CloudCut"
                width={905}
                height={207}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/images/cloudcut-icon.png"
                alt="CloudCut"
                width={284}
                height={284}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="text-[11px] font-medium text-slate-400 px-3 py-1 uppercase tracking-wider">
                {group.group}
              </p>
            )}
            {group.items.map(({ label, href, icon: Icon, badge, badgeAccent }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
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
                    <span className={clsx(
                      'ml-auto text-[11px] font-medium px-1.5 py-0.2 rounded',
                      badgeAccent
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    )}>
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
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center flex-shrink-0 text-slate-700 font-semibold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                {user?.name || 'Customer User'}
              </p>
              <p className="text-[11px] text-slate-500 truncate leading-tight">
                {user?.companyName || 'Cloud Workspace'}
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
