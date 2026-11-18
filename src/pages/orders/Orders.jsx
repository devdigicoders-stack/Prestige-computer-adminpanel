import { useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  CartIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CreditCardIcon,
  PlusIcon,
  SearchIcon,
} from '../../components/common/Icons'

const INITIAL_ORDERS = [
  {
    id: '#PC12845',
    date: 'Nov 30, 2026',
    time: '2:15 PM',
    customer: 'Aarav Sharma',
    email: 'aarav.sharma@gmail.com',
    phone: '+91 98204 51230',
    address: '402 Tech Park Ave, Bandra West, Mumbai 400050',
    items: [{ name: 'Dell XPS 15 (2024)', qty: 1, price: 1799.0 }],
    type: 'Purchase',
    paymentMethod: 'Credit Card (Visa)',
    paymentStatus: 'Paid',
    status: 'Processing',
  },
  {
    id: '#PC12844',
    date: 'Nov 30, 2026',
    time: '11:40 AM',
    customer: 'Priya Verma',
    email: 'priya.v@outlook.com',
    phone: '+91 98112 34901',
    address: '18 Cyber Hub Tower B, Gurugram 122002',
    items: [
      { name: 'HP EliteBook 840 G10', qty: 1, price: 1299.0 },
      { name: 'HP EliteBook 840 G10 (Dock Bundle)', qty: 1, price: 1299.0 },
    ],
    type: 'Purchase',
    paymentMethod: 'UPI / NetBanking',
    paymentStatus: 'Paid',
    status: 'Shipped',
  },
  {
    id: '#PC12843',
    date: 'Nov 29, 2026',
    time: '6:05 PM',
    customer: 'Rohan Mehta',
    email: 'rohan.mehta@techcorp.in',
    phone: '+91 99001 77421',
    address: '75 Indiranagar 100ft Rd, Bengaluru 560038',
    items: [{ name: 'ASUS ROG Strix G16', qty: 1, price: 2099.0 }],
    type: 'Purchase',
    paymentMethod: 'Credit Card (Mastercard)',
    paymentStatus: 'Paid',
    status: 'Delivered',
  },
  {
    id: '#PC12842',
    date: 'Nov 29, 2026',
    time: '3:20 PM',
    customer: 'Neha Kapoor',
    email: 'neha.kapoor@studio.co',
    phone: '+91 98765 40129',
    address: '12 Koregaon Park Lane 5, Pune 411001',
    items: [{ name: 'Apple MacBook Air M2 (30-Day Rent)', qty: 1, price: 199.0 }],
    type: 'Rental',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    status: 'Delivered',
  },
  {
    id: '#PC12841',
    date: 'Nov 28, 2026',
    time: '5:50 PM',
    customer: 'Vikram Singh',
    email: 'vikram.s@gmail.com',
    phone: '+91 97170 88214',
    address: '29 Connaught Circus, New Delhi 110001',
    items: [{ name: 'Lenovo ThinkPad T14', qty: 1, price: 1199.0 }],
    type: 'Purchase',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    status: 'Pending',
  },
  {
    id: '#PC12840',
    date: 'Nov 28, 2026',
    time: '1:10 PM',
    customer: 'Ananya Iyer',
    email: 'ananya.iyer@design.io',
    phone: '+91 98401 66318',
    address: '88 Anna Salai, Teynampet, Chennai 600018',
    items: [{ name: 'RTX 4070 Custom RGB Tower', qty: 1, price: 2499.0 }],
    type: 'Purchase',
    paymentMethod: 'Credit Card (Visa)',
    paymentStatus: 'Refunded',
    status: 'Cancelled',
  },
]

const ORDER_STATUSES = [
  'All',
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
]
const PAYMENT_FILTERS = ['All Payments', 'Paid', 'Pending', 'Refunded']
const TYPE_FILTERS = ['All Types', 'Purchase', 'Rental']
const PAGES = [1, 2, 3, 4, 5]
const TOTAL_ORDERS_BASE = 1248

function getOrderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

function getItemCount(order) {
  return order.items.reduce((sum, item) => sum + item.qty, 0)
}

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

function EyeIcon({ className = 'w-[17px] h-[17px]' }) {
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

function OrderStatusBadge({ status }) {
  const styles = {
    Pending: 'bg-[#fef3c7] text-[#b45309]',
    Processing: 'bg-[#dbeafe] text-[#1d4ed8]',
    Shipped: 'bg-[#ede9fe] text-[#6d28d9]',
    Delivered: 'bg-[#dcfce7] text-[#15803d]',
    Cancelled: 'bg-[#fee2e2] text-[#b91c1c]',
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

function PaymentBadge({ status }) {
  const config = {
    Paid: { dot: 'bg-[#16a34a]', text: 'text-[#15803d]' },
    Pending: { dot: 'bg-[#d97706]', text: 'text-[#b45309]' },
    Refunded: { dot: 'bg-[#6b7280]', text: 'text-[#4b5563]' },
  }
  const c = config[status] || config.Pending

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  )
}

function OrderDetailModal({ order, onClose, onUpdateStatus }) {
  const [status, setStatus] = useState(order?.status || 'Pending')
  const [paymentStatus, setPaymentStatus] = useState(
    order?.paymentStatus || 'Pending',
  )

  if (!order) return null

  const total = getOrderTotal(order)

  const handleSave = () => {
    onUpdateStatus(order.id, status, paymentStatus)
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
                Order {order.id}
              </h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              Placed on {order.date} at {order.time} &bull; {order.type}
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

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Customer & Shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-4">
            <div>
              <p className="text-[11.5px] font-normal uppercase tracking-wider text-[#6b7280]">
                Customer
              </p>
              <p className="text-[13px] font-medium text-[#111827] mt-1">
                {order.customer}
              </p>
              <p className="text-[12px] text-[#4b5563]">{order.email}</p>
              <p className="text-[12px] text-[#4b5563]">{order.phone}</p>
            </div>
            <div>
              <p className="text-[11.5px] font-normal uppercase tracking-wider text-[#6b7280]">
                Shipping &amp; Payment
              </p>
              <p className="text-[12px] text-[#374151] mt-1 leading-relaxed">
                {order.address}
              </p>
              <p className="text-[12px] font-medium text-[#111827] mt-1.5">
                {order.paymentMethod}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <p className="text-[13px] font-medium text-[#111827] mb-2">
              Order Items
            </p>
            <div className="rounded-xl border border-[#e5e7eb] divide-y divide-[#eef0f4]">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="px-4 py-3 flex items-center justify-between gap-3 text-[12.5px]"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[#111827] truncate">
                      {item.name}
                    </p>
                    <p className="text-[12px] text-[#6b7280]">
                      Qty: {item.qty} &times; {formatMoney(item.price)}
                    </p>
                  </div>
                  <span className="font-medium text-[#111827] shrink-0">
                    {formatMoney(item.price * item.qty)}
                  </span>
                </div>
              ))}
              <div className="px-4 py-3 bg-[#f8f9fb] flex items-center justify-between text-[13px]">
                <span className="font-medium text-[#111827]">Total Amount</span>
                <span className="text-[14.5px] font-semibold text-[#dc1414]">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              >
                {ORDER_STATUSES.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              >
                {PAYMENT_FILTERS.filter((p) => p !== 'All Payments').map(
                  (p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ),
                )}
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
            Update Order
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateOrderModal({ isOpen, onClose, onCreate }) {
  const [customer, setCustomer] = useState('')
  const [email, setEmail] = useState('')
  const [productName, setProductName] = useState('Dell XPS 15 (2024)')
  const [qty, setQty] = useState('1')
  const [price, setPrice] = useState('1799')
  const [type, setType] = useState('Purchase')
  const [paymentStatus, setPaymentStatus] = useState('Paid')
  const [status, setStatus] = useState('Processing')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!customer.trim() || !productName.trim()) {
      setError('Please enter customer name and product.')
      return
    }
    const parsedQty = Math.max(1, Number.parseInt(qty, 10) || 1)
    const parsedPrice = Number.parseFloat(price)
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Please enter a valid price.')
      return
    }

    onCreate({
      id: `#PC${Math.floor(12846 + Math.random() * 900)}`,
      date: 'Nov 30, 2026',
      time: 'Just now',
      customer: customer.trim(),
      email:
        email.trim() ||
        `${customer.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: '+91 98000 12345',
      address: 'Walk-in Store / Standard Delivery',
      items: [{ name: productName.trim(), qty: parsedQty, price: parsedPrice }],
      type,
      paymentMethod: 'Store POS / Online',
      paymentStatus,
      status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[490px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4]">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Create New Order
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
                placeholder="e.g. Rahul Joshi"
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
                placeholder="rahul@example.com"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Product
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Unit Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-2.5 py-2.5 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Purchase">Purchase</option>
                <option value="Rental">Rental</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                {ORDER_STATUSES.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Orders({ globalSearch = '' }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [localSearch, setLocalSearch] = useState('')
  const [activeStatusTab, setActiveStatusTab] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All Payments')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingOrder, setViewingOrder] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmState, setConfirmState] = useState(null)

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        !combinedSearch ||
        order.id.toLowerCase().includes(combinedSearch) ||
        order.customer.toLowerCase().includes(combinedSearch) ||
        order.email.toLowerCase().includes(combinedSearch) ||
        order.items.some((i) => i.name.toLowerCase().includes(combinedSearch))

      const matchesStatus =
        activeStatusTab === 'All' || order.status === activeStatusTab

      const matchesPayment =
        paymentFilter === 'All Payments' ||
        order.paymentStatus === paymentFilter

      const matchesType =
        typeFilter === 'All Types' || order.type === typeFilter

      return matchesSearch && matchesStatus && matchesPayment && matchesType
    })
  }, [orders, combinedSearch, activeStatusTab, paymentFilter, typeFilter])

  const kpis = useMemo(() => {
    const pendingOrProcessing = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'Processing',
    ).length
    const delivered = orders.filter((o) => o.status === 'Delivered').length
    const revenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + getOrderTotal(o), 0)

    return [
      {
        label: 'Total Orders',
        value: (TOTAL_ORDERS_BASE + (orders.length - INITIAL_ORDERS.length)).toLocaleString(),
        sub: 'All store & online orders',
        icon: CartIcon,
        tone: 'red',
      },
      {
        label: 'Pending / Processing',
        value: pendingOrProcessing,
        sub: 'Awaiting fulfillment',
        icon: ClockIcon,
        tone: 'amber',
      },
      {
        label: 'Delivered Orders',
        value: delivered,
        sub: 'Completed successfully',
        icon: CheckCircleIcon,
        tone: 'green',
      },
      {
        label: 'Recent Order Value',
        value: formatMoney(revenue),
        sub: 'Excludes cancelled',
        icon: CreditCardIcon,
        tone: 'red',
      },
    ]
  }, [orders])

  const allSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedIds.includes(o.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredOrders.map((o) => o.id))
    }
  }

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleUpdateOrderStatus = (id, nextStatus, nextPayment) => {
    const existing = orders.find((o) => o.id === id)
    const isDestructive =
      nextStatus === 'Cancelled' || nextPayment === 'Refunded'
    const statusChanged =
      existing &&
      (existing.status !== nextStatus || existing.paymentStatus !== nextPayment)

    if (statusChanged && isDestructive) {
      setConfirmState({
        title:
          nextStatus === 'Cancelled'
            ? `Cancel Order ${id}?`
            : `Mark Payment Refunded for ${id}?`,
        message: `Are you sure you want to update order ${id} (${existing.customer}) to Status: "${nextStatus}" and Payment: "${nextPayment}"?`,
        confirmText:
          nextStatus === 'Cancelled' ? 'Yes, Cancel Order' : 'Yes, Confirm Refund',
        variant: 'danger',
        onConfirm: () => {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === id
                ? { ...order, status: nextStatus, paymentStatus: nextPayment }
                : order,
            ),
          )
          setConfirmState(null)
        },
      })
      return
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, status: nextStatus, paymentStatus: nextPayment }
          : order,
      ),
    )
  }

  const handleCreateOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev])
    setCreateOpen(false)
  }

  const handleExportCsv = () => {
    const header = [
      'Order ID',
      'Date',
      'Customer',
      'Email',
      'Items',
      'Type',
      'Total',
      'Payment',
      'Status',
    ]
    const rows = filteredOrders.map((o) => [
      o.id,
      `"${o.date} ${o.time}"`,
      `"${o.customer}"`,
      o.email,
      `"${o.items.map((i) => `${i.name} x${i.qty}`).join('; ')}"`,
      o.type,
      getOrderTotal(o).toFixed(2),
      o.paymentStatus,
      o.status,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prestige-computers-orders.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const isFiltered =
    Boolean(combinedSearch) ||
    activeStatusTab !== 'All' ||
    paymentFilter !== 'All Payments' ||
    typeFilter !== 'All Types'

  const totalDisplayCount = isFiltered
    ? filteredOrders.length
    : TOTAL_ORDERS_BASE + (orders.length - INITIAL_ORDERS.length)

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Orders
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Track customer purchases, rental orders, payment status and
            deliveries.
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
            <span>Create Order</span>
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
        {ORDER_STATUSES.map((tab) => {
          const count =
            tab === 'All'
              ? orders.length
              : orders.filter((o) => o.status === tab).length
          const isActive = activeStatusTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveStatusTab(tab)}
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

      {/* Search & Dropdown Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="w-full lg:max-w-[380px]">
          <div className="flex items-center gap-2.5 bg-white border border-[#d6dae2] rounded-lg px-3.5 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus-within:border-[#dc1414] focus-within:ring-2 focus-within:ring-[#dc1414]/15 transition-all">
            <SearchIcon className="w-4 h-4 text-[#4b5563] shrink-0" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search order ID, customer or product..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="order-type-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Type:
            </label>
            <div className="relative flex-1 sm:w-[170px]">
              <select
                id="order-type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {TYPE_FILTERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label
              htmlFor="order-payment-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Payment:
            </label>
            <div className="relative flex-1 sm:w-[175px]">
              <select
                id="order-payment-filter"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {PAYMENT_FILTERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
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
                    aria-label="Select all orders"
                    className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3.5 px-3">Order ID</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Items</th>
                <th className="py-3.5 px-3">Total</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const isChecked = selectedIds.includes(order.id)
                  const total = getOrderTotal(order)
                  const itemCount = getItemCount(order)

                  return (
                    <tr
                      key={order.id}
                      className={[
                        'transition-colors hover:bg-[#fafbfc]',
                        isChecked ? 'bg-red-50/35' : '',
                      ].join(' ')}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(order.id)}
                          aria-label={`Select order ${order.id}`}
                          className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingOrder(order)}
                          className="font-medium text-[#dc1414] hover:underline cursor-pointer"
                        >
                          {order.id}
                        </button>
                        <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
                          {order.date} &bull; {order.time}
                        </p>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#111215] text-white text-[11.5px] font-medium flex items-center justify-center shrink-0">
                            {getInitials(order.customer)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#111827] leading-snug truncate">
                              {order.customer}
                            </p>
                            <p className="text-[12px] text-[#6b7280] truncate">
                              {order.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 max-w-[230px]">
                        <p className="font-medium text-[#1f2937] truncate">
                          {order.items[0]?.name}
                        </p>
                        <p className="text-[12px] text-[#6b7280]">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'} &bull;{' '}
                          <span className="font-medium text-[#374151]">
                            {order.type}
                          </span>
                        </p>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#111827] whitespace-nowrap">
                        {formatMoney(total)}
                      </td>
                      <td className="py-3.5 px-3">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 pl-3 pr-5 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] transition-colors cursor-pointer"
                        >
                          <EyeIcon className="w-4 h-4 text-[#4b5563]" />
                          <span>View</span>
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
                    No orders match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View */}
        <div className="lg:hidden divide-y divide-[#eef0f4]">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const total = getOrderTotal(order)
              return (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => setViewingOrder(order)}
                        className="text-[13.5px] font-medium text-[#dc1414] hover:underline cursor-pointer"
                      >
                        {order.id}
                      </button>
                      <p className="text-[12px] text-[#6b7280]">
                        {order.date} &bull; {order.time}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#111215] text-white text-[11px] font-medium flex items-center justify-center shrink-0">
                      {getInitials(order.customer)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium text-[#111827] truncate">
                        {order.customer}
                      </p>
                      <p className="text-[12px] text-[#6b7280] truncate">
                        {order.items[0]?.name} ({order.type})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[13.5px] font-semibold text-[#111827]">
                        {formatMoney(total)}
                      </span>
                      <PaymentBadge status={order.paymentStatus} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewingOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] cursor-pointer"
                    >
                      <EyeIcon className="w-4 h-4 text-[#4b5563]" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-10 text-center text-[12.5px] text-[#6b7280]">
              No orders match your current filters.
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
        <p className="text-[13px] font-normal text-[#4b5563]">
          {filteredOrders.length > 0
            ? `Showing 1 to ${filteredOrders.length} of ${totalDisplayCount.toLocaleString()} orders`
            : 'Showing 0 orders'}
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

      {/* Order Details & Status Update Modal */}
      {viewingOrder && (
        <OrderDetailModal
          key={viewingOrder.id}
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}

      {/* Create Manual Order Modal */}
      {createOpen && (
        <CreateOrderModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreateOrder}
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
