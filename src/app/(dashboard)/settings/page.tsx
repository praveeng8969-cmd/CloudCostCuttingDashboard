'use client'

import { useState } from 'react'
import {
  User, Bell, Cloud, DollarSign, Palette, Shield, Save,
  RotateCcw, Check, Sparkles, AlertCircle, Moon, Sun, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/layout/PageHeader'
import clsx from 'clsx'

const TABS = [
  { id: 'account',       label: 'Account Profile',    icon: User },
  { id: 'notifications', label: 'Alert Channels',      icon: Bell },
  { id: 'cloud',         label: 'Cloud Polling',      icon: Cloud },
  { id: 'budget',        label: 'Budget Guardrails',  icon: DollarSign },
  { id: 'appearance',    label: 'Appearance & Themes', icon: Palette },
  { id: 'security',      label: 'Security & 2FA',     icon: Shield },
]

export default function SettingsPage() {
  const [tab, setTab] = useState('account')
  const [form, setForm] = useState({
    name: 'Admin User',
    email: 'admin@cloudcut.demo',
    company: 'Acme Cloud Enterprises',
    currency: 'INR',
    budget: '150000',
    alertThreshold: '80',
    notifFreq: 'realtime',
    syncInterval: '15',
    theme: 'dark',
    twoFA: true,
    emailNotif: true,
    slackNotif: true,
    budgetAlert: true,
    unusualAlert: true,
  })

  function update(k: string, v: string | boolean) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function save() {
    toast.success('Configuration settings saved successfully!', {
      icon: '💾',
      style: { background: '#1e293b', color: '#fff', borderRadius: '12px' }
    })
  }

  function reset() {
    setForm({
      name: 'Admin User',
      email: 'admin@cloudcut.demo',
      company: 'Acme Cloud Enterprises',
      currency: 'INR',
      budget: '150000',
      alertThreshold: '80',
      notifFreq: 'daily',
      syncInterval: '15',
      theme: 'dark',
      twoFA: false,
      emailNotif: true,
      slackNotif: false,
      budgetAlert: true,
      unusualAlert: true,
    })
    toast('Settings reset to default baseline.', { icon: '🔄' })
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Standardized Page Header */}
      <PageHeader
        title="System Configuration & Governance"
        subtitle="Customize notification thresholds, multi-cloud polling intervals, and display preferences."
        badge="Enterprise Active"
        actions={
          <button onClick={save} className="btn-primary flex-shrink-0">
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 w-full min-w-0">
        {/* Navigation Sidebar Tabs */}
        <div className="w-full md:w-56 flex-shrink-0 space-y-1">
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
              <t.icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Form Container Card */}
        <div className="flex-1 card p-6 space-y-6 min-w-0">
          {tab === 'account' && (
            <div className="space-y-4">
              <h3 className="section-title border-b border-slate-800 pb-3">User Profile & Organization</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input font-semibold" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input font-semibold" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div>
                  <label className="label">Company / Entity Name</label>
                  <input className="input font-semibold" value={form.company} onChange={e => update('company', e.target.value)} />
                </div>
                <div>
                  <label className="label">Currency Display</label>
                  <select className="input font-semibold" value={form.currency} onChange={e => update('currency', e.target.value)}>
                    <option value="INR">INR (₹) — Indian Rupee</option>
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="section-title border-b border-slate-800 pb-3">Alert Delivery Channels</h3>
              <div className="space-y-3">
                {[
                  { key: 'emailNotif', label: 'Email Digest Alerts', desc: 'Daily PDF summaries sent to admin@cloudcut.demo' },
                  { key: 'slackNotif', label: 'Slack Webhook Notifications', desc: 'Post storage spikes to #finops-alerts' },
                  { key: 'budgetAlert', label: 'Budget Threshold Breaches', desc: 'Immediate SMS/Email when spending exceeds 80%' },
                  { key: 'unusualAlert', label: 'Unusual Ingestion Anomaly Detection', desc: 'AI alert when bucket growth exceeds 2 TB/day' },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl min-w-0 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{n.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => update(n.key, !(form as Record<string, boolean | string>)[n.key] as boolean)}
                      className={clsx(
                        'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
                        (form as Record<string, boolean | string>)[n.key] ? 'bg-blue-600' : 'bg-slate-700'
                      )}
                    >
                      <span className={clsx(
                        'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                        (form as Record<string, boolean | string>)[n.key] ? 'translate-x-6' : 'translate-x-1'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'cloud' && (
            <div className="space-y-4">
              <h3 className="section-title border-b border-slate-800 pb-3">Telemetry Polling Frequency</h3>
              <div>
                <label className="label">Cloud Polling Schedule</label>
                <select className="input max-w-sm font-semibold" value={form.syncInterval} onChange={e => update('syncInterval', e.target.value)}>
                  <option value="5">Every 5 Minutes (High Precision)</option>
                  <option value="15">Every 15 Minutes (Recommended)</option>
                  <option value="30">Every 30 Minutes</option>
                  <option value="60">Hourly</option>
                </select>
                <p className="text-xs text-slate-400 mt-1.5">How frequently CloudCut calls AWS CloudWatch & Azure Monitor telemetry endpoints.</p>
              </div>

              <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-2xl">
                <p className="text-xs font-bold text-blue-300">Active Polling Connectors</p>
                <p className="text-xs text-slate-300 mt-1">AWS S3 · Google Cloud Storage (Azure Blob connected)</p>
              </div>
            </div>
          )}

          {tab === 'budget' && (
            <div className="space-y-4">
              <h3 className="section-title border-b border-slate-800 pb-3">Budget Guardrails & Thresholds</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Monthly Target Budget (₹)</label>
                  <input className="input font-mono font-bold" type="number" value={form.budget} onChange={e => update('budget', e.target.value)} />
                  <p className="text-[11px] text-slate-400 mt-1">Current spend: ₹1,24,500 (<span className="text-amber-300 font-bold">83% utilized</span>)</p>
                </div>
                <div>
                  <label className="label">Alert Trigger Threshold (%)</label>
                  <input className="input font-mono font-bold" type="number" min="50" max="100" value={form.alertThreshold} onChange={e => update('alertThreshold', e.target.value)} />
                  <p className="text-[11px] text-slate-400 mt-1">Notifications dispatched when spend &gt; {form.alertThreshold}% of ceiling</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="section-title border-b border-slate-800 pb-3">Theme & UI Personalization</h3>
              <div>
                <label className="label">Color Palette Theme</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-blue-500/40 bg-blue-950/40 text-blue-300 text-center flex flex-col items-center gap-2 shadow-lg">
                    <Moon className="w-5 h-5 text-cyan-300" />
                    <span className="text-xs font-black text-white">Atmospheric Cloud Dark</span>
                    <span className="text-[10px] font-bold text-emerald-400">Active System Theme</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-4">
              <h3 className="section-title border-b border-slate-800 pb-3">Authentication & Role Governance</h3>
              <div className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl min-w-0 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">Require OTP confirmation via Google Authenticator or SMS</p>
                </div>
                <button
                  onClick={() => update('twoFA', !form.twoFA)}
                  className={clsx(
                    'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
                    form.twoFA ? 'bg-blue-600' : 'bg-slate-700'
                  )}
                >
                  <span className={clsx(
                    'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                    form.twoFA ? 'translate-x-6' : 'translate-x-1'
                  )} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="label">Update Security Key</label>
                  <input className="input font-mono text-xs" type="password" placeholder="••••••••••••" />
                </div>
                <div>
                  <label className="label">Confirm Security Key</label>
                  <input className="input font-mono text-xs" type="password" placeholder="••••••••••••" />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <button onClick={reset} className="btn-secondary text-xs">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button onClick={save} className="btn-primary text-xs">
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
