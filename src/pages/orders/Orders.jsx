import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import {
  CartIcon,
  ChevronDownIcon,
  CloseIcon,
  CreditCardIcon,
  PlusIcon,
  SearchIcon,
} from '../../components/common/Icons'
import orderService from '../../services/orderService'

const ORDER_STATUSES = [
  'All',
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
]

const PAYMENT_FILTERS = ['All Payments', 'Paid', 'Pending', 'Refunded', 'Failed']
const TYPE_FILTERS = ['All Types', 'Purchase', 'Rental']
const ITEMS_PER_PAGE = 8

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

function getOrderTotal(order) {
  if (order.totalPrice !== undefined && order.totalPrice !== null) {
    return Number(order.totalPrice)
  }
  return (order.items || []).reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0)
}

function getItemCount(order) {
  return (order.items || []).reduce((sum, item) => sum + (Number(item.qty) || 1), 0)
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'PC'
}

function resolveImageUrl(img) {
  if (!img) return ''
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img
  return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`
}

function normalizeOrder(order) {
  const num = order.orderNumber || (order._id ? `#${order._id.slice(-6).toUpperCase()}` : order.id || '#PCS-1001')
  const dateObj = order.createdAt ? new Date(order.createdAt) : null
  const formattedDate = dateObj
    ? dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
    : order.date || 'Today'
  const formattedTime = dateObj
    ? dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : order.time || 'Just now'

  const items = (order.orderItems || order.items || []).map((it) => {
    let name = it.name || it.title || it.product?.name || it.product?.title || 'Computer System'
    let specs = typeof it.specs === 'string' ? it.specs : (it.specs?.cpu ? `${it.specs.cpu} | ${it.specs.ram || ''}` : '')

    // Clean up any historical dummy fallback if present in old records
    if (name === 'Prestige Certified Hardware' || name === 'Product Hardware System') {
      if (specs && specs !== 'Prestige Certified Hardware') {
        name = specs
        specs = ''
      } else if (it.productId && !it.productId.startsWith('item-')) {
        name = it.productId.replace(/[-_]/g, ' ')
      }
    }

    return {
      name,
      qty: Number(it.quantity || it.qty || 1),
      price: Number(it.price || 0),
      originalPrice: Number(it.originalPrice || 0),
      specs,
      image: it.image || it.product?.image || '',
      type: it.type === 'Rent' || it.type === 'Rental' ? 'Rental' : 'Purchase',
    }
  })

  const hasRent = items.some((i) => i.type === 'Rental')
  const addressParts = [
    order.shippingAddress?.street || order.address,
    order.shippingAddress?.city,
    order.shippingAddress?.state,
    order.shippingAddress?.postalCode,
    order.shippingAddress?.country || 'India',
  ].filter(Boolean)

  const itemsSubtotal = Number(order.itemsPrice !== undefined ? order.itemsPrice : items.reduce((sum, it) => sum + it.price * it.qty, 0))
  const shippingCharge = Number(order.shippingPrice !== undefined ? order.shippingPrice : (order.deliveryMethod === 'express' ? 199 : 0))
  const discountAmount = Number(order.discountPrice || 0)
  const taxAmount = Number(order.taxPrice || 0)
  const orderTotal = Number(order.totalPrice !== undefined ? order.totalPrice : Math.max(0, itemsSubtotal + shippingCharge - discountAmount + taxAmount))

  return {
    id: num,
    _id: order._id || order.id,
    orderNumber: num,
    date: formattedDate,
    time: formattedTime,
    customer: order.customer?.name || order.shippingAddress?.name || order.customer || 'Customer',
    email: order.customer?.email || order.shippingAddress?.email || order.email || 'N/A',
    phone: order.customer?.phone || order.shippingAddress?.phone || order.phone || 'N/A',
    address: addressParts.length > 0 ? addressParts.join(', ') : 'Walk-in Store Pickup',
    shippingAddress: order.shippingAddress || null,
    items,
    type: hasRent ? 'Rental' : 'Purchase',
    deliveryMethod: order.deliveryMethod || 'standard',
    paymentMethod: order.paymentMethod || 'Online Payment',
    paymentStatus: order.paymentStatus || (order.isPaid ? 'Paid' : 'Pending'),
    status: order.orderStatus || order.status || 'Pending',
    courier: order.courier || '',
    trackingNumber: order.trackingNumber || '',
    notes: order.notes || '',
    itemsPrice: itemsSubtotal,
    shippingPrice: shippingCharge,
    discountPrice: discountAmount,
    taxPrice: taxAmount,
    totalPrice: orderTotal,
    timeline: order.timeline || [],
    rawCreatedAt: order.createdAt || null,
    createdAt: order.createdAt || null,
  }
}

function EyeIcon({ className = 'w-[17px] h-[17px]' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.25 12S5.75 5.5 12 5.5 21.75 12 21.75 12 18.25 18.5 12 18.5 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ClockIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.8 12.2 2.2 2.2 4.4-4.6" />
    </svg>
  )
}

function DownloadIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 20h16" />
    </svg>
  )
}

function OrderStatusBadge({ status }) {
  const styles = {
    Pending: 'bg-[#fef3c7] text-[#b45309]',
    Confirmed: 'bg-[#e0f2fe] text-[#0369a1]',
    Processing: 'bg-[#dbeafe] text-[#1d4ed8]',
    Shipped: 'bg-[#ede9fe] text-[#6d28d9]',
    'Out for Delivery': 'bg-[#ffedd5] text-[#c2410c]',
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
    Failed: { dot: 'bg-[#dc2626]', text: 'text-[#b91c1c]' },
  }
  const c = config[status] || config.Pending

  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  )
}

function OrderDetailModal({ order, onClose, onUpdateStatus, onDeleteOrder }) {
  const [status, setStatus] = useState(order?.status || 'Pending')
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'Pending')
  const [courier, setCourier] = useState(order?.courier || '')
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '')
  const [notes, setNotes] = useState(order?.notes || '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!order) return null

  const items = order.items || []
  const subtotal = order.itemsPrice !== undefined ? Number(order.itemsPrice) : items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)
  const shippingPrice = order.shippingPrice !== undefined ? Number(order.shippingPrice) : (order.deliveryMethod === 'express' ? 199 : 0)
  const discountPrice = Number(order.discountPrice || 0)
  const taxPrice = Number(order.taxPrice || 0)
  const total = order.totalPrice !== undefined ? Number(order.totalPrice) : Math.max(0, subtotal + shippingPrice - discountPrice + taxPrice)

  const handleCopyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard?.writeText(trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdateStatus(order._id || order.id, {
        orderStatus: status,
        paymentStatus,
        courier: courier.trim(),
        trackingNumber: trackingNumber.trim(),
        notes: notes.trim(),
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
      <div className="w-full max-w-[680px] rounded-2xl bg-white border border-[#e5e7eb] shadow-[0_25px_60px_rgba(16,24,40,0.25)] overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f4] bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[16px] font-semibold text-[#111827]">
                Order {order.orderNumber || order.id}
              </h3>
              <OrderStatusBadge status={status} />
            </div>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              Placed on {order.date} at {order.time} &bull;{' '}
              <span className="font-medium text-[#374151]">{order.type} Order</span>
            </p>
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

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#f8f9fb] border border-[#eef0f4] p-4 text-[12.5px]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                Customer Information
              </p>
              <p className="text-[13.5px] font-semibold text-[#111827] mt-1.5">
                {order.customer}
              </p>
              <p className="text-[12px] text-[#4b5563] mt-0.5">{order.email}</p>
              <p className="text-[12px] text-[#4b5563]">{order.phone}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
                Shipping &amp; Delivery
              </p>
              <p className="text-[12px] text-[#374151] mt-1.5 leading-relaxed">
                {order.address}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-[#e5e7eb] text-[#374151]">
                  {order.deliveryMethod === 'express' ? '⚡ Express' : '🚚 Standard'}
                </span>
                <span className="text-[11.5px] text-[#6b7280]">Payment:</span>
                <span className="font-medium text-[#111827]">{order.paymentMethod}</span>
                <PaymentBadge status={paymentStatus} />
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold text-[#111827]">
                Ordered Hardware &amp; Items ({getItemCount(order)})
              </p>
              <span className="text-[12px] font-medium text-[#6b7280]">
                {order.type} Order
              </span>
            </div>
            <div className="rounded-xl border border-[#e5e7eb] overflow-hidden">
              <div className="divide-y divide-[#eef0f4]">
                {items.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="p-3.5 flex items-center justify-between gap-3 text-[12.5px] hover:bg-[#fafbfc] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg border border-[#e5e7eb] bg-[#f8f9fb] flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image ? (
                          <img
                            src={resolveImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <CartIcon className="w-5 h-5 text-[#9ca3af]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#111827] leading-tight truncate">
                          {item.name}
                        </p>
                        {item.specs && (
                          <p className="text-[11.5px] text-[#6b7280] truncate mt-0.5">
                            {item.specs}
                          </p>
                        )}
                        <p className="text-[11.5px] text-[#9ca3af] mt-0.5">
                          Qty: {item.qty} &times; {formatMoney(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-[#111827] text-[13px]">
                        {formatMoney(item.price * item.qty)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Exact Dynamic Price Breakdown */}
              <div className="bg-[#f8f9fb] p-4 border-t border-[#e5e7eb] space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between text-[#4b5563]">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-[#111827]">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-[#4b5563]">
                  <span>Delivery Charges ({order.deliveryMethod === 'express' ? 'Express' : 'Standard'})</span>
                  <span className="font-semibold text-[#111827]">
                    {shippingPrice === 0 ? (
                      <span className="text-emerald-600">Free Delivery</span>
                    ) : (
                      `+ ${formatMoney(shippingPrice)}`
                    )}
                  </span>
                </div>
                {discountPrice > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium">
                    <span>Discount Applied</span>
                    <span>- {formatMoney(discountPrice)}</span>
                  </div>
                )}
                {taxPrice > 0 && (
                  <div className="flex items-center justify-between text-[#4b5563]">
                    <span>Taxes (GST)</span>
                    <span>+ {formatMoney(taxPrice)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#e5e7eb] text-[13.5px]">
                  <span className="font-bold text-[#111827]">Total Order Amount</span>
                  <span className="text-[16px] font-black text-[#dc1414]">
                    {formatMoney(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Logistics Settings */}
          <div className="rounded-xl border border-[#eef0f4] bg-[#fafbfc] p-4 space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-[#374151]">
              Order Fulfillment &amp; Logistics Control
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-[#d6dae2] bg-white px-3 py-2 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
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
                  className="w-full rounded-lg border border-[#d6dae2] bg-white px-3 py-2 text-[12.5px] font-medium text-[#111827] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
                >
                  {PAYMENT_FILTERS.filter((p) => p !== 'All Payments').map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Courier Partner
                </label>
                <input
                  type="text"
                  list="courier-partner-list"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="Select or enter courier (e.g. Delhivery, BlueDart)"
                  className="w-full rounded-lg border border-[#d6dae2] bg-white px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:outline-none"
                />
                <datalist id="courier-partner-list">
                  <option value="Delhivery" />
                  <option value="BlueDart Express" />
                  <option value="DTDC" />
                  <option value="Ekart Logistics" />
                  <option value="India Post" />
                  <option value="Shadowfax" />
                  <option value="XpressBees" />
                </datalist>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[12px] font-medium text-[#374151]">
                    Tracking Number / AWB
                  </label>
                  {trackingNumber && (
                    <button
                      type="button"
                      onClick={handleCopyTracking}
                      className="text-[11px] font-medium text-[#dc1414] hover:underline cursor-pointer"
                    >
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter AWB or tracking number"
                  className="w-full rounded-lg border border-[#d6dae2] bg-white px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1">
                Admin Fulfillment Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add internal dispatch notes, serial numbers, warranty tags..."
                className="w-full rounded-lg border border-[#d6dae2] bg-white px-3 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#eef0f4] bg-[#fafbfc] shrink-0">
          <button
            type="button"
            onClick={() => {
              onDeleteOrder(order._id || order.id)
              onClose()
            }}
            className="text-[12.5px] font-medium text-[#dc2626] hover:text-[#b91c1c] hover:underline cursor-pointer"
          >
            Delete Order
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Updating...' : 'Update Order Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateOrderModal({ isOpen, onClose, onCreate }) {
  const [customer, setCustomer] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('Kanpur')
  const [state, setState] = useState('Uttar Pradesh')
  const [pincode, setPincode] = useState('208025')
  const [productName, setProductName] = useState('Dell Inspiron 15 (2025)')
  const [specs, setSpecs] = useState('13th Gen Intel Core i5 | 16GB RAM | 512GB SSD')
  const [qty, setQty] = useState('1')
  const [price, setPrice] = useState('52999')
  const [type, setType] = useState('Purchase')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [paymentStatus, setPaymentStatus] = useState('Paid')
  const [status, setStatus] = useState('Confirmed')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customer.trim() || !productName.trim()) {
      setError('Please enter customer name and product title.')
      return
    }
    const parsedQty = Math.max(1, Number.parseInt(qty, 10) || 1)
    const parsedPrice = Number.parseFloat(price)
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Please enter a valid price in ₹.')
      return
    }

    setSubmitting(true)
    setError('')

    const orderData = {
      customer: {
        name: customer.trim(),
        email: email.trim() || `${customer.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        phone: phone.trim() || '+91 98765 43210',
      },
      shippingAddress: {
        name: customer.trim(),
        phone: phone.trim() || '+91 98765 43210',
        street: address.trim() || 'Prestige Walk-in / Store POS',
        city: city.trim() || 'Kanpur',
        state: state.trim() || 'Uttar Pradesh',
        postalCode: pincode.trim() || '208025',
        country: 'India',
        addressType: 'Home',
      },
      orderItems: [
        {
          name: productName.trim(),
          title: productName.trim(),
          quantity: parsedQty,
          price: parsedPrice,
          specs: specs.trim(),
          type: type === 'Rental' ? 'Rent' : 'Buy',
        },
      ],
      paymentMethod,
      itemsPrice: parsedPrice * parsedQty,
      totalPrice: parsedPrice * parsedQty,
      orderStatus: status,
      paymentStatus,
    }

    try {
      await onCreate(orderData)
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-[540px] rounded-2xl bg-white border border-[#e5e7eb] shadow-[0_25px_60px_rgba(16,24,40,0.25)] overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f4] shrink-0">
          <h3 className="text-[16px] font-semibold text-[#111827]">
            Create Manual Customer Order
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[12.5px] font-medium text-[#b91c1c]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value)
                  if (error) setError('')
                }}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
              Delivery Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street Address / Flat No."
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                PIN Code
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
              Configuration / Specs
            </label>
            <input
              type="text"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Qty
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Price (₹)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-2.5 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Purchase">Purchase</option>
                <option value="Rental">Rental</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-2 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="NetBanking">NetBanking</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-2 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-2 py-2 text-[12px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
              >
                {ORDER_STATUSES.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#eef0f4]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Orders({ globalSearch = '' }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLiveConnected, setIsLiveConnected] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const [activeStatusTab, setActiveStatusTab] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All Payments')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingOrder, setViewingOrder] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmState, setConfirmState] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type })
    setTimeout(() => setFeedback(null), 3500)
  }

  // Load orders from backend API on mount
  useEffect(() => {
    let ignore = false
    orderService
      .getAll()
      .then((res) => {
        if (ignore) return
        const rawOrders = res?.data?.orders || res?.orders || res?.data
        if (Array.isArray(rawOrders)) {
          setOrders(rawOrders.map(normalizeOrder))
          setIsLiveConnected(true)
        } else {
          setOrders([])
        }
        setLoading(false)
      })
      .catch((err) => {
        if (ignore) return
        console.warn('Backend orders fetch failed:', err.message)
        setOrders([])
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
      const res = await orderService.getAll()
      const rawOrders = res?.data?.orders || res?.orders || res?.data
      if (Array.isArray(rawOrders)) {
        setOrders(rawOrders.map(normalizeOrder))
        setIsLiveConnected(true)
        showFeedback(`Synced ${rawOrders.length} live orders from database.`, 'success')
      }
    } catch (err) {
      console.warn('Backend orders fetch failed:', err.message)
      showFeedback(`Refresh failed: ${err.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredOrders = useMemo(() => {
    const list = orders.filter((order) => {
      const matchesSearch =
        !combinedSearch ||
        order.id.toLowerCase().includes(combinedSearch) ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(combinedSearch)) ||
        order.customer.toLowerCase().includes(combinedSearch) ||
        order.email.toLowerCase().includes(combinedSearch) ||
        order.phone.toLowerCase().includes(combinedSearch) ||
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(combinedSearch)) ||
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

    return [...list].sort((a, b) => {
      const timeA = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      const timeB = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
      if (timeA && timeB && timeA !== timeB) {
        return timeB - timeA
      }
      return 0
    })
  }, [orders, combinedSearch, activeStatusTab, paymentFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  // Slice orders for active page
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredOrders, safePage])

  const kpis = useMemo(() => {
    const pendingOrders = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'Confirmed',
    ).length
    const inTransit = orders.filter(
      (o) => o.status === 'Processing' || o.status === 'Shipped' || o.status === 'Out for Delivery',
    ).length
    const delivered = orders.filter((o) => o.status === 'Delivered').length
    const revenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + getOrderTotal(o), 0)

    return [
      {
        label: 'Total Orders',
        value: orders.length.toLocaleString('en-IN'),
        sub: 'Storefront & Admin orders',
        icon: CartIcon,
        tone: 'red',
      },
      {
        label: 'Pending / Confirmed',
        value: pendingOrders,
        sub: 'Awaiting fulfillment',
        icon: ClockIcon,
        tone: 'amber',
      },
      {
        label: 'In Transit / Logistics',
        value: inTransit,
        sub: 'Packed, Shipped & Out',
        icon: CheckCircleIcon,
        tone: 'blue',
      },
      {
        label: 'Delivered Revenue',
        value: formatMoney(revenue),
        sub: `${delivered} completed orders`,
        icon: CreditCardIcon,
        tone: 'green',
      },
    ]
  }, [orders])

  const handleUpdateOrderStatus = async (id, updateData) => {
    try {
      await orderService.updateStatus(id, updateData)
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === id || ord.id === id
            ? {
                ...ord,
                status: updateData.orderStatus || ord.status,
                paymentStatus: updateData.paymentStatus || ord.paymentStatus,
                courier: updateData.courier || ord.courier,
                trackingNumber: updateData.trackingNumber !== undefined ? updateData.trackingNumber : ord.trackingNumber,
                notes: updateData.notes !== undefined ? updateData.notes : ord.notes,
              }
            : ord,
        ),
      )
      showFeedback(`Order ${id} status updated successfully!`, 'success')
    } catch {
      // optimistic local update if offline
      setOrders((prev) =>
        prev.map((ord) =>
          ord._id === id || ord.id === id
            ? {
                ...ord,
                status: updateData.orderStatus || ord.status,
                paymentStatus: updateData.paymentStatus || ord.paymentStatus,
                courier: updateData.courier || ord.courier,
                trackingNumber: updateData.trackingNumber !== undefined ? updateData.trackingNumber : ord.trackingNumber,
              }
            : ord,
        ),
      )
      showFeedback(`Order ${id} updated locally.`, 'success')
    }
  }

  const handleDeleteOrder = (id) => {
    const target = orders.find((o) => o._id === id || o.id === id)
    setConfirmState({
      title: `Delete Order ${target?.orderNumber || id}?`,
      message: `Are you sure you want to delete order ${target?.orderNumber || id} placed by ${target?.customer}? This action cannot be undone.`,
      confirmText: 'Yes, Delete Order',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await orderService.delete(id)
          setOrders((prev) => prev.filter((o) => o._id !== id && o.id !== id))
          showFeedback('Order deleted successfully.', 'success')
        } catch {
          setOrders((prev) => prev.filter((o) => o._id !== id && o.id !== id))
          showFeedback('Order removed from view.', 'success')
        } finally {
          setConfirmState(null)
        }
      },
    })
  }

  const handleCreateOrder = async (orderData) => {
    try {
      const res = await orderService.create(orderData)
      const created = res?.data || res
      const normalized = normalizeOrder(created)
      setOrders((prev) => [normalized, ...prev])
      showFeedback(`Order ${normalized.orderNumber} created successfully!`, 'success')
    } catch {
      // fallback local insertion
      const fallbackNew = normalizeOrder({
        ...orderData,
        orderNumber: `PCS-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toISOString(),
      })
      setOrders((prev) => [fallbackNew, ...prev])
      showFeedback('Order created locally.', 'success')
    }
  }

  const handleExportCsv = () => {
    const header = [
      'Order Number',
      'Date',
      'Time',
      'Customer',
      'Email',
      'Phone',
      'Address',
      'Products',
      'Type',
      'Total (INR)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Courier',
      'Tracking Number',
    ]
    const rows = filteredOrders.map((o) => [
      o.orderNumber || o.id,
      `"${o.date}"`,
      `"${o.time}"`,
      `"${o.customer}"`,
      o.email,
      `"${o.phone}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${o.items.map((i) => `${i.name} (x${i.qty})`).join('; ')}"`,
      o.type,
      getOrderTotal(o),
      `"${o.paymentMethod}"`,
      o.paymentStatus,
      o.status,
      `"${o.courier || ''}"`,
      `"${o.trackingNumber || ''}"`,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `prestige-orders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
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
              Orders Management
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
            Live order tracking, logistics dispatch, customer shipments, and instant status updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh Orders"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#d6dae2] bg-white hover:bg-[#f9fafb] text-[#1f2937] text-[12.5px] font-medium shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors cursor-pointer"
          >
            <ClockIcon className={`w-4 h-4 text-[#4b5563] ${loading ? 'animate-spin' : ''}`} />
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
                : card.tone === 'blue'
                  ? 'bg-[#dbeafe] border-[#bfdbfe] text-[#1d4ed8]'
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
              onClick={() => {
                setActiveStatusTab(tab)
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

      {/* Search & Dropdown Filter Bar */}
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
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
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
                onChange={(e) => {
                  setPaymentFilter(e.target.value)
                  setCurrentPage(1)
                }}
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
                <th className="py-3.5 pl-5 pr-3">Order ID</th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Items</th>
                <th className="py-3.5 px-3">Total Amount</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
                  const total = getOrderTotal(order)
                  const itemCount = getItemCount(order)

                  return (
                    <tr
                      key={order._id || order.id}
                      className="transition-colors hover:bg-[#fafbfc]"
                    >
                      <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setViewingOrder(order)}
                          className="font-medium text-[#dc1414] hover:underline cursor-pointer"
                        >
                          {order.orderNumber || order.id}
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
                      <td className="py-3.5 px-3 max-w-[240px]">
                        <p className="font-medium text-[#1f2937] truncate">
                          {order.items[0]?.name || 'Prestige System'}
                        </p>
                        <p className="text-[12px] text-[#6b7280]">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'} &bull;{' '}
                          <span className="font-medium text-[#374151]">
                            {order.type}
                          </span>
                        </p>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[#111827] whitespace-nowrap">
                        {formatMoney(total)}
                      </td>
                      <td className="py-3.5 px-3">
                        <PaymentBadge status={order.paymentStatus} />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#dce0e8] bg-white hover:bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937] transition-colors cursor-pointer"
                          >
                            <EyeIcon className="w-4 h-4 text-[#4b5563]" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
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
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => {
              const total = getOrderTotal(order)
              return (
                <div key={order._id || order.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <button
                        type="button"
                        onClick={() => setViewingOrder(order)}
                        className="text-[13.5px] font-medium text-[#dc1414] hover:underline cursor-pointer"
                      >
                        {order.orderNumber || order.id}
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

      {/* Dynamic Pagination */}
      <Pagination
        currentPage={safePage}
        totalItems={filteredOrders.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemName="orders"
      />

      {/* Order Details & Logistics Modal */}
      {viewingOrder && (
        <OrderDetailModal
          key={viewingOrder._id || viewingOrder.id}
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
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
