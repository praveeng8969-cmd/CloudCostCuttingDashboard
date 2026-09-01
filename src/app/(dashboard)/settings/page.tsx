'use client'

import React, { useState } from 'react'
import {
  User, Bell, Cloud, DollarSign, Palette, Shield, Save,
  RotateCcw, Check, Sparkles, AlertCircle, Moon, Sun, Lock,
  SlidersHorizontal, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/layout/PageHeader'
import { useStorageData } from '@/context/StorageDataContext'
import clsx from 'clsx'

const TABS = [
  { id: 'pricing',       label: 'Demo Pricing Rates',   icon: DollarSign },
  { id: 'thresholds',    label: 'Detection Thresholds', icon: SlidersHorizontal },
  { id: 'account',       label: 'Account Profile',      icon: User },
  { id: 'notifications', label: 'Alert Channels',        icon: Bell },
  { id: 'security',      label: 'Security & 2FA',       icon: Shield },
]

export default function SettingsPage() {
  const { pricing, thresholds, updatePricing, updateThresholds } = useStorageData()

  const [tab, setTab] = useState('pricing')

  // Local state for pricing
  const [localPricing, setLocalPricing] = useState({
    STANDARD: pricing.STANDARD,
    STANDARD_IA: pricing.STANDARD_IA,
    ONEZONE_IA: pricing.ONEZONE_IA,
    GLACIER: pricing.GLACIER,
    DEEP_ARCHIVE: pricing.DEEP_ARCHIVE,
    currency: pricing.currency
  })

  // Local state for thresholds
  const [localThresholds, setLocalThresholds] = useState({
    inactiveDays: thresholds.inactiveDays,
    highlyInactiveDays: thresholds.highlyInactiveDays,
    largeFileSizeGB: thresholds.largeFileSizeGB
  })

  // Account profile state
  const [accountForm, setAccountForm] = useState({
    name: 'Admin User',
    email: 'admin@cloudcut.demo',
    company: 'Acme Cloud Enterprises',
  })

  function handleSaveAll() {
    updatePricing(localPricing)
    updateThresholds(localThresholds)
    toast.success('Configuration saved! All calculations and ROI metrics updated.', {
      icon: '💾',
      style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
    })
  }

  function handleResetDefaults() {
    const defaultPricing = {
      STANDARD: 2.0,
      STANDARD_IA: 1.25,
      ONEZONE_IA: 1.0,
      GLACIER: 0.40,
      DEEP_ARCHIVE: 0.10,
      currency: 'INR'
    }
    const defaultThresholds = {
      inactiveDays: 180,
      highlyInactiveDays: 365,
      largeFileSizeGB: 10
    }
    setLocalPricing(defaultPricing)
    setLocalThresholds(defaultThresholds)
    updatePricing(defaultPricing)
    updateThresholds(defaultThresholds)
    toast('Settings reset to system baseline.', { icon: '🔄' })
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Standardized Page Header */}
      <PageHeader
        title="System Configuration & Pricing Guardrails"
        subtitle="Customize detection thresholds, demo storage pricing rates per GB, and display preferences."
        badge="Live Calculation Settings"
        actions={
          <button onClick={handleSaveAll} className="btn-primary flex-shrink-0 font-black">
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Changes
          </button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 w-full min-w-0">
        {/* Navigation Sidebar Tabs */}
        <div className="w-full md:w-60 flex-shrink-0 space-y-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left',
                tab === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              )}
            >
              <t.icon className="w-4 h-4 flex-shrink-0" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Form Container Card */}
        <div className="flex-1 card p-6 space-y-6 min-w-0">
          {/* TAB 1: Demo Pricing Rates */}
          {tab === 'pricing' && (
            <div className="space-y-5">
              <div>
                <h3 className="section-title border-b border-slate-800 pb-2">Storage Class Unit Pricing (₹ per GB / Month)</h3>
                <p className="section-sub mt-1">
                  Adjust demo unit costs. All dashboard totals, savings, and ROI projections immediately update based on these values.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">STANDARD Tier (Hot Storage)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      className="input pl-8 font-mono font-bold"
                      value={localPricing.STANDARD}
                      onChange={e => setLocalPricing({ ...localPricing, STANDARD: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Default: ₹2.00 / GB / month</p>
                </div>

                <div>
                  <label className="label">STANDARD_IA Tier (Infrequent Access)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      className="input pl-8 font-mono font-bold"
                      value={localPricing.STANDARD_IA}
                      onChange={e => setLocalPricing({ ...localPricing, STANDARD_IA: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Default: ₹1.25 / GB / month</p>
                </div>

                <div>
                  <label className="label">GLACIER Tier (Cold Archive)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      className="input pl-8 font-mono font-bold"
                      value={localPricing.GLACIER}
                      onChange={e => setLocalPricing({ ...localPricing, GLACIER: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Default: ₹0.40 / GB / month</p>
                </div>

                <div>
                  <label className="label">DEEP_ARCHIVE Tier (Long-term Vault)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="input pl-8 font-mono font-bold"
                      value={localPricing.DEEP_ARCHIVE}
                      onChange={e => setLocalPricing({ ...localPricing, DEEP_ARCHIVE: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Default: ₹0.10 / GB / month</p>
                </div>
              </div>

              <div className="p-3.5 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0 text-cyan-400" />
                <span>
                  All pricing values are used strictly for local prototype calculations and do not affect cloud provider credentials.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Inactive & Large File Thresholds */}
          {tab === 'thresholds' && (
            <div className="space-y-5">
              <div>
                <h3 className="section-title border-b border-slate-800 pb-2">Analysis Engine Inspection Thresholds</h3>
                <p className="section-sub mt-1">
                  Define the criteria used to classify objects as Inactive, Highly Inactive, or Oversized.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label">Inactive Threshold (Days)</label>
                  <input
                    type="number"
                    min="30"
                    max="720"
                    className="input font-mono font-bold"
                    value={localThresholds.inactiveDays}
                    onChange={e => setLocalThresholds({ ...localThresholds, inactiveDays: parseInt(e.target.value) || 180 })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default: 180 days unaccessed</p>
                </div>

                <div>
                  <label className="label">Highly Inactive Threshold (Days)</label>
                  <input
                    type="number"
                    min="90"
                    max="1000"
                    className="input font-mono font-bold"
                    value={localThresholds.highlyInactiveDays}
                    onChange={e => setLocalThresholds({ ...localThresholds, highlyInactiveDays: parseInt(e.target.value) || 365 })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default: 365 days (Deep Archive candidate)</p>
                </div>

                <div>
                  <label className="label">Large File Cutoff (GB)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    className="input font-mono font-bold"
                    value={localThresholds.largeFileSizeGB}
                    onChange={e => setLocalThresholds({ ...localThresholds, largeFileSizeGB: parseFloat(e.target.value) || 10 })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default: 10 GB (Compression target)</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Account Profile */}
          {tab === 'account' && (
            <div className="space-y-4">
              <h3 className="section-title border-b border-slate-800 pb-2">User Profile & Entity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input font-semibold" value={accountForm.name} onChange={e => setAccountForm({ ...accountForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input font-semibold" type="email" value={accountForm.email} onChange={e => setAccountForm({ ...accountForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Company / Entity</label>
                  <input className="input font-semibold" value={accountForm.company} onChange={e => setAccountForm({ ...accountForm, company: e.target.value })} />
                </div>
                <div>
                  <label className="label">Currency Display</label>
                  <input className="input font-semibold bg-slate-900 text-slate-400" disabled value="INR (₹) — Indian Rupee" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Alert Channels */}
          {tab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="section-title border-b border-slate-800 pb-2">Alert Delivery Channels</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Weekly Cost Summary Email', desc: 'Dispatched to admin@cloudcut.demo' },
                  { label: 'Duplicate Growth Spike Detection', desc: 'Trigger alerts when duplicate redundancy exceeds 10%' },
                  { label: 'Unused Bucket Alarm', desc: 'Alert when a bucket receives zero reads in 90 days' }
                ].map(item => (
                  <div key={item.label} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">ENABLED</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Security */}
          {tab === 'security' && (
            <div className="space-y-4">
              <h3 className="section-title border-b border-slate-800 pb-2">Authentication & Access Governance</h3>
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                <p className="text-xs font-bold text-white">Local Prototype Execution Mode</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  CloudCut is operating in browser-side data-driven mode. No cloud API credentials or remote database connections are required.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <button onClick={handleResetDefaults} className="btn-secondary text-xs">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Baseline Defaults
            </button>
            <button onClick={handleSaveAll} className="btn-primary text-xs font-black">
              <Save className="w-3.5 h-3.5 mr-1" />
              Save & Apply Calculations
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
