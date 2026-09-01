'use client'

import { useState } from 'react'
import { RefreshCw, Settings, Plus, CheckCircle, XCircle, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cloudProvidersData } from '@/lib/mockData'
import type { CloudProvider } from '@/types'
import clsx from 'clsx'

// Provider logos (SVG)
function AWSLogo() {
  return (
    <svg viewBox="0 0 80 48" fill="none" className="w-12 h-8">
      <text x="0" y="32" fontSize="28" fontWeight="800" fill="#FF9900" fontFamily="Arial">aws</text>
    </svg>
  )
}
function GCPLogo() {
  return (
    <svg viewBox="0 0 80 48" fill="none" className="w-12 h-8">
      <text x="0" y="32" fontSize="20" fontWeight="700" fill="#4285F4" fontFamily="Arial">GCP</text>
    </svg>
  )
}
function AzureLogo() {
  return (
    <svg viewBox="0 0 80 48" fill="none" className="w-12 h-8">
      <text x="0" y="32" fontSize="16" fontWeight="700" fill="#0078D4" fontFamily="Arial">Azure</text>
    </svg>
  )
}

const logos: Record<string, React.ElementType> = { aws: AWSLogo, gcp: GCPLogo, azure: AzureLogo }

export default function CloudProvidersPage() {
  const [connectModal, setConnectModal] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [connectStep, setConnectStep] = useState(0)

  function handleSync(p: CloudProvider) {
    setSyncing(p.id)
    setTimeout(() => {
      setSyncing(null)
      toast.success(`${p.shortName} synced successfully!`)
    }, 2000)
  }

  function handleConnect() {
    setConnectStep(1)
    setTimeout(() => setConnectStep(2), 1500)
  }

  function closeConnect() {
    setConnectModal(false)
    setConnectStep(0)
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cloud Providers</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage connected cloud storage accounts.</p>
        </div>
        <button onClick={() => setConnectModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Connect Provider
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Connected', value: '2 of 3', color: 'text-green-600' },
          { label: 'Total Storage', value: '11.0 TB', color: 'text-blue-600' },
          { label: 'Total Monthly Cost', value: '₹1,10,600', color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={clsx('text-xl font-bold mt-0.5', s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Provider cards */}
      <div className="space-y-4">
        {cloudProvidersData.map(p => {
          const Logo = logos[p.icon] ?? AWSLogo
          const connected = p.status === 'connected'
          return (
            <div key={p.id} className="card p-6">
              <div className="flex items-start gap-4 flex-wrap">
                {/* Logo */}
                <div className="w-16 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Logo />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{p.name}</h3>
                    <span className={clsx(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                      connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {connected
                        ? <CheckCircle className="w-3 h-3" />
                        : <XCircle className="w-3 h-3" />}
                      {connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">Last synced: {p.lastSync}</p>

                  {connected && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Storage Used', value: p.storageUsed },
                        { label: 'Monthly Cost', value: p.monthlyCost },
                        { label: 'Regions', value: `${p.regions} regions` },
                        { label: 'Buckets', value: `${p.buckets} buckets` },
                      ].map(m => (
                        <div key={m.label} className="bg-gray-50 rounded-lg px-3 py-2">
                          <p className="text-[10px] text-gray-400">{m.label}</p>
                          <p className="text-sm font-semibold text-gray-800 mt-0.5">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {connected ? (
                    <>
                      <button className="btn-secondary text-xs">
                        <Settings className="w-3.5 h-3.5" />
                        Manage
                      </button>
                      <button
                        onClick={() => handleSync(p)}
                        disabled={syncing === p.id}
                        className="btn-primary text-xs"
                      >
                        {syncing === p.id
                          ? <LoadingSpinner size={14} className="text-white" />
                          : <RefreshCw className="w-3.5 h-3.5" />}
                        {syncing === p.id ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setConnectModal(true)} className="btn-primary text-xs">
                      <Plus className="w-3.5 h-3.5" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Connect modal */}
      <Modal
        open={connectModal}
        onClose={closeConnect}
        title="Connect Cloud Provider"
        size="md"
        footer={connectStep === 0 ? (
          <>
            <button onClick={closeConnect} className="btn-secondary">Cancel</button>
            <button onClick={handleConnect} className="btn-primary">Connect</button>
          </>
        ) : connectStep === 2 ? (
          <button onClick={() => { closeConnect(); toast.success('Azure Blob Storage connected!') }} className="btn-primary w-full justify-center">
            Done
          </button>
        ) : undefined}
      >
        {connectStep === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Enter your Azure Blob Storage credentials to connect.</p>
            <div>
              <label className="label">Account Name</label>
              <input className="input" placeholder="mystorageaccount" defaultValue="cloudcut-azure-demo" />
            </div>
            <div>
              <label className="label">Account Key / SAS Token</label>
              <input className="input" type="password" placeholder="Enter key or SAS token" defaultValue="demo-key-placeholder" />
            </div>
            <div>
              <label className="label">Container Name (optional)</label>
              <input className="input" placeholder="Leave empty to scan all containers" />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
              <strong>Demo mode:</strong> No real credentials are required. Click Connect to simulate the integration.
            </div>
          </div>
        )}
        {connectStep === 1 && (
          <div className="flex flex-col items-center py-8 gap-3">
            <LoadingSpinner size={36} />
            <p className="text-sm font-medium text-gray-700">Connecting to Azure...</p>
            <p className="text-xs text-gray-400">Verifying credentials and scanning storage</p>
          </div>
        )}
        {connectStep === 2 && (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Azure Connected!</p>
            <p className="text-xs text-gray-500">Your Azure Blob Storage account has been successfully integrated.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
