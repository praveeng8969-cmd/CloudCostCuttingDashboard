'use client'

import { useState, useEffect } from 'react'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const steps = [
  { label: 'Scanning storage buckets...', delay: 600 },
  { label: '1,284 duplicate files found', delay: 1200 },
  { label: '1.8 TB inactive data identified', delay: 1800 },
  { label: '620 GB old backups detected', delay: 2400 },
  { label: '₹31,800 monthly savings identified', delay: 3000 },
]

export default function AIScanPanel() {
  const [scanning, setScanning] = useState(false)
  const [done, setDone] = useState(false)
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])

  function startScan() {
    setScanning(true)
    setDone(false)
    setVisibleSteps([])
    steps.forEach((s, i) => {
      setTimeout(() => {
        setVisibleSteps(prev => [...prev, i])
        if (i === steps.length - 1) {
          setTimeout(() => { setScanning(false); setDone(true) }, 400)
        }
      }, s.delay)
    })
  }

  return (
    <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">AI Storage Analysis</h3>
          <p className="text-xs text-gray-500">Powered by CloudCut Intelligence</p>
        </div>
      </div>

      {!scanning && !done && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-3">Run a deep scan of your cloud storage to identify savings opportunities.</p>
          <button onClick={startScan} className="btn-primary text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            Start AI Analysis
          </button>
        </div>
      )}

      {(scanning || done) && (
        <div className="space-y-2">
          {visibleSteps.map(i => (
            <div key={i} className="flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{steps[i].label}</span>
            </div>
          ))}
          {scanning && (
            <div className="flex items-center gap-2">
              <LoadingSpinner size={16} />
              <span className="text-sm text-gray-400">Analyzing...</span>
            </div>
          )}
          {done && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-700">Analysis complete! Found ₹31,800/month in savings.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
