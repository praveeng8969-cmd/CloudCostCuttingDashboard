export type UserRole = 'admin' | 'user'
export type UserStatus = 'active' | 'disabled'

export interface UserProfile {
  id: string
  name: string
  companyName: string
  email: string
  passwordHash?: string
  password?: string
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLogin?: string
}

export interface UserReportRecord {
  id: string
  userId: string
  companyName: string
  userName: string
  reportTitle: string
  generatedAt: string
  totalStorageGB: number
  totalFiles: number
  currentMonthlyCost: number
  potentialMonthlySavings: number
  potentialAnnualSavings: number
  optimizationScore: number
  summaryText: string
}
