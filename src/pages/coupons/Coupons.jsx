import { useCallback, useEffect, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import {
  CloseIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TagIcon,
  TrashIcon,
} from '../../components/common/Icons'
import { couponService } from '../../services/couponService'

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Percentage (%)', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'flat', label: 'Flat Discount (₹)', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'free_shipping', label: 'Free Shipping', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
]

const INITIAL_FORM = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscountAmount: '',
  startDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  usageLimit: '',
  isActive: true,
}

export default function Coupons({ globalSearch = '' }) {
  const [coupons, setCoupons] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    activeCount: 0,
    inactiveCount: 0,
    expiredCount: 0,
    totalRedemptions: 0,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 12,
  })

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedType, setSelectedType] = useState('All')

  // Modals & form state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Delete & status toggle state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [copiedCode, setCopiedCode] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const effectiveSearch = searchQuery || globalSearch

  const fetchCoupons = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        const res = await couponService.getAll({
          page,
          limit: pagination.pageSize,
          search: effectiveSearch,
          status: selectedStatus,
          type: selectedType,
        })

        if (res?.data) {
          setCoupons(res.data.coupons || [])
          if (res.data.stats) setStats(res.data.stats)
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
        showToast(err.message || 'Failed to fetch coupons', 'error')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [pagination.pageSize, effectiveSearch, selectedStatus, selectedType]
  )

  useEffect(() => {
    fetchCoupons(1)
  }, [fetchCoupons])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCoupons(pagination.currentPage)
  }

  // Copy coupon code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(''), 2000)
    showToast(`Code "${code}" copied to clipboard!`)
  }

  // Toggle active status
  const handleToggleStatus = async (coupon) => {
    try {
      setTogglingId(coupon._id)
      const res = await couponService.toggleStatus(coupon._id)
      const nextActive = res?.data?.isActive ?? !coupon.isActive

      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: nextActive } : c))
      )
      showToast(`Coupon "${coupon.code}" ${nextActive ? 'activated' : 'disabled'}.`)

      // Refresh stats
      couponService.getAll({ limit: 1 }).then((r) => {
        if (r?.data?.stats) setStats(r.data.stats)
      })
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCoupon(null)
    setFormData(INITIAL_FORM)
    setFormError('')
    setModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive !== false,
    })
    setFormError('')
    setModalOpen(true)
  }

  // Submit Create or Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.code.trim()) {
      setFormError('Please enter a coupon code.')
      return
    }
    if (!formData.description.trim()) {
      setFormError('Please enter a description for this coupon.')
      return
    }
    if (formData.discountValue === '' || Number(formData.discountValue) < 0) {
      setFormError('Please enter a valid discount value.')
      return
    }
    if (
      formData.discountType === 'percentage' &&
      (Number(formData.discountValue) <= 0 || Number(formData.discountValue) > 100)
    ) {
      setFormError('Percentage discount must be between 1% and 100%.')
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        isActive: Boolean(formData.isActive),
      }

      if (editingCoupon) {
        await couponService.update(editingCoupon._id, payload)
        showToast(`Coupon "${payload.code}" updated successfully!`)
      } else {
        await couponService.create(payload)
        showToast(`New coupon "${payload.code}" created successfully!`)
      }

      setModalOpen(false)
      fetchCoupons(pagination.currentPage)
    } catch (err) {
      setFormError(err.message || 'Failed to save coupon.')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete Coupon
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await couponService.delete(deleteTarget._id)
      setCoupons((prev) => prev.filter((c) => c._id !== deleteTarget._id))
      setPagination((prev) => ({
        ...prev,
        totalCount: Math.max(0, prev.totalCount - 1),
      }))
      setDeleteTarget(null)
      showToast(`Coupon "${deleteTarget.code}" deleted permanently.`)

      couponService.getAll({ limit: 1 }).then((r) => {
        if (r?.data?.stats) setStats(r.data.stats)
      })
    } catch (err) {
      showToast(err.message || 'Failed to delete coupon', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  // Export CSV
  const handleExportCsv = () => {
    if (!coupons.length) {
      showToast('No coupons to export', 'error')
      return
    }

    const headers = [
      'Code',
      'Description',
      'Type',
      'Discount Value',
      'Min Order (INR)',
      'Max Cap (INR)',
      'Used Count',
      'Usage Limit',
      'Status',
      'Expiry Date',
    ]

    const rows = coupons.map((c) => [
      `"${c.code}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      c.discountType,
      c.discountType === 'percentage' ? `${c.discountValue}%` : `INR ${c.discountValue}`,
      c.minOrderAmount || 0,
      c.maxDiscountAmount || 'N/A',
      c.usedCount || 0,
      c.usageLimit || 'Unlimited',
      c.isActive ? 'Active' : 'Disabled',
      c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN') : 'No Expiry',
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `prestige-computers-coupons-${new Date().toISOString().split('T')[0]}.csv`
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

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
              Coupons &amp; Promotional Discounts
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dc1414] text-white">
              {stats.activeCount} Active
            </span>
          </div>
          <p className="text-[12.5px] sm:text-[13px] text-[#6b7280] mt-0.5">
            Configure promotional codes, percentage discounts, flat cashbacks, and free shipping vouchers for checkout.
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
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#e11414] to-[#b80808] hover:from-[#eb1a1a] hover:to-[#9f0606] text-white text-[12.5px] font-bold shadow-sm transition-all cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl border border-[#e6e8ee] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#6b7280] text-[12px] font-medium">
            <span>Total Coupons</span>
            <TagIcon className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#111827]">
              {stats.total || pagination.totalCount}
            </span>
            <span className="text-[11.5px] text-[#6b7280]">Campaigns</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200/80 p-4 shadow-2xs bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 text-[12px] font-medium">
            <span className="font-semibold">Live &amp; Active</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-emerald-700">
              {stats.activeCount}
            </span>
            <span className="text-[11.5px] text-emerald-600 font-medium">Redeemable</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-purple-700 text-[12px] font-medium">
            <span>Total Redemptions</span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#111827]">
              {stats.totalRedemptions}
            </span>
            <span className="text-[11.5px] text-purple-600 font-medium">Times Used</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[#6b7280] text-[12px] font-medium">
            <span>Expired / Disabled</span>
            <span className="w-2 h-2 rounded-full bg-gray-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#374151]">
              {stats.expiredCount + stats.inactiveCount}
            </span>
            <span className="text-[11.5px] text-[#6b7280]">Archived</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#e6e8ee] shadow-2xs overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-[#f1f3f7] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['All', 'Active', 'Inactive', 'Expired'].map((status) => {
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
                </button>
              )
            })}
          </div>

          {/* Right Filters: Discount Type & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#e5e7eb] bg-white text-[12.5px] text-[#374151] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] cursor-pointer"
            >
              <option value="All">All Discount Types</option>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Discount (₹)</option>
              <option value="free_shipping">Free Shipping</option>
            </select>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search coupon code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[12.5px] text-[#111827] placeholder-[#9ca3af] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] transition-all uppercase"
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
                <th className="py-3 px-4">Coupon Code &amp; Offer</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Spend / Cap</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f1f3f7] text-[#1f2937]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#6b7280]">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-[#dc1414] border-t-transparent animate-spin" />
                      <span>Loading coupons...</span>
                    </div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#9ca3af] mb-3">
                        <TagIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-[14px] font-semibold text-[#111827]">
                        No coupons found
                      </h3>
                      <p className="text-[12.5px] text-[#6b7280] mt-1">
                        {searchQuery || selectedStatus !== 'All' || selectedType !== 'All'
                          ? 'Try adjusting your search or filters.'
                          : 'Click "Create Coupon" above to launch a new promotional discount.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const now = new Date()
                  const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < now
                  const isStarted = !coupon.startDate || new Date(coupon.startDate) <= now
                  const usagePct = coupon.usageLimit
                    ? Math.min(100, Math.round(((coupon.usedCount || 0) / coupon.usageLimit) * 100))
                    : null

                  return (
                    <tr
                      key={coupon._id}
                      className="hover:bg-[#fafafa] transition-colors group"
                    >
                      {/* Code & Description */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200/80 text-[#dc1414] font-mono font-bold text-[12.5px] tracking-wider hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                            title="Click to copy code"
                          >
                            <span>{coupon.code}</span>
                            <span className="text-[10px] text-red-500 font-sans">
                              {copiedCode === coupon.code ? '✓' : '⧉'}
                            </span>
                          </button>
                        </div>
                        <p className="text-[12px] text-[#4b5563] mt-1 line-clamp-1">
                          {coupon.description}
                        </p>
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {coupon.discountType === 'percentage' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {coupon.discountValue}% OFF
                          </span>
                        ) : coupon.discountType === 'free_shipping' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            FREE SHIPPING
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            ₹{Number(coupon.discountValue).toLocaleString('en-IN')} OFF
                          </span>
                        )}
                      </td>

                      {/* Min Spend / Cap */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[12px] text-[#4b5563]">
                        <div>
                          Min. Spend:{' '}
                          <span className="font-semibold text-[#111827]">
                            {coupon.minOrderAmount
                              ? `₹${coupon.minOrderAmount.toLocaleString('en-IN')}`
                              : 'No Min.'}
                          </span>
                        </div>
                        {coupon.discountType === 'percentage' && (
                          <div className="text-[11px] text-[#6b7280]">
                            Max Cap:{' '}
                            <span className="font-medium text-[#374151]">
                              {coupon.maxDiscountAmount
                                ? `₹${coupon.maxDiscountAmount.toLocaleString('en-IN')}`
                                : 'No Cap'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Redemptions Progress */}
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-[11.5px] mb-1">
                          <span className="font-bold text-[#111827]">
                            {coupon.usedCount || 0} used
                          </span>
                          <span className="text-[#6b7280]">
                            {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'unlimited'}
                          </span>
                        </div>
                        {usagePct !== null && (
                          <div className="w-full bg-[#f1f3f7] rounded-full h-1.5 overflow-hidden">
                            <div
                              style={{ width: `${usagePct}%` }}
                              className={`h-full rounded-full ${
                                usagePct >= 90 ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                        )}
                      </td>

                      {/* Validity */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[12px]">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-[11.5px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Expired
                          </span>
                        ) : coupon.expiryDate ? (
                          <div>
                            <span className="font-medium text-[#111827]">
                              {new Date(coupon.expiryDate).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="block text-[11px] text-[#6b7280]">
                              Until 11:59 PM
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-medium text-[11.5px]">
                            Never Expires
                          </span>
                        )}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={coupon.isActive}
                          disabled={togglingId === coupon._id || isExpired}
                          onClick={() => handleToggleStatus(coupon)}
                          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer disabled:opacity-50 ${
                            coupon.isActive && !isExpired ? 'bg-[#dc1414]' : 'bg-[#d1d5db]'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
                              coupon.isActive && !isExpired ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 rounded-lg text-[#4b5563] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                            title="Edit Coupon"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(coupon)}
                            className="p-1.5 rounded-lg text-[#9ca3af] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete Coupon"
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
              onPageChange={(page) => fetchCoupons(page)}
              itemName="coupons"
            />
          </div>
        )}
      </div>

      {/* Create / Edit Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-[2px] animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#e5e7eb] max-w-xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#f3f4f6]">
              <div>
                <h2 className="text-[18px] font-bold text-[#111827] leading-tight">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
                </h2>
                <p className="text-[12px] text-[#6b7280] mt-0.5">
                  Configure discount rules, cart thresholds and usage limits.
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

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px] font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              {/* Row 1: Code & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1">
                    Coupon Code <span className="text-[#dc1414]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''),
                      }))
                    }
                    placeholder="e.g. DIWALI2026"
                    className="w-full px-3 py-2 rounded-xl border border-[#d1d5db] font-mono font-bold text-[13px] text-[#111827] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1">
                    Coupon Status
                  </label>
                  <div className="flex items-center gap-3 py-1.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.isActive}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer ${
                        formData.isActive ? 'bg-[#dc1414]' : 'bg-[#d1d5db]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
                          formData.isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-[12.5px] font-medium text-[#374151]">
                      {formData.isActive ? 'Active (Live at Checkout)' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Description */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#374151] mb-1">
                  Description / Customer Offer Note <span className="text-[#dc1414]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="e.g. 10% instant discount on orders above ₹10,000"
                  className="w-full px-3 py-2 rounded-xl border border-[#d1d5db] text-[13px] text-[#111827] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414]"
                />
              </div>

              {/* Row 3: Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, discountType: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#d1d5db] bg-white text-[13px] text-[#111827] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] cursor-pointer"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="flat">Flat Cash Discount (₹)</option>
                    <option value="free_shipping">100% Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1">
                    {formData.discountType === 'percentage'
                      ? 'Discount Percentage (%)'
                      : formData.discountType === 'flat'
                      ? 'Flat Amount (₹)'
                      : 'Free Shipping Value'}
                    <span className="text-[#dc1414]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    disabled={formData.discountType === 'free_shipping'}
                    value={formData.discountType === 'free_shipping' ? 0 : formData.discountValue}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, discountValue: e.target.value }))
                    }
                    placeholder={formData.discountType === 'percentage' ? '10' : '1000'}
                    className="w-full px-3 py-2 rounded-xl border border-[#d1d5db] text-[13px] text-[#111827] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Row 4: Minimum Spend & Maximum Discount Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1">
                    Minimum Cart Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, minOrderAmount: e.target.value }))
                    }
                    placeholder="0 (No minimum)"
                    className="w-full px-3 py-2 rounded-xl border border-[#d1d5db] text-[13px] text-[#111827] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414]"
                  />
                  <p className="text-[11px] text-[#6b7280] mt-0.5">
                    Order must be at least this value to apply.
                  </p>
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={formData.discountType !== 'percentage'}
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, maxDiscountAmount: e.target.value }))
                    }
                    placeholder="e.g. 5000 (Optional)"
                    className="w-full px-3 py-2 rounded-xl border border-[#d1d5db] text-[13px] text-[#111827] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414] disabled:bg-gray-100"
                  />
                  <p className="text-[11px] text-[#6b7280] mt-0.5">
                    Caps maximum savings for % discounts.
                  </p>
                </div>
              </div>

              {/* Row 5: Usage Limit & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1">
                    Global Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))
                    }
                    placeholder="e.g. 500 (Blank = Unlimited)"
                    className="w-full px-3 py-2 rounded-xl border border-[#d1d5db] text-[13px] text-[#111827] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414]"
                  />
                </div>

                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#d1d5db] text-[13px] text-[#111827] outline-none focus:border-[#dc1414] focus:ring-1 focus:ring-[#dc1414]"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#f3f4f6] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#e5e7eb] text-[12.5px] font-medium text-[#374151] hover:bg-[#f9fafb] cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#e11414] to-[#b80808] hover:from-[#eb1a1a] hover:to-[#9f0606] text-white text-[12.5px] font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Promotional Coupon?"
        message={`Are you sure you want to delete coupon code "${deleteTarget?.code}"? Customers will no longer be able to use it at checkout.`}
        confirmText="Yes, Delete Coupon"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
