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
  TrashIcon,
  UsersIcon,
} from '../../components/common/Icons'

const INITIAL_CUSTOMERS = [
  {
    id: 'CUS-1001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    phone: '+91 98204 51230',
    city: 'Mumbai',
    address: '402 Tech Park Ave, Bandra West, Mumbai 400050',
    segment: 'VIP',
    ordersCount: 6,
    rentalsCount: 1,
    totalSpent: 5890.0,
    kycStatus: 'Verified',
    status: 'Active',
    joinedAt: 'Jan 14, 2026',
    lastActivity: '2 hours ago',
  },
  {
    id: 'CUS-1002',
    name: 'Priya Verma',
    email: 'priya.v@outlook.com',
    phone: '+91 98112 34901',
    city: 'Gurugram',
    address: '18 Cyber Hub Tower B, Gurugram 122002',
    segment: 'Corporate',
    ordersCount: 9,
    rentalsCount: 4,
    totalSpent: 11420.0,
    kycStatus: 'Verified',
    status: 'Active',
    joinedAt: 'Nov 02, 2025',
    lastActivity: '5 hours ago',
  },
  {
    id: 'CUS-1003',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@techcorp.in',
    phone: '+91 99001 77421',
    city: 'Bengaluru',
    address: '75 Indiranagar 100ft Rd, Bengaluru 560038',
    segment: 'Corporate',
    ordersCount: 5,
    rentalsCount: 2,
    totalSpent: 7650.0,
    kycStatus: 'Verified',
    status: 'Active',
    joinedAt: 'Mar 19, 2026',
    lastActivity: '1 day ago',
  },
  {
    id: 'CUS-1004',
    name: 'Neha Kapoor',
    email: 'neha.kapoor@studio.co',
    phone: '+91 98765 40129',
    city: 'Pune',
    address: '12 Koregaon Park Lane 5, Pune 411001',
    segment: 'VIP',
    ordersCount: 3,
    rentalsCount: 3,
    totalSpent: 3180.0,
    kycStatus: 'Verified',
    status: 'Active',
    joinedAt: 'Apr 08, 2026',
    lastActivity: '1 day ago',
  },
  {
    id: 'CUS-1005',
    name: 'Vikram Singh',
    email: 'vikram.s@gmail.com',
    phone: '+91 97170 88214',
    city: 'New Delhi',
    address: '29 Connaught Circus, New Delhi 110001',
    segment: 'Regular',
    ordersCount: 2,
    rentalsCount: 0,
    totalSpent: 1499.0,
    kycStatus: 'Pending',
    status: 'Active',
    joinedAt: 'Aug 22, 2026',
    lastActivity: '2 days ago',
  },
  {
    id: 'CUS-1006',
    name: 'Siddharth Nair',
    email: 'sid.nair@devlabs.in',
    phone: '+91 98201 77634',
    city: 'Mumbai',
    address: '904 Hiranandani Gardens, Powai, Mumbai 400076',
    segment: 'Regular',
    ordersCount: 1,
    rentalsCount: 2,
    totalSpent: 890.0,
    kycStatus: 'Verified',
    status: 'Blocked',
    joinedAt: 'Sep 11, 2026',
    lastActivity: '4 days ago',
  },
]

const TABS = ['All', 'Active', 'VIP', 'Corporate', 'Blocked']
const KYC_FILTERS = ['All KYC', 'Verified', 'Pending', 'Unverified']
const SORT_OPTIONS = ['Highest Spend', 'Most Orders', 'Name (A-Z)']
const PAGES = [1, 2, 3, 4, 5]
const TOTAL_CUSTOMERS_BASE = 3892

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

function ShieldCheckIcon({ className = 'w-5 h-5' }) {
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
      <path d="M12 3 5 6v6c0 4.5 3 8.2 7 9.5 4-1.3 7-5 7-9.5V6l-7-3Z" />
      <path d="m9 12.2 2 2 4-4.2" />
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

function SegmentBadge({ segment }) {
  const styles = {
    VIP: 'bg-[#fef2f2] text-[#dc1414] border border-[#fecaca]',
    Corporate: 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]',
    Regular: 'bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]',
  }

  return (
    <span
      className={[
        'inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[11.5px] font-medium leading-tight whitespace-nowrap',
        styles[segment] || styles.Regular,
      ].join(' ')}
    >
      {segment}
    </span>
  )
}

function StatusBadge({ status, onClick }) {
  const styles = {
    Active: 'bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0]',
    Blocked: 'bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca]',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        status === 'Active'
          ? 'Click to block customer'
          : 'Click to activate customer'
      }
      className={[
        'inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-medium leading-none whitespace-nowrap transition-colors cursor-pointer',
        styles[status] || styles.Active,
      ].join(' ')}
    >
      {status}
    </button>
  )
}

function KycBadge({ kycStatus }) {
  const config = {
    Verified: { dot: 'bg-[#16a34a]', text: 'text-[#15803d]' },
    Pending: { dot: 'bg-[#d97706]', text: 'text-[#b45309]' },
    Unverified: { dot: 'bg-[#9ca3af]', text: 'text-[#6b7280]' },
  }
  const c = config[kycStatus] || config.Unverified

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {kycStatus}
    </span>
  )
}

function CustomerDetailModal({ customer, onClose, onUpdate }) {
  const [segment, setSegment] = useState(customer?.segment || 'Regular')
  const [kycStatus, setKycStatus] = useState(customer?.kycStatus || 'Pending')
  const [status, setStatus] = useState(customer?.status || 'Active')

  if (!customer) return null

  const handleSave = () => {
    onUpdate(customer.id, { segment, kycStatus, status })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[540px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#111215] text-white text-[13px] font-medium flex items-center justify-center shrink-0">
              {getInitials(customer.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-[#111827]">
                  {customer.name}
                </h3>
                <SegmentBadge segment={customer.segment} />
              </div>
              <p className="text-[12px] font-normal text-[#6b7280]">
                {customer.id} &bull; Joined {customer.joinedAt}
              </p>
            </div>
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
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-3 text-center">
              <p className="text-[11.5px] font-normal text-[#6b7280]">
                Total Orders
              </p>
              <p className="text-[17px] font-semibold text-[#111827] mt-0.5">
                {customer.ordersCount}
              </p>
            </div>
            <div className="rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-3 text-center">
              <p className="text-[11.5px] font-normal text-[#6b7280]">
                Rentals
              </p>
              <p className="text-[17px] font-semibold text-[#111827] mt-0.5">
                {customer.rentalsCount}
              </p>
            </div>
            <div className="rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-3 text-center">
              <p className="text-[11.5px] font-normal text-[#6b7280]">
                Lifetime Spend
              </p>
              <p className="text-[16px] font-semibold text-[#dc1414] mt-0.5">
                {formatMoney(customer.totalSpent)}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-xl border border-[#e5e7eb] divide-y divide-[#eef0f4] text-[12.5px]">
            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#6b7280] font-normal">Email</span>
              <span className="font-medium text-[#111827]">
                {customer.email}
              </span>
            </div>
            <div className="px-4 py-2.5 flex items-center justify-between gap-2">
              <span className="text-[#6b7280] font-normal">Phone</span>
              <span className="font-medium text-[#111827]">
                {customer.phone}
              </span>
            </div>
            <div className="px-4 py-2.5 flex items-start justify-between gap-4">
              <span className="text-[#6b7280] font-normal shrink-0">
                Address
              </span>
              <span className="font-medium text-[#1f2937] text-right">
                {customer.address}
              </span>
            </div>
          </div>

          {/* Management Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Segment
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Rental KYC
              </label>
              <select
                value={kycStatus}
                onChange={(e) => setKycStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#eef0f4] bg-[#fafbfc] shrink-0">
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
            Save Profile
          </button>
        </div>
      </div>
    </div>
  )
}

function AddCustomerModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [segment, setSegment] = useState('Regular')
  const [kycStatus, setKycStatus] = useState('Pending')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please enter customer name and email address.')
      return
    }

    onAdd({
      id: `CUS-${Math.floor(1007 + Math.random() * 899)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98000 00000',
      city: city.trim() || 'Mumbai',
      address: `${city.trim() || 'Mumbai'}, India`,
      segment,
      ordersCount: 0,
      rentalsCount: 0,
      totalSpent: 0,
      kycStatus,
      status: 'Active',
      joinedAt: 'Nov 30, 2026',
      lastActivity: 'Just now',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[480px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4]">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Add New Customer
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
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. Kabir Khanna"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                placeholder="kabir@example.com"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Segment
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Rental KYC Status
              </label>
              <select
                value={kycStatus}
                onChange={(e) => setKycStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Unverified">Unverified</option>
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
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Customers({ globalSearch = '' }) {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS)
  const [localSearch, setLocalSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [kycFilter, setKycFilter] = useState('All KYC')
  const [sortBy, setSortBy] = useState('Highest Spend')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingCustomer, setViewingCustomer] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmState, setConfirmState] = useState(null)

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredCustomers = useMemo(() => {
    const list = customers.filter((customer) => {
      const matchesSearch =
        !combinedSearch ||
        customer.name.toLowerCase().includes(combinedSearch) ||
        customer.email.toLowerCase().includes(combinedSearch) ||
        customer.phone.toLowerCase().includes(combinedSearch) ||
        customer.city.toLowerCase().includes(combinedSearch) ||
        customer.id.toLowerCase().includes(combinedSearch)

      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Active' && customer.status === 'Active') ||
        (activeTab === 'Blocked' && customer.status === 'Blocked') ||
        customer.segment === activeTab

      const matchesKyc =
        kycFilter === 'All KYC' || customer.kycStatus === kycFilter

      return matchesSearch && matchesTab && matchesKyc
    })

    return [...list].sort((a, b) => {
      if (sortBy === 'Most Orders') {
        return b.ordersCount + b.rentalsCount - (a.ordersCount + a.rentalsCount)
      }
      if (sortBy === 'Name (A-Z)') {
        return a.name.localeCompare(b.name)
      }
      return b.totalSpent - a.totalSpent
    })
  }, [customers, combinedSearch, activeTab, kycFilter, sortBy])

  const kpis = useMemo(() => {
    const activeCount = customers.filter((c) => c.status === 'Active').length
    const verifiedCount = customers.filter(
      (c) => c.kycStatus === 'Verified',
    ).length
    const totalSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0)

    return [
      {
        label: 'Total Customers',
        value: (
          TOTAL_CUSTOMERS_BASE +
          (customers.length - INITIAL_CUSTOMERS.length)
        ).toLocaleString(),
        sub: 'Registered accounts',
        icon: UsersIcon,
        tone: 'red',
      },
      {
        label: 'Active Accounts',
        value: activeCount,
        sub: 'In good standing',
        icon: CheckCircleIcon,
        tone: 'green',
      },
      {
        label: 'Rental KYC Verified',
        value: verifiedCount,
        sub: 'Eligible for rentals',
        icon: ShieldCheckIcon,
        tone: 'amber',
      },
      {
        label: 'Customer Lifetime Value',
        value: formatMoney(totalSpend),
        sub: 'Purchases & rentals',
        icon: CreditCardIcon,
        tone: 'red',
      },
    ]
  }, [customers])

  const allSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((c) => selectedIds.includes(c.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCustomers.map((c) => c.id))
    }
  }

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleUpdateCustomer = (id, patch) => {
    const existing = customers.find((c) => c.id === id)
    if (existing && patch.status && patch.status !== existing.status) {
      const isBlocking = patch.status === 'Blocked'
      setConfirmState({
        title: isBlocking ? 'Block Customer Account?' : 'Activate Customer Account?',
        message: isBlocking
          ? `Are you sure you want to block "${existing.name}"? They will no longer be able to place orders or rent devices.`
          : `Are you sure you want to reactivate "${existing.name}"?`,
        confirmText: isBlocking ? 'Yes, Block' : 'Yes, Activate',
        variant: isBlocking ? 'danger' : 'success',
        onConfirm: () => {
          setCustomers((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          )
          setConfirmState(null)
        },
      })
      return
    }
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    )
  }

  const requestToggleStatus = (customer) => {
    const nextStatus = customer.status === 'Active' ? 'Blocked' : 'Active'
    const isBlocking = nextStatus === 'Blocked'
    setConfirmState({
      title: isBlocking ? 'Block Customer Account?' : 'Activate Customer Account?',
      message: isBlocking
        ? `Are you sure you want to mark "${customer.name}" as Blocked / Inactive?`
        : `Are you sure you want to mark "${customer.name}" as Active?`,
      confirmText: isBlocking ? 'Yes, Block' : 'Yes, Activate',
      variant: isBlocking ? 'danger' : 'success',
      onConfirm: () => {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id ? { ...c, status: nextStatus } : c,
          ),
        )
        setConfirmState(null)
      },
    })
  }

  const requestDeleteCustomer = (customer) => {
    setConfirmState({
      title: 'Delete Customer?',
      message: `Are you sure you want to permanently remove "${customer.name}" (${customer.email})? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: () => {
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id))
        setSelectedIds((prev) => prev.filter((item) => item !== customer.id))
        setConfirmState(null)
      },
    })
  }

  const handleAddCustomer = (newCustomer) => {
    setCustomers((prev) => [newCustomer, ...prev])
    setAddOpen(false)
  }

  const handleExportCsv = () => {
    const header = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'City',
      'Segment',
      'Orders',
      'Rentals',
      'Total Spent',
      'KYC',
      'Status',
    ]
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.name}"`,
      c.email,
      `"${c.phone}"`,
      c.city,
      c.segment,
      c.ordersCount,
      c.rentalsCount,
      c.totalSpent.toFixed(2),
      c.kycStatus,
      c.status,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prestige-computers-customers.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const getTabCount = (tab) => {
    if (tab === 'All') return customers.length
    if (tab === 'Active' || tab === 'Blocked') {
      return customers.filter((c) => c.status === tab).length
    }
    return customers.filter((c) => c.segment === tab).length
  }

  const isFiltered =
    Boolean(combinedSearch) || activeTab !== 'All' || kycFilter !== 'All KYC'

  const totalDisplayCount = isFiltered
    ? filteredCustomers.length
    : TOTAL_CUSTOMERS_BASE + (customers.length - INITIAL_CUSTOMERS.length)

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Customers
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Manage registered customers, rental KYC verification and purchase
            history.
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
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer"
          >
            <PlusIcon className="w-[17px] h-[17px]" />
            <span>Add Customer</span>
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

      {/* Segment / Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => {
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
                {getTabCount(tab)}
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
              placeholder="Search name, email, phone or city..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="customer-kyc-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              KYC:
            </label>
            <div className="relative flex-1 sm:w-[165px]">
              <select
                id="customer-kyc-filter"
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {KYC_FILTERS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label
              htmlFor="customer-sort"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Sort:
            </label>
            <div className="relative flex-1 sm:w-[175px]">
              <select
                id="customer-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table Card */}
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
                    aria-label="Select all customers"
                    className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Contact &amp; City</th>
                <th className="py-3.5 px-3">Segment</th>
                <th className="py-3.5 px-3">Orders &amp; Rentals</th>
                <th className="py-3.5 px-3">Total Spent</th>
                <th className="py-3.5 px-3">KYC</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => {
                  const isChecked = selectedIds.includes(customer.id)

                  return (
                    <tr
                      key={customer.id}
                      className={[
                        'transition-colors hover:bg-[#fafbfc]',
                        isChecked ? 'bg-red-50/35' : '',
                      ].join(' ')}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(customer.id)}
                          aria-label={`Select ${customer.name}`}
                          className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#111215] text-white text-[11.5px] font-medium flex items-center justify-center shrink-0">
                            {getInitials(customer.name)}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setViewingCustomer(customer)}
                              className="font-medium text-[#111827] hover:text-[#dc1414] transition-colors text-left leading-snug truncate block cursor-pointer"
                            >
                              {customer.name}
                            </button>
                            <p className="text-[12px] text-[#6b7280] truncate">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="text-[13px] font-medium text-[#1f2937]">
                          {customer.phone}
                        </p>
                        <p className="text-[12px] text-[#6b7280] mt-0.5">
                          {customer.city}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        <SegmentBadge segment={customer.segment} />
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <p className="text-[13px] font-medium text-[#111827]">
                          {customer.ordersCount}{' '}
                          {customer.ordersCount === 1 ? 'order' : 'orders'}
                        </p>
                        <p className="text-[12px] text-[#6b7280] mt-0.5">
                          {customer.rentalsCount}{' '}
                          {customer.rentalsCount === 1 ? 'rental' : 'rentals'}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#111827] whitespace-nowrap">
                        {formatMoney(customer.totalSpent)}
                      </td>
                      <td className="py-3.5 px-3">
                        <KycBadge kycStatus={customer.kycStatus} />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge
                          status={customer.status}
                          onClick={() => requestToggleStatus(customer)}
                        />
                      </td>
                      <td className="py-3.5 pl-3 pr-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingCustomer(customer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] transition-colors cursor-pointer"
                          >
                            <EyeIcon className="w-4 h-4 text-[#4b5563]" />
                            <span>Profile</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteCustomer(customer)}
                            aria-label={`Delete ${customer.name}`}
                            className="p-1.5 rounded-lg text-[#dc1414] hover:text-[#a30b0b] hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-[13px] font-normal text-[#6b7280]"
                  >
                    No customers match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View */}
        <div className="lg:hidden divide-y divide-[#eef0f4]">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#111215] text-white text-[12px] font-medium flex items-center justify-center shrink-0">
                      {getInitials(customer.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-medium text-[#111827] truncate">
                          {customer.name}
                        </p>
                        <SegmentBadge segment={customer.segment} />
                      </div>
                      <p className="text-[12px] text-[#6b7280] truncate">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={customer.status}
                    onClick={() => requestToggleStatus(customer)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#4b5563]">
                  <span>{customer.phone}</span>
                  <span>{customer.city}</span>
                  <span>
                    {customer.ordersCount} orders &bull; {customer.rentalsCount}{' '}
                    rentals
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[13.5px] font-semibold text-[#111827]">
                      {formatMoney(customer.totalSpent)}
                    </span>
                    <KycBadge kycStatus={customer.kycStatus} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingCustomer(customer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] cursor-pointer"
                    >
                      <EyeIcon className="w-4 h-4 text-[#4b5563]" />
                      <span>Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteCustomer(customer)}
                      aria-label={`Delete ${customer.name}`}
                      className="p-1.5 rounded-lg text-[#dc1414] hover:bg-red-50 cursor-pointer"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-[12.5px] text-[#6b7280]">
              No customers match your current filters.
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
        <p className="text-[13px] font-normal text-[#4b5563]">
          {filteredCustomers.length > 0
            ? `Showing 1 to ${filteredCustomers.length} of ${totalDisplayCount.toLocaleString()} customers`
            : 'Showing 0 customers'}
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

      {/* Customer Profile Modal */}
      {viewingCustomer && (
        <CustomerDetailModal
          key={viewingCustomer.id}
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onUpdate={handleUpdateCustomer}
        />
      )}

      {/* Add Customer Modal */}
      {addOpen && (
        <AddCustomerModal
          isOpen={addOpen}
          onClose={() => setAddOpen(false)}
          onAdd={handleAddCustomer}
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
