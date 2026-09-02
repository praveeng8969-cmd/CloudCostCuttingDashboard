'use client'

import React, { useState } from 'react'
import {
  Shield, Settings, DollarSign, Save, RotateCcw,
  CheckCircle2, Sliders
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
    toast.success('Platform pricing rates updated!')
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
    toast('Restored default tier rates')
  }

  return (
    <div className="space-y-6 w-full min-w-0 max-w-4xl pb-12">
      <PageHeader
        title="Platform Settings & Governance"
        subtitle="Configure default storage tier cost matrices across all customer tenants, and manage platform administrator preferences."
        badge="Platform Admin"
      />

      {/* Admin Profile Card */}
      <div className="card p-6 bg-white border border-slate-200">
        <h3 className="section-title mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-700" />
          Administrator Identity
        </h3>
        <p className="section-sub mb-4">Credentials and security details for the master control account</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Name</span>
            <p className="text-slate-900 font-semibold mt-0.5">{user?.name || 'Sarah Chen'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Admin Email</span>
            <p className="text-slate-900 font-mono font-medium mt-0.5">{user?.email || 'admin@cloudcut.com'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
            <span className="text-[11px] text-slate-500 font-medium">Access Scope</span>
            <p className="text-blue-700 font-medium mt-0.5">Full Superadmin Control</p>
          </div>
        </div>
      </div>

      {/* Demo Pricing Rates Configuration */}
      <div className="card p-6 bg-white border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-700" />
            <h3 className="section-title">Default Storage Tier Rates (INR / GB / Month)</h3>
          </div>
          <button
            type="button"
            onClick={handleResetDefaultRates}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
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
              <label className="label">STANDARD Storage (₹ / GB / mo)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.STANDARD}
                onChange={e => setRates({ ...rates, STANDARD: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: ₹2.00 (Hot object storage)</span>
            </div>

            <div>
              <label className="label">STANDARD_IA (₹ / GB / mo)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.STANDARD_IA}
                onChange={e => setRates({ ...rates, STANDARD_IA: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: ₹1.25 (30-day retention minimum)</span>
            </div>

            <div>
              <label className="label">ONEZONE_IA (₹ / GB / mo)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.ONEZONE_IA}
                onChange={e => setRates({ ...rates, ONEZONE_IA: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: ₹1.00 (Single AZ lower cost)</span>
            </div>

            <div>
              <label className="label">GLACIER Flexible Retrieval (₹ / GB / mo)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.GLACIER}
                onChange={e => setRates({ ...rates, GLACIER: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: ₹0.40 (Cold archive)</span>
            </div>

            <div>
              <label className="label">DEEP_ARCHIVE Cold Vault (₹ / GB / mo)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={rates.DEEP_ARCHIVE}
                onChange={e => setRates({ ...rates, DEEP_ARCHIVE: parseFloat(e.target.value) || 0 })}
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: ₹0.10 (Long-term retention)</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" className="btn-primary text-xs flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              Save Platform Pricing Rates
            </button>
          </div>
        </form>
      </div>

      {/* Architecture Governance Card */}
      <div className="card p-6 bg-white border border-slate-200">
        <h3 className="section-title mb-1 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-slate-700" />
          Tenant Isolation & Architecture Guardrails
        </h3>
        <p className="section-sub mb-4">Core multi-tenant security guarantees enforced across all client workspaces</p>

        <div className="space-y-2.5 text-xs text-slate-700">
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Strict data isolation: every dataset is keyed by unique customer tenant ID.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Role-based route guarding: non-administrators are denied access to <code>/admin/*</code> routes.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-md border border-slate-200 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Zero leakage: Customer A cannot view, query, or overwrite Customer B&apos;s storage records.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
