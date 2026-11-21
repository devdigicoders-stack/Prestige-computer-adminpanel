import { useCallback, useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import RentalPlanModal from './RentalPlanModal'
import {
  CalendarIcon,
  ChevronDownIcon,
  CloseIcon,
  CreditCardIcon,
  SearchIcon,
} from '../../components/common/Icons'
import { rentalService } from '../../services/rentalService'

const RENTAL_STATUSES = [
  'All',
  'Pending',
  'Approved',
  'Active',
  'Overdue',
  'Returned',
  'Cancelled',
]
const PLAN_FILTERS = ['All Plans', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
const DEPOSIT_FILTERS = ['All Deposits', 'Pending', 'Held', 'Paid', 'Refunded', 'Forfeited']
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

function EyeIcon({ className = 'w-4 h-4' }) {
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
      <path d="M2.25 12S5.75 5.5 12 5.5 21.75 12 21.75 12 18.25 18.5 12 18.5 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function AlertClockIcon({ className = 'w-5 h-5' }) {
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
      <path d="M12 7.5v4.8l3 1.8" />
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

function RentalStatusBadge({ status }) {
  const norm = (status || '').toLowerCase()
  const styles = {
    active: 'bg-[#dcfce7] text-[#15803d]',
    approved: 'bg-[#eff6ff] text-[#1d4ed8]',
    pending: 'bg-[#fef3c7] text-[#b45309]',
    requested: 'bg-[#fef3c7] text-[#b45309]',
    overdue: 'bg-[#fee2e2] text-[#b91c1c]',
    returned: 'bg-[#f3f4f6] text-[#374151]',
    cancelled: 'bg-[#fee2e2] text-[#991b1b]',
    rejected: 'bg-[#fee2e2] text-[#991b1b]',
  }

  const label = norm.charAt(0).toUpperCase() + norm.slice(1)

  return (
    <span
      className={[
        'inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-medium leading-none whitespace-nowrap capitalize',
        styles[norm] || 'bg-gray-100 text-gray-700',
      ].join(' ')}
    >
      {label}
    </span>
  )
}

function DepositBadge({ status }) {
  const norm = (status || '').toLowerCase()
  const styles = {
    held: 'text-[#1d4ed8] font-bold',
    paid: 'text-[#15803d] font-bold',
    refunded: 'text-[#15803d] font-semibold',
    pending: 'text-[#b45309] font-medium',
    forfeited: 'text-[#dc1414] font-bold',
  }
  const label = norm.charAt(0).toUpperCase() + norm.slice(1)
  return (
    <span className={`capitalize ${styles[norm] || 'text-[#4b5563]'}`}>
      {label}
    </span>
  )
}

function normalizeRental(r) {
  const rawStatus = (r.rentalStatus || 'pending').toLowerCase()
  const displayStatus =
    rawStatus === 'requested' || rawStatus === 'pending'
      ? 'Pending'
      : rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)

  const rawDeposit = (r.depositStatus || 'pending').toLowerCase()
  const displayDeposit = rawDeposit.charAt(0).toUpperCase() + rawDeposit.slice(1)

  const tenure = r.tenureType ? r.tenureType.charAt(0).toUpperCase() + r.tenureType.slice(1) : 'Monthly'

  const formattedStart = r.startDate
    ? new Date(r.startDate).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A'

  const formattedDue = r.endDate
    ? new Date(r.endDate).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A'

  return {
    id: r.rentalId || r._id,
    _id: r._id,
    rentalId: r.rentalId || r._id,
    customer: r.customer?.name || r.user?.name || 'Customer',
    email: r.customer?.email || r.user?.email || 'N/A',
    phone: r.customer?.phone || r.user?.phone || 'N/A',
    address: [r.customer?.address, r.customer?.city, r.customer?.state, r.customer?.postalCode]
      .filter(Boolean)
      .join(', ') || 'Kanpur, UP',
    device: r.productSnapshot?.title || r.product?.title || 'Prestige Rental Device',
    deviceSpecs: r.productSnapshot?.specs || '',
    serial: r.serialNumber ? `SN: ${r.serialNumber}` : 'Unassigned',
    rawSerial: r.serialNumber || '',
    plan: tenure,
    duration: r.duration || 1,
    startDate: formattedStart,
    dueDate: formattedDue,
    dueNote:
      rawStatus === 'returned'
        ? 'Returned & verified'
        : rawStatus === 'overdue'
        ? 'Overdue return'
        : rawStatus === 'active'
        ? 'Active on lease'
        : 'Pending review',
    rentFee: Number(r.rentAmountPerUnit || r.totalRentAmount) || 0,
    deposit: Number(r.securityDeposit) || 0,
    depositStatus: displayDeposit,
    rawDepositStatus: rawDeposit,
    status: displayStatus,
    rawStatus,
    kycStatus: (r.kycStatus || 'pending').toLowerCase(),
    kycDetails: r.kycDetails || { documentType: 'Aadhaar Card', documentNumber: 'N/A' },
    notes: r.notes || '',
  }
}

function RentalDetailModal({ rental, onClose, onUpdate, isUpdating }) {
  const [status, setStatus] = useState(rental?.status || 'Pending')
  const [depositStatus, setDepositStatus] = useState(rental?.depositStatus || 'Pending')
  const [serialNumber, setSerialNumber] = useState(rental?.rawSerial || '')
  const [kycStatus, setKycStatus] = useState(rental?.kycStatus || 'pending')
  const [notes, setNotes] = useState(rental?.notes || '')

  if (!rental) return null

  const handleSave = () => {
    onUpdate(rental._id || rental.id, {
      rentalStatus: status.toLowerCase(),
      depositStatus: depositStatus.toLowerCase(),
      kycStatus,
      serialNumber,
      notes,
    })
  }

  const handleApprove = () => {
    onUpdate(rental._id || rental.id, {
      rentalStatus: 'approved',
      kycStatus: 'verified',
      depositStatus: 'held',
      serialNumber,
      notes,
    })
  }

  const handleActivate = () => {
    onUpdate(rental._id || rental.id, {
      rentalStatus: 'active',
      depositStatus: 'held',
      serialNumber: serialNumber.trim() || `SN: PCS-${Math.floor(1000 + Math.random() * 9000)}`,
      notes,
    })
  }

  const handleMarkReturned = () => {
    onUpdate(rental._id || rental.id, {
      rentalStatus: 'returned',
      depositStatus: 'refunded',
      serialNumber,
      notes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[620px] rounded-2xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden max-h-[92vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4] shrink-0 bg-[#fafbfc]">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[16px] font-bold text-[#111827]">
                Rental Agreement #{rental.rentalId || rental.id}
              </h3>
              <RentalStatusBadge status={rental.status} />
            </div>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              {rental.plan} Plan ({rental.duration} Mo) &bull; {rental.startDate} &rarr; {rental.dueDate}
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
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Customer & KYC Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">
                Renter Details
              </p>
              <p className="text-[13.5px] font-bold text-[#111827] mt-1">
                {rental.customer}
              </p>
              <p className="text-[12px] text-[#4b5563]">{rental.email}</p>
              <p className="text-[12px] font-semibold text-[#111827]">{rental.phone}</p>
              <p className="text-[11.5px] text-[#6b7280] mt-1 leading-relaxed">
                {rental.address}
              </p>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-[#e5e7eb] pt-3 sm:pt-0 sm:pl-3.5 flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">
                  KYC Verification
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      kycStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : kycStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    ● {kycStatus}
                  </span>
                  {kycStatus !== 'verified' && (
                    <button
                      type="button"
                      onClick={() => setKycStatus('verified')}
                      className="text-[11px] font-bold text-[#dc1414] hover:underline"
                    >
                      Verify KYC ✓
                    </button>
                  )}
                </div>
                <p className="text-[12px] text-[#374151] mt-1.5 font-medium">
                  Doc: {rental.kycDetails?.documentType || 'Aadhaar Card'}
                </p>
                <p className="text-[12px] font-mono font-bold text-[#111827]">
                  ID: {rental.kycDetails?.documentNumber || 'Provided'}
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-[#6b7280] block">Purpose:</span>
                <span className="text-[12px] font-medium text-[#111827]">
                  {rental.kycDetails?.purpose || 'Personal / Professional'}
                </span>
              </div>
            </div>
          </div>

          {/* Device & Financials Card */}
          <div className="rounded-xl border border-[#e5e7eb] divide-y divide-[#eef0f4] text-xs">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[13.5px] font-bold text-[#111827]">
                  {rental.device}
                </p>
                {rental.deviceSpecs && (
                  <p className="text-[11.5px] text-[#6b7280] mt-0.5">{rental.deviceSpecs}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#6b7280] block">Monthly Rent</span>
                <span className="text-[15px] font-extrabold text-[#dc1414]">
                  {formatMoney(rental.rentFee)}/mo
                </span>
              </div>
            </div>

            <div className="px-4 py-3 bg-[#f8f9fb] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#374151]">Security Deposit Pool</span>
                <p className="text-[11px] text-[#6b7280]">
                  Status: <DepositBadge status={depositStatus} />
                </p>
              </div>
              <span className="text-[14px] font-bold text-emerald-700">
                {formatMoney(rental.deposit)}
              </span>
            </div>
          </div>

          {/* Fulfillment Controls */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1">
                  Hardware Serial / Asset Tag
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN: AP-MBA-4412"
                  className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-xs font-mono font-semibold text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1">
                  Agreement Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-xs font-semibold text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                >
                  {RENTAL_STATUSES.filter((s) => s !== 'All').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1">
                  Deposit Status
                </label>
                <select
                  value={depositStatus}
                  onChange={(e) => setDepositStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-xs font-semibold text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                >
                  {DEPOSIT_FILTERS.filter((d) => d !== 'All Deposits').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#374151] mb-1">
                  Admin Fulfillment Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal dispatch notes, diagnostic tags..."
                  className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-xs text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 py-3.5 border-t border-[#eef0f4] bg-[#fafbfc] shrink-0">
          <div className="flex items-center gap-2">
            {(rental.rawStatus === 'pending' || rental.rawStatus === 'requested') && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleApprove}
                className="px-3.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1d4ed8] text-[12.5px] font-bold cursor-pointer disabled:opacity-60"
              >
                Approve Contract
              </button>
            )}
            {rental.rawStatus === 'approved' && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleActivate}
                className="px-3.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#15803d] text-[12.5px] font-bold cursor-pointer disabled:opacity-60"
              >
                Dispatch &amp; Activate Lease
              </button>
            )}
            {(rental.rawStatus === 'active' || rental.rawStatus === 'overdue') && (
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleMarkReturned}
                className="px-3.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#15803d] text-[12.5px] font-bold cursor-pointer disabled:opacity-60"
              >
                Mark Returned &amp; Settle Deposit
              </button>
            )}
          </div>

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
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-bold shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Rentals({ globalSearch = '' }) {
  const [rentals, setRentals] = useState([])
  const [kpisData, setKpisData] = useState({
    activeCount: 0,
    pendingCount: 0,
    totalDepositHeld: 0,
    monthlyRevenue: 0,
  })
  const [statusCounts, setStatusCounts] = useState({
    All: 0,
    Active: 0,
    Pending: 0,
    Overdue: 0,
    Returned: 0,
    Scheduled: 0,
    Cancelled: 0,
  })
  const [loading, setLoading] = useState(true)
  const [localSearch, setLocalSearch] = useState(globalSearch)
  const [activeTab, setActiveTab] = useState('All')
  const [planFilter, setPlanFilter] = useState('All Plans')
  const [depositFilter, setDepositFilter] = useState('All Deposits')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingRental, setViewingRental] = useState(null)
  const [confirmState, setConfirmState] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)

  const loadRentals = useCallback(async () => {
    try {
      const res = await rentalService.getAll({
        status: activeTab !== 'All' ? activeTab : undefined,
      })
      if (res?.data) {
        const rawRentals = Array.isArray(res.data.rentals) ? res.data.rentals : []
        setRentals(rawRentals.map(normalizeRental))
        if (res.data.kpis) setKpisData(res.data.kpis)
        if (res.data.statusCounts) setStatusCounts(res.data.statusCounts)
      }
    } catch (err) {
      console.warn('Failed to load rentals:', err.message)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    let ignore = false
    rentalService
      .getAll({
        status: activeTab !== 'All' ? activeTab : undefined,
      })
      .then((res) => {
        if (ignore) return
        if (res?.data) {
          const rawRentals = Array.isArray(res.data.rentals) ? res.data.rentals : []
          setRentals(rawRentals.map(normalizeRental))
          if (res.data.kpis) setKpisData(res.data.kpis)
          if (res.data.statusCounts) setStatusCounts(res.data.statusCounts)
        }
      })
      .catch((err) => {
        if (ignore) return
        console.warn('Failed to load rentals:', err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [activeTab])

  const filteredRentals = useMemo(() => {
    const searchTarget = (localSearch || '').trim().toLowerCase()

    return rentals.filter((item) => {
      const matchesSearch =
        !searchTarget ||
        String(item.id || '').toLowerCase().includes(searchTarget) ||
        String(item.customer || '').toLowerCase().includes(searchTarget) ||
        String(item.email || '').toLowerCase().includes(searchTarget) ||
        String(item.phone || '').toLowerCase().includes(searchTarget) ||
        String(item.device || '').toLowerCase().includes(searchTarget) ||
        String(item.serial || '').toLowerCase().includes(searchTarget)

      const matchesTab = activeTab === 'All' || item.status === activeTab
      const matchesPlan =
        planFilter === 'All Plans' ||
        String(item.plan || '').toLowerCase() === planFilter.toLowerCase()
      const matchesDeposit =
        depositFilter === 'All Deposits' ||
        String(item.depositStatus || '').toLowerCase() === depositFilter.toLowerCase()

      return matchesSearch && matchesTab && matchesPlan && matchesDeposit
    })
  }, [rentals, localSearch, activeTab, planFilter, depositFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRentals.length / ITEMS_PER_PAGE))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const paginatedRentals = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredRentals.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredRentals, safePage])

  const kpis = useMemo(() => {
    return [
      {
        label: 'Active Leases',
        value: kpisData.activeCount,
        sub: 'Devices currently rented out',
        icon: CalendarIcon,
        tone: 'green',
      },
      {
        label: 'Pending Approvals',
        value: kpisData.pendingCount,
        sub: 'Awaiting KYC & contract review',
        icon: AlertClockIcon,
        tone: 'amber',
      },
      {
        label: 'Deposits Held',
        value: formatMoney(kpisData.totalDepositHeld),
        sub: '100% refundable security pool',
        icon: CreditCardIcon,
        tone: 'red',
      },
      {
        label: 'Monthly Rental Revenue',
        value: formatMoney(kpisData.monthlyRevenue),
        sub: 'Recurring monthly lease yield',
        icon: CheckCircleIcon,
        tone: 'green',
      },
    ]
  }, [kpisData])

  const handleUpdateRental = async (id, updateData) => {
    setIsUpdating(true)
    try {
      await rentalService.updateStatus(id, updateData)
      await loadRentals()
      setViewingRental(null)
    } catch (err) {
      alert(`Failed to update rental status: ${err.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExportCsv = () => {
    const header = [
      'Rental ID',
      'Customer',
      'Phone',
      'Device',
      'Serial',
      'Plan',
      'Start Date',
      'Due Date',
      'Rent Fee (INR)',
      'Deposit (INR)',
      'Deposit Status',
      'KYC Status',
      'Status',
    ]
    const rows = filteredRentals.map((r) => [
      r.id,
      `"${r.customer}"`,
      `"${r.phone}"`,
      `"${r.device}"`,
      r.serial,
      r.plan,
      `"${r.startDate}"`,
      `"${r.dueDate}"`,
      r.rentFee.toFixed(2),
      r.deposit.toFixed(2),
      r.depositStatus,
      r.kycStatus,
      r.status,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prestige-rentals-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Rental Leases &amp; Hardware Subscriptions
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Manage laptop &amp; PC rental applications, KYC approvals, asset serial tags, security deposits, and returns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPlanModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#dc1414] hover:bg-[#b91c1c] text-white text-[12.5px] font-semibold shadow-xs transition-all cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4 text-white" />
            <span>Configure Rental Durations</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#d6dae2] bg-white hover:bg-[#f9fafb] text-[#1f2937] text-[12.5px] font-medium shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors cursor-pointer"
          >
            <DownloadIcon className="w-4 h-4 text-[#4b5563]" />
            <span>Export CSV</span>
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

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {RENTAL_STATUSES.map((tab) => {
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
              placeholder="Search rental ID, renter, device or serial..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('')
                  setCurrentPage(1)
                }}
                className="text-gray-400 hover:text-gray-600 text-xs px-1 font-bold cursor-pointer"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="rental-plan-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Plan:
            </label>
            <div className="relative flex-1 sm:w-[170px]">
              <select
                id="rental-plan-filter"
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {PLAN_FILTERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label
              htmlFor="rental-deposit-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Deposit:
            </label>
            <div className="relative flex-1 sm:w-[175px]">
              <select
                id="rental-deposit-filter"
                value={depositFilter}
                onChange={(e) => {
                  setDepositFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {DEPOSIT_FILTERS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Rentals Table Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-[#6b7280] flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#dc1414] border-t-transparent rounded-full animate-spin" />
            <span>Loading live rental applications...</span>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb] text-[13px] font-medium text-[#1f2937]">
                    <th className="py-3.5 pl-5 pr-3">Rental ID</th>
                    <th className="py-3.5 px-3">Customer</th>
                    <th className="py-3.5 px-3">Rented Device</th>
                    <th className="py-3.5 px-3">Lease Period</th>
                    <th className="py-3.5 px-3">Fee &amp; Deposit</th>
                    <th className="py-3.5 px-3 text-center">Status</th>
                    <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef0f4] text-[13px]">
                  {paginatedRentals.length > 0 ? (
                    paginatedRentals.map((rental) => {
                      const isOverdue = rental.rawStatus === 'overdue'

                      return (
                        <tr
                          key={rental.id || rental._id}
                          className="transition-colors hover:bg-[#fafbfc]"
                        >
                          <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setViewingRental(rental)}
                              className="font-medium text-[#dc1414] hover:underline cursor-pointer"
                            >
                              #{rental.rentalId || rental.id}
                            </button>
                            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
                              {rental.plan} ({rental.duration} Mo)
                            </p>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#111215] text-white text-[11.5px] font-medium flex items-center justify-center shrink-0">
                                {getInitials(rental.customer)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-[#111827] leading-snug truncate">
                                  {rental.customer}
                                </p>
                                <p className="text-[12px] text-[#6b7280] truncate">
                                  {rental.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <p className="font-medium text-[#111827] leading-snug">
                              {rental.device}
                            </p>
                            <p className="text-[12px] font-mono text-[#6b7280] mt-0.5">
                              {rental.serial}
                            </p>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <p className="text-[13px] font-medium text-[#1f2937]">
                              {rental.startDate} &rarr; {rental.dueDate}
                            </p>
                            <p
                              className={[
                                'text-[12px] font-medium mt-0.5',
                                isOverdue ? 'text-[#dc1414]' : 'text-[#6b7280]',
                              ].join(' ')}
                            >
                              {rental.dueNote}
                            </p>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <p className="font-medium text-[#111827]">
                              {formatMoney(rental.rentFee)}/mo
                            </p>
                            <p className="text-[12px] text-[#6b7280] mt-0.5">
                              Dep: {formatMoney(rental.deposit)} (
                              <DepositBadge status={rental.depositStatus} />)
                            </p>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <RentalStatusBadge status={rental.status} />
                          </td>
                          <td className="py-3.5 pl-3 pr-5 text-right">
                            <button
                              type="button"
                              onClick={() => setViewingRental(rental)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] transition-colors cursor-pointer"
                            >
                              <EyeIcon className="w-4 h-4 text-[#4b5563]" />
                              <span>Manage</span>
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
                        No rental bookings match your current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden divide-y divide-[#eef0f4]">
              {paginatedRentals.length > 0 ? (
                paginatedRentals.map((rental) => (
                  <div key={rental.id || rental._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          type="button"
                          onClick={() => setViewingRental(rental)}
                          className="text-[13.5px] font-medium text-[#dc1414] hover:underline cursor-pointer"
                        >
                          #{rental.rentalId || rental.id}
                        </button>
                        <p className="text-[12px] text-[#6b7280]">
                          {rental.plan} Plan &bull; {rental.startDate} &rarr; {rental.dueDate}
                        </p>
                      </div>
                      <RentalStatusBadge status={rental.status} />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[12.5px] font-medium text-[#111827]">
                          {rental.customer}
                        </p>
                        <p className="text-[12px] text-[#4b5563]">
                          {rental.device} ({rental.serial})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[13.5px] font-semibold text-[#111827]">
                        {formatMoney(rental.rentFee)}/mo
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewingRental(rental)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] cursor-pointer"
                      >
                        <EyeIcon className="w-4 h-4 text-[#4b5563]" />
                        <span>Manage</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-[12.5px] text-[#6b7280]">
                  No rental bookings match your current filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={safePage}
        totalItems={filteredRentals.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemName="rental bookings"
      />

      {/* Rental Details & Action Modal */}
      {viewingRental && (
        <RentalDetailModal
          key={viewingRental.id || viewingRental._id}
          rental={viewingRental}
          onClose={() => setViewingRental(null)}
          onUpdate={handleUpdateRental}
          isUpdating={isUpdating}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmText={confirmState?.confirmText}
        variant={confirmState?.variant}
        onCancel={() => setConfirmState(null)}
        onConfirm={confirmState?.onConfirm}
      />

      {/* Rental Duration & Plans Management Modal */}
      <RentalPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
    </div>
  )
}
