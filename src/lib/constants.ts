export const APP_NAME = 'CloudCut'
export const APP_TAGLINE = 'See where your cloud money goes. Cut unnecessary storage costs.'
export const APP_SUBTITLE = 'Cloud Storage Cost Cutting Dashboard'

export const DEMO_EMAIL = 'admin@cloudcut.demo'
export const DEMO_PASSWORD = 'demo1234'

export const DATE_RANGES = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 3 months', value: '3m' },
  { label: 'This year', value: '1y' },
] as const

export const PRIORITY_COLORS = {
  HIGH: 'badge-high',
  MEDIUM: 'badge-medium',
  LOW: 'badge-low',
} as const

export const STATUS_COLORS: Record<string, string> = {
  'Needs Review': 'bg-orange-100 text-orange-700',
  'Recommended': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Dismissed': 'bg-gray-100 text-gray-600',
}

export const RECOMMENDATION_COLORS: Record<string, string> = {
  red: 'bg-red-50 border-red-200 text-red-600',
  orange: 'bg-orange-50 border-orange-200 text-orange-600',
  purple: 'bg-purple-50 border-purple-200 text-purple-600',
  blue: 'bg-blue-50 border-blue-200 text-blue-600',
  green: 'bg-green-50 border-green-200 text-green-600',
}
