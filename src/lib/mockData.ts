import type {
  CostTrendPoint,
  StorageGrowthPoint,
  FileTypeData,
  DepartmentData,
  ActivityRow,
  FileRow,
  DuplicateFile,
  Recommendation,
  CloudProvider,
  Report,
  CostItem,
} from '@/types'

// ─── KPI Summary ──────────────────────────────────────────────────────────────
export const kpiSummary = {
  totalStorage: '12.8 TB',
  totalStorageChange: '+8.4%',
  monthlyCost: '₹1,24,500',
  monthlyCostChange: '+12.6%',
  potentialSavings: '₹31,800 / mo',
  optimizationScore: 72,
  duplicateStorage: '284 GB',
  duplicateFiles: 1284,
  inactiveStorage: '1.8 TB',
  inactiveFiles: 9120,
  annualCurrentCost: '₹14,94,000',
  annualOptimizedCost: '₹11,12,400',
  annualSavings: '₹3,81,600',
  projectedAnnual: '₹14.8 Lakhs',
  optimizedAnnual: '₹11.0 Lakhs',
  usedStorage: '10.6 TB',
  availableStorage: '2.2 TB',
  utilizationPercent: 83,
}

// ─── Cost Trend ───────────────────────────────────────────────────────────────
export const costTrendData: CostTrendPoint[] = [
  { month: 'Jan', current: 92000,  projected: 92000 },
  { month: 'Feb', current: 95500,  projected: 96000 },
  { month: 'Mar', current: 98200,  projected: 100500 },
  { month: 'Apr', current: 102400, projected: 105000 },
  { month: 'May', current: 106800, projected: 110000 },
  { month: 'Jun', current: 110600, projected: 115000 },
  { month: 'Jul', current: 114200, projected: 120000 },
  { month: 'Aug', current: 118000, projected: 125500 },
  { month: 'Sep', current: 120500, projected: 131000 },
  { month: 'Oct', current: 122000, projected: 136500 },
  { month: 'Nov', current: 123800, projected: 142000 },
  { month: 'Dec', current: 124500, projected: 148000 },
]

// ─── Storage Growth ───────────────────────────────────────────────────────────
export const storageGrowthData: StorageGrowthPoint[] = [
  { month: 'Jan', storage: 5.0 },
  { month: 'Feb', storage: 5.6 },
  { month: 'Mar', storage: 6.2 },
  { month: 'Apr', storage: 7.0 },
  { month: 'May', storage: 8.1 },
  { month: 'Jun', storage: 8.9 },
  { month: 'Jul', storage: 9.8 },
  { month: 'Aug', storage: 10.5 },
  { month: 'Sep', storage: 11.2 },
  { month: 'Oct', storage: 11.8 },
  { month: 'Nov', storage: 12.3 },
  { month: 'Dec', storage: 12.8 },
]

// ─── File Type Distribution ───────────────────────────────────────────────────
export const fileTypeData: FileTypeData[] = [
  { name: 'Backups',   value: 4.2, color: '#3b82f6' },
  { name: 'Videos',    value: 2.8, color: '#8b5cf6' },
  { name: 'Logs',      value: 2.1, color: '#f59e0b' },
  { name: 'Images',    value: 1.5, color: '#10b981' },
  { name: 'Documents', value: 1.2, color: '#06b6d4' },
  { name: 'Other',     value: 1.0, color: '#6b7280' },
]

// ─── Department Storage ───────────────────────────────────────────────────────
export const departmentData: DepartmentData[] = [
  { department: 'Engineering', storage: 4800, cost: 47040 },
  { department: 'Marketing',   storage: 2900, cost: 28420 },
  { department: 'Operations',  storage: 2100, cost: 20580 },
  { department: 'Finance',     storage: 1600, cost: 15680 },
  { department: 'HR',          storage: 1400, cost: 13720 },
]

// ─── Cost Breakdown ───────────────────────────────────────────────────────────
export const costBreakdown: CostItem[] = [
  { label: 'Standard Storage', amount: '₹62,400', amountNum: 62400, percentage: 50, color: '#3b82f6' },
  { label: 'Backup Storage',   amount: '₹28,500', amountNum: 28500, percentage: 23, color: '#8b5cf6' },
  { label: 'Snapshots',        amount: '₹14,800', amountNum: 14800, percentage: 12, color: '#f59e0b' },
  { label: 'Archive Storage',  amount: '₹11,200', amountNum: 11200, percentage: 9,  color: '#10b981' },
  { label: 'Data Transfer',    amount: '₹7,600',  amountNum: 7600,  percentage: 6,  color: '#ef4444' },
]

// ─── Activity Feed ────────────────────────────────────────────────────────────
export const activityData: ActivityRow[] = [
  { id: 'a1', activity: 'Duplicate files detected',      type: 'Duplicate', storageImpact: '284 GB',  estimatedSavings: '₹12,000', status: 'Needs Review',  time: '2 hours ago' },
  { id: 'a2', activity: 'Old backups identified',        type: 'Backup',    storageImpact: '620 GB',  estimatedSavings: '₹8,500',  status: 'Recommended',   time: '5 hours ago' },
  { id: 'a3', activity: 'Unused snapshots found',        type: 'Snapshot',  storageImpact: '180 GB',  estimatedSavings: '₹5,200',  status: 'Needs Review',  time: '1 day ago' },
  { id: 'a4', activity: 'Temporary files detected',      type: 'Temp',      storageImpact: '95 GB',   estimatedSavings: '₹2,100',  status: 'Recommended',   time: '1 day ago' },
  { id: 'a5', activity: 'Inactive log files identified', type: 'Inactive',  storageImpact: '142 GB',  estimatedSavings: '₹4,000',  status: 'Needs Review',  time: '2 days ago' },
]

// ─── Files ────────────────────────────────────────────────────────────────────
export const filesData: FileRow[] = [
  { id: 'f1',  name: 'prod-db-backup-2024-01.tar.gz', type: 'Backup',   size: '142 GB', sizeBytes: 142000, lastAccessed: '180 days ago', owner: 'devops@corp.in',  storageClass: 'Standard',         department: 'Engineering', recommendation: 'Archive' },
  { id: 'f2',  name: 'marketing-video-assets.zip',    type: 'Video',    size: '86 GB',  sizeBytes: 86000,  lastAccessed: '95 days ago',  owner: 'mktg@corp.in',    storageClass: 'Standard',         department: 'Marketing',   recommendation: 'Review' },
  { id: 'f3',  name: 'system-logs-2023-q4.tar',       type: 'Log',      size: '68 GB',  sizeBytes: 68000,  lastAccessed: '210 days ago', owner: 'admin@corp.in',   storageClass: 'Standard',         department: 'Operations',  recommendation: 'Delete' },
  { id: 'f4',  name: 'hr-records-archive-2022.zip',   type: 'Archive',  size: '45 GB',  sizeBytes: 45000,  lastAccessed: '365 days ago', owner: 'hr@corp.in',      storageClass: 'Infrequent Access', department: 'HR',          recommendation: 'Archive' },
  { id: 'f5',  name: 'finance-reports-fy23.pdf',      type: 'Document', size: '12 GB',  sizeBytes: 12000,  lastAccessed: '30 days ago',  owner: 'cfo@corp.in',     storageClass: 'Standard',         department: 'Finance',     recommendation: 'Keep' },
  { id: 'f6',  name: 'employee-photos-archive.zip',   type: 'Image',    size: '28 GB',  sizeBytes: 28000,  lastAccessed: '120 days ago', owner: 'hr@corp.in',      storageClass: 'Standard',         department: 'HR',          recommendation: 'Compress' },
  { id: 'f7',  name: 'app-crash-logs-oct.tar.gz',     type: 'Log',      size: '18 GB',  sizeBytes: 18000,  lastAccessed: '91 days ago',  owner: 'devops@corp.in',  storageClass: 'Standard',         department: 'Engineering', recommendation: 'Delete' },
  { id: 'f8',  name: 'snapshot-prod-server-aug.img',  type: 'Backup',   size: '55 GB',  sizeBytes: 55000,  lastAccessed: '183 days ago', owner: 'infra@corp.in',   storageClass: 'Standard',         department: 'Engineering', recommendation: 'Delete' },
  { id: 'f9',  name: 'client-presentation-q3.pptx',   type: 'Document', size: '4 GB',   sizeBytes: 4000,   lastAccessed: '14 days ago',  owner: 'sales@corp.in',   storageClass: 'Standard',         department: 'Marketing',   recommendation: 'Keep' },
  { id: 'f10', name: 'tmp-build-artifacts-2024.zip',  type: 'Other',    size: '22 GB',  sizeBytes: 22000,  lastAccessed: '60 days ago',  owner: 'cicd@corp.in',    storageClass: 'Standard',         department: 'Engineering', recommendation: 'Delete' },
]

// ─── Duplicate Files ──────────────────────────────────────────────────────────
export const duplicateFilesData: DuplicateFile[] = [
  { id: 'd1',  name: 'project_final.pdf',           type: 'Document', original: '/docs/project/',    copies: 3, size: '24 MB',  sizeBytes: 24,    potentialSaving: '₹120',   potentialSavingAmount: 120 },
  { id: 'd2',  name: 'presentation_v2.pptx',        type: 'Document', original: '/marketing/decks/', copies: 4, size: '86 MB',  sizeBytes: 86,    potentialSaving: '₹430',   potentialSavingAmount: 430 },
  { id: 'd3',  name: 'photo_archive_2023.zip',      type: 'Archive',  original: '/hr/photos/',       copies: 2, size: '1.2 GB', sizeBytes: 1200,  potentialSaving: '₹1,200', potentialSavingAmount: 1200 },
  { id: 'd4',  name: 'backup_config.tar.gz',        type: 'Backup',   original: '/infra/configs/',   copies: 5, size: '340 MB', sizeBytes: 340,   potentialSaving: '₹680',   potentialSavingAmount: 680 },
  { id: 'd5',  name: 'employee_data.xlsx',          type: 'Document', original: '/hr/data/',         copies: 6, size: '18 MB',  sizeBytes: 18,    potentialSaving: '₹360',   potentialSavingAmount: 360 },
  { id: 'd6',  name: 'server_snapshot_july.img',    type: 'Backup',   original: '/infra/snapshots/', copies: 2, size: '55 GB',  sizeBytes: 55000, potentialSaving: '₹5,500', potentialSavingAmount: 5500 },
  { id: 'd7',  name: 'marketing_video_final.mp4',   type: 'Video',    original: '/marketing/videos/', copies: 3, size: '4.8 GB', sizeBytes: 4800, potentialSaving: '₹960',   potentialSavingAmount: 960 },
  { id: 'd8',  name: 'app_log_sep_2024.tar',        type: 'Log',      original: '/logs/app/',        copies: 4, size: '12 GB',  sizeBytes: 12000, potentialSaving: '₹2,400', potentialSavingAmount: 2400 },
  { id: 'd9',  name: 'quarterly_report_q2.pdf',     type: 'Document', original: '/finance/reports/', copies: 3, size: '8 MB',   sizeBytes: 8,     potentialSaving: '₹80',    potentialSavingAmount: 80 },
  { id: 'd10', name: 'db_dump_prod_aug.sql.gz',     type: 'Backup',   original: '/db/dumps/',        copies: 2, size: '22 GB',  sizeBytes: 22000, potentialSaving: '₹2,200', potentialSavingAmount: 2200 },
]

// ─── Recommendations ──────────────────────────────────────────────────────────
export const recommendationsData: Recommendation[] = [
  {
    id: 'r1',
    title: 'Delete Duplicate Files',
    description: '1,284 duplicate files detected across your cloud storage. Removing them will immediately free up 284 GB of storage.',
    details: ['284 GB recoverable storage', '1,284 duplicate files identified', 'Affects Engineering, Marketing & HR buckets'],
    potentialSaving: '₹12,000/month',
    potentialSavingAmount: 12000,
    impact: '284 GB',
    priority: 'HIGH',
    files: 1284,
    icon: 'Copy',
    color: 'red',
  },
  {
    id: 'r2',
    title: 'Archive Old Backups',
    description: 'Move backups older than 180 days from Standard to Archive storage. Reduces cost by up to 80% for rarely accessed backup data.',
    details: ['620 GB of backups >180 days old', 'Move to Archive class: 80% cheaper', '12 backup sets identified'],
    potentialSaving: '₹8,500/month',
    potentialSavingAmount: 8500,
    impact: '620 GB',
    priority: 'HIGH',
    icon: 'Archive',
    color: 'orange',
  },
  {
    id: 'r3',
    title: 'Remove Unused Snapshots',
    description: '32 unused server snapshots are consuming 180 GB. These snapshots have not been accessed in over 6 months.',
    details: ['180 GB in unused snapshots', '32 snapshots across 8 servers', 'Last accessed: 6+ months ago'],
    potentialSaving: '₹5,200/month',
    potentialSavingAmount: 5200,
    impact: '180 GB',
    priority: 'MEDIUM',
    icon: 'Camera',
    color: 'purple',
  },
  {
    id: 'r4',
    title: 'Compress Large Log Files',
    description: 'Apply GZIP compression to 156 large log files. Typical compression ratio for logs is 70–80%, significantly reducing storage costs.',
    details: ['156 compressible log files', 'Estimated 75% compression ratio', 'Save ~320 GB of storage'],
    potentialSaving: '₹4,100/month',
    potentialSavingAmount: 4100,
    impact: '~320 GB',
    priority: 'MEDIUM',
    icon: 'FileArchive',
    color: 'blue',
  },
  {
    id: 'r5',
    title: 'Delete Temporary Files',
    description: 'Auto-generated temporary build artifacts and cache files are accumulating. These files have no recovery value.',
    details: ['95 GB temporary/cache files', 'CI/CD build artifacts: 68 GB', 'Temp uploads: 27 GB'],
    potentialSaving: '₹2,000/month',
    potentialSavingAmount: 2000,
    impact: '95 GB',
    priority: 'LOW',
    icon: 'Trash2',
    color: 'green',
  },
]

// ─── Cloud Providers ──────────────────────────────────────────────────────────
export const cloudProvidersData: CloudProvider[] = [
  {
    id: 'aws',
    name: 'Amazon Web Services',
    shortName: 'AWS S3',
    storageUsed: '7.2 TB',
    monthlyCost: '₹72,400',
    lastSync: '5 minutes ago',
    status: 'connected',
    icon: 'aws',
    color: '#FF9900',
    regions: 3,
    buckets: 18,
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    shortName: 'Google Cloud Storage',
    storageUsed: '3.8 TB',
    monthlyCost: '₹38,200',
    lastSync: '12 minutes ago',
    status: 'connected',
    icon: 'gcp',
    color: '#4285F4',
    regions: 2,
    buckets: 9,
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    shortName: 'Azure Blob Storage',
    storageUsed: '0 TB',
    monthlyCost: '₹0',
    lastSync: 'Never',
    status: 'disconnected',
    icon: 'azure',
    color: '#0078D4',
    regions: 0,
    buckets: 0,
  },
]

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsData: Report[] = [
  { id: 'rp1', title: 'Monthly Cost Report',        description: 'Detailed breakdown of cloud storage costs for the current billing period including service-wise analysis.', lastGenerated: '1 Sep 2026', size: '2.4 MB', icon: 'BarChart3',    color: 'blue' },
  { id: 'rp2', title: 'Storage Usage Report',       description: 'Comprehensive analysis of storage consumption across departments, file types, and storage classes.', lastGenerated: '1 Sep 2026', size: '3.1 MB', icon: 'HardDrive',    color: 'purple' },
  { id: 'rp3', title: 'Optimization Report',        description: 'Actionable recommendations to reduce storage costs with estimated savings and implementation steps.', lastGenerated: '28 Aug 2026', size: '1.8 MB', icon: 'Zap',         color: 'orange' },
  { id: 'rp4', title: 'Duplicate File Report',      description: 'Complete list of duplicate files identified across all connected cloud providers with removal guide.', lastGenerated: '25 Aug 2026', size: '4.2 MB', icon: 'Copy',        color: 'red' },
  { id: 'rp5', title: 'Savings Report',             description: 'Summary of realized savings from optimization actions taken, projected annual savings breakdown.', lastGenerated: '1 Sep 2026', size: '1.2 MB', icon: 'TrendingDown', color: 'green' },
]

// ─── Monthly cost by service ──────────────────────────────────────────────────
export const costByServiceData = [
  { service: 'Object Storage', cost: 62400 },
  { service: 'Backup Storage', cost: 28500 },
  { service: 'Snapshots',      cost: 14800 },
  { service: 'Archive',        cost: 11200 },
  { service: 'Data Transfer',  cost: 7600 },
]

// ─── Cost by storage class ────────────────────────────────────────────────────
export const costByClassData = [
  { class: 'Standard',          cost: 72000 },
  { class: 'Infrequent Access', cost: 28500 },
  { class: 'Archive',           cost: 11200 },
  { class: 'Deep Archive',      cost: 5200 },
  { class: 'Snapshots',         cost: 7600 },
]
