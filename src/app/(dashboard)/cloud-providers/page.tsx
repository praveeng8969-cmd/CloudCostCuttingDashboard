'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Cloud, Copy, Database, RefreshCw, Settings, ShieldCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PageHeader from '@/components/layout/PageHeader'
import { useAuth } from '@/context/AuthContext'
import { useStorageData } from '@/context/StorageDataContext'
import type { AwsBucket, AwsConnection, AwsMetadataRecord, AwsSyncResult } from '@/types/aws'
import type { FileCategory, StorageClass, StorageRecord } from '@/types/storage'

const AWS_PRINCIPAL_ARN = process.env.NEXT_PUBLIC_CLOUDCUT_AWS_PRINCIPAL_ARN || 'arn:aws:iam::CLOUDCUT_ACCOUNT_ID:role/CloudCutConnector'

function inferFileType(key: string): FileCategory {
  const extension = key.split('.').pop()?.toLowerCase() || ''
  if (['zip', 'tar', 'gz', '7z', 'bak', 'dump', 'sql', 'iso', 'vmdk'].includes(extension)) return 'Backup'
  if (['log', 'txt', 'out', 'csv', 'tsv', 'json', 'xml'].includes(extension)) return 'Logs'
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'].includes(extension)) return 'Video'
  if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'tiff'].includes(extension)) return 'Image'
  if (['pdf', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'md'].includes(extension)) return 'Document'
  return 'Other'
}

function normalizeStorageClass(value: string): StorageClass {
  if (value === 'STANDARD_IA') return 'STANDARD_IA'
  if (value === 'ONEZONE_IA') return 'ONEZONE_IA'
  if (value.includes('DEEP_ARCHIVE')) return 'DEEP_ARCHIVE'
  if (value.includes('GLACIER')) return 'GLACIER'
  return 'STANDARD'
}

function normalizeAwsRecord(record: AwsMetadataRecord, priceFor: (storageClass: string) => number): StorageRecord {
  const storageClass = normalizeStorageClass(record.storage_class)
  const sizeGB = Math.round((record.size_bytes / 1_000_000_000) * 100000) / 100000
  return {
    id: record.id,
    fileName: record.file_name,
    sizeGB,
    lastAccessed: null,
    lastModified: record.last_modified,
    activityDataAvailable: false,
    storageClass,
    fileType: inferFileType(record.file_name),
    bucket: record.bucket,
    ageDays: null,
    isInactive: false,
    isHighlyInactive: false,
    isLarge: sizeGB >= 10,
    status: 'Active',
    recommendation: 'Review',
    estimatedMonthlyCost: Math.round(sizeGB * priceFor(storageClass) * 100) / 100
  }
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'The AWS request could not be completed.')
  return data as T
}

export default function CloudProvidersPage() {
  const { user } = useAuth()
  const { activateExternalDataset, pricing } = useStorageData()
  const customerId = user?.id || ''
  const [connections, setConnections] = useState<AwsConnection[]>([])
  const [connectOpen, setConnectOpen] = useState(false)
  const [roleArn, setRoleArn] = useState('')
  const [displayName, setDisplayName] = useState('Production AWS')
  const [created, setCreated] = useState<AwsConnection | null>(null)
  const [bucketConnection, setBucketConnection] = useState<AwsConnection | null>(null)
  const [buckets, setBuckets] = useState<AwsBucket[]>([])
  const [selectedBuckets, setSelectedBuckets] = useState<string[]>([])
  const [manualBuckets, setManualBuckets] = useState('')
  const [busy, setBusy] = useState('')

  const loadConnections = useCallback(async () => {
    if (!customerId) return
    try {
      const data = await apiJson<{ connections: AwsConnection[] }>(`/api/aws/connections?customer_id=${encodeURIComponent(customerId)}`)
      setConnections(data.connections)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load AWS connections.')
    }
  }, [customerId])

  useEffect(() => { void loadConnections() }, [loadConnections])

  const trustPolicy = useMemo(() => created ? JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Effect: 'Allow',
      Principal: { AWS: AWS_PRINCIPAL_ARN },
      Action: 'sts:AssumeRole',
      Condition: { StringEquals: { 'sts:ExternalId': created.external_id } }
    }]
  }, null, 2) : '', [created])

  async function createConnection() {
    if (!customerId) return
    setBusy('create')
    try {
      const connection = await apiJson<AwsConnection>('/api/aws/connections', {
        method: 'POST', body: JSON.stringify({ customer_id: customerId, role_arn: roleArn, display_name: displayName })
      })
      setCreated(connection)
      await loadConnections()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create the connection.')
    } finally { setBusy('') }
  }

  async function testConnection(connection: AwsConnection) {
    setBusy(`test:${connection.id}`)
    try {
      await apiJson(`/api/aws/connections/${connection.id}/test`, {
        method: 'POST', body: JSON.stringify({ customer_id: customerId })
      })
      toast.success('AWS role verified with temporary credentials.')
      setCreated(null)
      setConnectOpen(false)
      await loadConnections()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Connection test failed.')
    } finally { setBusy('') }
  }

  async function openBuckets(connection: AwsConnection) {
    setBusy(`buckets:${connection.id}`)
    setBucketConnection(connection)
    setSelectedBuckets(connection.selected_buckets)
    setManualBuckets('')
    try {
      const data = await apiJson<{ buckets: AwsBucket[] }>(`/api/aws/connections/${connection.id}/buckets?customer_id=${encodeURIComponent(customerId)}`)
      setBuckets(data.buckets)
    } catch (error) {
      setBuckets([])
      toast.error(`${error instanceof Error ? error.message : 'Bucket listing failed'} You can enter authorized bucket names manually.`)
    } finally { setBusy('') }
  }

  async function syncConnection(connection: AwsConnection, scope = connection.selected_buckets) {
    if (scope.length === 0) return toast.error('Select at least one authorized bucket first.')
    setBusy(`sync:${connection.id}`)
    try {
      const result = await apiJson<AwsSyncResult>(`/api/aws/connections/${connection.id}/sync`, {
        method: 'POST', body: JSON.stringify({ customer_id: customerId, buckets: scope })
      })
      if (result.completeness !== 'complete') {
        toast.error(`Partial sync: ${result.failures.map(item => `${item.bucket} (${item.error})`).join(', ')}. The dataset was not activated.`)
      } else {
        const priceFor = (storageClass: string) => {
          const rate = (pricing as unknown as Record<string, number | string>)[storageClass]
          return typeof rate === 'number' ? rate : pricing.STANDARD
        }
        activateExternalDataset(
          result.records.map(record => normalizeAwsRecord(record, priceFor)),
          `${connection.display_name} · ${result.bucket_scope.length} S3 bucket${result.bucket_scope.length === 1 ? '' : 's'} · ${result.dataset_id}`
        )
        toast.success(`Synchronized ${result.object_count.toLocaleString()} S3 objects. Analysis started automatically.`)
        setBucketConnection(null)
      }
      await loadConnections()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AWS synchronization failed.')
    } finally { setBusy('') }
  }

  async function disconnect(connection: AwsConnection) {
    if (!window.confirm(`Disconnect ${connection.display_name}? Future synchronization will stop.`)) return
    setBusy(`delete:${connection.id}`)
    try {
      const response = await fetch(`/api/aws/connections/${connection.id}?customer_id=${encodeURIComponent(customerId)}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Disconnect failed.')
      toast.success('AWS connection disconnected.')
      await loadConnections()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Disconnect failed.')
    } finally { setBusy('') }
  }

  const scopedBuckets = Array.from(new Set([
    ...selectedBuckets,
    ...manualBuckets.split(',').map(value => value.trim()).filter(Boolean)
  ]))

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader title="Cloud Connections" subtitle="Securely index storage metadata from customer-authorized cloud accounts." actions={
        <button onClick={() => { setCreated(null); setConnectOpen(true) }} className="btn-primary text-xs"><Cloud className="w-3.5 h-3.5" />Connect AWS</button>
      } />

      <div className="card p-5 border-blue-200 bg-blue-50/50 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
        <div><p className="text-sm font-semibold text-slate-900">Read-only metadata access</p><p className="text-xs text-slate-600 mt-1">CloudCut uses short-lived AWS role credentials. It lists object metadata only and never downloads, changes, or deletes objects.</p></div>
      </div>

      {connections.length === 0 ? (
        <div className="card p-12 text-center"><Database className="w-9 h-9 text-slate-300 mx-auto" /><h2 className="text-base font-semibold mt-3">No AWS accounts connected</h2><p className="text-sm text-slate-500 mt-1">Connect an IAM role to select buckets and synchronize metadata.</p></div>
      ) : connections.map(connection => (
        <div key={connection.id} className="card p-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2"><div className="w-9 h-9 rounded bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center font-bold text-xs">AWS</div><div><h2 className="text-sm font-semibold">{connection.display_name}</h2><p className="text-xs text-slate-500">Account {connection.account_id}</p></div></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-xs">
                <Info label="Status" value={connection.status === 'connected' ? 'Connected' : 'Setup required'} />
                <Info label="Authorized buckets" value={connection.selected_buckets.length.toString()} />
                <Info label="Objects" value={connection.object_count.toLocaleString()} />
                <Info label="Last synced" value={connection.last_sync ? new Date(connection.last_sync).toLocaleString() : 'Never'} />
              </div>
              {connection.completeness === 'partial' && <p className="text-xs text-amber-700 mt-3">The last sync was partial and was not activated for analysis.</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => testConnection(connection)} disabled={Boolean(busy)} className="btn-secondary text-xs"><CheckCircle2 className="w-3.5 h-3.5" />Test</button>
              <button onClick={() => openBuckets(connection)} disabled={Boolean(busy) || connection.status !== 'connected'} className="btn-secondary text-xs"><Settings className="w-3.5 h-3.5" />Select Buckets</button>
              <button onClick={() => syncConnection(connection)} disabled={Boolean(busy) || connection.selected_buckets.length === 0} className="btn-primary text-xs">{busy === `sync:${connection.id}` ? <LoadingSpinner size={14} /> : <RefreshCw className="w-3.5 h-3.5" />}Sync Now</button>
              <button disabled title="Scheduled sync requires a durable deployment worker" className="btn-secondary text-xs opacity-60">Scheduled Sync</button>
              <button onClick={() => disconnect(connection)} disabled={Boolean(busy)} className="btn-secondary text-xs text-red-600"><Trash2 className="w-3.5 h-3.5" />Disconnect</button>
            </div>
          </div>
        </div>
      ))}

      <Modal open={connectOpen} onClose={() => setConnectOpen(false)} title="Connect Amazon S3" size="lg" footer={created ? <button onClick={() => testConnection(created)} disabled={Boolean(busy)} className="btn-primary text-xs">Verify Role Connection</button> : <button onClick={createConnection} disabled={Boolean(busy) || !roleArn} className="btn-primary text-xs">Generate Secure Setup</button>}>
        {!created ? <div className="space-y-4 text-xs"><p className="text-slate-600">Create a read-only IAM role in your AWS account, then enter its ARN. CloudCut does not accept permanent access keys.</p><div><label className="label">Connection name</label><input className="input" value={displayName} onChange={event => setDisplayName(event.target.value)} /></div><div><label className="label">IAM role ARN</label><input className="input font-mono" value={roleArn} onChange={event => setRoleArn(event.target.value)} placeholder="arn:aws:iam::123456789012:role/CloudCutReadOnly" /></div></div> : <div className="space-y-4 text-xs"><p className="text-slate-600">Add this trust policy to <strong>{created.role_arn}</strong>. The unique external ID prevents another tenant from using this role.</p><CodeBlock title="Trust policy" value={trustPolicy} /><CodeBlock title="External ID" value={created.external_id} /><p className="text-slate-500">Attach the least-privilege S3 listing policy from <code>AWS_SETUP.md</code>, then verify the connection.</p></div>}
      </Modal>

      <Modal open={Boolean(bucketConnection)} onClose={() => setBucketConnection(null)} title="Select Authorized Buckets" size="md" footer={<button onClick={() => bucketConnection && syncConnection(bucketConnection, scopedBuckets)} disabled={Boolean(busy) || scopedBuckets.length === 0} className="btn-primary text-xs">Save & Sync</button>}>
        <div className="space-y-3 text-xs">{busy.startsWith('buckets:') ? <LoadingSpinner /> : buckets.map(bucket => <label key={bucket.name} className="flex items-center gap-2 p-2 border rounded"><input type="checkbox" checked={selectedBuckets.includes(bucket.name)} onChange={event => setSelectedBuckets(current => event.target.checked ? [...current, bucket.name] : current.filter(name => name !== bucket.name))} />{bucket.name}</label>)}<div><label className="label">Authorized bucket names (optional, comma-separated)</label><input className="input" value={manualBuckets} onChange={event => setManualBuckets(event.target.value)} placeholder="production-assets, audit-logs" /></div><p className="text-slate-500">Only the selected names are sent to the metadata collector.</p></div>
      </Modal>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) { return <div className="bg-slate-50 border border-slate-200 rounded p-3"><span className="text-slate-500 block">{label}</span><strong className="text-slate-900 block mt-1 truncate">{value}</strong></div> }

function CodeBlock({ title, value }: { title: string; value: string }) {
  return <div><div className="flex justify-between mb-1"><label className="label mb-0">{title}</label><button onClick={() => { void navigator.clipboard.writeText(value); toast.success(`${title} copied`) }} className="text-blue-600 inline-flex gap-1"><Copy className="w-3 h-3" />Copy</button></div><pre className="bg-slate-950 text-slate-100 p-3 rounded overflow-auto max-h-52 text-[11px]">{value}</pre></div>
}
