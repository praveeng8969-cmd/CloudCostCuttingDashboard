'use client'

import React, { useState } from 'react'
import {
  Shield, Settings, DollarSign, Save, RotateCcw,
  CheckCircle2, AlertTriangle, User, Building2, Lock, Sliders
} from 'lucide-react'
import { useStorageData } from '@/context/StorageDataContext'
import { useAuth } from '@/context/AuthContext'
import PageHeader from '@/components/layout/PageHeader'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const { pricing, updatePricing } = useStorageData()
  const { user } = useAuth()

  const [rates, setRates] = useState({
    STANDARD: pricing.STANDARD,
    STANDARD_IA: pricing.STANDARD_IA,
    ONEZONE_IA: pricing.ONEZONE_IA,
    GLACIER: pricing.GLACIER,
    DEEP_ARCHIVE: pricing.DEEP_ARCHIVE,
  })

  function handleSavePricing(e: React.FormEvent) {
    e.preventDefault()
    updatePricing(rates)
  }

  function handleResetDefaultRates() {
    const defaults = {
      STANDARD: 2.0,
      STANDARD_IA: 1.25,
      ONEZONE_IA: 1.0,
      GLACIER: 0.40,
      DEEP_ARCHIVE: 0.10,
    }
    setRates(defaults)
    updatePricing(defaults)
  }

  return (
    <div className="space-y-6 w-full min-w-0 max-w-4xl">
      <PageHeader
        title="Platform & Pricing Governance"
        subtitle="Configure default storage tier cost matrices across all customer tenants, and manage platform administrator preferences."
        badge="Superadmin Access"
      />

      {/* Admin Profile Card */}
      <div className="card p-6 border border-purple-500/30">
        <h3 className="section-title mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          Platform Administrator Profile
        </h3>
        <p className="section-sub mb-4">Credentials and security details for the master control account</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Name</span>
            <p className="text-white font-bold mt-1">{user?.name || 'Sarah Chen'}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Admin Email</span>
            <p className="text-white font-bold mt-1 font-mono">{user?.email || 'admin@cloudcut.com'}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Access Level</span>
            <p className="text-purple-300 font-bold mt-1 uppercase">Platform Administrator</p>
          </div>
        </div>
      </div>

      {/* Demo Pricing Rates Configuration */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="section-title">Platform Storage Tier Pricing (INR / GB / Month)</h3>
          </div>
          <button
            type="button"
            onClick={handleResetDefaultRates}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore Defaults
          </button>
        </div>
        <p className="section-sub mb-5">
          These rates drive cost projections and potential savings calculations across all client workspaces.
        </p>

        <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">STANDARD Storage Class (₹ / GB)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.STANDARD}
                onChange={e => setRates({ ...rates, STANDARD: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: ₹2.00 (Hot object storage)</span>
            </div>

            <div>
              <label className="label">STANDARD_IA (Infrequent Access) (₹ / GB)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.STANDARD_IA}
                onChange={e => setRates({ ...rates, STANDARD_IA: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: ₹1.25 (30-day minimum retention)</span>
            </div>

            <div>
              <label className="label">ONEZONE_IA (₹ / GB)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.ONEZONE_IA}
                onChange={e => setRates({ ...rates, ONEZONE_IA: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: ₹1.00 (Single AZ lower cost)</span>
            </div>

            <div>
              <label className="label">GLACIER Flexible Retrieval (₹ / GB)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.GLACIER}
                onChange={e => setRates({ ...rates, GLACIER: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: ₹0.40 (Minutes to hours retrieval)</span>
            </div>

            <div>
              <label className="label">DEEP_ARCHIVE Cold Vault (₹ / GB)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.DEEP_ARCHIVE}
                onChange={e => setRates({ ...rates, DEEP_ARCHIVE: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: ₹0.10 (12-hour cold storage)</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Platform Pricing Rates
            </button>
          </div>
        </form>
      </div>

      {/* Platform Maintenance Card */}
      <div className="card p-6 border border-slate-800">
        <h3 className="section-title mb-1 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          Tenant Isolation & Data Governance
        </h3>
        <p className="section-sub mb-4">Architecture rules enforced across all client workspaces</p>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Strict data isolation: every dataset is keyed by unique customer tenant ID.</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Role-based route guarding: non-administrators are denied access to <code>/admin/*</code> routes.</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Zero leakage: Customer A cannot view, query, or overwrite Customer B&apos;s storage records.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
