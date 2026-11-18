import { useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CreditCardIcon,
  PlusIcon,
  SearchIcon,
} from '../../components/common/Icons'

const INITIAL_PAYMENTS = [
  {
    id: '#TXN-90482',
    gatewayRef: 'PAY_LIVE_884219',
    referenceId: '#PC12845',
    category: 'Order Payment',
    customer: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    method: 'Credit Card',
    methodDetail: 'Visa •••• 4242',
    amount: 1799.0,
    date: 'Nov 30, 2026',
    time: '2:16 PM',
    status: 'Completed',
  },
  {
    id: '#TXN-90481',
    gatewayRef: 'PAY_LIVE_884105',
    referenceId: '#PC12844',
    category: 'Order Payment',
    customer: 'Priya Verma',
    email: 'priya.v@outlook.com',
    method: 'UPI',
    methodDetail: 'priya@okaxis',
    amount: 2598.0,
    date: 'Nov 30, 2026',
    time: '11:41 AM',
    status: 'Completed',
  },
  {
    id: '#TXN-90480',
    gatewayRef: 'PAY_LIVE_883942',
    referenceId: '#RT7845',
    category: 'Rental Fee',
    customer: 'Neha Kapoor',
    email: 'neha.kapoor@studio.co',
    method: 'UPI',
    methodDetail: 'neha@okhdfc',
    amount: 199.0,
    date: 'Nov 29, 2026',
    time: '3:21 PM',
    status: 'Completed',
  },
  {
    id: '#TXN-90479',
    gatewayRef: 'PAY_LIVE_883941',
    referenceId: '#RT7845',
    category: 'Security Deposit',
    customer: 'Neha Kapoor',
    email: 'neha.kapoor@studio.co',
    method: 'Credit Card',
    methodDetail: 'Mastercard •••• 8810',
    amount: 300.0,
    date: 'Nov 29, 2026',
    time: '3:21 PM',
    status: 'Completed',
  },
  {
    id: '#TXN-90478',
    gatewayRef: 'POS_COD_10482',
    referenceId: '#PC12841',
    category: 'Order Payment',
    customer: 'Vikram Singh',
    email: 'vikram.s@gmail.com',
    method: 'Cash / POS',
    methodDetail: 'Cash on Delivery',
    amount: 1199.0,
    date: 'Nov 28, 2026',
    time: '5:50 PM',
    status: 'Pending',
  },
  {
    id: '#TXN-90477',
    gatewayRef: 'PAY_LIVE_883120',
    referenceId: '#PC12840',
    category: 'Order Payment',
    customer: 'Ananya Iyer',
    email: 'ananya.iyer@design.io',
    method: 'Credit Card',
    methodDetail: 'Visa •••• 1934',
    amount: 2499.0,
    date: 'Nov 28, 2026',
    time: '1:15 PM',
    status: 'Refunded',
  },
]

const STATUS_TABS = ['All', 'Completed', 'Pending', 'Failed', 'Refunded']
const METHOD_FILTERS = [
  'All Methods',
  'Credit Card',
  'UPI',
  'NetBanking',
  'Cash / POS',
]
const CATEGORY_FILTERS = [
  'All Types',
  'Order Payment',
  'Rental Fee',
  'Security Deposit',
]
const PAGES = [1, 2, 3, 4, 5]
const TOTAL_TXNS_BASE = 894
const BASE_REVENUE = 178320

function formatMoney(amount) {
  return `$${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
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

function PaymentReceiptModal({ payment, onClose, onUpdateStatus }) {
  const [status, setStatus] = useState(payment?.status || 'Completed')

  if (!payment) return null

  const handleSave = () => {
    onUpdateStatus(payment.id, status)
    onClose()
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
              onClick={() => {
                onUpdateStatus(payment.id, 'Completed')
                onClose()
              }}
              className="px-3.5 py-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#15803d] text-[13px] font-medium cursor-pointer"
            >
              Mark Completed
            </button>
          )}
          {payment.status === 'Completed' && (
            <button
              type="button"
              onClick={() => {
                onUpdateStatus(payment.id, 'Refunded')
                onClose()
              }}
              className="px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[#b91c1c] text-[13px] font-medium cursor-pointer"
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
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs cursor-pointer"
            >
              Save Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecordPaymentModal({ isOpen, onClose, onRecord }) {
  const [customer, setCustomer] = useState('')
  const [referenceId, setReferenceId] = useState('#PC12846')
  const [category, setCategory] = useState('Order Payment')
  const [method, setMethod] = useState('UPI')
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState('Completed')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customer.trim()) {
      setError('Please enter customer name.')
      return
    }
    const parsedAmount = Number.parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid payment amount.')
      return
    }

    onRecord({
      id: `#TXN-${Math.floor(90483 + Math.random() * 500)}`,
      gatewayRef: `POS_MAN_${Math.floor(100000 + Math.random() * 899999)}`,
      referenceId: referenceId.trim() || '#PC12846',
      category,
      customer: customer.trim(),
      email: `${customer.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      method,
      methodDetail:
        method === 'Cash / POS' ? 'In-Store Counter' : `${method} Verified`,
      amount: parsedAmount,
      date: 'Nov 30, 2026',
      time: 'Just now',
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[480px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4]">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Record Payment
          </h3>
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
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[13px] font-medium text-[#b91c1c]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Customer Name
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. Aarav Sharma"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Order / Rental Ref
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="#PC12846"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Payment Method
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
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Amount ($)
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
                placeholder="1299.00"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
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
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs cursor-pointer"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Payments({ globalSearch = '' }) {
  const [payments, setPayments] = useState(INITIAL_PAYMENTS)
  const [localSearch, setLocalSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All Methods')
  const [categoryFilter, setCategoryFilter] = useState('All Types')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingPayment, setViewingPayment] = useState(null)
  const [recordOpen, setRecordOpen] = useState(false)
  const [confirmState, setConfirmState] = useState(null)

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesSearch =
        !combinedSearch ||
        item.id.toLowerCase().includes(combinedSearch) ||
        item.referenceId.toLowerCase().includes(combinedSearch) ||
        item.customer.toLowerCase().includes(combinedSearch) ||
        item.gatewayRef.toLowerCase().includes(combinedSearch)

      const matchesTab = activeTab === 'All' || item.status === activeTab
      const matchesMethod =
        methodFilter === 'All Methods' || item.method === methodFilter
      const matchesCategory =
        categoryFilter === 'All Types' || item.category === categoryFilter

      return matchesSearch && matchesTab && matchesMethod && matchesCategory
    })
  }, [payments, combinedSearch, activeTab, methodFilter, categoryFilter])

  const kpis = useMemo(() => {
    const initialCompletedSum = INITIAL_PAYMENTS.filter(
      (p) => p.status === 'Completed',
    ).reduce((s, p) => s + p.amount, 0)
    const currentCompletedSum = payments
      .filter((p) => p.status === 'Completed')
      .reduce((s, p) => s + p.amount, 0)
    const completedCount = payments.filter(
      (p) => p.status === 'Completed',
    ).length
    const pendingAmount = payments
      .filter((p) => p.status === 'Pending')
      .reduce((s, p) => s + p.amount, 0)
    const refundedAmount = payments
      .filter((p) => p.status === 'Refunded')
      .reduce((s, p) => s + p.amount, 0)

    return [
      {
        label: 'Total Revenue',
        value: formatMoney(
          BASE_REVENUE + (currentCompletedSum - initialCompletedSum),
        ),
        sub: 'Settled store revenue',
        icon: CreditCardIcon,
        tone: 'red',
      },
      {
        label: 'Completed Payments',
        value: completedCount,
        sub: 'Verified recent transactions',
        icon: CheckCircleIcon,
        tone: 'green',
      },
      {
        label: 'Pending Amount',
        value: formatMoney(pendingAmount),
        sub: 'COD & awaiting clearance',
        icon: ClockIcon,
        tone: 'amber',
      },
      {
        label: 'Refunded Total',
        value: formatMoney(refundedAmount),
        sub: 'Returned to customers',
        icon: RefundIcon,
        tone: 'red',
      },
    ]
  }, [payments])

  const allSelected =
    filteredPayments.length > 0 &&
    filteredPayments.every((p) => selectedIds.includes(p.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredPayments.map((p) => p.id))
    }
  }

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleUpdateStatus = (id, nextStatus) => {
    const existing = payments.find((p) => p.id === id)
    if (!existing || existing.status === nextStatus) return

    const isRefundOrFail =
      nextStatus === 'Refunded' || nextStatus === 'Failed'

    setConfirmState({
      title:
        nextStatus === 'Refunded'
          ? `Issue Refund for ${id}?`
          : nextStatus === 'Completed'
            ? `Mark ${id} as Completed?`
            : `Change Status to ${nextStatus}?`,
      message:
        nextStatus === 'Refunded'
          ? `Are you sure you want to issue a full refund of ${formatMoney(existing.amount)} to ${existing.customer}?`
          : `Are you sure you want to change transaction ${id} (${formatMoney(existing.amount)}) from "${existing.status}" to "${nextStatus}"?`,
      confirmText:
        nextStatus === 'Refunded'
          ? 'Yes, Issue Refund'
          : `Yes, Mark ${nextStatus}`,
      variant: isRefundOrFail ? 'danger' : 'success',
      onConfirm: () => {
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
        )
        setConfirmState(null)
      },
    })
  }

  const handleRecordPayment = (newPayment) => {
    setPayments((prev) => [newPayment, ...prev])
    setRecordOpen(false)
  }

  const handleExportCsv = () => {
    const header = [
      'Transaction ID',
      'Gateway Ref',
      'Reference',
      'Category',
      'Customer',
      'Method',
      'Amount',
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
      p.amount.toFixed(2),
      `"${p.date} ${p.time}"`,
      p.status,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prestige-computers-payments.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const isFiltered =
    Boolean(combinedSearch) ||
    activeTab !== 'All' ||
    methodFilter !== 'All Methods' ||
    categoryFilter !== 'All Types'

  const totalDisplayCount = isFiltered
    ? filteredPayments.length
    : TOTAL_TXNS_BASE + (payments.length - INITIAL_PAYMENTS.length)

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Payments
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Track all payment transactions, rental deposits, pending settlements
            and refunds.
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
          const count =
            tab === 'All'
              ? payments.length
              : payments.filter((p) => p.status === tab).length
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
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
              onChange={(e) => setLocalSearch(e.target.value)}
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
                onChange={(e) => setMethodFilter(e.target.value)}
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
                onChange={(e) => setCategoryFilter(e.target.value)}
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

      {/* Payments Table Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb] text-[13px] font-medium text-[#1f2937]">
                <th className="py-3.5 pl-4 pr-2 w-11">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all transactions"
                    className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3.5 px-3">Transaction ID</th>
                <th className="py-3.5 px-3">Reference &amp; Type</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Method</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const isChecked = selectedIds.includes(payment.id)
                  const isRefunded = payment.status === 'Refunded'

                  return (
                    <tr
                      key={payment.id}
                      className={[
                        'transition-colors hover:bg-[#fafbfc]',
                        isChecked ? 'bg-red-50/35' : '',
                      ].join(' ')}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(payment.id)}
                          aria-label={`Select transaction ${payment.id}`}
                          className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
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
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <div key={payment.id} className="p-4 space-y-3">
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
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
        <p className="text-[13px] font-normal text-[#4b5563]">
          {filteredPayments.length > 0
            ? `Showing 1 to ${filteredPayments.length} of ${totalDisplayCount} transactions`
            : 'Showing 0 transactions'}
        </p>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="w-8 h-8 rounded-md border border-[#dce0e8] bg-white text-[#374151] hover:bg-[#f9fafb] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeftIcon />
          </button>

          {PAGES.map((page) => {
            const isActive = currentPage === page
            return (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={[
                  'w-8 h-8 rounded-md text-[13px] font-medium flex items-center justify-center border transition-all cursor-pointer',
                  isActive
                    ? 'bg-gradient-to-b from-[#e01414] to-[#c40b0b] text-white border-[#c40b0b] shadow-xs'
                    : 'bg-white border-[#dce0e8] text-[#1f2937] hover:bg-[#f9fafb]',
                ].join(' ')}
              >
                {page}
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(PAGES.length, p + 1))}
            disabled={currentPage === PAGES.length}
            aria-label="Next page"
            className="w-8 h-8 rounded-md border border-[#dce0e8] bg-white text-[#374151] hover:bg-[#f9fafb] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      {/* Payment Receipt & Status Modal */}
      {viewingPayment && (
        <PaymentReceiptModal
          key={viewingPayment.id}
          payment={viewingPayment}
          onClose={() => setViewingPayment(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Record Payment Modal */}
      {recordOpen && (
        <RecordPaymentModal
          isOpen={recordOpen}
          onClose={() => setRecordOpen(false)}
          onRecord={handleRecordPayment}
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
