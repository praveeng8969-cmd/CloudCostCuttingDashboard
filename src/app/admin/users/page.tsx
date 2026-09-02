'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, UserPlus, Search, Filter, ArrowUpDown,
  MoreVertical, Edit2, Trash2, UserX, UserCheck, Eye,
  Shield, CheckCircle2, AlertTriangle, Building2, Mail, Lock,
  Clock, DollarSign, HardDrive
} from 'lucide-react'
import { useStorageData, CustomerSummaryItem } from '@/context/StorageDataContext'
import {
  createUser, updateUser, toggleUserStatus, deleteUser,
  getAllUsers
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

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (!formName || !formCompany || !formEmail) {
      setFormError('Please fill in all required customer fields.')
      return
    }

    const res = createUser({
      name: formName,
      companyName: formCompany,
      email: formEmail,
      password: formPassword || 'Cloud@123',
      status: formStatus
    })

    if (res.success && res.user) {
      toast.success(`Customer ${res.user.companyName} created successfully!`)
      setCreateModalOpen(false)
      setRefreshTick(t => t + 1)
    } else {
      setFormError(res.error || 'Failed to create customer.')
    }
  }

  function handleOpenEdit(cust: CustomerSummaryItem) {
    setTargetUser(cust)
    setFormName(cust.name)
    setFormCompany(cust.companyName)
    setFormEmail(cust.email)
    setFormStatus(cust.status)
    setFormError('')
    setEditModalOpen(true)
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!targetUser) return
    setFormError('')

    const res = updateUser(targetUser.id, {
      name: formName,
      companyName: formCompany,
      email: formEmail,
      status: formStatus
    })

    if (res.success) {
      toast.success('Customer details updated successfully!')
      setEditModalOpen(false)
      setRefreshTick(t => t + 1)
    } else {
      setFormError(res.error || 'Failed to update customer.')
    }
  }

  function handleToggleStatus(cust: CustomerSummaryItem) {
    const res = toggleUserStatus(cust.id)
    if (res.success) {
      toast.success(`Customer status updated to ${res.user?.status.toUpperCase()}`)
      setRefreshTick(t => t + 1)
    } else {
      toast.error(res.error || 'Status change failed')
    }
  }

  function handleOpenDelete(cust: CustomerSummaryItem) {
    setTargetUser(cust)
    setDeleteModalOpen(true)
  }

  function handleDeleteConfirm() {
    if (!targetUser) return
    const res = deleteUser(targetUser.id)
    if (res.success) {
      toast.success(`Customer ${targetUser.companyName} removed. Isolated dataset cleared.`)
      setDeleteModalOpen(false)
      setRefreshTick(t => t + 1)
    } else {
      toast.error(res.error || 'Failed to delete customer')
    }
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Customer Account Management"
          subtitle="Provision new customer tenants, manage access status, inspect isolated data, and monitor monthly spend."
          badge={`${summaries.length} Registered Tenants`}
        />

        <button
          onClick={handleOpenCreate}
          className="btn-primary py-2.5 px-4 text-xs font-black flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-purple-600/30"
        >
          <UserPlus className="w-4 h-4" />
          Provision Customer Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, company, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 text-xs w-full"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold">Status:</span>
            {(['all', 'active', 'disabled'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg font-bold capitalize transition-colors',
                  statusFilter === st
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                )}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="cost">Highest Cost</option>
              <option value="savings">Highest Savings</option>
              <option value="storage">Largest Storage</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Accounts Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3.5 px-4">Customer & Company</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Total Storage</th>
                <th className="py-3.5 px-4">Estimated Cost</th>
                <th className="py-3.5 px-4">Potential Savings</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No customers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-900/40 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-300 font-black flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                          {cust.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white group-hover:text-purple-300 transition-colors">
                            {cust.companyName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {cust.name} • <span className="font-mono">{cust.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-[10px] font-black uppercase border',
                        cust.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      )}>
                        {cust.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-cyan-300">
                        {cust.totalStorageGB >= 1000
                          ? `${(cust.totalStorageGB / 1000).toFixed(2)} TB`
                          : `${cust.totalStorageGB} GB`}
                      </span>
                      <p className="text-[10px] text-slate-400">{cust.totalObjects} objects</p>
                    </td>

                    <td className="py-4 px-4 font-black text-white">
                      ₹{cust.currentMonthlyCost.toLocaleString('en-IN')}
                      <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                    </td>

                    <td className="py-4 px-4 font-black text-emerald-400">
                      ₹{cust.potentialMonthlySavings.toLocaleString('en-IN')}
                      <span className="text-[10px] text-slate-400 font-normal"> /mo</span>
                    </td>

                    <td className="py-4 px-4 text-slate-400 text-[11px]">
                      {new Date(cust.lastActivity).toLocaleDateString('en-GB')}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => router.push(`/admin/users/${cust.id}`)}
                          title="Inspect Workspace"
                          className="p-1.5 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(cust)}
                          title="Edit Customer"
                          className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(cust)}
                          title={cust.status === 'active' ? 'Disable Account' : 'Enable Account'}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors',
                            cust.status === 'active'
                              ? 'bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white'
                              : 'bg-emerald-950/60 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                          )}
                        >
                          {cust.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleOpenDelete(cust)}
                          title="Delete Customer"
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2 text-xs">
          {formError && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 font-bold">
              {formError}
            </div>
          )}

          <div>
            <label className="label">Contact Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Jordan Miller"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Company Name *</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Apex Dataworks Inc."
              value={formCompany}
              onChange={e => setFormCompany(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Login Email *</label>
            <input
              type="email"
              className="input"
              placeholder="jordan@apexdata.com"
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Initial Password</label>
            <input
              type="password"
              className="input"
              placeholder="Leave blank for default: Cloud@123"
              value={formPassword}
              onChange={e => setFormPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Account Status</label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as any)}
              className="input cursor-pointer"
            >
              <option value="active">Active (Permits Immediate Login)</option>
              <option value="disabled">Disabled (Blocks Login Access)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Provision Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT CUSTOMER MODAL */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Customer: ${targetUser?.companyName}`}
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 py-2 text-xs">
          {formError && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 font-bold">
              {formError}
            </div>
          )}

          <div>
            <label className="label">Contact Name *</label>
            <input
              type="text"
              className="input"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Company Name *</label>
            <input
              type="text"
              className="input"
              value={formCompany}
              onChange={e => setFormCompany(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Login Email *</label>
            <input
              type="email"
              className="input"
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Account Status</label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as any)}
              className="input cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Customer Tenant Deletion"
        size="sm"
      >
        <div className="py-3 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-950 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">Delete {targetUser?.companyName}?</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to delete this customer account? Their isolated storage dataset, telemetry, and reports will be permanently purged.
          </p>
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="btn-secondary flex-1 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="btn-danger flex-1 text-xs font-bold"
            >
              Yes, Delete Tenant
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
