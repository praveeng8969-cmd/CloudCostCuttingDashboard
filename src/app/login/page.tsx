'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Cloud, Eye, EyeOff, ArrowRight, Shield, User, Lock, AlertCircle, Check
} from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    company: 'CloudCut Operations',
    name: 'Sarah Chen',
    email: 'admin@cloudcut.com',
    pass: 'Admin@123',
    desc: 'Platform administration & multi-tenant oversight'
  },
  {
    role: 'Customer',
    company: 'NovaTech Solutions',
    name: 'Alex Rivera',
    email: 'user@cloudcut.com',
    pass: 'User@123',
    desc: 'Balanced enterprise storage pool (~5.0 TB)'
  },
  {
    role: 'Customer',
    company: 'ByteWorks Systems',
    name: 'Devin Vance',
    email: 'byteworks@cloudcut.com',
    pass: 'Byte@123',
    desc: 'Duplicate-heavy build cluster dataset'
  },
  {
    role: 'Customer',
    company: 'StartFlow Cloud',
    name: 'Elena Rostova',
    email: 'startflow@cloudcut.com',
    pass: 'Flow@123',
    desc: 'Inactive archive-heavy storage pool'
  },
  {
    role: 'Customer',
    company: 'PixelLabs Media',
    name: 'Marcus Vance',
    email: 'pixellabs@cloudcut.com',
    pass: 'Pixel@123',
    desc: 'Media-heavy dataset'
  },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, role } = useAuth()

  const [email, setEmail] = useState('user@cloudcut.com')
  const [password, setPassword] = useState('User@123')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/dashboard')
      }
    }
  }, [isAuthenticated, role, router])

  function handleSelectPreset(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email)
    setPassword(acc.pass)
    setErrorMsg('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    setSubmitting(true)

    try {
      const res = await login(email, password)
      if (res.success && res.user) {
        toast.success(`Signed in as ${res.user.name}`)
        if (res.user.role === 'admin') {
          router.replace('/admin/dashboard')
        } else {
          router.replace('/dashboard')
        }
      } else {
        setErrorMsg(res.error || 'Invalid credentials. Please verify email and password.')
        setSubmitting(false)
      }
    } catch {
      setErrorMsg('An unexpected error occurred during authentication.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-cloud-login flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow-sm mb-3">
            <Cloud className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to {APP_NAME}
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Cloud storage cost optimization for growing businesses
          </p>
        </div>

        {/* Authentication Card */}
        <div className="card p-6 sm:p-8 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-xl shadow-md">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Work Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  className="input"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <span className="text-xs text-slate-400">Default: Admin@123 / User@123</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 text-sm font-medium"
            >
              {submitting ? 'Signing in...' : 'Sign in to Workspace'}
            </button>
          </form>

          {/* Clean Demo Accounts Selector */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs font-medium text-slate-500 mb-2.5">
              Or select a pre-configured demo account:
            </p>

            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {DEMO_ACCOUNTS.map(acc => {
                const isSelected = email === acc.email
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectPreset(acc)}
                    className={clsx(
                      'w-full text-left p-2.5 rounded-md border text-xs transition-colors flex items-center justify-between gap-2',
                      isSelected
                        ? 'bg-blue-50 border-blue-200 text-slate-900'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 truncate">{acc.company}</span>
                        <span className={clsx(
                          'px-1.5 py-0.2 rounded text-[10px] font-medium border',
                          acc.role === 'Admin'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        )}>
                          {acc.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{acc.email}</p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400">
          Role-based access control with isolated client storage data.
        </p>
      </div>
    </div>
  )
}
