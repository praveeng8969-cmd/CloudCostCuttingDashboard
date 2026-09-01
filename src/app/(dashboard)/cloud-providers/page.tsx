'use client'

import { useState } from 'react'
import {
  RefreshCw, Settings, Plus, CheckCircle2, XCircle,
  Wifi, ShieldCheck, Database, Layers, ArrowUpRight, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cloudProvidersData } from '@/lib/mockData'
import type { CloudProvider } from '@/types'
import clsx from 'clsx'

function AWSLogo() {
  return (
    <div className="w-12 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-300 text-sm shadow-sm">
      AWS
    </div>
  )
}
function GCPLogo() {
  return (
    <div className="w-12 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-300 text-sm shadow-sm">
      GCP
    </div>
  )
}
function AzureLogo() {
  return (
    <div className="w-12 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center font-black text-sky-300 text-sm shadow-sm">
      Azure
    </div>
  )
}

const logos: Record<string, React.ElementType> = { aws: AWSLogo, gcp: GCPLogo, azure: AzureLogo }

export default function CloudProvidersPage() {
  const [providers, setProviders] = useState<CloudProvider[]>(cloudProvidersData)
  const [connectModal, setConnectModal] = useState(false)
  const [manageModal, setManageModal] = useState<CloudProvider | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [connectStep, setConnectStep] = useState(0)
  const [selectedProviderToConnect, setSelectedProviderToConnect] = useState('Azure Blob Storage')

  function handleSync(p: CloudProvider) {
    setSyncing(p.id)
    setTimeout(() => {
      setSyncing(null)
      setProviders(prev => prev.map(item => item.id === p.id ? { ...item, lastSync: 'Just now' } : item))
      toast.success(`${p.shortName} bucket indexes synchronized!`, {
        icon: '⚡',
        style: { background: '#064e3b', color: '#ecfdf5', borderRadius: '12px' }
      })
    }, 1500)
  }

  function handleConnect() {
    setConnectStep(1)
    setTimeout(() => {
      setConnectStep(2)
      setProviders(prev => prev.map(item =>
        item.id === 'azure' ? { ...item, status: 'connected', storageUsed: '1.8 TB', monthlyCost: '₹13,900', lastSync: 'Just now', buckets: 4, regions: 2 } : item
      ))
      toast.success('Azure Blob Storage connected successfully!')
    }, 1800)
  }

  function closeConnect() {
    setConnectModal(false)
    setConnectStep(0)
  }

  const connectedCount = providers.filter(p => p.status === 'connected').length

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Multi-Cloud Storage Integrations</h2>
          <p className="text-xs text-slate-300 mt-0.5">Manage read-only telemetry telemetry connectors across Amazon S3, Google Cloud & Azure Blob.</p>
        </div>
        <button onClick={() => setConnectModal(true)} className="btn-primary self-start">
          <Plus className="w-4 h-4" />
          Connect New Provider
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4.5 card-glow-emerald flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-black border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Connection Status</p>
            <p className="text-2xl font-black text-emerald-400 tracking-tight">{connectedCount} of 3 Live</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Automated 15-min sync schedule</p>
          </div>
        </div>

        <div className="card p-4.5 card-glow-blue flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Monitored Footprint</p>
            <p className="text-2xl font-black text-blue-400 tracking-tight">12.8 TB</p>
            <p className="text-[10px] text-slate-400 mt-0.5">27 total bucket containers</p>
          </div>
        </div>

        <div className="card p-4.5 card-glow-purple flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Multi-Cloud Spend</p>
            <p className="text-2xl font-black text-purple-400 tracking-tight">₹1,24,500</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Consolidated monthly billing</p>
          </div>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="space-y-4">
        {providers.map(p => {
          const Logo = logos[p.icon] ?? AWSLogo
          const isConnected = p.status === 'connected'
          return (
            <div
              key={p.id}
              className={clsx(
                'card p-6 transition-all',
                isConnected ? 'card-glow-blue' : 'opacity-85'
              )}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                {/* Provider Logo & Info */}
                <div className="flex items-start gap-4">
                  <Logo />
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-black text-white tracking-tight">{p.name}</h3>
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border',
                        isConnected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      )}>
                        {isConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isConnected ? 'Active & Polling' : 'Disconnected'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Bucket Telemetry: <span className="font-bold text-slate-200">{p.shortName}</span> · Last synchronized: <strong className="text-blue-400">{p.lastSync}</strong>
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                {isConnected && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                    {[
                      { label: 'Storage Used', value: p.storageUsed },
                      { label: 'Monthly Spend', value: p.monthlyCost },
                      { label: 'Regions', value: `${p.regions} Regions` },
                      { label: 'Buckets', value: `${p.buckets} Buckets` },
                    ].map(m => (
                      <div key={m.label} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/80 text-center min-w-[105px]">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
                        <p className="text-xs font-black text-white mt-0.5">{m.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => setManageModal(p)}
                        className="btn-secondary text-xs"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Manage Buckets
                      </button>
                      <button
                        onClick={() => handleSync(p)}
                        disabled={syncing === p.id}
                        className="btn-primary text-xs"
                      >
                        <RefreshCw className={clsx('w-3.5 h-3.5', syncing === p.id && 'animate-spin')} />
                        {syncing === p.id ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProviderToConnect('Azure Blob Storage')
                        setConnectModal(true)
                      }}
                      className="btn-primary text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Connect Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Connect Modal */}
      <Modal
        open={connectModal}
        onClose={closeConnect}
        title="Connect Multi-Cloud Storage Account"
        size="md"
        footer={
          connectStep === 0 ? (
            <>
              <button onClick={closeConnect} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleConnect} className="btn-primary">
                Authenticate & Connect
              </button>
            </>
          ) : connectStep === 2 ? (
            <button onClick={closeConnect} className="btn-emerald w-full justify-center">
              Done & Return to Providers
            </button>
          ) : undefined
        }
      >
        {connectStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className="label">Target Cloud Provider</label>
              <select
                value={selectedProviderToConnect}
                onChange={e => setSelectedProviderToConnect(e.target.value)}
                className="input font-semibold"
              >
                <option>Microsoft Azure Blob Storage</option>
                <option>Amazon Web Services (AWS S3)</option>
                <option>Google Cloud Storage (GCS)</option>
                <option>Cloudflare R2 Storage</option>
              </select>
            </div>

            <div>
              <label className="label">Storage Account / IAM Role ARN</label>
              <input className="input font-mono text-xs" defaultValue="arn:aws:iam::8948194:role/CloudCutReadOnlyAudit" />
            </div>

            <div>
              <label className="label">Access Key or SAS Token</label>
              <input className="input font-mono text-xs" type="password" defaultValue="demo-access-key-cloudcut-secure" />
            </div>

            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-blue-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-blue-400" />
              <span>Read-only metadata permissions are used. CloudCut never accesses file payloads.</span>
            </div>
          </div>
        )}

        {connectStep === 1 && (
          <div className="py-8 flex flex-col items-center gap-4">
            <LoadingSpinner size={42} className="text-blue-400" />
            <div className="text-center">
              <h4 className="text-sm font-bold text-white">Connecting to {selectedProviderToConnect}...</h4>
              <p className="text-xs text-slate-400 mt-1">Validating IAM permissions & discovering container buckets</p>
            </div>
          </div>
        )}

        {connectStep === 2 && (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black text-white">Successfully Connected!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              <strong>{selectedProviderToConnect}</strong> has been integrated. 4 storage containers have been indexed for cost optimization.
            </p>
          </div>
        )}
      </Modal>

      {/* Manage Buckets Modal */}
      <Modal
        open={!!manageModal}
        onClose={() => setManageModal(null)}
        title={`Manage Buckets — ${manageModal?.name}`}
        size="md"
        footer={
          <button onClick={() => setManageModal(null)} className="btn-secondary w-full justify-center">
            Close Bucket View
          </button>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-400">Connected bucket partitions actively indexed by CloudCut:</p>
          {[
            { name: 'prod-media-assets-us-east', size: '4.2 TB', cost: '₹42,000/mo', tier: 'Standard', status: 'Healthy' },
            { name: 'db-backups-archive-eu-west', size: '2.1 TB', cost: '₹18,500/mo', tier: 'Glacier Deep', status: 'Optimized' },
            { name: 'cicd-build-artifacts-temp', size: '900 GB', cost: '₹9,000/mo', tier: 'Standard', status: 'Waste Detected' },
          ].map(b => (
            <div key={b.name} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white font-mono">{b.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{b.tier} · {b.size}</p>
              </div>
              <div className="text-right">
                <span className="font-black text-white">{b.cost}</span>
                <span className={clsx(
                  'block text-[10px] font-bold mt-0.5',
                  b.status === 'Waste Detected' ? 'text-rose-400' : 'text-emerald-400'
                )}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
