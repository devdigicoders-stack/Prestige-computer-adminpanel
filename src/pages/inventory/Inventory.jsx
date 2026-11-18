import { useMemo, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CubeIcon,
  InventoryIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
} from '../../components/common/Icons'

const INITIAL_INVENTORY = [
  {
    id: 'INV-001',
    sku: 'PCS-DL-XPS15',
    name: 'Dell XPS 15 (2024)',
    category: 'Laptops',
    stock: 24,
    onRent: 6,
    reorderLevel: 10,
    maxCapacity: 35,
    warehouse: 'Main Store - A1',
    lastUpdated: '10 min ago',
  },
  {
    id: 'INV-002',
    sku: 'PCS-HP-EB840',
    name: 'HP EliteBook 840 G10',
    category: 'Laptops',
    stock: 18,
    onRent: 8,
    reorderLevel: 10,
    maxCapacity: 30,
    warehouse: 'Main Store - A2',
    lastUpdated: '35 min ago',
  },
  {
    id: 'INV-003',
    sku: 'PCS-LN-T14G4',
    name: 'Lenovo ThinkPad T14',
    category: 'Laptops',
    stock: 7,
    onRent: 5,
    reorderLevel: 10,
    maxCapacity: 25,
    warehouse: 'Main Store - B1',
    lastUpdated: '1 hour ago',
  },
  {
    id: 'INV-004',
    sku: 'PCS-AP-MBAM2',
    name: 'Apple MacBook Air M2',
    category: 'Laptops',
    stock: 12,
    onRent: 4,
    reorderLevel: 8,
    maxCapacity: 24,
    warehouse: 'Main Store - A3',
    lastUpdated: '2 hours ago',
  },
  {
    id: 'INV-005',
    sku: 'PCS-AS-ROG16',
    name: 'ASUS ROG Strix G16',
    category: 'Gaming Laptops',
    stock: 4,
    onRent: 2,
    reorderLevel: 8,
    maxCapacity: 20,
    warehouse: 'Gaming Bay - G1',
    lastUpdated: '3 hours ago',
  },
  {
    id: 'INV-006',
    sku: 'PCS-PC-4070R',
    name: 'RTX 4070 Custom RGB Tower',
    category: 'Desktop PCs',
    stock: 0,
    onRent: 3,
    reorderLevel: 5,
    maxCapacity: 15,
    warehouse: 'Warehouse - W2',
    lastUpdated: 'Yesterday',
  },
]

const CATEGORIES = [
  'All Categories',
  'Laptops',
  'Gaming Laptops',
  'Desktop PCs',
  'Monitors',
  'Accessories',
]

const STOCK_STATUSES = ['All Status', 'In Stock', 'Low Stock', 'Out of Stock']
const ADJUST_REASONS = [
  'Supplier Restock',
  'Rental Return',
  'Manual Stock Audit',
  'Damaged / Defective',
  'Store Transfer',
]

function getStockStatus(stock, reorderLevel) {
  if (stock <= 0) return 'Out of Stock'
  if (stock <= reorderLevel) return 'Low Stock'
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

function StockHealthBar({ stock, reorderLevel, maxCapacity }) {
  const status = getStockStatus(stock, reorderLevel)
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
        <span className="font-medium text-[#111827]">{stock}</span>
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

function StockAdjustModal({ isOpen, items, targetItem, onClose, onApply }) {
  const [selectedId, setSelectedId] = useState(
    targetItem?.id || items[0]?.id || '',
  )
  const [mode, setMode] = useState('add')
  const [quantity, setQuantity] = useState('10')
  const [reorderLevel, setReorderLevel] = useState(
    String(targetItem?.reorderLevel ?? items[0]?.reorderLevel ?? 10),
  )
  const [reason, setReason] = useState(ADJUST_REASONS[0])
  const [error, setError] = useState('')

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

  const parsedReorder = Number.parseInt(reorderLevel, 10)
  const safeReorder =
    Number.isNaN(parsedReorder) || parsedReorder < 0
      ? activeItem?.reorderLevel || 5
      : parsedReorder

  const previewStatus = getStockStatus(previewStock, safeReorder)

  const handleSelectItem = (newId) => {
    setSelectedId(newId)
    const found = items.find((i) => i.id === newId)
    if (found) {
      setReorderLevel(String(found.reorderLevel))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!activeItem) return
    if (Number.isNaN(parsedQty) || parsedQty < 0) {
      setError('Please enter a valid quantity.')
      return
    }
    onApply(activeItem.id, previewStock, safeReorder)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-[490px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_20px_50px_rgba(16,24,40,0.22)] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4]">
          <h3 className="text-[15px] font-semibold text-[#111827]">
            Update Inventory Stock
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

          {/* Product Selector */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Select Product
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleSelectItem(e.target.value)}
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.sku})
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
                { id: 'add', label: 'Add (+)' },
                { id: 'remove', label: 'Remove (-)' },
                { id: 'set', label: 'Set Exact' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id)}
                  className={[
                    'py-2 rounded-lg text-[13px] font-medium border transition-all cursor-pointer',
                    mode === opt.id
                      ? 'bg-[#dc1414] text-white border-[#dc1414]'
                      : 'bg-white text-[#374151] border-[#d6dae2] hover:bg-[#f9fafb]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value)
                  if (error) setError('')
                }}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Reorder Threshold
              </label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
            >
              {ADJUST_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Live Stock Preview */}
          {activeItem && (
            <div className="rounded-lg bg-[#f8f9fb] border border-[#e5e7eb] px-4 py-3 flex items-center justify-between gap-2 text-[13px]">
              <div>
                <span className="text-[#6b7280] font-normal">Stock Preview: </span>
                <span className="font-medium text-[#374151]">
                  {activeItem.stock}
                </span>
                <span className="mx-1.5 text-[#9ca3af]">&rarr;</span>
                <span className="font-semibold text-[#111827]">
                  {previewStock} units
                </span>
              </div>
              <StatusBadge status={previewStatus} />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
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
              Save Stock Update
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Inventory({ globalSearch = '' }) {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY)
  const [localSearch, setLocalSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState({ open: false, item: null })
  const [confirmState, setConfirmState] = useState(null)

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredItems = useMemo(() => {
    return inventory.filter((item) => {
      const status = getStockStatus(item.stock, item.reorderLevel)

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

  const kpis = useMemo(() => {
    const totalUnits = inventory.reduce((sum, i) => sum + i.stock, 0)
    const lowStockCount = inventory.filter(
      (i) => getStockStatus(i.stock, i.reorderLevel) === 'Low Stock',
    ).length
    const outOfStockCount = inventory.filter((i) => i.stock <= 0).length

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
        sub: 'Ready for sale & rent',
        icon: InventoryIcon,
        tone: 'green',
      },
      {
        label: 'Low Stock Alerts',
        value: lowStockCount,
        sub: 'At or below threshold',
        icon: WarningTriangleIcon,
        tone: 'amber',
      },
      {
        label: 'Out of Stock',
        value: outOfStockCount,
        sub: 'Needs immediate restock',
        icon: WarningTriangleIcon,
        tone: 'red',
      },
    ]
  }, [inventory])

  const allSelected =
    filteredItems.length > 0 &&
    filteredItems.every((i) => selectedIds.includes(i.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredItems.map((i) => i.id))
    }
  }

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const applyStockValue = (id, nextStock, newReorder) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        return {
          ...item,
          stock: nextStock,
          reorderLevel: newReorder ?? item.reorderLevel,
          maxCapacity: Math.max(item.maxCapacity, nextStock),
          lastUpdated: 'Just now',
        }
      }),
    )
  }

  const handleQuickStep = (id, delta) => {
    const target = inventory.find((i) => i.id === id)
    if (!target) return
    const nextStock = Math.max(0, target.stock + delta)

    if (target.stock > 0 && nextStock === 0) {
      setConfirmState({
        title: 'Mark Item Out of Stock?',
        message: `Reducing stock for "${target.name}" to 0 will mark it Out of Stock and pause sales/rentals. Continue?`,
        confirmText: 'Yes, Set to 0',
        variant: 'warning',
        onConfirm: () => {
          applyStockValue(id, 0)
          setConfirmState(null)
        },
      })
      return
    }

    applyStockValue(id, nextStock)
  }

  const handleApplyAdjustment = (id, newStock, newReorder) => {
    const target = inventory.find((i) => i.id === id)
    if (target && target.stock > 0 && newStock === 0) {
      setModalState({ open: false, item: null })
      setConfirmState({
        title: 'Mark Item Out of Stock?',
        message: `Setting stock for "${target.name}" to 0 will mark this SKU as Out of Stock. Confirm update?`,
        confirmText: 'Yes, Mark Out of Stock',
        variant: 'warning',
        onConfirm: () => {
          applyStockValue(id, 0, newReorder)
          setConfirmState(null)
        },
      })
      return
    }

    applyStockValue(id, newStock, newReorder)
    setModalState({ open: false, item: null })
  }

  const handleExportCsv = () => {
    const header = [
      'SKU',
      'Product',
      'Category',
      'Available Stock',
      'On Rent',
      'Reorder Level',
      'Status',
      'Warehouse',
    ]
    const rows = filteredItems.map((i) => [
      i.sku,
      `"${i.name}"`,
      i.category,
      i.stock,
      i.onRent,
      i.reorderLevel,
      getStockStatus(i.stock, i.reorderLevel),
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

  const pages = [1, 2, 3]

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Inventory &amp; Stock
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Monitor real-time stock quantities, low-stock alerts and rental
            allocations.
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
                {CATEGORIES.map((category) => (
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
                <th className="py-3.5 pl-4 pr-2 w-11">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all inventory items"
                    className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3.5 px-3">Product &amp; SKU</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Available Stock</th>
                <th className="py-3.5 px-3 text-center">On Rent</th>
                <th className="py-3.5 px-3 text-center">Reorder At</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const status = getStockStatus(item.stock, item.reorderLevel)
                  const isChecked = selectedIds.includes(item.id)

                  return (
                    <tr
                      key={item.id}
                      className={[
                        'transition-colors hover:bg-[#fafbfc]',
                        isChecked ? 'bg-red-50/35' : '',
                      ].join(' ')}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(item.id)}
                          aria-label={`Select ${item.name}`}
                          className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-medium text-[#111827] leading-snug">
                          {item.name}
                        </p>
                        <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
                          {item.sku} &bull; {item.warehouse}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#374151] whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-3">
                        <StockHealthBar
                          stock={item.stock}
                          reorderLevel={item.reorderLevel}
                          maxCapacity={item.maxCapacity}
                        />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-[#f3f4f6] text-[12px] font-medium text-[#1f2937]">
                          {item.onRent} units
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-normal text-[#4b5563]">
                        {item.reorderLevel}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3.5 pl-3 pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="inline-flex items-center rounded-lg border border-[#dce0e8] bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleQuickStep(item.id, -1)}
                              disabled={item.stock <= 0}
                              aria-label={`Decrease stock for ${item.name}`}
                              className="w-7 h-7 flex items-center justify-center text-[13.5px] font-medium text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                            >
                              &minus;
                            </button>
                            <span className="w-8 text-center text-[12px] font-medium text-[#111827] border-x border-[#eef0f4]">
                              {item.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuickStep(item.id, 1)}
                              aria-label={`Increase stock for ${item.name}`}
                              className="w-7 h-7 flex items-center justify-center text-[13.5px] font-medium text-[#dc1414] hover:bg-red-50 cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setModalState({ open: true, item })}
                            aria-label={`Adjust stock for ${item.name}`}
                            className="p-1.5 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
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
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const status = getStockStatus(item.stock, item.reorderLevel)
              const isChecked = selectedIds.includes(item.id)
              return (
                <div
                  key={item.id}
                  className={[
                    'p-4 space-y-3',
                    isChecked ? 'bg-red-50/35' : '',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectRow(item.id)}
                        aria-label={`Select ${item.name}`}
                        className="mt-1 w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#111827] truncate">
                          {item.name}
                        </p>
                        <p className="text-[12px] font-normal text-[#6b7280]">
                          {item.sku} &bull; {item.category}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pl-7">
                    <StockHealthBar
                      stock={item.stock}
                      reorderLevel={item.reorderLevel}
                      maxCapacity={item.maxCapacity}
                    />
                    <div className="text-[12px] font-normal text-[#4b5563]">
                      On Rent:{' '}
                      <strong className="font-medium text-[#111827]">{item.onRent}</strong>{' '}
                      &bull; Reorder:{' '}
                      <strong className="font-medium text-[#111827]">
                        {item.reorderLevel}
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="inline-flex items-center rounded-lg border border-[#dce0e8] bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleQuickStep(item.id, -1)}
                          disabled={item.stock <= 0}
                          aria-label={`Decrease stock for ${item.name}`}
                          className="w-7 h-7 flex items-center justify-center font-medium text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-35 cursor-pointer"
                        >
                          &minus;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickStep(item.id, 1)}
                          aria-label={`Increase stock for ${item.name}`}
                          className="w-7 h-7 flex items-center justify-center font-medium text-[#dc1414] hover:bg-red-50 border-l border-[#eef0f4] cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalState({ open: true, item })}
                        aria-label={`Edit stock for ${item.name}`}
                        className="p-1.5 rounded-lg text-[#374151] hover:bg-gray-100 cursor-pointer"
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

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
        <p className="text-[13px] font-normal text-[#4b5563]">
          {filteredItems.length > 0
            ? `Showing 1 to ${filteredItems.length} of ${inventory.length} stock items`
            : 'Showing 0 stock items'}
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

          {pages.map((page) => {
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
            onClick={() => setCurrentPage((p) => Math.min(pages.length, p + 1))}
            disabled={currentPage === pages.length}
            aria-label="Next page"
            className="w-8 h-8 rounded-md border border-[#dce0e8] bg-white text-[#374151] hover:bg-[#f9fafb] disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

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
