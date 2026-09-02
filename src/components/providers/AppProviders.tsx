'use client'

import React, { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { StorageDataProvider } from '@/context/StorageDataContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StorageDataProvider>
        {children}
      </StorageDataProvider>
    </AuthProvider>
  )
}
