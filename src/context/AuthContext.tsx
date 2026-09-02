'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { UserProfile, UserRole } from '@/types/auth'
import {
  getSessionUser, setSessionUser, authenticate,
  getUserById, getAllUsers
} from '@/lib/services/authService'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: UserProfile | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>
  logout: () => void
  refreshUser: () => void
  switchDemoUser: (email: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(() => {
    const session = getSessionUser()
    if (session) {
      // Re-fetch user from registry in case details/status changed
      const fresh = getUserById(session.id)
      if (fresh && fresh.status === 'active') {
        setUser(fresh)
        setSessionUser(fresh)
      } else {
        // Disabled or removed
        setUser(null)
        setSessionUser(null)
      }
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Make sure initial users are seeded
    getAllUsers()
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    const result = authenticate(email, password)
    if (result.success && result.user) {
      setUser(result.user)
      setIsLoading(false)
      return { success: true, user: result.user }
    }
    setIsLoading(false)
    return { success: false, error: result.error || 'Authentication failed' }
  }, [])

  const logout = useCallback(() => {
    setSessionUser(null)
    setUser(null)
    toast.success('Logged out securely')
    router.push('/login')
  }, [router])

  const switchDemoUser = useCallback(async (email: string, password: string) => {
    const res = await login(email, password)
    if (res.success && res.user) {
      toast.success(`Switched account to ${res.user.name} (${res.user.role.toUpperCase()})`)
      if (res.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
      return true
    } else {
      toast.error(res.error || 'Could not switch to demo user')
      return false
    }
  }, [login, router])

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
        switchDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
