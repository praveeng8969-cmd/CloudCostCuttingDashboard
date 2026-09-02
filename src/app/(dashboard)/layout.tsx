'use client'

import { useState, createContext, useContext, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import DataSourceBanner from '@/components/layout/DataSourceBanner'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useStorageData } from '@/context/StorageDataContext'
import { useAuth } from '@/context/AuthContext'
import type { DateRange } from '@/types'

// Context so pages can read dateRange
export const DateRangeContext = createContext<DateRange>('30d')
export const useDateRange = () => useContext(DateRangeContext)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const { isHydrated, hasData } = useStorageData()
  const { user, role, isAuthenticated, isLoading: authLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    // Route Protection: Unauthenticated -> /login
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    // Role Protection: Admin attempting to access customer space -> /admin/dashboard
    if (role === 'admin') {
      router.replace('/admin/dashboard')
      return
    }

    // First visit rule: If no dataset is loaded and user lands on /dashboard, redirect to /import
    if (isHydrated && !hasData && pathname === '/dashboard') {
      router.replace('/import')
    }
  }, [authLoading, isAuthenticated, role, isHydrated, hasData, pathname, router])

  if (authLoading || !isAuthenticated || role === 'admin' || !isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <LoadingSpinner size={40} className="text-blue-400" />
          <p className="text-xs font-bold text-slate-300">
            {authLoading ? 'Verifying customer credentials...' : 'Loading your cloud storage workspace...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <DateRangeContext.Provider value={dateRange}>
      <div className="flex h-screen w-full overflow-hidden bg-transparent">
        {/* Fixed/Sticky Customer Sidebar */}
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        {/* Main Application Area */}
        <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden bg-transparent">
          {/* Top Sticky Navbar */}
          <Navbar
            onMenuClick={() => setMobileOpen(true)}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />

          {/* Scrollable Page Content Container with Data Source Banner */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent">
            <div className="page-container page-enter">
              <DataSourceBanner />
              {children}
            </div>
          </main>
        </div>
      </div>
    </DateRangeContext.Provider>
  )
}
