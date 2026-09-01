'use client'

import { useState } from 'react'
import { User, Bell, Cloud, DollarSign, Palette, Shield, Save, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TABS = [
  { id: 'account',      label: 'Account',        icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'cloud',        label: 'Cloud Settings',  icon: Cloud },
  { id: 'budget',       label: 'Budget & Alerts', icon: DollarSign },
  { id: 'appearance',   label: 'Appearance',      icon: Palette },
  { id: 'security',     label: 'Security',        icon: Shield },
]

export default function SettingsPage() {
  const [tab, setTab] = useState('account')
  const [form, setForm] = useState({
    name: 'Admin User',
    email: 'admin@cloudcut.demo',
    company: 'CloudCut Inc.',
    currency: 'INR',
    budget: '150000',
    alertThreshold: '80',
    notifFreq: 'daily',
    syncInterval: '15',
    theme: 'light',
    twoFA: false,
    emailNotif: true,
    slackNotif: false,
    budgetAlert: true,
    unusualAlert: true,
  })

  function update(k: string, v: string | boolean) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function save() {
    toast.success('Settings saved successfully.')
  }

  function reset() {
    toast('Settings reset to defaults.', { icon: '↩️' })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences and configuration.</p>
      </div>

      <div className="flex gap-6">
        {/* Tab nav */}
        <div className="w-48 flex-shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                tab === t.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              )}
            >
              <t.icon className={clsx('w-4 h-4', tab === t.id ? 'text-blue-600' : 'text-gray-400')} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card p-6 space-y-5">
          {tab === 'account' && (
            <>
              <h3 className="section-title border-b border-gray-100 pb-3">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div>
                  <label className="label">Company / Organization</label>
                  <input className="input" value={form.company} onChange={e => update('company', e.target.value)} />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select className="input" value={form.currency} onChange={e => update('currency', e.target.value)}>
                    <option value="INR">INR (₹) — Indian Rupee</option>
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {tab === 'notifications' && (
            <>
              <h3 className="section-title border-b border-gray-100 pb-3">Notification Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Notification Frequency</label>
                  <select className="input max-w-xs" value={form.notifFreq} onChange={e => update('notifFreq', e.target.value)}>
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly digest</option>
                    <option value="daily">Daily digest</option>
                    <option value="weekly">Weekly summary</option>
                  </select>
                </div>
                {[
                  { key: 'emailNotif', label: 'Email Notifications', desc: 'Receive alerts via email' },
                  { key: 'slackNotif', label: 'Slack Notifications', desc: 'Send alerts to Slack channel' },
                  { key: 'budgetAlert', label: 'Budget Alerts', desc: 'Alert when budget threshold is reached' },
                  { key: 'unusualAlert', label: 'Unusual Activity Alerts', desc: 'Alert on unusual storage spikes' },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{n.label}</p>
                      <p className="text-xs text-gray-400">{n.desc}</p>
                    </div>
                    <button
                      onClick={() => update(n.key, !(form as Record<string, boolean | string>)[n.key] as boolean)}
                      className={clsx(
                        'w-10 h-6 rounded-full transition-colors relative flex-shrink-0',
                        (form as Record<string, boolean | string>)[n.key] ? 'bg-blue-600' : 'bg-gray-200'
                      )}
                    >
                      <span className={clsx(
                        'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                        (form as Record<string, boolean | string>)[n.key] ? 'translate-x-5' : 'translate-x-1'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'cloud' && (
            <>
              <h3 className="section-title border-b border-gray-100 pb-3">Cloud Sync Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Cloud Sync Interval</label>
                  <select className="input max-w-xs" value={form.syncInterval} onChange={e => update('syncInterval', e.target.value)}>
                    <option value="5">Every 5 minutes</option>
                    <option value="15">Every 15 minutes</option>
                    <option value="30">Every 30 minutes</option>
                    <option value="60">Every hour</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">How often CloudCut polls your cloud providers for updated data.</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Connected Providers</p>
                  <p className="text-xs text-blue-600 mt-1">AWS S3 · Google Cloud Storage</p>
                  <p className="text-xs text-gray-400 mt-0.5">Azure Blob Storage — not connected</p>
                </div>
              </div>
            </>
          )}

          {tab === 'budget' && (
            <>
              <h3 className="section-title border-b border-gray-100 pb-3">Budget & Alert Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Monthly Budget (₹)</label>
                  <input className="input" type="number" value={form.budget} onChange={e => update('budget', e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">Current spend: ₹1,24,500 (83% of budget)</p>
                </div>
                <div>
                  <label className="label">Alert Threshold (%)</label>
                  <input className="input" type="number" min="50" max="100" value={form.alertThreshold}
                    onChange={e => update('alertThreshold', e.target.value)} />
                  <p className="text-xs text-gray-400 mt-1">Alert when spend exceeds {form.alertThreshold}% of budget</p>
                </div>
              </div>
            </>
          )}

          {tab === 'appearance' && (
            <>
              <h3 className="section-title border-b border-gray-100 pb-3">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Theme</label>
                  <div className="flex gap-3">
                    {['light', 'dark', 'system'].map(t => (
                      <button
                        key={t}
                        onClick={() => update('theme', t)}
                        className={clsx(
                          'px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors',
                          form.theme === t
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'security' && (
            <>
              <h3 className="section-title border-b border-gray-100 pb-3">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-400">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => update('twoFA', !form.twoFA)}
                    className={clsx(
                      'w-10 h-6 rounded-full transition-colors relative',
                      form.twoFA ? 'bg-blue-600' : 'bg-gray-200'
                    )}
                  >
                    <span className={clsx(
                      'w-4 h-4 rounded-full bg-white absolute top-1 transition-transform',
                      form.twoFA ? 'translate-x-5' : 'translate-x-1'
                    )} />
                  </button>
                </div>
                <div>
                  <label className="label">Change Password</label>
                  <input className="input max-w-sm" type="password" placeholder="New password" />
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input className="input max-w-sm" type="password" placeholder="Confirm new password" />
                </div>
              </div>
            </>
          )}

          {/* Footer buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button onClick={save} className="btn-primary">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button onClick={reset} className="btn-secondary">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
