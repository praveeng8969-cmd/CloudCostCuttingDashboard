'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, HardDrive, DollarSign, Zap, Copy,
  FileText, Cloud, Settings, HelpCircle, LogOut,
  ChevronLeft, ChevronRight, User, X, Sparkles, TrendingDown
} from 'lucide-react'
import clsx from 'clsx'
import { APP_NAME } from '@/lib/constants'
import toast from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard',        href: '/dashboard',        icon: LayoutDashboard, badge: null, color: 'text-blue-500' },
  { label: 'Storage Analysis', href: '/storage',          icon: HardDrive,       badge: '83%', color: 'text-cyan-500' },
  { label: 'Cost Analysis',    href: '/cost-analysis',    icon: DollarSign,      badge: null, color: 'text-purple-500' },
  { label: 'Recommendations',  href: '/recommendations',  icon: Zap,             badge: '5 New', badgeColor: 'bg-emerald-500 text-white', color: 'text-emerald-500' },
  { label: 'Duplicate Files',  href: '/duplicates',       icon: Copy,            badge: '284 GB', badgeColor: 'bg-amber-500/15 text-amber-600', color: 'text-amber-500' },
  { label: 'Reports',          href: '/reports',          icon: FileText,        badge: null, color: 'text-indigo-500' },
  { label: 'Cloud Providers',  href: '/cloud-providers',  icon: Cloud,           badge: '2 Live', badgeColor: 'bg-blue-500/15 text-blue-600', color: 'text-sky-500' },
  { label: 'Settings',         href: '/settings',         icon: Settings,        badge: null, color: 'text-gray-500' },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

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

  const SidebarContent = (
    <div className={clsx(
      'flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800 sidebar-transition overflow-hidden select-none',
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <Link
          href="/dashboard"
          className={clsx('flex items-center gap-3 overflow-hidden group', collapsed && 'justify-center w-full')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                  {APP_NAME}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 leading-tight block uppercase tracking-wider">
                Cost Optimizer
              </span>
            </div>
          )}
        </Link>
        {/* Mobile close */}
        <button onClick={onMobileClose} className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1">Main Menu</p>
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
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white',
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
                  'ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full',
                  active ? 'bg-white/25 text-white' : (badgeColor ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300')
                )}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Savings Summary Widget in Sidebar */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400">Recoverable Savings</span>
          </div>
          <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">₹31,800 <span className="text-xs font-medium text-gray-400">/mo</span></p>
          <Link
            href="/recommendations"
            className="mt-2 block text-center py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors"
          >
            Optimize Now →
          </Link>
        </div>
      )}

      {/* Footer Profile & Support */}
      <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-3 space-y-1 flex-shrink-0">
        <button
          onClick={handleSupport}
          title={collapsed ? 'Help & Support' : undefined}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left',
            collapsed && 'justify-center px-2'
          )}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0 text-gray-400" />
          {!collapsed && <span>Help & Support</span>}
        </button>

        {/* Profile */}
        <div className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60',
          collapsed && 'justify-center px-2'
        )}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
            A
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Administrator</p>
              <p className="text-[10px] font-medium text-gray-400 truncate">admin@cloudcut.demo</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg group transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-500" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center w-full py-2 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0 flex-shrink-0 z-30">
        {SidebarContent}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative flex-shrink-0 animate-fade-in">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
