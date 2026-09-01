'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, HardDrive, DollarSign, Zap, Copy,
  FileText, Cloud, Settings, HelpCircle, LogOut,
  ChevronLeft, ChevronRight, UploadCloud, TrendingDown, Sparkles
} from 'lucide-react'
import clsx from 'clsx'
import { APP_NAME } from '@/lib/constants'
import { useStorageData } from '@/context/StorageDataContext'
import toast from 'react-hot-toast'

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { analysisResult, hasData } = useStorageData()

  function handleLogout() {
    toast.success('Logged out successfully')
    router.push('/login')
  }

  function handleSupport() {
    toast('CloudCut Support: Active 24/7. Contact: support@cloudcut.io', {
      icon: '💬',
      style: { background: '#1e293b', color: '#fff' }
    })
  }

  const navItems = [
    { label: 'Dashboard',        href: '/dashboard',        icon: LayoutDashboard, badge: null, color: 'text-blue-400' },
    { label: 'Import CSV Data',  href: '/import',           icon: UploadCloud,     badge: 'Upload', badgeColor: 'bg-blue-600 text-white', color: 'text-cyan-400' },
    { label: 'Storage Analysis', href: '/storage',          icon: HardDrive,       badge: hasData ? `${(analysisResult.totalStorageGB / 1000).toFixed(1)} TB` : '0 TB', color: 'text-cyan-400' },
    { label: 'Cost Analysis',    href: '/cost-analysis',    icon: DollarSign,      badge: null, color: 'text-purple-400' },
    { label: 'Recommendations',  href: '/recommendations',  icon: Zap,             badge: hasData ? `${analysisResult.recommendations.length} Recs` : '0', badgeColor: 'bg-emerald-500 text-white', color: 'text-emerald-400' },
    { label: 'Duplicate Files',  href: '/duplicates',       icon: Copy,            badge: hasData ? `${analysisResult.duplicateRecoverableStorageGB} GB` : '0 GB', badgeColor: 'bg-orange-500/20 text-orange-400', color: 'text-orange-400' },
    { label: 'Reports',          href: '/reports',          icon: FileText,        badge: null, color: 'text-indigo-400' },
    { label: 'Cloud Providers',  href: '/cloud-providers',  icon: Cloud,           badge: '3 Connected', badgeColor: 'bg-blue-500/20 text-blue-400', color: 'text-sky-400' },
    { label: 'Settings',         href: '/settings',         icon: Settings,        badge: null, color: 'text-slate-400' },
  ]

  const SidebarContent = (
    <div className={clsx(
      'flex flex-col h-full bg-slate-950/70 backdrop-blur-xl border-r border-slate-800/80 sidebar-transition overflow-hidden select-none',
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4.5 border-b border-slate-800/80 flex-shrink-0">
        <Link
          href="/dashboard"
          className={clsx('flex items-center gap-3 overflow-hidden group', collapsed && 'justify-center w-full')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform border border-white/20">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-white tracking-tight leading-tight">
                  {APP_NAME}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-cyan-400 leading-tight block uppercase tracking-wider">
                Cost Optimizer
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 pb-1">Main Menu</p>
        )}
        {navItems.map(({ label, href, icon: Icon, badge, badgeColor, color }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group relative',
                active
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 border border-blue-400/40'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
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

      {/* Dynamic Savings Summary Widget in Sidebar */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3.5 bg-gradient-to-br from-emerald-950/60 via-teal-950/40 to-slate-900/60 border border-emerald-500/30 rounded-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-extrabold text-emerald-300">Recoverable Savings</span>
          </div>
          <p className="text-lg font-black text-white leading-tight">
            ₹{analysisResult.potentialMonthlySavings.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-medium text-slate-400">/mo</span>
          </p>
          <Link
            href="/recommendations"
            className="mt-2 block text-center py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black rounded-lg shadow-md transition-colors"
          >
            Review {analysisResult.recommendations.length} Fixes →
          </Link>
        </div>
      )}

      {/* Footer Profile & Support */}
      <div className="border-t border-slate-800/80 px-3 py-3 space-y-1 flex-shrink-0">
        <button
          onClick={handleSupport}
          title={collapsed ? 'Help & Support' : undefined}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors text-left',
            collapsed && 'justify-center px-2'
          )}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0 text-slate-400" />
          {!collapsed && <span>Help & Support</span>}
        </button>

        {/* Profile */}
        <div className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800/80',
          collapsed && 'justify-center px-2'
        )}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
            A
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] font-medium text-slate-400 truncate">admin@cloudcut.demo</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
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
        className="hidden lg:flex items-center justify-center w-full py-2 border-t border-slate-800/80 hover:bg-slate-800/60 transition-colors text-slate-400 hover:text-white"
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
