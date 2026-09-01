'use client'

import { useState, createContext, useContext } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import DataSourceBanner from '@/components/layout/DataSourceBanner'
import { StorageDataProvider } from '@/context/StorageDataContext'
import type { DateRange } from '@/types'

// Context so pages can read dateRange
export const DateRangeContext = createContext<DateRange>('30d')
export const useDateRange = () => useContext(DateRangeContext)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  return (
    <StorageDataProvider>
      <DateRangeContext.Provider value={dateRange}>
        <div className="flex h-screen w-full overflow-hidden bg-transparent">
          {/* Fixed/Sticky Sidebar */}
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
    </StorageDataProvider>
  )
}
