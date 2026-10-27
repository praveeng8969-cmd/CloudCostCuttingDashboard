'use client'

import React, { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { StorageDataProvider } from '@/context/StorageDataContext'
import { MLAnalysisProvider } from '@/context/MLAnalysisContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StorageDataProvider>
        <MLAnalysisProvider>
          {children}
        </MLAnalysisProvider>
      </StorageDataProvider>
    </AuthProvider>
  )
}
