'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, HardDrive, DollarSign, Zap, Copy,
  FileText, Cloud, Settings, HelpCircle, LogOut,
  ChevronLeft, ChevronRight, User, X
} from 'lucide-react'
import clsx from 'clsx'
import { APP_NAME } from '@/lib/constants'

const navItems = [
  { label: 'Dashboard',        href: '/dashboard',        icon: LayoutDashboard },
  { label: 'Storage Analysis', href: '/storage',          icon: HardDrive },
  { label: 'Cost Analysis',    href: '/cost-analysis',    icon: DollarSign },
  { label: 'Recommendations',  href: '/recommendations',  icon: Zap },
  { label: 'Duplicate Files',  href: '/duplicates',       icon: Copy },
  { label: 'Reports',          href: '/reports',          icon: FileText },
  { label: 'Cloud Providers',  href: '/cloud-providers',  icon: Cloud },
  { label: 'Settings',         href: '/settings',         icon: Settings },
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
    router.push('/login')
  }

  const SidebarContent = (
    <div className={clsx(
      'flex flex-col h-full bg-white border-r border-gray-200 sidebar-transition overflow-hidden',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
        <div className={clsx('flex items-center gap-2 overflow-hidden', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-sm font-bold text-gray-900 block leading-tight">{APP_NAME}</span>
              <span className="text-[10px] text-gray-400 leading-tight block">Cost Dashboard</span>
            </div>
          )}
        </div>
        {/* Mobile close */}
        <button onClick={onMobileClose} className="lg:hidden p-1 hover:bg-gray-100 rounded-md">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className={clsx('w-4 h-4 flex-shrink-0', active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600')} />
              {!collapsed && <span className="truncate">{label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-gray-100 px-2 py-3 space-y-0.5 flex-shrink-0">
        <a
          href="#"
          title={collapsed ? 'Help & Support' : undefined}
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <HelpCircle className="w-4 h-4 flex-shrink-0 text-gray-400" />
          {!collapsed && <span>Help & Support</span>}
        </a>

        {/* Profile */}
        <div className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg cursor-default',
          collapsed && 'justify-center px-2'
        )}>
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">Admin User</p>
              <p className="text-[10px] text-gray-400 truncate">admin@cloudcut.demo</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1 hover:bg-red-50 rounded-md group transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center w-full py-2 border-t border-gray-100 hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0 flex-shrink-0">
        {SidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <div className="relative flex-shrink-0">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
