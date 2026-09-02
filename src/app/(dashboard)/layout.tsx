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

    // Note: If no dataset is loaded, /dashboard will render its custom empty state with the cloud-storage background
  }, [authLoading, isAuthenticated, role, isHydrated, hasData, pathname, router])

  if (authLoading || !isAuthenticated || role === 'admin' || !isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-center p-6">
          <LoadingSpinner size={32} className="text-blue-600" />
          <p className="text-xs font-medium text-slate-600">
            {authLoading ? 'Verifying credentials...' : 'Loading workspace...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <DateRangeContext.Provider value={dateRange}>
      <div className="flex h-screen w-full overflow-hidden bg-slate-50">
        {/* Customer Sidebar */}
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        {/* Main Application Area */}
        <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden bg-slate-50">
          {/* Top Sticky Navbar */}
          <Navbar onMenuClick={() => setMobileOpen(true)} />

          {/* Scrollable Page Content with Subtle Cloud Background */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-cloud-subtle">
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
