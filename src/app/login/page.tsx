'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cloud, Eye, EyeOff, ArrowRight, Shield, TrendingDown, Zap, Sparkles, Layers, CheckCircle2 } from 'lucide-react'
import { APP_NAME, APP_TAGLINE, DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Logged in successfully! Welcome to CloudCut.')
      router.push('/dashboard')
    }, 800)
  }

  function handleDemo() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Demo account authenticated!')
      router.push('/dashboard')
    }, 600)
  }

  function handleGoogle() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Google SSO authenticated!')
      router.push('/dashboard')
    }, 700)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Container Box */}
      <div className="w-full max-w-5xl card overflow-hidden flex flex-col lg:flex-row border border-blue-500/30 shadow-2xl backdrop-blur-2xl">
        {/* Left Visual Branding Panel with Photo Glow */}
        <div className="lg:w-[52%] p-8 sm:p-12 bg-gradient-to-br from-blue-950/90 via-indigo-950/90 to-slate-950/95 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-700/80">
          {/* Subtle glowing halo */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Brand Logo */}
          <div className="flex items-center gap-3 relative z-10 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/20">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight">{APP_NAME}</span>
              <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Cloud Storage Cost Cutting Dashboard</p>
            </div>
          </div>

          {/* Core Message */}
          <div className="relative z-10 my-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 rounded-full text-xs font-black mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Cloud FinOps
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              See where your cloud money goes.<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Cut unnecessary storage costs.
              </span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
              Continuously audit object storage tiers, purge redundant replicas, and reclaim up to 25.5% in monthly AWS, GCP & Azure spend.
            </p>

            {/* Colorful Feature Badges: Blue, Red, Orange, Yellow */}
            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  TB
                </div>
                <div>
                  <p className="text-xs font-bold text-white">12.8 TB</p>
                  <p className="text-[10px] text-blue-300">Monitored Pool</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <div>
                  <p className="text-xs font-bold text-white">₹31,800/mo</p>
                  <p className="text-[10px] text-emerald-300">Target Savings</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-950/60 border border-orange-500/30 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                  284
                </div>
                <div>
                  <p className="text-xs font-bold text-white">284 GB</p>
                  <p className="text-[10px] text-orange-300">Duplicates Waste</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-yellow-950/60 border border-yellow-400/30 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-300 flex items-center justify-center font-bold text-xs">
                  72
                </div>
                <div>
                  <p className="text-xs font-bold text-white">72 / 100</p>
                  <p className="text-[10px] text-yellow-300">Health Score</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-semibold relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span>v2.4 Enterprise Production Prototype</span>
            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> API Connected</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:w-[48%] p-8 sm:p-12 bg-slate-900/90 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Sign In to CloudCut</h1>
            <p className="text-xs text-slate-400 mt-1">Access your enterprise cloud cost optimization dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs font-bold text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Admin Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="admin@cloudcut.demo"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter demo password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                />
                <span>Keep session active</span>
              </label>
              <a href="#" onClick={e => { e.preventDefault(); toast('Password reset link sent to admin@cloudcut.demo') }} className="text-blue-400 hover:underline font-bold">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Quick Demo Access Shortcut */}
          <div className="space-y-2.5">
            <button
              onClick={handleGoogle}
              className="w-full btn-secondary py-2.5 text-xs flex items-center justify-center gap-2.5"
            >
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Enterprise SSO
            </button>

            <button
              onClick={handleDemo}
              className="w-full btn-yellow py-2.5 text-xs font-black flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-gray-950" />
              1-Click Demo Account Access →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
