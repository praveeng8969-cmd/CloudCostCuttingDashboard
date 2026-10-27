'use client'

import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { useMLAnalysis } from '@/context/MLAnalysisContext'

export default function AnalysisStatus({ compact = false }: { compact?: boolean }) {
  const { jobStatus, statusMessage, retryAnalysis, analysis } = useMLAnalysis()
  const processing = jobStatus === 'PENDING' || jobStatus === 'VALIDATING' || jobStatus === 'PROCESSING'

  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'card p-4 text-sm'}`}>
      {processing ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" /> : jobStatus === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
      <div className="min-w-0"><p className="font-medium text-slate-800">{statusMessage}</p>{analysis && !compact && <p className="text-xs text-slate-500 mt-0.5">Last updated {new Date(analysis.analyzedAt).toLocaleString()}</p>}</div>
      {jobStatus === 'FAILED' && <button onClick={retryAnalysis} className="btn-secondary ml-auto">Retry</button>}
    </div>
  )
}
