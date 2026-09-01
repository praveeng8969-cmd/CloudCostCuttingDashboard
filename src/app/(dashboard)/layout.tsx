'use client'

import { useState, createContext, useContext } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import type { DateRange } from '@/types'

// Context so pages can read dateRange
export const DateRangeContext = createContext<DateRange>('30d')
export const useDateRange = () => useContext(DateRangeContext)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>('30d')

  return (
    <DateRangeContext.Provider value={dateRange}>
      <div className="flex h-screen overflow-hidden bg-transparent">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-transparent">
          <Navbar
            onMenuClick={() => setMobileOpen(true)}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-4 md:p-6 page-enter">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DateRangeContext.Provider>
  )
}
