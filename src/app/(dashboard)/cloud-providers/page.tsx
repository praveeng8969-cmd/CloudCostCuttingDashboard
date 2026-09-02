'use client'

import { useState } from 'react'
import {
  RefreshCw, Settings, Plus, CheckCircle2, XCircle,
  Database, Layers, Cloud
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PageHeader from '@/components/layout/PageHeader'
import { cloudProvidersData } from '@/lib/mockData'
import type { CloudProvider } from '@/types'
import clsx from 'clsx'

export default function CloudProvidersPage() {
  const [providers, setProviders] = useState<CloudProvider[]>(cloudProvidersData)
  const [connectModal, setConnectModal] = useState(false)
  const [manageModal, setManageModal] = useState<CloudProvider | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  function handleSync(p: CloudProvider) {
    setSyncing(p.id)
    setTimeout(() => {
      setSyncing(null)
      setProviders(prev => prev.map(item => item.id === p.id ? { ...item, lastSync: 'Just now' } : item))
      toast.success(`${p.shortName} bucket indexes synchronized!`)
    }, 800)
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Cloud Providers"
        subtitle="Manage connected object storage connections across AWS S3, Google Cloud Storage, and Azure Blob."
        actions={
          <button
            onClick={() => setConnectModal(true)}
            className="btn-primary text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Connect Provider
          </button>
        }
      />

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {providers.map((p) => {
          const isConnected = p.status === 'connected'
          return (
            <div key={p.id} className="card p-5 bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800">
                      {p.shortName}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 leading-tight">{p.name}</h3>
                      <p className="text-[11px] text-slate-400">{p.regions} Regions</p>
                    </div>
                  </div>

                  <span className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border',
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  )}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md text-center text-xs mt-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Storage</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{p.storageUsed}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Buckets</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{p.buckets}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Spend</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{p.monthlyCost}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-3">
                  Last synchronized: {p.lastSync}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSync(p)}
                  disabled={syncing === p.id || !isConnected}
                  className="btn-secondary py-1.5 px-2.5 text-xs"
                >
                  <RefreshCw className={clsx('w-3.5 h-3.5', syncing === p.id && 'animate-spin')} />
                  Sync
                </button>
                <button
                  onClick={() => setManageModal(p)}
                  className="btn-secondary py-1.5 px-2.5 text-xs"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Connect Modal */}
      <Modal
        open={connectModal}
        onClose={() => setConnectModal(false)}
        title="Connect Cloud Storage Provider"
        size="md"
        footer={
          <>
            <button onClick={() => setConnectModal(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button
              onClick={() => {
                setConnectModal(false)
                toast.success('Provider credentials validated & connection established!')
              }}
              className="btn-primary text-xs"
            >
              Verify & Connect
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="label">Select Provider</label>
            <select className="input">
              <option>Amazon Web Services (S3)</option>
              <option>Google Cloud Platform (GCS)</option>
              <option>Microsoft Azure (Blob Storage)</option>
            </select>
          </div>

          <div>
            <label className="label">Access Key ID / Client ID</label>
            <input type="text" placeholder="AKIA..." className="input" />
          </div>

          <div>
            <label className="label">Secret Access Key</label>
            <input type="password" placeholder="••••••••••••••••" className="input" />
          </div>
        </div>
      </Modal>

      {/* Manage Provider Modal */}
      <Modal
        open={Boolean(manageModal)}
        onClose={() => setManageModal(null)}
        title={manageModal ? `Manage ${manageModal.name}` : 'Provider Settings'}
        size="md"
        footer={
          <button onClick={() => setManageModal(null)} className="btn-secondary text-xs">
            Close
          </button>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>Target Regions: <strong>{manageModal?.regions} Active</strong></p>
          <p>Total Buckets Monitored: <strong>{manageModal?.buckets}</strong></p>
          <p>Current Monthly Spend: <strong>{manageModal?.monthlyCost}</strong></p>
        </div>
      </Modal>
    </div>
  )
}
