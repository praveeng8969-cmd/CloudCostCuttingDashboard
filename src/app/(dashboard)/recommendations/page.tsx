'use client'

import { Zap, TrendingDown } from 'lucide-react'
import RecommendationCard from '@/components/features/RecommendationCard'
import ProgressBar from '@/components/ui/ProgressBar'
import { recommendationsData } from '@/lib/mockData'

export default function RecommendationsPage() {
  const totalSavingsPerMonth = recommendationsData.reduce((s, r) => s + r.potentialSavingAmount, 0)
  const annualSavings = totalSavingsPerMonth * 12

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Optimization Recommendations</h2>
        <p className="text-sm text-gray-500 mt-0.5">Actionable ways to reduce your cloud storage costs.</p>
      </div>

      {/* Savings summary banner */}
      <div className="card p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Total Potential Savings</p>
              <p className="text-3xl font-bold">₹{totalSavingsPerMonth.toLocaleString('en-IN')}<span className="text-lg font-medium text-green-200"> / month</span></p>
              <p className="text-green-100 text-sm mt-0.5">₹{annualSavings.toLocaleString('en-IN')} annually</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm mb-1">{recommendationsData.length} recommendations</p>
            <div className="flex gap-2 flex-wrap justify-end">
              <span className="px-2 py-0.5 bg-red-400/30 text-white text-xs rounded-full font-medium">2 High</span>
              <span className="px-2 py-0.5 bg-yellow-400/30 text-white text-xs rounded-full font-medium">2 Medium</span>
              <span className="px-2 py-0.5 bg-green-300/30 text-white text-xs rounded-full font-medium">1 Low</span>
            </div>
          </div>
        </div>

        {/* Progress breakdown */}
        <div className="mt-5 space-y-2">
          {recommendationsData.map(r => (
            <div key={r.id} className="flex items-center gap-3">
              <span className="text-xs text-green-100 w-44 truncate">{r.title}</span>
              <div className="flex-1 bg-white/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${(r.potentialSavingAmount / totalSavingsPerMonth) * 100}%` }}
                />
              </div>
              <span className="text-xs text-white font-medium w-24 text-right">{r.potentialSaving}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation cards */}
      <div className="space-y-4">
        {recommendationsData.map(rec => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))}
      </div>
    </div>
  )
}
