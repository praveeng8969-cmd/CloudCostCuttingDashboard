'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminNavbar from '@/components/admin/AdminNavbar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, role, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    // Route Protection: Unauthenticated -> /login
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    // Role Protection: Non-admin trying to access /admin -> /dashboard
    if (role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [isLoading, isAuthenticated, role, router])

  if (isLoading || !isAuthenticated || role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-center p-6">
          <LoadingSpinner size={32} className="text-slate-900" />
          <p className="text-xs font-medium text-slate-600">
            Verifying admin credentials...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sticky Admin Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Admin Area */}
      <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden bg-slate-50">
        <AdminNavbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50">
          <div className="page-container page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
