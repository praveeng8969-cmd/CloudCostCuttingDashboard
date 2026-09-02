import { UserProfile, UserReportRecord } from '@/types/auth'

export type { UserProfile, UserReportRecord }

const USERS_STORAGE_KEY = 'cloudcut_users_registry_v1'
const SESSION_STORAGE_KEY = 'cloudcut_auth_session_v1'
const REPORTS_STORAGE_KEY = 'cloudcut_reports_registry_v1'

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'admin_01',
    name: 'Sarah Chen (Platform Admin)',
    companyName: 'CloudCut Operations',
    email: 'admin@cloudcut.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-10T09:00:00.000Z',
    lastLogin: '2026-09-02T08:00:00.000Z'
  },
  {
    id: 'user_novatech',
    name: 'Alex Rivera',
    companyName: 'NovaTech Solutions',
    email: 'user@cloudcut.com',
    password: 'User@123',
    role: 'user',
    status: 'active',
    createdAt: '2026-02-15T10:30:00.000Z',
    lastLogin: '2026-09-01T14:20:00.000Z'
  },
  {
    id: 'user_byteworks',
    name: 'Devin Vance',
    companyName: 'ByteWorks Systems',
    email: 'byteworks@cloudcut.com',
    password: 'Byte@123',
    role: 'user',
    status: 'active',
    createdAt: '2026-03-01T11:00:00.000Z',
    lastLogin: '2026-09-01T17:45:00.000Z'
  },
  {
    id: 'user_startflow',
    name: 'Elena Rostova',
    companyName: 'StartFlow Cloud',
    email: 'startflow@cloudcut.com',
    password: 'Flow@123',
    role: 'user',
    status: 'active',
    createdAt: '2026-04-12T08:15:00.000Z',
    lastLogin: '2026-08-30T10:10:00.000Z'
  },
  {
    id: 'user_pixellabs',
    name: 'Marcus Vance',
    companyName: 'PixelLabs Media',
    email: 'pixellabs@cloudcut.com',
    password: 'Pixel@123',
    role: 'user',
    status: 'active',
    createdAt: '2026-05-20T14:40:00.000Z',
    lastLogin: '2026-08-28T16:00:00.000Z'
  }
]

export function getAllUsers(): UserProfile[] {
  if (typeof window === 'undefined') return INITIAL_USERS
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS))
      return INITIAL_USERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS
  } catch {
    return INITIAL_USERS
  }
}

export function saveUsers(users: UserProfile[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (e) {
    console.error('Failed to save users registry:', e)
  }
}

export function getUserById(id: string): UserProfile | null {
  const users = getAllUsers()
  return users.find(u => u.id === id) || null
}

export function getUserByEmail(email: string): UserProfile | null {
  const users = getAllUsers()
  const cleanEmail = email.trim().toLowerCase()
  return users.find(u => u.email.toLowerCase() === cleanEmail) || null
}

export function authenticate(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
  const cleanEmail = email.trim().toLowerCase()
  const user = getUserByEmail(cleanEmail)

  if (!user) {
    return { success: false, error: 'No account found matching this email address.' }
  }

  if (user.status === 'disabled') {
    return { success: false, error: 'This account has been disabled by the administrator. Access denied.' }
  }

  if (user.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' }
  }

  // Update last login timestamp
  const now = new Date().toISOString()
  const updatedUser = { ...user, lastLogin: now }
  const users = getAllUsers().map(u => u.id === user.id ? updatedUser : u)
  saveUsers(users)

  // Save session
  setSessionUser(updatedUser)

  return { success: true, user: updatedUser }
}

export function getSessionUser(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSessionUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  } catch (e) {
    console.error('Failed to update session:', e)
  }
}

export function createUser(userData: {
  name: string
  companyName: string
  email: string
  password?: string
  status?: 'active' | 'disabled'
}): { success: boolean; user?: UserProfile; error?: string } {
  const cleanEmail = userData.email.trim().toLowerCase()
  const existing = getUserByEmail(cleanEmail)
  if (existing) {
    return { success: false, error: 'A customer with this email address already exists.' }
  }

  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    name: userData.name.trim(),
    companyName: userData.companyName.trim(),
    email: cleanEmail,
    password: userData.password || 'Cloud@123',
    role: 'user',
    status: userData.status || 'active',
    createdAt: new Date().toISOString()
  }

  const users = [...getAllUsers(), newUser]
  saveUsers(users)
  return { success: true, user: newUser }
}

export function updateUser(id: string, updates: Partial<UserProfile>): { success: boolean; user?: UserProfile; error?: string } {
  const users = getAllUsers()
  const idx = users.findIndex(u => u.id === id)
  if (idx === -1) {
    return { success: false, error: 'User not found.' }
  }

  // If email is changing, verify no duplicate
  if (updates.email && updates.email.toLowerCase() !== users[idx].email.toLowerCase()) {
    const emailConflict = users.some(u => u.id !== id && u.email.toLowerCase() === updates.email!.toLowerCase())
    if (emailConflict) {
      return { success: false, error: 'Another user is already registered with this email address.' }
    }
  }

  const updatedUser: UserProfile = {
    ...users[idx],
    ...updates,
    email: updates.email ? updates.email.trim().toLowerCase() : users[idx].email
  }

  users[idx] = updatedUser
  saveUsers(users)

  // If the updated user is currently logged in, sync session
  const currentSession = getSessionUser()
  if (currentSession && currentSession.id === id) {
    setSessionUser(updatedUser)
  }

  return { success: true, user: updatedUser }
}

export function toggleUserStatus(id: string): { success: boolean; user?: UserProfile; error?: string } {
  const user = getUserById(id)
  if (!user) return { success: false, error: 'User not found.' }
  if (user.role === 'admin') {
    return { success: false, error: 'Cannot disable the platform administrator account.' }
  }
  const nextStatus = user.status === 'active' ? 'disabled' : 'active'
  return updateUser(id, { status: nextStatus })
}

export function deleteUser(id: string): { success: boolean; error?: string } {
  const user = getUserById(id)
  if (!user) return { success: false, error: 'User not found.' }
  if (user.role === 'admin') {
    return { success: false, error: 'Cannot delete the platform administrator account.' }
  }

  const users = getAllUsers().filter(u => u.id !== id)
  saveUsers(users)

  // Clean up user dataset and user reports
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cloudcut_dataset_${id}`)
    }
  } catch {}

  return { success: true }
}

// Global Reports Registry (Admin can see reports generated by users)
export function getAllReports(): UserReportRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveReportRecord(report: UserReportRecord): void {
  if (typeof window === 'undefined') return
  try {
    const reports = getAllReports()
    const updated = [report, ...reports.filter(r => r.id !== report.id)]
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated.slice(0, 100)))
  } catch (e) {
    console.error('Failed to persist report record:', e)
  }
}

export function getReportsForUser(userId: string): UserReportRecord[] {
  const all = getAllReports()
  return all.filter(r => r.userId === userId)
}
