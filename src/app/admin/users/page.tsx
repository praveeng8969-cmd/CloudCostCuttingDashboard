'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, UserPlus, Search, Filter, ArrowUpDown,
  Edit2, Trash2, UserX, UserCheck, Eye,
  Shield, CheckCircle2, AlertTriangle, Building2, Mail, Lock
} from 'lucide-react'
import { useStorageData, CustomerSummaryItem } from '@/context/StorageDataContext'
import {
  createUser, updateUser, toggleUserStatus, deleteUser
} from '@/lib/services/authService'
import Modal from '@/components/ui/Modal'
import PageHeader from '@/components/layout/PageHeader'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminUsersPage() {
  const router = useRouter()
  const { getAllCustomerSummaries } = useStorageData()

  const [refreshTick, setRefreshTick] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all')
  const [sortBy, setSortBy] = useState<'cost' | 'savings' | 'storage' | 'newest'>('cost')

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [targetUser, setTargetUser] = useState<CustomerSummaryItem | null>(null)

  // Form states
  const [formName, setFormName] = useState('')
  const [formCompany, setFormCompany] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formStatus, setFormStatus] = useState<'active' | 'disabled'>('active')
  const [formError, setFormError] = useState('')

  // Live summaries across all customers
  const summaries = useMemo(() => {
    return getAllCustomerSummaries()
  }, [getAllCustomerSummaries, refreshTick])

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    return summaries
      .filter(c => {
        const matchesSearch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.companyName.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'cost') return b.currentMonthlyCost - a.currentMonthlyCost
        if (sortBy === 'savings') return b.potentialMonthlySavings - a.potentialMonthlySavings
        if (sortBy === 'storage') return b.totalStorageGB - a.totalStorageGB
        return b.id.localeCompare(a.id)
      })
  }, [summaries, search, statusFilter, sortBy])

  function handleOpenCreate() {
    setFormName('')
    setFormCompany('')
    setFormEmail('')
    setFormPassword('')
    setFormStatus('active')
    setFormError('')
    setCreateModalOpen(true)
  }

  function handleOpenEdit(user: CustomerSummaryItem) {
    setTargetUser(user)
    setFormName(user.name)
    setFormCompany(user.companyName)
    setFormEmail(user.email)
    setFormPassword('')
    setFormStatus(user.status)
    setFormError('')
    setEditModalOpen(true)
  }

  function handleOpenDelete(user: CustomerSummaryItem) {
    setTargetUser(user)
    setDeleteModalOpen(true)
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    const res = createUser({
      name: formName,
      companyName: formCompany,
      email: formEmail,
      password: formPassword,
      status: formStatus
    })

    if (res.success) {
      toast.success(`Created tenant for ${formCompany}`)
      setCreateModalOpen(false)
      setRefreshTick(t => t + 1)
    } else {
      setFormError(res.error || 'Failed to create customer.')
    }
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!targetUser) return
    setFormError('')

    const res = updateUser(targetUser.id, {
      name: formName,
      companyName: formCompany,
      status: formStatus,
      ...(formPassword.trim() ? { password: formPassword } : {})
    })

    if (res.success) {
      toast.success(`Updated tenant profile for ${formCompany}`)
      setEditModalOpen(false)
      setRefreshTick(t => t + 1)
    } else {
      setFormError(res.error || 'Failed to update customer.')
    }
  }

  function handleToggleStatus(user: CustomerSummaryItem) {
    const updated = toggleUserStatus(user.id)
    if (updated.success && updated.user) {
      toast.success(`${user.companyName} is now ${updated.user.status}.`)
      setRefreshTick(t => t + 1)
    }
  }

  function handleDeleteConfirm() {
    if (!targetUser) return
    const res = deleteUser(targetUser.id)
    if (res.success) {
      toast.success(`Tenant ${targetUser.companyName} deleted.`)
      setDeleteModalOpen(false)
      setRefreshTick(t => t + 1)
    } else {
      toast.error(res.error || 'Failed to delete customer.')
    }
  }

  return (
    <div className="space-y-6 w-full min-w-0 pb-12">
      <PageHeader
        title="Customer Directory"
        subtitle="Manage customer tenancies, access states, and inspect individual storage telemetry."
        badge={`${summaries.length} Total Customers`}
        actions={
          <button
            onClick={handleOpenCreate}
            className="btn-primary text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Provision New Customer
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company, contact, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 text-xs py-1.5 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="input text-xs py-1.5 w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="input text-xs py-1.5 w-auto"
            >
              <option value="cost">Sort: Spend (High → Low)</option>
              <option value="savings">Sort: Savings (High → Low)</option>
              <option value="storage">Sort: Storage Size</option>
              <option value="newest">Sort: Newest First</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Showing <strong>{filteredCustomers.length}</strong> customers</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-medium">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Storage</th>
                <th className="py-3 px-4 text-right">Monthly Spend</th>
                <th className="py-3 px-4 text-right">Potential Savings</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {c.companyName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {c.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className={clsx(
                      'inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium border',
                      c.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    {c.totalStorageGB >= 1000 ? `${(c.totalStorageGB / 1000).toFixed(2)} TB` : `${c.totalStorageGB} GB`}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">
                    ₹{c.currentMonthlyCost.toLocaleString('en-IN')}/mo
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                    ₹{c.potentialMonthlySavings.toLocaleString('en-IN')}/mo
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/users/${c.id}`}
                        className="btn-secondary py-1 px-2 text-xs"
                      >
                        Inspect
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={clsx(
                          'p-1 hover:bg-slate-100 rounded',
                          c.status === 'active' ? 'text-amber-600' : 'text-emerald-600'
                        )}
                        title={c.status === 'active' ? 'Disable Account' : 'Enable Account'}
                      >
                        {c.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleOpenDelete(c)}
                        className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                        title="Delete Tenant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CUSTOMER MODAL */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision New Customer Tenant"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {formError}
            </div>
          )}

          <div>
            <label className="label">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Software"
              value={formCompany}
              onChange={e => setFormCompany(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Primary Contact Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              required
              placeholder="jane@apex.com"
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Initial Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formPassword}
              onChange={e => setFormPassword(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Account Status</label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as any)}
              className="input"
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Provision Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT CUSTOMER MODAL */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Tenant: ${targetUser?.companyName}`}
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {formError}
            </div>
          )}

          <div>
            <label className="label">Company Name</label>
            <input
              type="text"
              required
              value={formCompany}
              onChange={e => setFormCompany(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Contact Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={e => setFormName(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Reset Password (leave empty to keep current)</label>
            <input
              type="password"
              placeholder="New password (optional)"
              value={formPassword}
              onChange={e => setFormPassword(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label">Account Status</label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as any)}
              className="input"
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Tenant Deletion"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteModalOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button onClick={handleDeleteConfirm} className="btn-danger text-xs">
              Delete Tenant
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Are you sure you want to permanently delete the tenant account for <strong>{targetUser?.companyName}</strong>?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            This will remove all associated user records and credentials from the platform.
          </div>
        </div>
      </Modal>
    </div>
  )
}
