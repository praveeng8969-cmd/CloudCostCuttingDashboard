import 'server-only'
import { SAMPLE_AWS_ACCOUNTS, SampleAwsAccountId } from '@/lib/services/sampleAwsDataset'

const DEMO_PASSWORDS: Record<SampleAwsAccountId, string> = {
  novatech: 'NovaDemo@2026',
  shopsphere: 'ShopDemo@2026',
  datacore: 'DataDemo@2026'
}

export function validateSampleAwsCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const account = SAMPLE_AWS_ACCOUNTS.find(item => item.email === normalizedEmail)
  if (!account || DEMO_PASSWORDS[account.id] !== password) return null
  return account
}

export function availableSampleCredentials() {
  return SAMPLE_AWS_ACCOUNTS.map(account => ({
    id: account.id,
    company: account.company,
    email: account.email,
    password: DEMO_PASSWORDS[account.id]
  }))
}
