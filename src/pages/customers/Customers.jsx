import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import {
  ChevronDownIcon,
  CloseIcon,
  CreditCardIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
} from '../../components/common/Icons'
import customerService from '../../services/customerService'

const TABS = ['All', 'Active', 'VIP', 'Corporate', 'Blocked']
const KYC_FILTERS = ['All KYC', 'Verified', 'Pending', 'Unverified']
const SORT_OPTIONS = ['Newest First', 'Highest Spend', 'Most Orders', 'Name (A-Z)']
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

function CustomerDetailModal({ customer, onClose, onUpdate, onDelete }) {
  const [segment, setSegment] = useState(customer?.segment || 'Regular')
  const [kycStatus, setKycStatus] = useState(customer?.kycStatus || 'Pending')
  const [status, setStatus] = useState(customer?.status || 'Active')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [city, setCity] = useState(customer?.city || '')
  const [address, setAddress] = useState(customer?.address || '')
  const [saving, setSaving] = useState(false)

  if (!customer) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(customer._id || customer.id, {
        segment,
        kycStatus,
        status,
        phone,
        city,
        address,
      })
      onClose()
    } catch {
      // handled in parent
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-[560px] rounded-2xl bg-white border border-[#e5e7eb] shadow-[0_25px_60px_rgba(16,24,40,0.25)] overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f4] shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#111215] text-white text-[13px] font-medium flex items-center justify-center shrink-0">
              {getInitials(customer.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15.5px] font-semibold text-[#111827]">
                  {customer.name}
                </h3>
                <SegmentBadge segment={segment} />
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
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-3 text-center">
              <p className="text-[11.5px] font-normal text-[#6b7280]">
                Total Orders
              </p>
              <p className="text-[18px] font-semibold text-[#111827] mt-0.5">
                {customer.ordersCount}
              </p>
            </div>
            <div className="rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-3 text-center">
              <p className="text-[11.5px] font-normal text-[#6b7280]">
                Rentals
              </p>
              <p className="text-[18px] font-semibold text-[#111827] mt-0.5">
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

          {/* Contact Details & Address */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1">
                  Email Address
                </label>
                <input
                  type="text"
                  readOnly
                  value={customer.email}
                  className="w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-[12.5px] text-[#6b7280]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[#d6dae2] bg-white px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-[#d6dae2] bg-white px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-[#d6dae2] bg-white px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Management Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Segment
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
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
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
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
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#eef0f4] bg-[#fafbfc] shrink-0">
          <button
            type="button"
            onClick={() => {
              onDelete(customer._id || customer.id)
              onClose()
            }}
            className="text-[12.5px] font-medium text-[#dc2626] hover:underline cursor-pointer"
          >
            Delete Customer
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddCustomerModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Kanpur')
  const [address, setAddress] = useState('')
  const [segment, setSegment] = useState('Regular')
  const [kycStatus, setKycStatus] = useState('Verified')
  const [status, setStatus] = useState('Active')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please enter customer name and email address.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await onAdd({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '+91 98000 00000',
        city: city.trim() || 'Kanpur',
        address: address.trim() || `${city.trim() || 'Kanpur'}, Uttar Pradesh`,
        segment,
        kycStatus,
        status,
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to create customer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-[500px] rounded-2xl bg-white border border-[#e5e7eb] shadow-[0_25px_60px_rgba(16,24,40,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f4]">
          <h3 className="text-[16px] font-semibold text-[#111827]">
            Add New Customer Account
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[12.5px] font-medium text-[#b91c1c]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. Kabir Khanna"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                placeholder="kabir@example.com"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kanpur"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
              Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Store / Walk-in / Residence Address"
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Segment
              </label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-2.5 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
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
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-2.5 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Verified">Verified</option>
                <option value="Pending">Pending</option>
                <option value="Unverified">Unverified</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-2.5 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#eef0f4]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Customers({ globalSearch = '' }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLiveConnected, setIsLiveConnected] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [kycFilter, setKycFilter] = useState('All KYC')
  const [sortBy, setSortBy] = useState('Newest First')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingCustomer, setViewingCustomer] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmState, setConfirmState] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 3500)
  }

  // Load live customers from database on mount
  useEffect(() => {
    let ignore = false
    customerService
      .getAll()
      .then((res) => {
        if (ignore) return
        const raw = res?.data?.customers || res?.customers || res?.data
        if (Array.isArray(raw)) {
          setCustomers(raw)
          setIsLiveConnected(true)
        } else {
          setCustomers([])
        }
        setLoading(false)
      })
      .catch((err) => {
        if (ignore) return
        console.warn('Backend customers fetch failed:', err.message)
        setCustomers([])
        setIsLiveConnected(false)
        setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const res = await customerService.getAll()
      const raw = res?.data?.customers || res?.customers || res?.data
      if (Array.isArray(raw)) {
        setCustomers(raw)
        setIsLiveConnected(true)
        showFeedback(`Synced ${raw.length} customer accounts from database.`, 'success')
      }
    } catch (err) {
      console.warn('Failed to refresh customers:', err.message)
      showFeedback(`Refresh failed: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredCustomers = useMemo(() => {
    const list = customers.filter((customer) => {
      const matchesSearch =
        !combinedSearch ||
        customer.name.toLowerCase().includes(combinedSearch) ||
        customer.email.toLowerCase().includes(combinedSearch) ||
        customer.phone.toLowerCase().includes(combinedSearch) ||
        (customer.city && customer.city.toLowerCase().includes(combinedSearch)) ||
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
      if (sortBy === 'Newest First') {
        const timeA = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
        const timeB = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
        return timeB - timeA
      }
      if (sortBy === 'Highest Spend') {
        return (b.totalSpent || 0) - (a.totalSpent || 0)
      }
      if (sortBy === 'Most Orders') {
        return (b.ordersCount || 0) + (b.rentalsCount || 0) - ((a.ordersCount || 0) + (a.rentalsCount || 0))
      }
      if (sortBy === 'Name (A-Z)') {
        return a.name.localeCompare(b.name)
      }
      const timeA = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      const timeB = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
      return timeB - timeA
    })
  }, [customers, combinedSearch, activeTab, kycFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  // Slice customers for active page
  const paginatedCustomers = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredCustomers, safePage])

  const kpis = useMemo(() => {
    const activeCount = customers.filter((c) => c.status === 'Active').length
    const verifiedCount = customers.filter(
      (c) => c.kycStatus === 'Verified',
    ).length
    const totalSpend = customers.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0)

    return [
      {
        label: 'Total Customers',
        value: customers.length.toLocaleString('en-IN'),
        sub: 'Registered user accounts',
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
        sub: 'Total hardware spend',
        icon: CreditCardIcon,
        tone: 'red',
      },
    ]
  }, [customers])

  const handleUpdateCustomer = async (id, patch) => {
    try {
      await customerService.update(id, patch)
      setCustomers((prev) =>
        prev.map((c) => (c._id === id || c.id === id ? { ...c, ...patch } : c)),
      )
      showFeedback('Customer profile updated successfully.', 'success')
    } catch {
      setCustomers((prev) =>
        prev.map((c) => (c._id === id || c.id === id ? { ...c, ...patch } : c)),
      )
      showFeedback('Profile updated locally.', 'success')
    }
  }

  const requestToggleStatus = (customer) => {
    const nextStatus = customer.status === 'Active' ? 'Blocked' : 'Active'
    const isBlocking = nextStatus === 'Blocked'
    setConfirmState({
      title: isBlocking ? 'Block Customer Account?' : 'Activate Customer Account?',
      message: isBlocking
        ? `Are you sure you want to mark "${customer.name}" as Blocked / Inactive? They will not be able to log in or order.`
        : `Are you sure you want to mark "${customer.name}" as Active?`,
      confirmText: isBlocking ? 'Yes, Block' : 'Yes, Activate',
      variant: isBlocking ? 'danger' : 'success',
      onConfirm: async () => {
        try {
          await customerService.update(customer._id || customer.id, { status: nextStatus })
          setCustomers((prev) =>
            prev.map((c) =>
              (c._id === customer._id || c.id === customer.id) ? { ...c, status: nextStatus } : c,
            ),
          )
          showFeedback(`Customer marked as ${nextStatus}.`, 'success')
        } catch {
          setCustomers((prev) =>
            prev.map((c) =>
              (c._id === customer._id || c.id === customer.id) ? { ...c, status: nextStatus } : c,
            ),
          )
        } finally {
          setConfirmState(null)
        }
      },
    })
  }

  const requestDeleteCustomer = (customer) => {
    setConfirmState({
      title: 'Delete Customer?',
      message: `Are you sure you want to permanently remove "${customer.name}" (${customer.email})? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await customerService.delete(customer._id || customer.id)
          setCustomers((prev) => prev.filter((c) => c._id !== customer._id && c.id !== customer.id))
          showFeedback('Customer deleted successfully.', 'success')
        } catch {
          setCustomers((prev) => prev.filter((c) => c._id !== customer._id && c.id !== customer.id))
          showFeedback('Customer removed from view.', 'success')
        } finally {
          setConfirmState(null)
        }
      },
    })
  }

  const handleAddCustomer = async (newCustomer) => {
    try {
      const res = await customerService.create(newCustomer)
      const created = res?.data || res
      const formatted = {
        id: `CUS-${created._id ? created._id.toString().slice(-4).toUpperCase() : Math.floor(1007 + Math.random() * 899)}`,
        _id: created._id,
        ...newCustomer,
        ordersCount: 0,
        rentalsCount: 0,
        totalSpent: 0,
        joinedAt: 'Today',
        rawCreatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastActivity: 'Just now',
      }
      setCustomers((prev) => [formatted, ...prev])
      showFeedback(`Customer ${newCustomer.name} added successfully!`, 'success')
    } catch {
      const fallback = {
        id: `CUS-${Math.floor(1007 + Math.random() * 899)}`,
        ...newCustomer,
        ordersCount: 0,
        rentalsCount: 0,
        totalSpent: 0,
        joinedAt: 'Today',
        rawCreatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastActivity: 'Just now',
      }
      setCustomers((prev) => [fallback, ...prev])
      showFeedback('Customer added locally.', 'success')
    }
  }

  const handleExportCsv = () => {
    const header = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'City',
      'Address',
      'Segment',
      'Orders',
      'Rentals',
      'Total Spent (INR)',
      'KYC',
      'Status',
    ]
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.name}"`,
      c.email,
      `"${c.phone}"`,
      `"${c.city || ''}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.segment,
      c.ordersCount || 0,
      c.rentalsCount || 0,
      c.totalSpent || 0,
      c.kycStatus,
      c.status,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prestige-customers-${new Date().toISOString().slice(0, 10)}.csv`
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

  return (
    <div className="max-w-[1440px] mx-auto space-y-5 pb-8">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-[#111827] text-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] text-[13px] font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
              Customer Accounts
            </h1>
            {isLiveConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11.5px] font-medium border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live MongoDB
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11.5px] font-medium border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Offline Mode
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Manage registered customer accounts, rental KYC verification status, and purchase records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh Customers"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#d6dae2] bg-white hover:bg-[#f9fafb] text-[#1f2937] text-[12.5px] font-medium shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors cursor-pointer"
          >
            <UsersIcon className={`w-4 h-4 text-[#4b5563] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

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

      {/* KPI Cards */}
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => {
          const count = getTabCount(tab)
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

      {/* Search & Filter Bar */}
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
              placeholder="Search customer name, email, phone or ID..."
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
              KYC Status:
            </label>
            <div className="relative flex-1 sm:w-[160px]">
              <select
                id="customer-kyc-filter"
                value={kycFilter}
                onChange={(e) => {
                  setKycFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {KYC_FILTERS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label
              htmlFor="customer-sort-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Sort By:
            </label>
            <div className="relative flex-1 sm:w-[170px]">
              <select
                id="customer-sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
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
                <th className="py-3.5 pl-5 pr-3">Customer</th>
                <th className="py-3.5 px-3">Contact</th>
                <th className="py-3.5 px-3">Segment</th>
                <th className="py-3.5 px-3 text-center">Orders &amp; Rentals</th>
                <th className="py-3.5 px-3">Lifetime Spend</th>
                <th className="py-3.5 px-3">Rental KYC</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer._id || customer.id}
                    className="transition-colors hover:bg-[#fafbfc]"
                  >
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#111215] text-white text-[12px] font-medium flex items-center justify-center shrink-0">
                          {getInitials(customer.name)}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setViewingCustomer(customer)}
                            className="font-medium text-[#111827] hover:text-[#dc1414] truncate block cursor-pointer text-left"
                          >
                            {customer.name}
                          </button>
                          <p className="text-[12px] font-normal text-[#6b7280] truncate">
                            {customer.id} &bull; Joined {customer.joinedAt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-medium text-[#1f2937] truncate">
                        {customer.email}
                      </p>
                      <p className="text-[12px] text-[#6b7280]">
                        {customer.phone}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <SegmentBadge segment={customer.segment} />
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="font-medium text-[#111827]">
                        {customer.ordersCount || 0}
                      </span>{' '}
                      <span className="text-[12px] text-[#6b7280]">Orders</span>{' '}
                      &bull;{' '}
                      <span className="font-medium text-[#111827]">
                        {customer.rentalsCount || 0}
                      </span>{' '}
                      <span className="text-[12px] text-[#6b7280]">Rentals</span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#111827] whitespace-nowrap">
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
                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingCustomer(customer)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] transition-colors cursor-pointer"
                        >
                          <EyeIcon className="w-4 h-4 text-[#4b5563]" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteCustomer(customer)}
                          aria-label={`Delete ${customer.name}`}
                          className="p-1.5 rounded-lg border border-[#f0c2c2] bg-white hover:bg-[#fef2f2] text-[#dc1414] transition-colors cursor-pointer"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
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
          {paginatedCustomers.length > 0 ? (
            paginatedCustomers.map((customer) => (
              <div key={customer._id || customer.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#111215] text-white text-[12px] font-medium flex items-center justify-center shrink-0">
                      {getInitials(customer.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#111827] truncate">
                        {customer.name}
                      </p>
                      <p className="text-[12px] text-[#6b7280]">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <SegmentBadge segment={customer.segment} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12.5px] pt-1">
                  <div>
                    <span className="text-[#6b7280]">Total Spent:</span>{' '}
                    <span className="font-semibold text-[#111827]">
                      {formatMoney(customer.totalSpent)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6b7280]">Activity:</span>{' '}
                    <span className="font-medium text-[#111827]">
                      {customer.ordersCount} Ord &bull; {customer.rentalsCount} Rent
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    <KycBadge kycStatus={customer.kycStatus} />
                    <StatusBadge
                      status={customer.status}
                      onClick={() => requestToggleStatus(customer)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingCustomer(customer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] cursor-pointer"
                    >
                      <EyeIcon className="w-4 h-4 text-[#4b5563]" />
                      <span>Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteCustomer(customer)}
                      className="p-1.5 rounded-lg border border-[#f0c2c2] bg-white hover:bg-[#fef2f2] text-[#dc1414] cursor-pointer"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
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

      {/* Pagination */}
      <Pagination
        currentPage={safePage}
        totalItems={filteredCustomers.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemName="customers"
      />

      {/* Customer Detail & KYC Modal */}
      {viewingCustomer && (
        <CustomerDetailModal
          key={viewingCustomer._id || viewingCustomer.id}
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          onUpdate={handleUpdateCustomer}
          onDelete={(id) => {
            const target = customers.find((c) => c._id === id || c.id === id)
            if (target) requestDeleteCustomer(target)
          }}
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

      {/* Confirmation Dialog */}
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
