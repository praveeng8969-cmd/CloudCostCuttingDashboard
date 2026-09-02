'use client'

import React, { useState } from 'react'
import {
  User, Bell, DollarSign, Shield, Save, RotateCcw,
  SlidersHorizontal, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/layout/PageHeader'
import { useStorageData } from '@/context/StorageDataContext'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

const TABS = [
  { id: 'pricing',       label: 'Pricing Rates',        icon: DollarSign },
  { id: 'thresholds',    label: 'Detection Thresholds', icon: SlidersHorizontal },
  { id: 'account',       label: 'Account Profile',      icon: User },
  { id: 'notifications', label: 'Alert Preferences',    icon: Bell },
  { id: 'security',      label: 'Security & Access',    icon: Shield },
]

export default function SettingsPage() {
  const { pricing, thresholds, updatePricing, updateThresholds } = useStorageData()
  const { user } = useAuth()

  const [tab, setTab] = useState('pricing')

  const [localPricing, setLocalPricing] = useState({
    STANDARD: pricing.STANDARD,
    STANDARD_IA: pricing.STANDARD_IA,
    ONEZONE_IA: pricing.ONEZONE_IA,
    GLACIER: pricing.GLACIER,
    DEEP_ARCHIVE: pricing.DEEP_ARCHIVE,
    currency: pricing.currency
  })

  const [localThresholds, setLocalThresholds] = useState({
    inactiveDays: thresholds.inactiveDays,
    highlyInactiveDays: thresholds.highlyInactiveDays,
    largeFileSizeGB: thresholds.largeFileSizeGB
  })

  const [accountForm, setAccountForm] = useState({
    name: user?.name || 'Customer User',
    email: user?.email || 'user@cloudcut.com',
    company: user?.companyName || 'NovaTech Solutions',
  })

  function handleSaveAll() {
    updatePricing(localPricing)
    updateThresholds(localThresholds)
    toast.success('Configuration updated!')
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
    toast('Restored default parameters')
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12 max-w-5xl">
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage cost matrices, inactivity detection thresholds, and account details."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="btn-secondary text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="btn-primary text-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 space-y-1">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-left transition-colors',
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className={clsx('w-4 h-4', active ? 'text-blue-600' : 'text-slate-400')} />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="md:col-span-3">
          {tab === 'pricing' && (
            <div className="card p-6 bg-white border border-slate-200 space-y-5">
              <div>
                <h3 className="section-title">Storage Tier Cost Rates</h3>
                <p className="section-sub">Configurable rate in INR (₹) per GB per month used in all cost calculations.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="label">STANDARD (₹ / GB / mo)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={localPricing.STANDARD}
                    onChange={e => setLocalPricing({ ...localPricing, STANDARD: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Hot active storage rate</span>
                </div>

                <div>
                  <label className="label">STANDARD_IA (₹ / GB / mo)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={localPricing.STANDARD_IA}
                    onChange={e => setLocalPricing({ ...localPricing, STANDARD_IA: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Infrequent access tier</span>
                </div>

                <div>
                  <label className="label">ONEZONE_IA (₹ / GB / mo)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={localPricing.ONEZONE_IA}
                    onChange={e => setLocalPricing({ ...localPricing, ONEZONE_IA: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Single AZ lower cost</span>
                </div>

                <div>
                  <label className="label">GLACIER (₹ / GB / mo)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={localPricing.GLACIER}
                    onChange={e => setLocalPricing({ ...localPricing, GLACIER: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Cold archive tier</span>
                </div>

                <div>
                  <label className="label">DEEP_ARCHIVE (₹ / GB / mo)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={localPricing.DEEP_ARCHIVE}
                    onChange={e => setLocalPricing({ ...localPricing, DEEP_ARCHIVE: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Long-term compliance vault</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'thresholds' && (
            <div className="card p-6 bg-white border border-slate-200 space-y-5">
              <div>
                <h3 className="section-title">Detection Thresholds</h3>
                <p className="section-sub">Define criteria for classifying objects as inactive or large storage.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="label">Inactive Threshold (Days)</label>
                  <input
                    type="number"
                    className="input max-w-xs"
                    value={localThresholds.inactiveDays}
                    onChange={e => setLocalThresholds({ ...localThresholds, inactiveDays: parseInt(e.target.value) || 90 })}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Objects unaccessed past this duration are flagged for tiering (default 180).</span>
                </div>

                <div>
                  <label className="label">Highly Inactive Threshold (Days)</label>
                  <input
                    type="number"
                    className="input max-w-xs"
                    value={localThresholds.highlyInactiveDays}
                    onChange={e => setLocalThresholds({ ...localThresholds, highlyInactiveDays: parseInt(e.target.value) || 365 })}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Target candidates for Deep Archive transition (default 365).</span>
                </div>

                <div>
                  <label className="label">Large File Cutoff (GB)</label>
                  <input
                    type="number"
                    className="input max-w-xs"
                    value={localThresholds.largeFileSizeGB}
                    onChange={e => setLocalThresholds({ ...localThresholds, largeFileSizeGB: parseInt(e.target.value) || 5 })}
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Objects larger than this threshold are categorized as large items.</span>
                </div>
              </div>
            </div>
          )}

          {tab === 'account' && (
            <div className="card p-6 bg-white border border-slate-200 space-y-5">
              <div>
                <h3 className="section-title">Account Profile</h3>
                <p className="section-sub">Organization profile and primary contact details.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="label">Contact Name</label>
                  <input
                    type="text"
                    className="input max-w-md"
                    value={accountForm.name}
                    onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Work Email</label>
                  <input
                    type="email"
                    className="input max-w-md"
                    value={accountForm.email}
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Company Name</label>
                  <input
                    type="text"
                    className="input max-w-md"
                    value={accountForm.company}
                    onChange={e => setAccountForm({ ...accountForm, company: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="card p-6 bg-white border border-slate-200 space-y-4 text-xs">
              <h3 className="section-title">Alert Channels</h3>
              <p className="section-sub">Configure frequency and delivery for cost spike notifications.</p>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span>Send weekly storage cost digest via email</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span>Notify when duplicate candidate cluster exceeds 100 GB</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span>Flag unaccessed STANDARD storage after 180 days</span>
                </label>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="card p-6 bg-white border border-slate-200 space-y-4 text-xs">
              <h3 className="section-title">Security & Session</h3>
              <p className="section-sub">Authentication credentials and role governance.</p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
                <p className="font-semibold text-slate-800">Role-Based Access Control</p>
                <p className="text-slate-500">Your account is authorized under the <strong>Customer Tenant</strong> scope.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
