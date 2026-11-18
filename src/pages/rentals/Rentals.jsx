
import { useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CreditCardIcon,
  PlusIcon,
  SearchIcon,
} from '../../components/common/Icons'

const INITIAL_RENTALS = [
  {
    id: '#RT7845',
    customer: 'Neha Kapoor',
    email: 'neha.kapoor@studio.co',
    phone: '+91 98765 40129',
    address: '12 Koregaon Park Lane 5, Pune 411001',
    device: 'Apple MacBook Air M2',
    serial: 'SN: AP-MBA-4412',
    plan: 'Monthly',
    startDate: 'Nov 15, 2026',
    dueDate: 'Dec 15, 2026',
    dueNote: '15 days left',
    rentFee: 199.0,
    deposit: 300.0,
    depositStatus: 'Held',
    status: 'Active',
  },
  {
    id: '#RT7844',
    customer: 'Siddharth Nair',
    email: 'sid.nair@devlabs.in',
    phone: '+91 98201 77634',
    address: '904 Hiranandani Gardens, Powai, Mumbai 400076',
    device: 'Dell XPS 15 (2024)',
    serial: 'SN: DL-XPS-9041',
    plan: 'Monthly',
    startDate: 'Nov 01, 2026',
    dueDate: 'Nov 28, 2026',
    dueNote: '2 days overdue',
    rentFee: 249.0,
    deposit: 400.0,
    depositStatus: 'Held',
    status: 'Overdue',
  },
  {
    id: '#RT7843',
    customer: 'Karan Malhotra',
    email: 'karan.m@esports.gg',
    phone: '+91 99104 33890',
    address: '45 DLF Phase 3, Sector 24, Gurugram 122002',
    device: 'ASUS ROG Strix G16',
    serial: 'SN: AS-ROG-7720',
    plan: 'Weekly',
    startDate: 'Nov 24, 2026',
    dueDate: 'Dec 01, 2026',
    dueNote: 'Due tomorrow',
    rentFee: 95.0,
    deposit: 350.0,
    depositStatus: 'Held',
    status: 'Active',
  },
  {
    id: '#RT7842',
    customer: 'Meera Deshmukh',
    email: 'meera.d@fintech.co',
    phone: '+91 98450 21904',
    address: '210 Koramangala 4th Block, Bengaluru 560034',
    device: 'HP EliteBook 840 G10',
    serial: 'SN: HP-EB8-2219',
    plan: 'Quarterly',
    startDate: 'Dec 02, 2026',
    dueDate: 'Mar 02, 2027',
    dueNote: 'Starts in 2 days',
    rentFee: 480.0,
    deposit: 250.0,
    depositStatus: 'Pending',
    status: 'Scheduled',
  },
  {
    id: '#RT7841',
    customer: 'Arjun Patel',
    email: 'arjun.patel@agency.in',
    phone: '+91 98250 88123',
    address: '14 SG Highway, Prahlad Nagar, Ahmedabad 380015',
    device: 'Lenovo ThinkPad T14',
    serial: 'SN: LN-T14-6184',
    plan: 'Monthly',
    startDate: 'Oct 20, 2026',
    dueDate: 'Nov 20, 2026',
    dueNote: 'Returned on time',
    rentFee: 159.0,
    deposit: 250.0,
    depositStatus: 'Refunded',
    status: 'Returned',
  },
  {
    id: '#RT7840',
    customer: 'Riya Sen',
    email: 'riya.sen@vfxhouse.io',
    phone: '+91 98301 55210',
    address: '62 Park Street, Kolkata 700016',
    device: 'RTX 4070 Custom RGB Tower',
    serial: 'SN: PC-407-1103',
    plan: 'Monthly',
    startDate: 'Nov 10, 2026',
    dueDate: 'Dec 10, 2026',
    dueNote: '10 days left',
    rentFee: 329.0,
    deposit: 500.0,
    depositStatus: 'Held',
    status: 'Active',
  },
]

const RENTAL_STATUSES = [
  'All',
  'Active',
  'Overdue',
  'Scheduled',
  'Returned',
  'Cancelled',
]
const PLAN_FILTERS = ['All Plans', 'Weekly', 'Monthly', 'Quarterly']
const DEPOSIT_FILTERS = ['All Deposits', 'Held', 'Refunded', 'Pending']
const PAGES = [1, 2, 3, 4]
const TOTAL_RENTALS_BASE = 48

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
  const styles = {
    Active: 'bg-[#dcfce7] text-[#15803d]',
    Overdue: 'bg-[#fee2e2] text-[#b91c1c]',
    Scheduled: 'bg-[#dbeafe] text-[#1d4ed8]',
    Returned: 'bg-[#f3f4f6] text-[#374151]',
    Cancelled: 'bg-[#fef2f2] text-[#991b1b]',
  }

  return (
    <span
      className={[
        'inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-medium leading-none whitespace-nowrap',
        styles[status] || styles.Active,
      ].join(' ')}
    >
      {status}
    </span>
  )
}

function DepositBadge({ status }) {
  const styles = {
    Held: 'text-[#1d4ed8]',
    Refunded: 'text-[#15803d]',
    Pending: 'text-[#b45309]',
  }
  return (
    <span className={`font-normal ${styles[status] || 'text-[#4b5563]'}`}>
      {status}
    </span>
  )
}

function RentalDetailModal({ rental, onClose, onUpdate }) {
  const [status, setStatus] = useState(rental?.status || 'Active')
  const [depositStatus, setDepositStatus] = useState(
    rental?.depositStatus || 'Held',
  )
  const [dueDate, setDueDate] = useState(rental?.dueDate || '')

  if (!rental) return null

  const handleMarkReturned = () => {
    onUpdate(rental.id, {
      status: 'Returned',
      depositStatus: 'Refunded',
      dueNote: 'Returned & verified',
    })
    onClose()
  }

  const handleSave = () => {
    onUpdate(rental.id, {
      status,
      depositStatus,
      dueDate: dueDate.trim() || rental.dueDate,
      dueNote:
        status === 'Returned'
          ? 'Returned & verified'
          : status === 'Overdue'
            ? 'Overdue return'
            : status === 'Cancelled'
              ? 'Booking cancelled'
              : rental.dueNote,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[560px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4] shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[15px] font-semibold text-[#111827]">
                Rental Booking {rental.id}
              </h3>
              <RentalStatusBadge status={rental.status} />
            </div>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              {rental.plan} Plan &bull; {rental.startDate} &rarr;{' '}
              {rental.dueDate}
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
        <div className="p-5 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-4">
            <div>
              <p className="text-[11.5px] font-normal uppercase tracking-wider text-[#6b7280]">
                Renter Details
              </p>
              <p className="text-[13px] font-medium text-[#111827] mt-1">
                {rental.customer}
              </p>
              <p className="text-[12px] text-[#4b5563]">{rental.email}</p>
              <p className="text-[12px] text-[#4b5563]">{rental.phone}</p>
            </div>
            <div>
              <p className="text-[11.5px] font-normal uppercase tracking-wider text-[#6b7280]">
                Delivery Address
              </p>
              <p className="text-[12px] text-[#374151] mt-1 leading-relaxed">
                {rental.address}
              </p>
            </div>
          </div>

          {/* Device & Pricing */}
          <div className="rounded-xl border border-[#e5e7eb] divide-y divide-[#eef0f4]">
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium text-[#111827]">
                  {rental.device}
                </p>
                <p className="text-[12px] font-normal text-[#6b7280]">
                  {rental.serial} &bull; {rental.plan} Rental
                </p>
              </div>
              <span className="text-[13.5px] font-semibold text-[#111827]">
                {formatMoney(rental.rentFee)}
              </span>
            </div>
            <div className="px-4 py-3 bg-[#f8f9fb] flex items-center justify-between text-[12.5px]">
              <span className="font-normal text-[#4b5563]">
                Security Deposit (
                <DepositBadge status={rental.depositStatus} />)
              </span>
              <span className="font-medium text-[#111827]">
                {formatMoney(rental.deposit)}
              </span>
            </div>
          </div>

          {/* Update Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Rental Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                {RENTAL_STATUSES.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Deposit Status
              </label>
              <select
                value={depositStatus}
                onChange={(e) => setDepositStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                {DEPOSIT_FILTERS.filter((d) => d !== 'All Deposits').map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Due Date
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-5 py-3.5 border-t border-[#eef0f4] bg-[#fafbfc] shrink-0">
          {(rental.status === 'Active' || rental.status === 'Overdue') && (
            <button
              type="button"
              onClick={handleMarkReturned}
              className="px-3.5 py-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#15803d] text-[13px] font-medium cursor-pointer"
            >
              Mark Returned &amp; Refund Deposit
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
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateRentalModal({ isOpen, onClose, onCreate }) {
  const [customer, setCustomer] = useState('')
  const [email, setEmail] = useState('')
  const [device, setDevice] = useState('Apple MacBook Air M2')
  const [plan, setPlan] = useState('Monthly')
  const [startDate, setStartDate] = useState('Dec 01, 2026')
  const [dueDate, setDueDate] = useState('Jan 01, 2027')
  const [rentFee, setRentFee] = useState('199')
  const [deposit, setDeposit] = useState('300')
  const [status, setStatus] = useState('Active')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customer.trim() || !device.trim()) {
      setError('Please enter customer name and device.')
      return
    }
    const parsedFee = Number.parseFloat(rentFee)
    const parsedDeposit = Number.parseFloat(deposit)
    if (Number.isNaN(parsedFee) || parsedFee < 0) {
      setError('Please enter a valid rental fee.')
      return
    }

    onCreate({
      id: `#RT${Math.floor(7846 + Math.random() * 900)}`,
      customer: customer.trim(),
      email:
        email.trim() ||
        `${customer.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: '+91 98200 11223',
      address: 'Prestige Store Pickup / Verified KYC',
      device: device.trim(),
      serial: `SN: PCS-${Math.floor(1000 + Math.random() * 9000)}`,
      plan,
      startDate: startDate.trim() || 'Dec 01, 2026',
      dueDate: dueDate.trim() || 'Jan 01, 2027',
      dueNote: status === 'Scheduled' ? 'Upcoming start' : '30 days left',
      rentFee: parsedFee,
      deposit: Number.isNaN(parsedDeposit) ? 0 : parsedDeposit,
      depositStatus: status === 'Scheduled' ? 'Pending' : 'Held',
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[500px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4]">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            New Rental Booking
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
                placeholder="e.g. Aditya Rao"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aditya@example.com"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Device
              </label>
              <input
                type="text"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Rental Plan
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Start Date
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Due Date
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Rent Fee ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={rentFee}
                onChange={(e) => setRentFee(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Deposit ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-2.5 py-2.5 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
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
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Rentals({ globalSearch = '' }) {
  const [rentals, setRentals] = useState(INITIAL_RENTALS)
  const [localSearch, setLocalSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [planFilter, setPlanFilter] = useState('All Plans')
  const [depositFilter, setDepositFilter] = useState('All Deposits')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingRental, setViewingRental] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmState, setConfirmState] = useState(null)

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredRentals = useMemo(() => {
    return rentals.filter((item) => {
      const matchesSearch =
        !combinedSearch ||
        item.id.toLowerCase().includes(combinedSearch) ||
        item.customer.toLowerCase().includes(combinedSearch) ||
        item.device.toLowerCase().includes(combinedSearch) ||
        item.serial.toLowerCase().includes(combinedSearch)

      const matchesTab = activeTab === 'All' || item.status === activeTab
      const matchesPlan = planFilter === 'All Plans' || item.plan === planFilter
      const matchesDeposit =
        depositFilter === 'All Deposits' || item.depositStatus === depositFilter

      return matchesSearch && matchesTab && matchesPlan && matchesDeposit
    })
  }, [rentals, combinedSearch, activeTab, planFilter, depositFilter])

  const kpis = useMemo(() => {
    const activeCount = rentals.filter((r) => r.status === 'Active').length
    const overdueCount = rentals.filter((r) => r.status === 'Overdue').length
    const returnedCount = rentals.filter((r) => r.status === 'Returned').length
    const heldDeposits = rentals
      .filter((r) => r.depositStatus === 'Held')
      .reduce((sum, r) => sum + r.deposit, 0)

    return [
      {
        label: 'Active Rentals',
        value: activeCount,
        sub: 'Devices currently rented out',
        icon: CalendarIcon,
        tone: 'green',
      },
      {
        label: 'Overdue Returns',
        value: overdueCount,
        sub: 'Needs immediate follow-up',
        icon: AlertClockIcon,
        tone: 'red',
      },
      {
        label: 'Completed Returns',
        value: returnedCount,
        sub: 'Inspected & back in stock',
        icon: CheckCircleIcon,
        tone: 'amber',
      },
      {
        label: 'Deposits Held',
        value: formatMoney(heldDeposits),
        sub: 'Refundable security pool',
        icon: CreditCardIcon,
        tone: 'red',
      },
    ]
  }, [rentals])

  const allSelected =
    filteredRentals.length > 0 &&
    filteredRentals.every((r) => selectedIds.includes(r.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRentals.map((r) => r.id))
    }
  }

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleUpdateRental = (id, patch) => {
    const existing = rentals.find((r) => r.id === id)
    if (!existing) return

    const needsConfirm =
      patch.status &&
      patch.status !== existing.status &&
      (patch.status === 'Returned' ||
        patch.status === 'Cancelled' ||
        patch.status === 'Active')

    if (needsConfirm) {
      const isCancel = patch.status === 'Cancelled'
      const isReturn = patch.status === 'Returned'
      setConfirmState({
        title: isCancel
          ? `Cancel Rental ${id}?`
          : isReturn
            ? `Mark ${id} Returned?`
            : `Activate Rental ${id}?`,
        message: isCancel
          ? `Are you sure you want to cancel rental booking ${id} for ${existing.customer}?`
          : isReturn
            ? `Confirm that "${existing.device}" from ${existing.customer} has been inspected and returned (Deposit: ${patch.depositStatus || existing.depositStatus})?`
            : `Are you sure you want to mark rental booking ${id} as Active?`,
        confirmText: isCancel
          ? 'Yes, Cancel Booking'
          : isReturn
            ? 'Yes, Mark Returned'
            : 'Yes, Activate',
        variant: isCancel ? 'danger' : 'success',
        onConfirm: () => {
          setRentals((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
          )
          setConfirmState(null)
        },
      })
      return
    }

    setRentals((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    )
  }

  const handleCreateRental = (newRental) => {
    setRentals((prev) => [newRental, ...prev])
    setCreateOpen(false)
  }

  const handleExportCsv = () => {
    const header = [
      'Rental ID',
      'Customer',
      'Device',
      'Serial',
      'Plan',
      'Start Date',
      'Due Date',
      'Rent Fee',
      'Deposit',
      'Deposit Status',
      'Status',
    ]
    const rows = filteredRentals.map((r) => [
      r.id,
      `"${r.customer}"`,
      `"${r.device}"`,
      r.serial,
      r.plan,
      `"${r.startDate}"`,
      `"${r.dueDate}"`,
      r.rentFee.toFixed(2),
      r.deposit.toFixed(2),
      r.depositStatus,
      r.status,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prestige-computers-rentals.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const isFiltered =
    Boolean(combinedSearch) ||
    activeTab !== 'All' ||
    planFilter !== 'All Plans' ||
    depositFilter !== 'All Deposits'

  const totalDisplayCount = isFiltered
    ? filteredRentals.length
    : TOTAL_RENTALS_BASE + (rentals.length - INITIAL_RENTALS.length)

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Rentals
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Manage laptop &amp; PC rental bookings, durations, security deposits
            and returns.
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
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer"
          >
            <PlusIcon className="w-[17px] h-[17px]" />
            <span>New Rental</span>
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
          const count =
            tab === 'All'
              ? rentals.length
              : rentals.filter((r) => r.status === tab).length
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
              placeholder="Search rental ID, renter, device or serial..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
            />
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
                onChange={(e) => setPlanFilter(e.target.value)}
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
                onChange={(e) => setDepositFilter(e.target.value)}
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
                    aria-label="Select all rentals"
                    className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3.5 px-3">Rental ID</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Rented Device</th>
                <th className="py-3.5 px-3">Rental Period</th>
                <th className="py-3.5 px-3">Fee &amp; Deposit</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {filteredRentals.length > 0 ? (
                filteredRentals.map((rental) => {
                  const isChecked = selectedIds.includes(rental.id)
                  const isOverdue = rental.status === 'Overdue'

                  return (
                    <tr
                      key={rental.id}
                      className={[
                        'transition-colors hover:bg-[#fafbfc]',
                        isChecked ? 'bg-red-50/35' : '',
                      ].join(' ')}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(rental.id)}
                          aria-label={`Select rental ${rental.id}`}
                          className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingRental(rental)}
                          className="font-medium text-[#dc1414] hover:underline cursor-pointer"
                        >
                          {rental.id}
                        </button>
                        <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
                          {rental.plan} Plan
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
                        <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
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
                          {formatMoney(rental.rentFee)}
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
          {filteredRentals.length > 0 ? (
            filteredRentals.map((rental) => (
              <div key={rental.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <button
                      type="button"
                      onClick={() => setViewingRental(rental)}
                      className="text-[13.5px] font-medium text-[#dc1414] hover:underline cursor-pointer"
                    >
                      {rental.id}
                    </button>
                    <p className="text-[12px] text-[#6b7280]">
                      {rental.plan} Plan &bull; {rental.startDate} &rarr;{' '}
                      {rental.dueDate}
                    </p>
                  </div>
                  <RentalStatusBadge status={rental.status} />
                </div>

                <div>
                  <p className="text-[12.5px] font-medium text-[#111827]">
                    {rental.customer}
                  </p>
                  <p className="text-[12px] text-[#4b5563]">
                    {rental.device} ({rental.serial})
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[13.5px] font-semibold text-[#111827]">
                      {formatMoney(rental.rentFee)}
                    </span>
                    <span className="ml-2 text-[12px] text-[#6b7280]">
                      Dep: {formatMoney(rental.deposit)} (
                      <DepositBadge status={rental.depositStatus} />)
                    </span>
                  </div>
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
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
        <p className="text-[13px] font-normal text-[#4b5563]">
          {filteredRentals.length > 0
            ? `Showing 1 to ${filteredRentals.length} of ${totalDisplayCount} rental bookings`
            : 'Showing 0 rental bookings'}
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

      {/* Rental Details / Return Modal */}
      {viewingRental && (
        <RentalDetailModal
          key={viewingRental.id}
          rental={viewingRental}
          onClose={() => setViewingRental(null)}
          onUpdate={handleUpdateRental}
        />
      )}

      {/* New Rental Booking Modal */}
      {createOpen && (
        <CreateRentalModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreateRental}
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
