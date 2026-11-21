import { useEffect, useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import {
  ChevronDownIcon,
  CloseIcon,
  CubeIcon,
  InventoryIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
} from '../../components/common/Icons'
import categoryService from '../../services/categoryService'
import productService from '../../services/productService'

const STOCK_STATUSES = ['All Status', 'In Stock', 'Low Stock', 'Out of Stock']
const ITEMS_PER_PAGE = 8
const ADJUST_REASONS = [
  'Supplier Restock',
  'Manual Stock Audit',
  'Damaged / Defective',
  'Rental Return',
  'Customer Order Return',
  'Store Transfer',
  'Inventory Correction',
]

function getStockStatus(stock, lowStockThreshold = 5, outOfStockThreshold = 0) {
  if (stock <= outOfStockThreshold) return 'Out of Stock'
  if (stock <= lowStockThreshold) return 'Low Stock'
  return 'In Stock'
}

function StatusBadge({ status }) {
  const styles = {
    'In Stock': 'bg-[#dcfce7] text-[#15803d]',
    'Low Stock': 'bg-[#fef3c7] text-[#b45309]',
    'Out of Stock': 'bg-[#fee2e2] text-[#b91c1c]',
  }

  return (
    <span
      className={[
        'inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-medium leading-none whitespace-nowrap',
        styles[status] || styles['In Stock'],
      ].join(' ')}
    >
      {status}
    </span>
  )
}

function StockHealthBar({ stock, lowStockThreshold, outOfStockThreshold, maxCapacity }) {
  const status = getStockStatus(stock, lowStockThreshold, outOfStockThreshold)
  const pct = Math.min(100, Math.round((stock / Math.max(maxCapacity, 1)) * 100))

  const barColor =
    status === 'Out of Stock'
      ? 'bg-[#dc1414]'
      : status === 'Low Stock'
        ? 'bg-[#d97706]'
        : 'bg-[#16a34a]'

  return (
    <div className="w-24">
      <div className="flex items-baseline justify-between text-[13px] mb-1">
        <span className="font-semibold text-[#111827]">{stock}</span>
        <span className="text-[11px] text-[#6b7280]">/ {maxCapacity}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#e5e7eb] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-200 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function WarningTriangleIcon({ className = 'w-5 h-5' }) {
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
      <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4.2" />
      <circle cx="12" cy="17" r="0.85" fill="currentColor" stroke="none" />
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

function HistoryClockIcon({ className = 'w-4 h-4' }) {
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
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}

function StockAdjustModal({ isOpen, items, targetItem, onClose, onApply }) {
  const [selectedId, setSelectedId] = useState(
    targetItem?.id || items[0]?.id || '',
  )
  const [mode, setMode] = useState('add')
  const [quantity, setQuantity] = useState('10')
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(targetItem?.lowStockThreshold ?? items[0]?.lowStockThreshold ?? 5),
  )
  const [outOfStockThreshold, setOutOfStockThreshold] = useState(
    String(targetItem?.outOfStockThreshold ?? items[0]?.outOfStockThreshold ?? 0),
  )
  const [warehouse, setWarehouse] = useState(
    targetItem?.warehouse || items[0]?.warehouse || 'Main Store - Section A1',
  )
  const [reason, setReason] = useState(ADJUST_REASONS[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const activeItem = items.find((i) => i.id === selectedId) || items[0]
  const parsedQty = Number.parseInt(quantity, 10)
  const safeQty = Number.isNaN(parsedQty) || parsedQty < 0 ? 0 : parsedQty

  const previewStock = !activeItem
    ? 0
    : mode === 'add'
      ? activeItem.stock + safeQty
      : mode === 'remove'
        ? Math.max(0, activeItem.stock - safeQty)
        : safeQty

  const parsedLow = Number.parseInt(lowStockThreshold, 10)
  const safeLow = Number.isNaN(parsedLow) || parsedLow < 0 ? 5 : parsedLow

  const parsedOut = Number.parseInt(outOfStockThreshold, 10)
  const safeOut = Number.isNaN(parsedOut) || parsedOut < 0 ? 0 : parsedOut

  const previewStatus = getStockStatus(previewStock, safeLow, safeOut)

  const handleSelectItem = (newId) => {
    setSelectedId(newId)
    const found = items.find((i) => i.id === newId)
    if (found) {
      setLowStockThreshold(String(found.lowStockThreshold ?? 5))
      setOutOfStockThreshold(String(found.outOfStockThreshold ?? 0))
      setWarehouse(found.warehouse || 'Main Store - Section A1')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!activeItem) return
    if (Number.isNaN(parsedQty) || parsedQty < 0) {
      setError('Please enter a valid positive quantity.')
      return
    }

    try {
      setIsSubmitting(true)
      await onApply(activeItem.id, {
        adjustmentType: mode,
        quantity: safeQty,
        lowStockThreshold: safeLow,
        outOfStockThreshold: safeOut,
        warehouse: warehouse.trim() || 'Main Store - Section A1',
        reason,
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      setError(err?.message || 'Failed to update stock')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4 overflow-y-auto">
      <div className="w-full max-w-[530px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden my-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4] bg-[#fbfcfd]">
          <div>
            <h3 className="text-[15px] font-semibold text-[#111827]">
              Advanced Stock Adjustment
            </h3>
            <p className="text-[12px] text-[#6b7280]">
              Adjust inventory units, set low stock &amp; out-of-stock cutoff thresholds
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
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[13px] font-medium text-[#b91c1c]">
              {error}
            </div>
          )}

          {/* Product Selector */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Select Product SKU
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleSelectItem(e.target.value)}
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku}) &bull; Current: {item.stock} units
                </option>
              ))}
            </select>
          </div>

          {/* Mode Toggle Pills */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'add', label: 'Add Stock (+)' },
                { id: 'remove', label: 'Reduce Stock (-)' },
                { id: 'set', label: 'Set Exact Count' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id)}
                  className={[
                    'py-2 rounded-lg text-[13px] font-medium border transition-all cursor-pointer',
                    mode === opt.id
                      ? 'bg-[#dc1414] text-white border-[#dc1414] shadow-xs'
                      : 'bg-white text-[#374151] border-[#d6dae2] hover:bg-[#f9fafb]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-[12.5px] font-medium text-[#374151] mb-1">
                {mode === 'set' ? 'New Total Units' : 'Quantity to Apply'}
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value)
                  if (error) setError('')
                }}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[13px] font-semibold text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            {/* Low Stock Threshold */}
            <div>
              <label className="block text-[12.5px] font-medium text-[#374151] mb-1">
                Low Stock Alert At
              </label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="5"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[13px] font-semibold text-[#b45309] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            {/* Out of Stock Cutoff Threshold */}
            <div>
              <label className="block text-[12.5px] font-medium text-[#374151] mb-1">
                Out of Stock At &le;
              </label>
              <input
                type="number"
                min="0"
                value={outOfStockThreshold}
                onChange={(e) => setOutOfStockThreshold(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[13px] font-semibold text-[#b91c1c] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Warehouse */}
            <div>
              <label className="block text-[12.5px] font-medium text-[#374151] mb-1">
                Warehouse Location
              </label>
              <input
                type="text"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                placeholder="e.g. Main Store - Section A1"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-[12.5px] font-medium text-[#374151] mb-1">
                Adjustment Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              >
                {ADJUST_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-[12.5px] font-medium text-[#374151] mb-1">
              Audit Notes &amp; Reference (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Batch #PO-2026-88 arrived via courier"
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2 text-[12.5px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
            />
          </div>

          {/* Live Dynamic Stock & Status Preview */}
          {activeItem && (
            <div className="rounded-xl bg-[#f8f9fb] border border-[#e5e7eb] p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[13px]">
                <div>
                  <span className="text-[#6b7280]">Current Stock: </span>
                  <span className="font-semibold text-[#374151]">
                    {activeItem.stock}
                  </span>
                  <span className="mx-2 text-[#9ca3af]">&rarr;</span>
                  <span className="font-bold text-[#111827]">
                    {previewStock} units
                  </span>
                </div>
                <StatusBadge status={previewStatus} />
              </div>

              <div className="flex items-center justify-between text-[11.5px] text-[#6b7280] border-t border-[#eef0f4] pt-2">
                <span>
                  Alert at &le; <strong className="text-[#b45309]">{safeLow}</strong>
                </span>
                <span>
                  Out of Stock at &le; <strong className="text-[#b91c1c]">{safeOut}</strong>
                </span>
                <span>
                  Storefront Status:{' '}
                  <strong className={previewStock <= safeOut ? 'text-[#b91c1c]' : 'text-[#15803d]'}>
                    {previewStock <= safeOut ? 'Out of Stock' : 'In Stock'}
                  </strong>
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-semibold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StockHistoryModal({ isOpen, item, onClose }) {
  const [history, setHistory] = useState(item?.stockHistory || [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    if (!item?.id) return

    productService
      .getStockHistory(item.id)
      .then((res) => {
        if (!isMounted) return
        if (res?.data?.history) {
          setHistory(res.data.history)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [item?.id])

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[680px] max-h-[85vh] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4] bg-[#fbfcfd]">
          <div>
            <h3 className="text-[15px] font-semibold text-[#111827]">
              Stock Audit Trail &amp; History
            </h3>
            <p className="text-[12px] text-[#6b7280]">
              {item.name} &bull; SKU: <span className="font-mono">{item.sku}</span> &bull; Current Stock: <strong>{item.stock}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-gray-100 cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-[13px] text-[#6b7280]">
              Loading adjustment audit records...
            </div>
          ) : history.length > 0 ? (
            <div className="divide-y divide-[#eef0f4]">
              {history.map((record, idx) => {
                const isAdd = record.type === 'add' || record.adjustment > 0
                const isRemove = record.type === 'remove' || record.adjustment < 0
                const badgeColor = isAdd
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isRemove
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'

                const diffStr = record.adjustment > 0 ? `+${record.adjustment}` : `${record.adjustment}`

                return (
                  <div key={record._id || idx} className="py-3 flex items-start justify-between gap-3 text-[12.5px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badgeColor}`}>
                          {record.type ? record.type.toUpperCase() : 'ADJUST'}
                        </span>
                        <span className="font-semibold text-[#111827]">
                          {record.reason || 'Manual Stock Audit'}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="text-[#6b7280] italic text-[12px]">
                          &ldquo;{record.notes}&rdquo;
                        </p>
                      )}
                      <p className="text-[#9ca3af] text-[11.5px]">
                        Adjusted by: <span className="text-[#4b5563] font-medium">{record.adjustedBy || 'Admin'}</span> &bull;{' '}
                        {record.date ? new Date(record.date).toLocaleString() : 'Recent'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[14px] font-bold ${isAdd ? 'text-[#15803d]' : isRemove ? 'text-[#dc1414]' : 'text-[#2563eb]'}`}>
                        {diffStr} units
                      </span>
                      <p className="text-[11.5px] text-[#6b7280]">
                        {record.previousStock} &rarr; <strong>{record.newStock}</strong>
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-[13px] text-[#6b7280] space-y-1">
              <p className="font-medium text-[#374151]">No stock adjustments logged yet.</p>
              <p className="text-[12px] text-[#9ca3af]">Future stock adjustments and quick steps will record audit logs here.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#eef0f4] bg-[#fbfcfd] flex items-center justify-between text-[12px] text-[#6b7280]">
          <span>Thresholds: Low Alert &le; {item.lowStockThreshold} | Out of Stock &le; {item.outOfStockThreshold}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Inventory({ globalSearch = '' }) {
  const [inventory, setInventory] = useState([])
  const [liveCategories, setLiveCategories] = useState([])
  const [localSearch, setLocalSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState({ open: false, item: null })
  const [historyModalState, setHistoryModalState] = useState({ open: false, item: null })
  const [confirmState, setConfirmState] = useState(null)
  const [feedbackToast, setFeedbackToast] = useState('')

  const showToast = (msg) => {
    setFeedbackToast(msg)
    setTimeout(() => setFeedbackToast(''), 3000)
  }

  useEffect(() => {
    let isMounted = true
    Promise.all([
      productService.getAll({ all: 'true' }).catch(() => null),
      categoryService.getAll({ all: 'true' }).catch(() => null),
    ]).then(([prodRes, catRes]) => {
      if (!isMounted) return
      if (prodRes?.data?.products || prodRes?.data) {
        const rawProducts = prodRes.data.products || prodRes.data || []
        const mapped = rawProducts.map((p, idx) => {
          const stock = typeof p.stock === 'number' ? p.stock : 15
          const lowStockThreshold = typeof p.lowStockThreshold === 'number' ? p.lowStockThreshold : 5
          const outOfStockThreshold = typeof p.outOfStockThreshold === 'number' ? p.outOfStockThreshold : 0
          return {
            id: p._id || p.id,
            sku: p.sku || `PCS-${(p.name || 'PRD').slice(0, 4).toUpperCase()}-${idx + 101}`,
            name: p.name || p.title,
            category: p.categoryName || p.category?.name || p.categorySlug || 'Laptops',
            stock: stock,
            lowStockThreshold: lowStockThreshold,
            outOfStockThreshold: outOfStockThreshold,
            onRent: typeof p.onRent === 'number' ? p.onRent : 0,
            maxCapacity: Math.max(30, stock + 15),
            warehouse: p.warehouse || 'Main Store - Section A1',
            stockHistory: p.stockHistory || [],
            lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString() : 'Live Sync',
          }
        })
        setInventory(mapped)
      }

      if (catRes?.data) {
        setLiveCategories(catRes.data)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const categoryFilterOptions = useMemo(() => {
    return ['All Categories', ...liveCategories.map((c) => c.name)]
  }, [liveCategories])

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const status = getStockStatus(item.stock, item.lowStockThreshold, item.outOfStockThreshold)

      const matchesSearch =
        !combinedSearch ||
        item.name.toLowerCase().includes(combinedSearch) ||
        item.sku.toLowerCase().includes(combinedSearch) ||
        item.warehouse.toLowerCase().includes(combinedSearch)

      const matchesCategory =
        selectedCategory === 'All Categories' ||
        item.category === selectedCategory

      const matchesStatus =
        selectedStatus === 'All Status' || status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [inventory, combinedSearch, selectedCategory, selectedStatus])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  // Slice stock items for active page
  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredItems.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredItems, safePage])

  const kpis = useMemo(() => {
    const totalUnits = inventory.reduce((sum, i) => sum + i.stock, 0)
    const lowStockCount = inventory.filter(
      (i) => getStockStatus(i.stock, i.lowStockThreshold, i.outOfStockThreshold) === 'Low Stock',
    ).length
    const outOfStockCount = inventory.filter(
      (i) => getStockStatus(i.stock, i.lowStockThreshold, i.outOfStockThreshold) === 'Out of Stock',
    ).length

    return [
      {
        label: 'Total SKUs',
        value: inventory.length,
        sub: 'Active catalog items',
        icon: CubeIcon,
        tone: 'red',
      },
      {
        label: 'Units in Stock',
        value: totalUnits,
        sub: 'Available for sale & rent',
        icon: InventoryIcon,
        tone: 'green',
      },
      {
        label: 'Low Stock Alerts',
        value: lowStockCount,
        sub: 'At or below alert threshold',
        icon: WarningTriangleIcon,
        tone: 'amber',
      },
      {
        label: 'Out of Stock',
        value: outOfStockCount,
        sub: 'At or below cutoff threshold',
        icon: WarningTriangleIcon,
        tone: 'red',
      },
    ]
  }, [inventory])

  const handleApplyAdjustment = async (id, payload) => {
    try {
      const res = await productService.adjustStock(id, payload)
      const updatedProduct = res?.data || res
      if (updatedProduct) {
        setInventory((prev) =>
          prev.map((item) => {
            if (item.id !== id) return item
            const newStock = typeof updatedProduct.stock === 'number' ? updatedProduct.stock : payload.quantity
            return {
              ...item,
              stock: newStock,
              lowStockThreshold: updatedProduct.lowStockThreshold ?? payload.lowStockThreshold ?? item.lowStockThreshold,
              outOfStockThreshold: updatedProduct.outOfStockThreshold ?? payload.outOfStockThreshold ?? item.outOfStockThreshold,
              warehouse: updatedProduct.warehouse || payload.warehouse || item.warehouse,
              maxCapacity: Math.max(item.maxCapacity, newStock),
              lastUpdated: 'Just now',
            }
          }),
        )
        showToast('✓ Stock & thresholds updated successfully!')
      }
    } catch (err) {
      console.error('Failed to adjust stock:', err)
      throw err
    }
  }

  const handleQuickStep = async (id, delta) => {
    const target = inventory.find((i) => i.id === id)
    if (!target) return
    const nextStock = Math.max(0, target.stock + delta)
    const outThreshold = target.outOfStockThreshold ?? 0

    if (target.stock > outThreshold && nextStock <= outThreshold) {
      setConfirmState({
        title: 'Mark Item Out of Stock?',
        message: `Reducing stock for "${target.name}" to ${nextStock} will hit or fall below the out-of-stock cutoff (${outThreshold}) and show as Out of Stock on the website. Continue?`,
        confirmText: 'Yes, Set Stock',
        variant: 'warning',
        onConfirm: async () => {
          setConfirmState(null)
          await handleApplyAdjustment(id, {
            adjustmentType: delta < 0 ? 'remove' : 'add',
            quantity: 1,
            reason: 'Quick Step Adjustment',
            notes: delta < 0 ? 'Reduced by 1 unit' : 'Added 1 unit',
          })
        },
      })
      return
    }

    await handleApplyAdjustment(id, {
      adjustmentType: delta < 0 ? 'remove' : 'add',
      quantity: 1,
      reason: 'Quick Step Adjustment',
      notes: delta < 0 ? 'Reduced by 1 unit' : 'Added 1 unit',
    })
  }

  const handleExportCsv = () => {
    const header = [
      'SKU',
      'Product',
      'Category',
      'Available Stock',
      'Low Stock Alert Threshold',
      'Out of Stock Cutoff Threshold',
      'Status',
      'Warehouse',
    ]
    const rows = filteredItems.map((i) => [
      i.sku,
      `"${i.name}"`,
      i.category,
      i.stock,
      i.lowStockThreshold,
      i.outOfStockThreshold,
      getStockStatus(i.stock, i.lowStockThreshold, i.outOfStockThreshold),
      `"${i.warehouse}"`,
    ])
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'prestige-computers-inventory.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#16a34a] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {feedbackToast}
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Inventory &amp; Stock Management
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Live inventory monitoring, dynamic threshold configuration, and stock audit adjustment.
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
            onClick={() => setModalState({ open: true, item: null })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer"
          >
            <PlusIcon className="w-[17px] h-[17px]" />
            <span>Update Stock</span>
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
                <p className="text-[19px] font-semibold text-[#111827] leading-tight">
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

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="w-full lg:max-w-[380px]">
          <div className="flex items-center gap-2.5 bg-white border border-[#d6dae2] rounded-lg px-3.5 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus-within:border-[#dc1414] focus-within:ring-2 focus-within:ring-[#dc1414]/15 transition-all">
            <SearchIcon className="w-4 h-4 text-[#4b5563] shrink-0" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by product name, SKU or warehouse..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="inv-category-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Category:
            </label>
            <div className="relative flex-1 sm:w-[185px]">
              <select
                id="inv-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {categoryFilterOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label
              htmlFor="inv-status-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Status:
            </label>
            <div className="relative flex-1 sm:w-[185px]">
              <select
                id="inv-status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {STOCK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden">
        {/* Desktop & Tablet Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb] text-[13px] font-medium text-[#1f2937]">
                <th className="py-3.5 pl-5 pr-3">Product &amp; SKU</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Available Stock</th>
                <th className="py-3.5 px-3 text-center">Low Alert (&le;)</th>
                <th className="py-3.5 px-3 text-center">Out of Stock (&le;)</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-center">Quick Adjust</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => {
                  const status = getStockStatus(item.stock, item.lowStockThreshold, item.outOfStockThreshold)

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[#fafbfc]"
                    >
                      <td className="py-3.5 pl-5 pr-3">
                        <p className="font-semibold text-[#111827] leading-snug">
                          {item.name}
                        </p>
                        <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
                          <span className="font-mono">{item.sku}</span> &bull; {item.warehouse}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#374151] whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-3">
                        <StockHealthBar
                          stock={item.stock}
                          lowStockThreshold={item.lowStockThreshold}
                          outOfStockThreshold={item.outOfStockThreshold}
                          maxCapacity={item.maxCapacity}
                        />
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-[#b45309]">
                        {item.lowStockThreshold}
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-[#b91c1c]">
                        {item.outOfStockThreshold}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center">
                          <div className="inline-flex items-center rounded-lg border border-[#dce0e8] bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleQuickStep(item.id, -1)}
                              disabled={item.stock <= 0}
                              aria-label={`Decrease stock for ${item.name}`}
                              className="w-7 h-7 flex items-center justify-center text-[13.5px] font-bold text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                            >
                              &minus;
                            </button>
                            <span className="w-8 text-center text-[12px] font-semibold text-[#111827] border-x border-[#eef0f4]">
                              {item.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStep(item.id, 1)}
                              aria-label={`Increase stock for ${item.name}`}
                              className="w-7 h-7 flex items-center justify-center text-[13.5px] font-bold text-[#dc1414] hover:bg-red-50 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pl-3 pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setHistoryModalState({ open: true, item })}
                            title="View Stock Audit Trail"
                            aria-label={`View stock audit history for ${item.name}`}
                            className="p-1.5 rounded-lg text-[#4b5563] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                          >
                            <HistoryClockIcon className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setModalState({ open: true, item })}
                            title="Adjust Stock & Thresholds"
                            aria-label={`Adjust stock for ${item.name}`}
                            className="p-1.5 rounded-lg text-[#dc1414] hover:text-[#b91c1c] hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <PencilIcon />
                          </button>
                        </div>
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
                    No inventory items match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View */}
        <div className="lg:hidden divide-y divide-[#eef0f4]">
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item) => {
              const status = getStockStatus(item.stock, item.lowStockThreshold, item.outOfStockThreshold)
              return (
                <div
                  key={item.id}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-[#111827] truncate">
                        {item.name}
                      </p>
                      <p className="text-[12px] font-normal text-[#6b7280]">
                        <span className="font-mono">{item.sku}</span> &bull; {item.category} &bull; {item.warehouse}
                      </p>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <StockHealthBar
                      stock={item.stock}
                      lowStockThreshold={item.lowStockThreshold}
                      outOfStockThreshold={item.outOfStockThreshold}
                      maxCapacity={item.maxCapacity}
                    />

                    <div className="text-[12px] font-normal text-[#4b5563]">
                      Alert At: <strong className="text-[#b45309]">{item.lowStockThreshold}</strong> &bull; Cutoff:{' '}
                      <strong className="text-[#b91c1c]">{item.outOfStockThreshold}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center rounded-lg border border-[#dce0e8] bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleQuickStep(item.id, -1)}
                          disabled={item.stock <= 0}
                          aria-label={`Decrease stock for ${item.name}`}
                          className="w-7 h-7 flex items-center justify-center font-bold text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-35 cursor-pointer"
                        >
                          &minus;
                        </button>
                        <span className="w-8 text-center text-[12px] font-semibold text-[#111827] border-x border-[#eef0f4]">
                          {item.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickStep(item.id, 1)}
                          aria-label={`Increase stock for ${item.name}`}
                          className="w-7 h-7 flex items-center justify-center font-bold text-[#dc1414] hover:bg-red-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setHistoryModalState({ open: true, item })}
                        title="View Audit Trail"
                        className="p-1.5 rounded-lg text-[#4b5563] hover:bg-gray-100 cursor-pointer"
                      >
                        <HistoryClockIcon className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalState({ open: true, item })}
                        title="Edit Stock"
                        className="p-1.5 rounded-lg text-[#dc1414] hover:bg-red-50 cursor-pointer"
                      >
                        <PencilIcon />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-10 text-center text-[12.5px] text-[#6b7280]">
              No inventory items match your current filters.
            </div>
          )}
        </div>
      </div>

      {/* Fully Dynamic Pagination Footer */}
      <Pagination
        currentPage={safePage}
        totalItems={filteredItems.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemName="stock items"
      />

      {/* Stock Adjustment Modal */}
      {modalState.open && (
        <StockAdjustModal
          key={modalState.item?.id || 'global'}
          isOpen={modalState.open}
          items={inventory}
          targetItem={modalState.item}
          onClose={() => setModalState({ open: false, item: null })}
          onApply={handleApplyAdjustment}
        />
      )}

      {/* Stock History Modal */}
      {historyModalState.open && (
        <StockHistoryModal
          key={historyModalState.item?.id || 'history'}
          isOpen={historyModalState.open}
          item={historyModalState.item}
          onClose={() => setHistoryModalState({ open: false, item: null })}
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
