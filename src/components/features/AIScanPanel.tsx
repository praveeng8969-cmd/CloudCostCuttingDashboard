'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle2, RefreshCw, Zap, ShieldCheck, ArrowRight } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const scanSteps = [
  { label: 'Connecting to AWS S3 & GCP Buckets...', delay: 500 },
  { label: 'Scanning 14,200 object metadata headers...', delay: 1100 },
  { label: 'Found 1,284 byte-identical duplicate files', delay: 1700 },
  { label: 'Identified 1.8 TB cold data (>180 days)', delay: 2300 },
  { label: 'Calculated ₹31,800/mo in recoverable spend!', delay: 2900 },
]

export default function AIScanPanel() {
  const router = useRouter()
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(false)
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])

  function startScan() {
    setScanning(true)
    setDone(false)
    setVisibleSteps([])

    scanSteps.forEach((s, i) => {
      setTimeout(() => {
        setVisibleSteps(prev => [...prev, i])
        if (i === scanSteps.length - 1) {
          setTimeout(() => {
            setScanning(false)
            setDone(true)
            toast.success('AI Deep Scan Complete! 3 High-Impact Savings Identified', {
              icon: '✨',
              style: { background: '#1e1b4b', color: '#e0e7ff', borderRadius: '12px' }
            })
          }, 400)
        }
      }, s.delay)
    })
  }

  return (
    <div className="card p-5 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white relative overflow-hidden shadow-xl border-indigo-700/50">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-gray-900 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight">AI Cloud Storage Engine</h3>
            <p className="text-[10px] text-blue-200 font-medium">Continuous Bucket Waste Intelligence</p>
          </div>
        </div>
        {done && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Scan Complete
          </span>
        )}
      </div>

      {!scanning && !done && (
        <div className="text-center py-3 relative z-10">
          <p className="text-xs text-blue-100/90 mb-3.5 leading-relaxed">
            Run an AI deep scan to uncover cold backups, redundant replicas, and instant cost cuts.
          </p>
          <button
            onClick={startScan}
            className="w-full py-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Launch AI Deep Scan
          </button>
        </div>
      )}

      {(scanning || done) && (
        <div className="space-y-2.5 relative z-10 py-1">
          {visibleSteps.map(i => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-blue-100 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-medium">{scanSteps[i].label}</span>
            </div>
          ))}

          {scanning && (
            <div className="flex items-center gap-2 text-xs text-blue-300 pt-1">
              <LoadingSpinner size={14} className="text-blue-400" />
              <span className="animate-pulse">Inspecting storage clusters...</span>
            </div>
          )}

          {done && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-200">Monthly Savings Found:</span>
                <span className="font-extrabold text-emerald-400 text-sm">₹31,800 / mo</span>
              </div>
              <button
                onClick={() => router.push('/recommendations')}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                Apply AI Fixes Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
