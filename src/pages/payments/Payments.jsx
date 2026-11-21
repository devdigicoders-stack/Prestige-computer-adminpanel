import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import {
  ChevronDownIcon,
  CloseIcon,
  CreditCardIcon,
  PlusIcon,
  SearchIcon,
} from '../../components/common/Icons'
import { paymentService } from '../../services/paymentService'

const STATUS_TABS = ['All', 'Completed', 'Pending', 'Failed', 'Refunded']
const METHOD_FILTERS = [
  'All Methods',
  'UPI',
  'Credit Card',
  'Debit Card',
  'NetBanking',
  'Cash / POS',
  'EMI',
  'Wallets',
]
const CATEGORY_FILTERS = [
  'All Types',
  'Order Payment',
  'Rental Fee',
  'Security Deposit',
  'Custom Hardware',
  'Service Fee',
]
const ITEMS_PER_PAGE = 8

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'CU'
}

function ReceiptIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 3.5h14v17l-2.3-1.5-2.3 1.5-2.4-1.5-2.4 1.5-2.3-1.5L5 20.5v-17Z" />
      <path d="M8.5 8.5h7" />
      <path d="M8.5 12.5h5" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.8 12.2 2.2 2.2 4.4-4.6" />
    </svg>
  )
}

function ClockIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function RefundIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function DownloadIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  )
}

function PaymentStatusBadge({ status }) {
  const styles = {
    Completed: 'bg-[#dcfce7] text-[#15803d]',
    Pending: 'bg-[#fef3c7] text-[#b45309]',
    Failed: 'bg-[#fee2e2] text-[#b91c1c]',
    Refunded: 'bg-[#f3f4f6] text-[#4b5563]',
  }

  return (
    <span
      className={[
        'inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-medium leading-none whitespace-nowrap',
        styles[status] || styles.Pending,
      ].join(' ')}
    >
      {status}
    </span>
  )
}

function CategoryPill({ category }) {
  const styles = {
    'Order Payment': 'bg-[#fef2f2] text-[#dc1414]',
    'Rental Fee': 'bg-[#eff6ff] text-[#1d4ed8]',
    'Security Deposit': 'bg-[#f3f4f6] text-[#374151]',
    'Custom Hardware': 'bg-[#faf5ff] text-[#7e22ce]',
    'Service Fee': 'bg-[#ecfdf5] text-[#047857]',
  }
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap',
        styles[category] || styles['Order Payment'],
      ].join(' ')}
    >
      {category}
    </span>
  )
}

function PaymentReceiptModal({ payment, onClose, onUpdateStatus, isUpdating }) {
  const [status, setStatus] = useState(payment?.status || 'Completed')

  if (!payment) return null

  const handleSave = () => {
    onUpdateStatus(payment.id || payment._id, status)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[520px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4]">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold text-[#111827]">
                Receipt {payment.id}
              </h3>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              {payment.date} at {payment.time} &bull; {payment.gatewayRef}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-gray-100 cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Amount Hero */}
          <div className="rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-4 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-normal text-[#6b7280]">
                Transaction Amount
              </p>
              <p className="text-[22px] font-semibold text-[#111827] leading-tight mt-0.5">
                {formatMoney(payment.amount)}
              </p>
            </div>
            <CategoryPill category={payment.category} />
          </div>

          {/* Key-Value Breakdown */}
          <div className="rounded-xl border border-[#e5e7eb] divide-y divide-[#eef0f4] text-[12.5px]">
            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#6b7280] font-normal">Customer</span>
              <span className="font-medium text-[#111827]">
                {payment.customer}
              </span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#6b7280] font-normal">Email</span>
              <span className="font-medium text-[#374151]">
                {payment.email}
              </span>
            </div>
            {payment.phone && (
              <div className="px-4 py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#6b7280] font-normal">Phone</span>
                <span className="font-medium text-[#374151]">
                  {payment.phone}
                </span>
              </div>
            )}
            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#6b7280] font-normal">Reference ID</span>
              <span className="font-medium text-[#dc1414]">
                {payment.referenceId}
              </span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#6b7280] font-normal">Payment Method</span>
              <span className="font-medium text-[#111827]">
                {payment.method} ({payment.methodDetail})
              </span>
            </div>
          </div>

          {/* Update Status */}
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
              Update Payment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
            >
              {STATUS_TABS.filter((s) => s !== 'All').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-t border-[#eef0f4] bg-[#fafbfc]">
          {payment.status === 'Pending' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(payment.id || payment._id, 'Completed')}
              className="px-3.5 py-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#15803d] text-[13px] font-medium cursor-pointer disabled:opacity-60"
            >
              Mark Completed
            </button>
          )}
          {payment.status === 'Completed' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(payment.id || payment._id, 'Refunded')}
              className="px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[#b91c1c] text-[13px] font-medium cursor-pointer disabled:opacity-60"
            >
              Issue Refund
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isUpdating ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecordPaymentModal({ isOpen, onClose, onRecord, isRecording }) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [category, setCategory] = useState('Order Payment')
  const [method, setMethod] = useState('UPI')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('Completed')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customerName.trim()) {
      setError('Please enter customer name.')
      return
    }
    const parsedAmount = Number.parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive payment amount.')
      return
    }

    onRecord({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      referenceId: referenceId.trim() || `#PC${Math.floor(10000 + Math.random() * 90000)}`,
      category,
      method,
      amount: parsedAmount,
      status,
      notes: notes.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[500px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4]">
          <div>
            <h3 className="text-[15px] font-semibold text-[#111827]">
              Record Payment
            </h3>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              Manually log an in-store counter, UPI, or offline transaction.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-gray-100 cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-[#b91c1c] font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Customer Name <span className="text-[#dc1414]">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value)
                if (error) setError('')
              }}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@gmail.com"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Reference ID / Order #
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="e.g. PCS-2026-42492"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] uppercase focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                {CATEGORY_FILTERS.filter((c) => c !== 'All Types').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                {METHOD_FILTERS.filter((m) => m !== 'All Methods').map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Amount (₹) <span className="text-[#dc1414]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (error) setError('')
                }}
                placeholder="52999"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via store POS counter terminal #1"
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRecording}
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isRecording ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Payments({ globalSearch = '' }) {
  const [payments, setPayments] = useState([])
  const [kpisData, setKpisData] = useState({
    totalRevenue: 0,
    completedCount: 0,
    pendingAmount: 0,
    refundedAmount: 0,
  })
  const [statusCounts, setStatusCounts] = useState({
    All: 0,
    Completed: 0,
    Pending: 0,
    Failed: 0,
    Refunded: 0,
  })
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All Methods')
  const [categoryFilter, setCategoryFilter] = useState('All Types')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingPayment, setViewingPayment] = useState(null)
  const [recordOpen, setRecordOpen] = useState(false)
  const [confirmState, setConfirmState] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  // Fetch payments from backend
  const loadPayments = useCallback(async () => {
    try {
      const res = await paymentService.getAll({
        status: activeTab !== 'All' ? activeTab : undefined,
        method: methodFilter !== 'All Methods' ? methodFilter : undefined,
        category: categoryFilter !== 'All Types' ? categoryFilter : undefined,
      })
      if (res?.data) {
        setPayments(res.data.payments || [])
        if (res.data.kpis) setKpisData(res.data.kpis)
        if (res.data.statusCounts) setStatusCounts(res.data.statusCounts)
      }
    } catch (err) {
      console.error('Failed to load payments:', err)
      setErrorMsg(err.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [activeTab, methodFilter, categoryFilter])

  useEffect(() => {
    let ignore = false
    paymentService
      .getAll({
        status: activeTab !== 'All' ? activeTab : undefined,
        method: methodFilter !== 'All Methods' ? methodFilter : undefined,
        category: categoryFilter !== 'All Types' ? categoryFilter : undefined,
      })
      .then((res) => {
        if (ignore) return
        if (res?.data) {
          setPayments(res.data.payments || [])
          if (res.data.kpis) setKpisData(res.data.kpis)
          if (res.data.statusCounts) setStatusCounts(res.data.statusCounts)
        }
      })
      .catch((err) => {
        if (ignore) return
        setErrorMsg(err.message || 'Failed to load payments')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [activeTab, methodFilter, categoryFilter])

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesSearch =
        !combinedSearch ||
        (item.id && item.id.toLowerCase().includes(combinedSearch)) ||
        (item.referenceId && item.referenceId.toLowerCase().includes(combinedSearch)) ||
        (item.customer && item.customer.toLowerCase().includes(combinedSearch)) ||
        (item.gatewayRef && item.gatewayRef.toLowerCase().includes(combinedSearch))

      const matchesTab = activeTab === 'All' || item.status === activeTab
      const matchesMethod =
        methodFilter === 'All Methods' || item.method === methodFilter
      const matchesCategory =
        categoryFilter === 'All Types' || item.category === categoryFilter

      return matchesSearch && matchesTab && matchesMethod && matchesCategory
    })
  }, [payments, combinedSearch, activeTab, methodFilter, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / ITEMS_PER_PAGE))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  // Slice transactions for active page
  const paginatedPayments = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredPayments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredPayments, safePage])

  const kpis = useMemo(() => {
    return [
      {
        label: 'Total Revenue',
        value: formatMoney(kpisData.totalRevenue),
        sub: 'Settled store revenue',
        icon: CreditCardIcon,
        tone: 'red',
      },
      {
        label: 'Completed Payments',
        value: kpisData.completedCount,
        sub: 'Verified transactions',
        icon: CheckCircleIcon,
        tone: 'green',
      },
      {
        label: 'Pending Amount',
        value: formatMoney(kpisData.pendingAmount),
        sub: 'COD & awaiting clearance',
        icon: ClockIcon,
        tone: 'amber',
      },
      {
        label: 'Refunded Total',
        value: formatMoney(kpisData.refundedAmount),
        sub: 'Returned to customers',
        icon: RefundIcon,
        tone: 'red',
      },
    ]
  }, [kpisData])

  const handleUpdateStatus = (id, nextStatus) => {
    const existing = payments.find((p) => (p.id === id || p._id === id))
    if (!existing || existing.status === nextStatus) return

    const isRefundOrFail =
      nextStatus === 'Refunded' || nextStatus === 'Failed'

    setConfirmState({
      title:
        nextStatus === 'Refunded'
          ? `Issue Refund for ${existing.id || id}?`
          : nextStatus === 'Completed'
            ? `Mark ${existing.id || id} as Completed?`
            : `Change Status to ${nextStatus}?`,
      message:
        nextStatus === 'Refunded'
          ? `Are you sure you want to issue a full refund of ${formatMoney(existing.amount)} to ${existing.customer}? This will update the linked order.`
          : `Are you sure you want to change transaction ${existing.id || id} (${formatMoney(existing.amount)}) from "${existing.status}" to "${nextStatus}"?`,
      confirmText:
        nextStatus === 'Refunded'
          ? 'Yes, Issue Refund'
          : `Yes, Mark ${nextStatus}`,
      variant: isRefundOrFail ? 'danger' : 'success',
      onConfirm: async () => {
        setIsUpdating(true)
        try {
          await paymentService.updateStatus(existing._id || id, { status: nextStatus })
          await loadPayments()
          setViewingPayment(null)
        } catch (err) {
          alert(`Failed to update payment status: ${err.message}`)
        } finally {
          setIsUpdating(false)
          setConfirmState(null)
        }
      },
    })
  }

  const handleRecordPayment = async (newPaymentData) => {
    setIsRecording(true)
    try {
      await paymentService.create(newPaymentData)
      await loadPayments()
      setRecordOpen(false)
    } catch (err) {
      alert(`Failed to record payment: ${err.message}`)
    } finally {
      setIsRecording(false)
    }
  }

  const handleExportCsv = () => {
    const header = [
      'Transaction ID',
      'Gateway Ref',
      'Reference',
      'Category',
      'Customer',
      'Method',
      'Amount (INR)',
      'Date',
      'Status',
    ]
    const rows = filteredPayments.map((p) => [
      p.id,
      p.gatewayRef,
      p.referenceId,
      `"${p.category}"`,
      `"${p.customer}"`,
      `"${p.method} (${p.methodDetail})"`,
      Number(p.amount || 0).toFixed(2),
      `"${p.date} ${p.time}"`,
      p.status,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prestige-payments-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Payments &amp; Transactions
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Real-time ledger of orders, hardware rental deposits, counter POS payments, and settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#d6dae2] bg-white hover:bg-[#f9fafb] text-[#1f2937] text-[12.5px] font-medium shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors cursor-pointer"
          >
            <DownloadIcon className="w-4 h-4 text-[#4b5563]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setRecordOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer"
          >
            <PlusIcon className="w-[17px] h-[17px]" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        {kpis.map((card) => {
          const Icon = card.icon
          const badgeStyle =
            card.tone === 'amber'
              ? 'bg-[#fef3c7] border-[#fde68a] text-[#b45309]'
              : card.tone === 'green'
                ? 'bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]'
                : 'bg-[#fef2f2] border-[#fee2e2] text-[#dc1414]'

          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-[#e6e8ee] px-4 py-3.5 shadow-[0_2px_8px_rgba(16,24,40,0.03)] flex items-center gap-3.5"
            >
              <div
                className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${badgeStyle}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-normal text-[#4b5563] truncate">
                  {card.label}
                </p>
                <p className="text-[18px] sm:text-[19px] font-semibold text-[#111827] leading-tight truncate">
                  {card.value}
                </p>
                <p className="text-[11.5px] font-normal text-[#6b7280] truncate">
                  {card.sub}
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count = statusCounts[tab] !== undefined ? statusCounts[tab] : 0
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab)
                setCurrentPage(1)
              }}
              className={[
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap border transition-all cursor-pointer',
                isActive
                  ? 'bg-[#111215] text-white border-[#111215] shadow-xs'
                  : 'bg-white text-[#374151] border-[#dfe3ea] hover:bg-[#f9fafb]',
              ].join(' ')}
            >
              <span>{tab}</span>
              <span
                className={[
                  'px-1.5 py-0.5 rounded-md text-[11px] font-medium leading-none',
                  isActive
                    ? 'bg-[#dc1414] text-white'
                    : 'bg-[#f3f4f6] text-[#4b5563]',
                ].join(' ')}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="w-full lg:max-w-[380px]">
          <div className="flex items-center gap-2.5 bg-white border border-[#d6dae2] rounded-lg px-3.5 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus-within:border-[#dc1414] focus-within:ring-2 focus-within:ring-[#dc1414]/15 transition-all">
            <SearchIcon className="w-4 h-4 text-[#4b5563] shrink-0" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search transaction ID, order ref or customer..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="payment-method-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Method:
            </label>
            <div className="relative flex-1 sm:w-[170px]">
              <select
                id="payment-method-filter"
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {METHOD_FILTERS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label
              htmlFor="payment-category-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Type:
            </label>
            <div className="relative flex-1 sm:w-[180px]">
              <select
                id="payment-category-filter"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {CATEGORY_FILTERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-[#b91c1c] rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* Payments Table Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-[#6b7280] flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#dc1414] border-t-transparent rounded-full animate-spin" />
            <span>Loading live transactions from database...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb] text-[13px] font-medium text-[#1f2937]">
                    <th className="py-3.5 pl-5 pr-3">Transaction ID</th>
                    <th className="py-3.5 px-3">Reference &amp; Type</th>
                    <th className="py-3.5 px-3">Customer</th>
                    <th className="py-3.5 px-3">Method</th>
                    <th className="py-3.5 px-3">Amount</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0f4] text-[13px]">
                  {paginatedPayments.length > 0 ? (
                    paginatedPayments.map((payment) => {
                      const isRefunded = payment.status === 'Refunded'

                      return (
                        <tr
                          key={payment.id || payment._id}
                          className="transition-colors hover:bg-[#fafbfc]"
                        >
                          <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setViewingPayment(payment)}
                              className="font-medium text-[#dc1414] hover:underline cursor-pointer"
                            >
                              {payment.id}
                            </button>
                            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
                              {payment.date} &bull; {payment.time}
                            </p>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <p className="text-[12.5px] font-medium text-[#111827] mb-1">
                              {payment.referenceId}
                            </p>
                            <CategoryPill category={payment.category} />
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#111215] text-white text-[11.5px] font-medium flex items-center justify-center shrink-0">
                                {getInitials(payment.customer)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-[#111827] leading-snug truncate">
                                  {payment.customer}
                                </p>
                                <p className="text-[12px] text-[#6b7280] truncate">
                                  {payment.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <p className="text-[13px] font-medium text-[#1f2937]">
                              {payment.method}
                            </p>
                            <p className="text-[12px] text-[#6b7280] mt-0.5">
                              {payment.methodDetail}
                            </p>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span
                              className={[
                                'font-semibold',
                                isRefunded
                                  ? 'text-[#6b7280] line-through'
                                  : 'text-[#111827]',
                              ].join(' ')}
                            >
                              {formatMoney(payment.amount)}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <PaymentStatusBadge status={payment.status} />
                          </td>
                          <td className="py-3.5 pl-3 pr-5 text-right">
                            <button
                              type="button"
                              onClick={() => setViewingPayment(payment)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] transition-colors cursor-pointer"
                            >
                              <ReceiptIcon className="w-4 h-4 text-[#4b5563]" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-[13px] font-normal text-[#6b7280]"
                      >
                        No transactions match your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden divide-y divide-[#eef0f4]">
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment) => (
                  <div key={payment.id || payment._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          type="button"
                          onClick={() => setViewingPayment(payment)}
                          className="text-[13.5px] font-medium text-[#dc1414] hover:underline cursor-pointer"
                        >
                          {payment.id}
                        </button>
                        <p className="text-[12px] text-[#6b7280]">
                          {payment.date} &bull; {payment.time}
                        </p>
                      </div>
                      <PaymentStatusBadge status={payment.status} />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[12.5px] font-medium text-[#111827]">
                          {payment.customer}
                        </p>
                        <p className="text-[12px] text-[#4b5563]">
                          Ref {payment.referenceId} &bull; {payment.method}
                        </p>
                      </div>
                      <CategoryPill category={payment.category} />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[13.5px] font-semibold text-[#111827]">
                        {formatMoney(payment.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewingPayment(payment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] cursor-pointer"
                      >
                        <ReceiptIcon className="w-4 h-4 text-[#4b5563]" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-[12.5px] text-[#6b7280]">
                  No transactions match your current filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Fully Dynamic Pagination Footer */}
      <Pagination
        currentPage={safePage}
        totalItems={filteredPayments.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemName="transactions"
      />

      {/* Payment Receipt & Status Modal */}
      {viewingPayment && (
        <PaymentReceiptModal
          key={viewingPayment.id || viewingPayment._id}
          payment={viewingPayment}
          onClose={() => setViewingPayment(null)}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />
      )}

      {/* Record Payment Modal */}
      {recordOpen && (
        <RecordPaymentModal
          isOpen={recordOpen}
          onClose={() => setRecordOpen(false)}
          onRecord={handleRecordPayment}
          isRecording={isRecording}
        />
      )}

      {/* Confirmation Alert */}
      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmText={confirmState?.confirmText}
        variant={confirmState?.variant}
        onCancel={() => setConfirmState(null)}
        onConfirm={confirmState?.onConfirm}
      />
    </div>
  )
}
