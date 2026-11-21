import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import {
  CloseIcon,
  EyeIcon,
  MailIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/common/Icons'
import { enquiryService } from '../../services/enquiryService'

const INQUIRY_TYPES = [
  'All',
  'General Inquiry',
  'Product Purchase',
  'Computer & Laptop Rental',
  'Bulk & Corporate Orders',
  'Technical Support',
  'Warranty & Repair',
  'Custom PC Build',
  'Other',
]

const STATUS_CONFIG = {
  New: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  'In Progress': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  Resolved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Archived: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
}

const AVATAR_COLORS = [
  ['#fee2e2', '#dc2626'],
  ['#dbeafe', '#1d4ed8'],
  ['#dcfce7', '#16a34a'],
  ['#fef3c7', '#d97706'],
  ['#f3e8ff', '#7c3aed'],
  ['#fce7f3', '#be185d'],
  ['#e0f2fe', '#0369a1'],
]

function getAvatarColors(name) {
  let hash = 0
  for (let i = 0; i < (name || '').length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
  return (name || 'Lead')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export default function Enquiries({ globalSearch = '' }) {
  const [enquiries, setEnquiries] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    newCount: 0,
    inProgressCount: 0,
    resolvedCount: 0,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 15,
  })

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedType, setSelectedType] = useState('All')

  // Modals & Dialog state
  const [activeEnquiry, setActiveEnquiry] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNotes, setEditingNotes] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Combined search term
  const effectiveSearch = searchQuery || globalSearch

  const fetchEnquiries = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        const res = await enquiryService.getAll({
          page,
          limit: pagination.pageSize,
          search: effectiveSearch,
          status: selectedStatus,
          inquiryType: selectedType,
        })

        if (res?.data) {
          const list = res.data.enquiries || []
          setEnquiries(list)
          if (res.data.stats) {
            setStats(res.data.stats)
          }
          if (res.data.pagination) {
            setPagination((prev) => ({
              ...prev,
              currentPage: res.data.pagination.currentPage,
              totalPages: res.data.pagination.totalPages,
              totalCount: res.data.pagination.totalCount,
            }))
          }
        }
      } catch (err) {
        showToast(err.message || 'Failed to fetch inquiries', 'error')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [pagination.pageSize, effectiveSearch, selectedStatus, selectedType]
  )

  useEffect(() => {
    fetchEnquiries(1)
  }, [fetchEnquiries])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchEnquiries(pagination.currentPage)
  }

  // Quick status update
  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      setUpdatingStatus(true)
      const res = await enquiryService.update(enquiryId, { status: newStatus })
      const updated = res?.data

      setEnquiries((prev) =>
        prev.map((e) => (e._id === enquiryId ? { ...e, status: newStatus } : e))
      )
      if (activeEnquiry && activeEnquiry._id === enquiryId) {
        setActiveEnquiry((prev) => ({ ...prev, status: newStatus }))
      }

      // Re-fetch stats in background
      enquiryService.getAll({ limit: 1 }).then((r) => {
        if (r?.data?.stats) setStats(r.data.stats)
      })

      showToast(`Status updated to "${newStatus}".`)
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Save admin internal notes
  const handleSaveNotes = async () => {
    if (!activeEnquiry) return
    try {
      setSavingNotes(true)
      await enquiryService.update(activeEnquiry._id, {
        adminNotes: editingNotes,
      })
      setActiveEnquiry((prev) => ({ ...prev, adminNotes: editingNotes }))
      setEnquiries((prev) =>
        prev.map((e) =>
          e._id === activeEnquiry._id ? { ...e, adminNotes: editingNotes } : e
        )
      )
      showToast('Admin notes saved.')
    } catch (err) {
      showToast(err.message || 'Failed to save notes', 'error')
    } finally {
      setSavingNotes(false)
    }
  }

  // Delete enquiry
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await enquiryService.delete(deleteTarget._id)
      setEnquiries((prev) => prev.filter((e) => e._id !== deleteTarget._id))
      setPagination((prev) => ({
        ...prev,
        totalCount: Math.max(0, prev.totalCount - 1),
      }))
      if (activeEnquiry?._id === deleteTarget._id) {
        setModalOpen(false)
        setActiveEnquiry(null)
      }
      setDeleteTarget(null)
      showToast('Enquiry deleted successfully.')

      // Update KPIs
      enquiryService.getAll({ limit: 1 }).then((r) => {
        if (r?.data?.stats) setStats(r.data.stats)
      })
    } catch (err) {
      showToast(err.message || 'Failed to delete enquiry', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const openDetailsModal = (enquiry) => {
    setActiveEnquiry(enquiry)
    setEditingNotes(enquiry.adminNotes || '')
    setModalOpen(true)
  }

  // Export CSV
  const handleExportCsv = () => {
    if (!enquiries.length) {
      showToast('No enquiries to export', 'error')
      return
    }

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Inquiry Type',
      'Subject',
      'Message',
      'Status',
      'Admin Notes',
      'Created Date',
    ]

    const rows = enquiries.map((e) => [
      `"${e.fullName || ''}"`,
      `"${e.email || ''}"`,
      `"${e.phone || ''}"`,
      `"${e.inquiryType || ''}"`,
      `"${(e.subject || '').replace(/"/g, '""')}"`,
      `"${(e.message || '').replace(/"/g, '""')}"`,
      `"${e.status || ''}"`,
      `"${(e.adminNotes || '').replace(/"/g, '""')}"`,
      `"${e.createdAt ? new Date(e.createdAt).toLocaleString('en-IN') : ''}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `prestige-computers-enquiries-${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[13px] font-medium shadow-lg animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
              Enquiries &amp; Customer Leads
            </h1>
            {stats.newCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dc1414] text-white">
                {stats.newCount} New
              </span>
            )}
          </div>
          <p className="text-[12.5px] sm:text-[13px] text-[#6b7280] mt-0.5">
            Manage incoming contact inquiries, bulk order leads, and rental requests from your website.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-[#f9fafb] active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
            title="Refresh list"
          >
            <svg
              className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#dc1414]' : 'text-[#6b7280]'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-[#f9fafb] active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
          >
            <svg
              className="w-3.5 h-3.5 text-[#6b7280]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-[#e6e8ee] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#6b7280] text-[12px] font-medium">
            <span>Total Inquiries</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#111827]">
              {stats.total || pagination.totalCount}
            </span>
            <span className="text-[11.5px] text-[#6b7280]">All time</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-red-200/80 p-4 shadow-2xs bg-gradient-to-br from-white to-red-50/20">
          <div className="flex items-center justify-between text-[#dc1414] text-[12px] font-medium">
            <span className="font-semibold">New / Unread</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#dc1414]" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#dc1414]">
              {stats.newCount}
            </span>
            <span className="text-[11.5px] text-red-600 font-medium">Needs Attention</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-amber-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-[12px] font-medium">
            <span>In Progress</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#111827]">
              {stats.inProgressCount}
            </span>
            <span className="text-[11.5px] text-amber-700 font-medium">Being Handled</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-[12px] font-medium">
            <span>Resolved</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-emerald-700">
              {stats.resolvedCount}
            </span>
            <span className="text-[11.5px] text-emerald-600">Completed</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#e6e8ee] shadow-2xs overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-[#f1f3f7] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['All', 'New', 'In Progress', 'Resolved', 'Archived'].map((status) => {
              const count =
                status === 'All'
                  ? stats.total
                  : status === 'New'
                  ? stats.newCount
                  : status === 'In Progress'
                  ? stats.inProgressCount
                  : status === 'Resolved'
                  ? stats.resolvedCount
                  : stats.archivedCount
              const isActive = selectedStatus === status
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#111827] text-white shadow-xs'
                      : 'text-[#4b5563] hover:bg-[#f3f4f6]'
                  }`}
                >
                  <span>{status}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : status === 'New'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right Filters: Type & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#e5e7eb] bg-white text-[12.5px] text-[#374151] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] cursor-pointer"
            >
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[12.5px] text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] transition-all"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                <SearchIcon className="w-3.5 h-3.5" />
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#f1f3f7] bg-[#fbfcfd] text-[#6b7280] text-[11.5px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Inquiry Type &amp; Subject</th>
                <th className="py-3 px-4">Message Preview</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f1f3f7] text-[#1f2937]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#6b7280]">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-[#dc1414] border-t-transparent animate-spin" />
                      <span>Loading inquiries...</span>
                    </div>
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-14 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#9ca3af] mb-3">
                        <MailIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-[14px] font-semibold text-[#111827]">
                        No enquiries found
                      </h3>
                      <p className="text-[12.5px] text-[#6b7280] mt-1">
                        {searchQuery || selectedStatus !== 'All' || selectedType !== 'All'
                          ? 'Try adjusting your search or filters.'
                          : 'Customer contact messages will appear here once submitted on the website.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                enquiries.map((enquiry) => {
                  const [avatarBg, avatarText] = getAvatarColors(enquiry.fullName)
                  const initials = getInitials(enquiry.fullName)
                  const statusMeta = STATUS_CONFIG[enquiry.status] || STATUS_CONFIG.New

                  const dateStr = enquiry.createdAt
                    ? new Date(enquiry.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'
                  const timeStr = enquiry.createdAt
                    ? new Date(enquiry.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''

                  return (
                    <tr
                      key={enquiry._id}
                      className="hover:bg-[#fafafa] transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div
                            style={{ backgroundColor: avatarBg, color: avatarText }}
                            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 border border-black/5"
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[#111827] flex items-center gap-1.5 truncate">
                              <span>{enquiry.fullName}</span>
                              {enquiry.status === 'New' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#dc1414] shrink-0" />
                              )}
                            </div>
                            <div className="text-[12px] text-[#6b7280] truncate">
                              <a
                                href={`mailto:${enquiry.email}`}
                                className="hover:text-[#dc1414] hover:underline"
                              >
                                {enquiry.email}
                              </a>
                            </div>
                            <div className="text-[11px] text-[#9ca3af]">
                              <a
                                href={`tel:${enquiry.phone}`}
                                className="hover:text-[#111827]"
                              >
                                {enquiry.phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Subject */}
                      <td className="py-3.5 px-4 min-w-[190px]">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb] mb-1">
                          {enquiry.inquiryType || 'General Inquiry'}
                        </span>
                        <div className="font-medium text-[#111827] line-clamp-1">
                          {enquiry.subject}
                        </div>
                      </td>

                      {/* Message Preview */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <p className="text-[12.5px] text-[#4b5563] line-clamp-2 leading-relaxed">
                          {enquiry.message}
                        </p>
                        {enquiry.adminNotes && (
                          <div className="mt-1 text-[11px] text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60 inline-flex items-center gap-1">
                            <span>📝 Note:</span>
                            <span className="truncate max-w-[180px]">{enquiry.adminNotes}</span>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#6b7280] text-[12px] whitespace-nowrap">
                        <div className="font-medium text-[#374151]">{dateStr}</div>
                        <div className="text-[11px] text-[#9ca3af]">{timeStr}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={enquiry.status}
                          disabled={updatingStatus}
                          onChange={(e) => handleStatusChange(enquiry._id, e.target.value)}
                          className={`text-[11.5px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer transition-all ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                        >
                          <option value="New">● New</option>
                          <option value="In Progress">● In Progress</option>
                          <option value="Resolved">● Resolved</option>
                          <option value="Archived">● Archived</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openDetailsModal(enquiry)}
                            className="p-1.5 rounded-lg text-[#4b5563] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                            title="View Full Details &amp; Notes"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>

                          <a
                            href={`mailto:${enquiry.email}?subject=Re: ${encodeURIComponent(
                              enquiry.subject || 'Your Inquiry at Prestige Computers'
                            )}&body=Dear ${encodeURIComponent(enquiry.fullName)},\n\nThank you for reaching out to Prestige Computers.`}
                            className="p-1.5 rounded-lg text-[#4b5563] hover:text-[#dc1414] hover:bg-red-50 transition-colors"
                            title="Reply via Email"
                          >
                            <MailIcon className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(enquiry)}
                            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Enquiry"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalCount > 0 && (
          <div className="p-4 border-t border-[#f1f3f7]">
            <Pagination
              currentPage={pagination.currentPage}
              totalItems={pagination.totalCount}
              pageSize={pagination.pageSize}
              onPageChange={(page) => fetchEnquiries(page)}
              itemName="enquiries"
            />
          </div>
        )}
      </div>

      {/* View & Respond Details Modal */}
      {modalOpen && activeEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#f3f4f6]">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#dc1414]/10 text-[#dc1414] border border-[#dc1414]/20 mb-1.5">
                  {activeEnquiry.inquiryType || 'General Inquiry'}
                </span>
                <h2 className="text-[18px] font-bold text-[#111827] leading-tight">
                  {activeEnquiry.subject}
                </h2>
                <p className="text-[12px] text-[#6b7280] mt-1">
                  Received on{' '}
                  {activeEnquiry.createdAt
                    ? new Date(activeEnquiry.createdAt).toLocaleString('en-IN')
                    : 'N/A'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#111827] hover:bg-[#f3f4f6] cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Contact Details Card */}
            <div className="mt-4 p-4 rounded-xl bg-[#f9fafb] border border-[#e5e7eb] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12.5px]">
              <div>
                <span className="block text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide">
                  Customer Name
                </span>
                <span className="font-bold text-[#111827] mt-0.5 block">
                  {activeEnquiry.fullName}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide">
                  Email
                </span>
                <a
                  href={`mailto:${activeEnquiry.email}`}
                  className="font-medium text-[#dc1414] hover:underline mt-0.5 block truncate"
                >
                  {activeEnquiry.email}
                </a>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-[#6b7280] uppercase tracking-wide">
                  Phone Number
                </span>
                <a
                  href={`tel:${activeEnquiry.phone}`}
                  className="font-medium text-[#111827] hover:text-[#dc1414] mt-0.5 block"
                >
                  {activeEnquiry.phone}
                </a>
              </div>
            </div>

            {/* Inquiry Message Body */}
            <div className="mt-5">
              <label className="block text-[12px] font-semibold text-[#374151] uppercase tracking-wide mb-1.5">
                Message Body
              </label>
              <div className="p-4 rounded-xl bg-white border border-[#e5e7eb] text-[13px] text-[#1f2937] leading-relaxed whitespace-pre-wrap">
                {activeEnquiry.message}
              </div>
            </div>

            {/* Status & Response Management */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                  Update Lead Status
                </label>
                <select
                  value={activeEnquiry.status}
                  onChange={(e) => handleStatusChange(activeEnquiry._id, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#d1d5db] bg-white text-[13px] font-medium text-[#111827] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] cursor-pointer"
                >
                  <option value="New">● New (Needs Attention)</option>
                  <option value="In Progress">● In Progress (Contacted)</option>
                  <option value="Resolved">● Resolved (Closed Deal / Answered)</option>
                  <option value="Archived">● Archived</option>
                </select>
              </div>

              <div className="sm:text-right pt-2 sm:pt-4">
                <a
                  href={`mailto:${activeEnquiry.email}?subject=Re: ${encodeURIComponent(
                    activeEnquiry.subject
                  )}&body=Dear ${encodeURIComponent(activeEnquiry.fullName)},\n\n`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e11414] to-[#b80808] hover:from-[#eb1a1a] hover:to-[#9f0606] text-white text-[12.5px] font-bold shadow-md cursor-pointer transition-all"
                >
                  <MailIcon className="w-4 h-4" />
                  <span>Send Direct Email Reply</span>
                </a>
              </div>
            </div>

            {/* Admin Internal Notes */}
            <div className="mt-5 pt-4 border-t border-[#f3f4f6]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-semibold text-[#374151]">
                  Internal Admin Follow-up Notes
                </label>
                <span className="text-[11px] text-[#9ca3af]">
                  Only visible to admin staff
                </span>
              </div>
              <textarea
                rows={3}
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                placeholder="e.g. Called customer on 21 Nov, offered Dell Inspiron quote at ₹48,000..."
                className="w-full p-3 rounded-xl border border-[#d1d5db] text-[13px] text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] transition-all resize-y"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-3.5 py-1.5 rounded-lg bg-[#111827] hover:bg-black text-white text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Customer Enquiry?"
        message={`Are you sure you want to delete the enquiry from "${deleteTarget?.fullName}"? This action cannot be undone.`}
        confirmText="Yes, Delete Enquiry"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
