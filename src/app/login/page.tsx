'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Cloud, Eye, EyeOff, ArrowRight, Shield, TrendingDown,
  Zap, Sparkles, Layers, CheckCircle2, User, Lock, Building2, AlertCircle
} from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const DEMO_PRESETS = [
  {
    roleLabel: 'Admin Control Center',
    company: 'CloudCut Operations',
    name: 'Sarah Chen',
    email: 'admin@cloudcut.com',
    pass: 'Admin@123',
    badge: 'Platform Admin',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    desc: 'Full platform oversight, customer management & aggregated metrics'
  },
  {
    roleLabel: 'Customer 1 (Balanced)',
    company: 'NovaTech Solutions',
    name: 'Alex Rivera',
    email: 'user@cloudcut.com',
    pass: 'User@123',
    badge: 'Customer',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    desc: 'Balanced enterprise storage pool (~1.2 TB, moderate spend)'
  },
  {
    roleLabel: 'Customer 2 (Duplicate Heavy)',
    company: 'ByteWorks Systems',
    name: 'Devin Vance',
    email: 'byteworks@cloudcut.com',
    pass: 'Byte@123',
    badge: 'Customer',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    desc: 'High duplicate redundant clusters and build artifacts'
  },
  {
    roleLabel: 'Customer 3 (Inactive Heavy)',
    company: 'StartFlow Cloud',
    name: 'Elena Rostova',
    email: 'startflow@cloudcut.com',
    pass: 'Flow@123',
    badge: 'Customer',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    desc: 'Large cold datasets sitting in expensive STANDARD tier'
  },
  {
    roleLabel: 'Customer 4 (Media Heavy)',
    company: 'PixelLabs Media',
    name: 'Marcus Vance',
    email: 'pixellabs@cloudcut.com',
    pass: 'Pixel@123',
    badge: 'Customer',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    desc: 'Massive 4K video masters, raw audio and visual assets'
  }
]

export default function LoginPage() {
  const router = useRouter()
  const { user, login, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('admin@cloudcut.com')
  const [password, setPassword] = useState('Admin@123')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.replace('/admin/dashboard')
      } else {
        router.replace('/dashboard')
      }
    }
  }, [isAuthenticated, user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.')
      return
    }

    setLoading(true)
    const res = await login(email.trim(), password)
    setLoading(false)

    if (res.success && res.user) {
      toast.success(`Welcome back, ${res.user.name}!`, {
        icon: '👋',
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })

      if (res.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.')
    }
  }

  function handlePresetSelect(preset: typeof DEMO_PRESETS[0]) {
    setEmail(preset.email)
    setPassword(preset.pass)
    setError('')
  }

  async function handleQuickLogin(preset: typeof DEMO_PRESETS[0]) {
    setEmail(preset.email)
    setPassword(preset.pass)
    setError('')
    setLoading(true)

    const res = await login(preset.email, preset.pass)
    setLoading(false)

    if (res.success && res.user) {
      toast.success(`Signed in as ${res.user.name} (${res.user.role.toUpperCase()})`)
      if (res.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } else {
      setError(res.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl card overflow-hidden flex flex-col lg:flex-row border border-blue-500/30 shadow-2xl backdrop-blur-2xl">
        {/* Left Visual Branding Panel */}
        <div className="lg:w-[48%] p-8 sm:p-10 bg-gradient-to-br from-blue-950/90 via-indigo-950/90 to-slate-950/95 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-700/80">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Logo */}
          <div className="flex items-center gap-3 relative z-10 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">{APP_NAME}</span>
              <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Cloud Storage Cost Cutting Dashboard
              </p>
            </div>
          </div>

          {/* Core Pitch */}
          <div className="relative z-10 my-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 rounded-full text-xs font-black mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Role-Based SaaS Platform
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
              Optimize your cloud storage.<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Reduce waste. Understand your costs.
              </span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
              Enterprise role-based multi-user system. Platform administrators monitor all client accounts, while customers audit their own storage buckets in strict isolation.
            </p>

            {/* Platform Highlights */}
            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/30">
                <p className="text-[10px] font-bold text-blue-300 uppercase">Admin Role</p>
                <p className="text-xs font-bold text-white mt-0.5">Platform Control Center</p>
                <p className="text-[10px] text-slate-400 mt-1">Multi-tenant usage & cost monitoring</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
                <p className="text-[10px] font-bold text-emerald-300 uppercase">Customer Role</p>
                <p className="text-xs font-bold text-white mt-0.5">Isolated FinOps Audit</p>
                <p className="text-[10px] text-slate-400 mt-1">Dedicated CSV parsing & reports</p>
              </div>
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Quick Demo Accounts</span>
              <span className="text-cyan-400 text-[10px]">Click to auto-fill</span>
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {DEMO_PRESETS.map(p => (
                <div
                  key={p.email}
                  onClick={() => handlePresetSelect(p)}
                  className={clsx(
                    'p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group',
                    email === p.email
                      ? 'bg-blue-600/30 border-blue-400 text-white'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  )}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate text-white">{p.company}</span>
                      <span className={clsx('text-[9px] font-black px-1.5 py-0.2 rounded border', p.badgeColor)}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{p.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleQuickLogin(p)
                    }}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-blue-600 hover:bg-blue-500 text-[10px] font-black text-white rounded-lg transition-all flex items-center gap-1 flex-shrink-0"
                  >
                    Login →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="lg:w-[52%] p-8 sm:p-10 bg-slate-900/90 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Sign In to CloudCut</h1>
            <p className="text-xs text-slate-400 mt-1">Access your platform control center or customer storage dashboard</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-950/70 border border-red-500/50 rounded-xl text-xs font-bold text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label flex items-center justify-between">
                <span>Account Email</span>
                <span className="text-[10px] text-slate-400">Admin or Customer</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="input pl-10"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label flex items-center justify-between">
                <span>Password</span>
                <span className="text-[10px] text-slate-400">Demo Auth</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="Enter account password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400">
                Current Role: <strong className="text-cyan-400">{email.includes('admin') ? 'Administrator' : 'Customer'}</strong>
              </span>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault()
                  toast('Demo password: Admin@123 for Admin or User@123 for Customer')
                }}
                className="text-blue-400 hover:underline font-bold text-xs"
              >
                Need Help?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Role Direct Jump Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Role Authentication
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin(DEMO_PRESETS[0])}
                className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 hover:bg-purple-900/50 transition-all text-left group"
              >
                <p className="text-[11px] font-black text-purple-300">Admin Control Center</p>
                <p className="text-[10px] text-slate-400 mt-0.5">admin@cloudcut.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(DEMO_PRESETS[1])}
                className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 hover:bg-blue-900/50 transition-all text-left group"
              >
                <p className="text-[11px] font-black text-blue-300">Customer Workspace</p>
                <p className="text-[10px] text-slate-400 mt-0.5">user@cloudcut.com</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
