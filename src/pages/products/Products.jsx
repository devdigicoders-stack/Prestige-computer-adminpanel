import { useMemo, useRef, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/common/Icons'

const INITIAL_PRODUCTS = [
  {
    id: 'PRD-001',
    name: 'Dell XPS 15 (2024)',
    brand: 'Dell',
    sku: 'PCS-DL-XPS15',
    category: 'Laptops',
    price: 1799.0,
    comparePrice: 1999.0,
    rentPrice: 249.0,
    deposit: 400.0,
    stock: 24,
    type: 'Buy & Rent',
    status: 'Active',
    warranty: '1 Year Dell ProSupport',
    description:
      'Ultra-premium 15.6-inch creator laptop with InfinityEdge OLED display, CNC machined aluminum chassis and dedicated RTX graphics.',
    specs: {
      processor: 'Intel Core i7-13700H (14-Core)',
      ram: '16GB DDR5 4800MHz',
      storage: '1TB PCIe Gen4 NVMe SSD',
      graphics: 'NVIDIA GeForce RTX 4050 6GB',
      display: '15.6" 3.5K OLED Touch',
      os: 'Windows 11 Pro',
    },
    customSpecs: [
      { key: 'Battery', value: '86Wh 6-Cell' },
      { key: 'Weight', value: '1.86 kg' },
    ],
    images: [],
    thumbVariant: 'dell',
  },
  {
    id: 'PRD-002',
    name: 'HP EliteBook 840 G10',
    brand: 'HP',
    sku: 'PCS-HP-EB840',
    category: 'Laptops',
    price: 1299.0,
    comparePrice: 1449.0,
    rentPrice: 169.0,
    deposit: 250.0,
    stock: 18,
    type: 'Buy & Rent',
    status: 'Active',
    warranty: '3 Years HP Onsite',
    description:
      'Enterprise-grade business ultrabook built for corporate teams with HP Wolf Security, 5MP webcam and all-day battery life.',
    specs: {
      processor: 'Intel Core i7-1355U vPro',
      ram: '16GB DDR5',
      storage: '512GB PCIe NVMe SSD',
      graphics: 'Intel Iris Xe Graphics',
      display: '14" WUXGA IPS Anti-Glare',
      os: 'Windows 11 Pro',
    },
    customSpecs: [{ key: 'Weight', value: '1.36 kg' }],
    images: [],
    thumbVariant: 'hp',
  },
  {
    id: 'PRD-003',
    name: 'Lenovo ThinkPad T14',
    brand: 'Lenovo',
    sku: 'PCS-LN-T14G4',
    category: 'Laptops',
    price: 1199.0,
    comparePrice: 1349.0,
    rentPrice: 159.0,
    deposit: 250.0,
    stock: 12,
    type: 'Buy & Rent',
    status: 'Active',
    warranty: '3 Years Premier Support',
    description:
      'MIL-STD-810H tested workstation laptop featuring the legendary ThinkPad keyboard, TrackPoint and rapid-charge battery.',
    specs: {
      processor: 'AMD Ryzen 7 PRO 7840U',
      ram: '16GB LPDDR5x',
      storage: '512GB NVMe SSD',
      graphics: 'AMD Radeon 780M',
      display: '14" FHD+ IPS 400 nits',
      os: 'Windows 11 Pro',
    },
    customSpecs: [{ key: 'Connectivity', value: 'Wi-Fi 6E, RJ-45 Ethernet' }],
    images: [],
    thumbVariant: 'lenovo',
  },
  {
    id: 'PRD-004',
    name: 'Apple MacBook Air M2',
    brand: 'Apple',
    sku: 'PCS-AP-MBAM2',
    category: 'Laptops',
    price: 1499.0,
    comparePrice: 1599.0,
    rentPrice: 199.0,
    deposit: 300.0,
    stock: 10,
    type: 'Buy & Rent',
    status: 'Active',
    warranty: '1 Year AppleCare',
    description:
      'Strikingly thin fanless design powered by Apple M2 silicon with Liquid Retina display, MagSafe 3 and up to 18 hours battery.',
    specs: {
      processor: 'Apple M2 (8-Core CPU)',
      ram: '16GB Unified Memory',
      storage: '512GB SSD',
      graphics: '10-Core Apple GPU',
      display: '13.6" Liquid Retina 500 nits',
      os: 'macOS Sequoia',
    },
    customSpecs: [{ key: 'Weight', value: '1.24 kg' }],
    images: [],
    thumbVariant: 'macbook',
  },
  {
    id: 'PRD-005',
    name: 'ASUS ROG Strix G16',
    brand: 'ASUS',
    sku: 'PCS-AS-ROG16',
    category: 'Gaming Laptops',
    price: 2099.0,
    comparePrice: 2299.0,
    rentPrice: 289.0,
    deposit: 450.0,
    stock: 6,
    type: 'Buy Only',
    status: 'Active',
    warranty: '2 Years ASUS Global',
    description:
      'High-FPS esports powerhouse featuring ROG Intelligent Cooling with Tri-Fan technology, Per-Key RGB keyboard and 240Hz Nebula display.',
    specs: {
      processor: 'Intel Core i9-14900HX',
      ram: '32GB DDR5 5600MHz',
      storage: '1TB PCIe 4.0 NVMe SSD',
      graphics: 'NVIDIA GeForce RTX 4070 8GB',
      display: '16" QHD+ 240Hz ROG Nebula',
      os: 'Windows 11 Home',
    },
    customSpecs: [{ key: 'Cooling', value: 'Liquid Metal Tri-Fan' }],
    images: [],
    thumbVariant: 'asus',
  },
]

const CATEGORIES = [
  'All Categories',
  'Laptops',
  'Gaming Laptops',
  'Desktop PCs',
  'Monitors & Displays',
  'PC Components',
  'Accessories',
]

const STATUSES = ['All Status', 'Active', 'Inactive', 'Out of Stock', 'Draft']
const PRODUCT_TYPES = ['Buy & Rent', 'Buy Only', 'Rent Only']
const PAGES = [1, 2, 3, 4, 5]
const TOTAL_CATALOG_COUNT = 142

function formatPrice(value) {
  return `$${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function UploadCloudIcon({ className = 'w-7 h-7' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 16l-4-4-4 4" />
      <path d="M12 12v9" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function ProductThumb({ variant = 'dell', imageUrl = '' }) {
  if (imageUrl) {
    return (
      <div className="w-12 h-9 rounded-md border border-[#e5e7eb] bg-[#f8f9fb] overflow-hidden shrink-0 flex items-center justify-center">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  const themes = {
    dell: {
      screenA: '#0b2545',
      screenB: '#1d4ed8',
      accent: '#38bdf8',
      chassis: '#374151',
      base: '#9ca3af',
    },
    hp: {
      screenA: '#111827',
      screenB: '#334155',
      accent: '#94a3b8',
      chassis: '#4b5563',
      base: '#d1d5db',
    },
    lenovo: {
      screenA: '#0f172a',
      screenB: '#1e1b4b',
      accent: '#ef4444',
      chassis: '#18181b',
      base: '#27272a',
    },
    macbook: {
      screenA: '#4c1d95',
      screenB: '#ec4899',
      accent: '#fb923c',
      chassis: '#334155',
      base: '#cbd5e1',
    },
    asus: {
      screenA: '#1e1b4b',
      screenB: '#2563eb',
      accent: '#a855f7',
      chassis: '#111827',
      base: '#1f2937',
    },
  }

  const t = themes[variant] || themes.dell
  const gradId = `laptopGrad-${variant}`

  return (
    <div className="w-12 h-9 flex items-center justify-center shrink-0">
      <svg viewBox="0 0 64 46" className="w-12 h-9" aria-hidden="true">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={t.screenA} />
            <stop offset="100%" stopColor={t.screenB} />
          </linearGradient>
        </defs>
        <rect
          x="10"
          y="4"
          width="44"
          height="29"
          rx="2.6"
          fill={t.chassis}
        />
        <rect
          x="12.5"
          y="6.5"
          width="39"
          height="24"
          rx="1.2"
          fill={`url(#${gradId})`}
        />
        <path
          d="M12.5 24 C 22 14, 34 22, 51.5 11 L 51.5 30.5 L 12.5 30.5 Z"
          fill={t.accent}
          fillOpacity="0.38"
        />
        <path d="M5 34.5h54l3 5.5H2l3-5.5Z" fill={t.base} />
        <rect x="2" y="39.5" width="60" height="2" rx="1" fill="#6b7280" />
        <rect
          x="26"
          y="36.5"
          width="12"
          height="2"
          rx="0.8"
          fill="#4b5563"
          fillOpacity="0.45"
        />
        {variant === 'lenovo' && (
          <circle cx="32" cy="35.6" r="1.2" fill="#dc1414" />
        )}
      </svg>
    </div>
  )
}

function StatusBadge({ status, onClick }) {
  const styles = {
    Active: 'bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0]',
    Inactive: 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]',
    'Out of Stock': 'bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca]',
    Draft: 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        status === 'Active'
          ? 'Click to mark Inactive'
          : 'Click to mark Active'
      }
      className={[
        'inline-flex items-center justify-center px-3.5 py-1 rounded-full text-[12px] font-medium leading-none whitespace-nowrap transition-colors cursor-pointer',
        styles[status] || styles.Active,
      ].join(' ')}
    >
      {status}
    </button>
  )
}

function ProductModal({ isOpen, editingProduct, onClose, onSave }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  // Basic Info
  const [name, setName] = useState(editingProduct?.name || '')
  const [brand, setBrand] = useState(editingProduct?.brand || '')
  const [sku, setSku] = useState(editingProduct?.sku || '')
  const [category, setCategory] = useState(
    editingProduct?.category || 'Laptops',
  )
  const [type, setType] = useState(editingProduct?.type || 'Buy & Rent')
  const [status, setStatus] = useState(editingProduct?.status || 'Active')
  const [warranty, setWarranty] = useState(editingProduct?.warranty || '')

  // Pricing & Stock
  const [price, setPrice] = useState(
    editingProduct ? String(editingProduct.price) : '',
  )
  const [comparePrice, setComparePrice] = useState(
    editingProduct?.comparePrice ? String(editingProduct.comparePrice) : '',
  )
  const [stock, setStock] = useState(
    editingProduct ? String(editingProduct.stock) : '',
  )
  const [rentPrice, setRentPrice] = useState(
    editingProduct?.rentPrice ? String(editingProduct.rentPrice) : '',
  )
  const [deposit, setDeposit] = useState(
    editingProduct?.deposit ? String(editingProduct.deposit) : '',
  )

  // Images
  const [images, setImages] = useState(editingProduct?.images || [])

  // Hardware Specifications
  const [specs, setSpecs] = useState({
    processor: editingProduct?.specs?.processor || '',
    ram: editingProduct?.specs?.ram || '',
    storage: editingProduct?.specs?.storage || '',
    graphics: editingProduct?.specs?.graphics || '',
    display: editingProduct?.specs?.display || '',
    os: editingProduct?.specs?.os || '',
  })

  // Extra Dynamic Specifications
  const [customSpecs, setCustomSpecs] = useState(
    editingProduct?.customSpecs?.length
      ? editingProduct.customSpecs
      : [{ key: '', value: '' }],
  )

  // Description
  const [description, setDescription] = useState(
    editingProduct?.description || '',
  )

  const [error, setError] = useState('')

  if (!isOpen) return null

  const showRentalFields = type === 'Buy & Rent' || type === 'Rent Only'

  const handleFilesAdded = (fileList) => {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith('image/'),
    )
    if (!files.length) return

    const remainingSlots = Math.max(0, 5 - images.length)
    const filesToRead = files.slice(0, remainingSlots)

    filesToRead.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result
        if (typeof result === 'string') {
          setImages((prev) =>
            prev.length < 5
              ? [...prev, { id: `${Date.now()}-${file.name}`, name: file.name, url: result }]
              : prev,
          )
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFilesAdded(e.dataTransfer.files)
  }

  const handleRemoveImage = (imgId) => {
    setImages((prev) => prev.filter((img) => img.id !== imgId))
  }

  const handleSetMainImage = (index) => {
    if (index === 0) return
    setImages((prev) => {
      const next = [...prev]
      const [picked] = next.splice(index, 1)
      return [picked, ...next]
    })
  }

  const updateSpec = (field, value) => {
    setSpecs((prev) => ({ ...prev, [field]: value }))
  }

  const handleCustomSpecChange = (idx, field, value) => {
    setCustomSpecs((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    )
  }

  const handleAddCustomSpec = () => {
    setCustomSpecs((prev) => [...prev, { key: '', value: '' }])
  }

  const handleRemoveCustomSpec = (idx) => {
    setCustomSpecs((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a product name.')
      return
    }
    const parsedPrice = Number.parseFloat(price)
    const parsedStock = Number.parseInt(stock, 10)
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Please enter a valid price.')
      return
    }
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setError('Please enter a valid stock quantity.')
      return
    }

    const parsedCompare = Number.parseFloat(comparePrice)
    const parsedRent = Number.parseFloat(rentPrice)
    const parsedDeposit = Number.parseFloat(deposit)

    const cleanCustomSpecs = customSpecs.filter(
      (row) => row.key.trim() && row.value.trim(),
    )

    onSave({
      id: editingProduct?.id || `PRD-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      brand: brand.trim() || 'Prestige',
      sku:
        sku.trim() ||
        `PCS-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      price: parsedPrice,
      comparePrice: Number.isNaN(parsedCompare) ? null : parsedCompare,
      rentPrice: Number.isNaN(parsedRent) ? null : parsedRent,
      deposit: Number.isNaN(parsedDeposit) ? null : parsedDeposit,
      stock: parsedStock,
      type,
      status,
      warranty: warranty.trim(),
      description: description.trim(),
      specs,
      customSpecs: cleanCustomSpecs,
      images,
      thumbVariant:
        editingProduct?.thumbVariant ||
        (category === 'Gaming Laptops' ? 'asus' : 'dell'),
    })
  }

  const inputClass =
    'w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[12.5px] font-medium text-[#111827] placeholder:text-[#9ca3af] placeholder:font-normal focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 transition-all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[1px] p-3 sm:p-5">
      <div className="w-full max-w-[760px] max-h-[92vh] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_24px_60px_rgba(16,24,40,0.28)] overflow-hidden flex flex-col">
        {/* Sticky Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#eef0f4] shrink-0">
          <div>
            <h3 className="text-[16px] font-semibold text-[#111827]">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              Upload product photos, pricing, hardware specifications and
              description.
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

        {/* Scrollable Form Body */}
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-[#b91c1c]">
              {error}
            </div>
          )}

          {/* SECTION 1: PRODUCT IMAGES UPLOAD */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[12.5px] font-medium text-[#111827]">
                Product Images
              </h4>
              <span className="text-[12px] font-normal text-[#6b7280]">
                {images.length} / 5 uploaded (PNG, JPG, WebP)
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                'rounded-xl border-2 border-dashed px-4 py-5 text-center cursor-pointer transition-all',
                isDragging
                  ? 'border-[#dc1414] bg-red-50/50'
                  : 'border-[#d6dae2] bg-[#f8f9fb] hover:border-[#dc1414]/60 hover:bg-red-50/20',
              ].join(' ')}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  handleFilesAdded(e.target.files)
                  e.target.value = ''
                }}
                className="hidden"
              />
              <div className="w-11 h-11 rounded-full bg-[#fef2f2] border border-[#fee2e2] text-[#dc1414] flex items-center justify-center mx-auto">
                <UploadCloudIcon className="w-6 h-6" />
              </div>
              <p className="mt-2.5 text-[12.5px] font-medium text-[#111827]">
                <span className="text-[#dc1414]">Click to upload</span> or drag
                and drop product images
              </p>
              <p className="text-[12px] text-[#6b7280] mt-0.5">
                Upload up to 5 high-resolution images (first image is used as
                thumbnail)
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={[
                      'relative group rounded-lg overflow-hidden border bg-[#f8f9fb] aspect-[4/3]',
                      idx === 0
                        ? 'border-[#dc1414] ring-2 ring-[#dc1414]/20'
                        : 'border-[#e5e7eb]',
                    ].join(' ')}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      onClick={() => handleSetMainImage(idx)}
                      title={
                        idx === 0 ? 'Main thumbnail' : 'Click to set as main'
                      }
                      className="w-full h-full object-cover cursor-pointer"
                    />
                    {idx === 0 && (
                      <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded bg-[#dc1414] text-white text-[10px] font-medium leading-none">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.id)}
                      aria-label={`Remove ${img.name}`}
                      className="absolute right-1.5 top-1.5 w-5 h-5 rounded-full bg-black/70 hover:bg-[#dc1414] text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <CloseIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: BASIC INFORMATION */}
          <section className="space-y-3.5 border-t border-[#eef0f4] pt-5">
            <h4 className="text-[12.5px] font-medium text-[#111827]">
              Basic Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="e.g. Dell XPS 15 (2024)"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Dell, Apple, ASUS, HP"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  SKU / Model Code
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. PCS-DL-XPS15"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Listing Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={inputClass}
                >
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 3: PRICING, RENTAL & STOCK */}
          <section className="space-y-3.5 border-t border-[#eef0f4] pt-5">
            <h4 className="text-[12.5px] font-medium text-[#111827]">
              Pricing, Rental &amp; Stock
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Sale Price ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="1499.00"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Compare / MRP ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="1699.00"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="10"
                  className={inputClass}
                />
              </div>

              {showRentalFields && (
                <>
                  <div>
                    <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                      Monthly Rent ($ / mo)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={rentPrice}
                      onChange={(e) => setRentPrice(e.target.value)}
                      placeholder="199.00"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                      Security Deposit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="300.00"
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClass}
                >
                  {STATUSES.filter((s) => s !== 'All Status').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className={showRentalFields ? 'sm:col-span-3' : 'sm:col-span-2'}>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Warranty
                </label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="e.g. 1 Year Official Onsite Warranty"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* SECTION 4: PRODUCT SPECIFICATIONS */}
          <section className="space-y-3.5 border-t border-[#eef0f4] pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[12.5px] font-medium text-[#111827]">
                  Technical Specifications
                </h4>
                <p className="text-[12px] text-[#6b7280]">
                  Key hardware configuration shown on product page
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Processor (CPU)
                </label>
                <input
                  type="text"
                  value={specs.processor}
                  onChange={(e) => updateSpec('processor', e.target.value)}
                  placeholder="e.g. Intel Core i7-13700H / Apple M2"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  RAM / Memory
                </label>
                <input
                  type="text"
                  value={specs.ram}
                  onChange={(e) => updateSpec('ram', e.target.value)}
                  placeholder="e.g. 16GB DDR5 4800MHz"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Storage
                </label>
                <input
                  type="text"
                  value={specs.storage}
                  onChange={(e) => updateSpec('storage', e.target.value)}
                  placeholder="e.g. 1TB PCIe Gen4 NVMe SSD"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Graphics (GPU)
                </label>
                <input
                  type="text"
                  value={specs.graphics}
                  onChange={(e) => updateSpec('graphics', e.target.value)}
                  placeholder="e.g. NVIDIA GeForce RTX 4060 8GB"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Display
                </label>
                <input
                  type="text"
                  value={specs.display}
                  onChange={(e) => updateSpec('display', e.target.value)}
                  placeholder='e.g. 15.6" 3.5K OLED 120Hz'
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Operating System
                </label>
                <input
                  type="text"
                  value={specs.os}
                  onChange={(e) => updateSpec('os', e.target.value)}
                  placeholder="e.g. Windows 11 Pro / macOS"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Additional Custom Specifications */}
            <div className="pt-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-[#374151]">
                  Additional Specifications (Optional)
                </span>
                <button
                  type="button"
                  onClick={handleAddCustomSpec}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-[#dc1414] hover:text-[#a80b0b] cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Add Spec</span>
                </button>
              </div>

              <div className="space-y-2">
                {customSpecs.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={row.key}
                      onChange={(e) =>
                        handleCustomSpecChange(idx, 'key', e.target.value)
                      }
                      placeholder="Spec name (e.g. Battery)"
                      className={`${inputClass} col-span-5`}
                    />
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) =>
                        handleCustomSpecChange(idx, 'value', e.target.value)
                      }
                      placeholder="Value (e.g. 86Wh 6-Cell)"
                      className={`${inputClass} col-span-6`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomSpec(idx)}
                      aria-label="Remove specification row"
                      className="col-span-1 h-10 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-[#dc1414] hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 5: DESCRIPTION */}
          <section className="space-y-2.5 border-t border-[#eef0f4] pt-5">
            <label
              htmlFor="product-description"
              className="block text-[12.5px] font-medium text-[#111827]"
            >
              Product Description
            </label>
            <textarea
              id="product-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a detailed product overview, key highlights, build quality and included accessories..."
              className={`${inputClass} resize-y`}
            />
          </section>
        </form>

        {/* Sticky Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 border-t border-[#eef0f4] bg-[#fafbfc] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            className="px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs cursor-pointer"
          >
            {editingProduct ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products({ globalSearch = '' }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [localSearch, setLocalSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState({ open: false, product: null })
  const [confirmState, setConfirmState] = useState(null)

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        !combinedSearch ||
        item.name.toLowerCase().includes(combinedSearch) ||
        item.category.toLowerCase().includes(combinedSearch) ||
        item.type.toLowerCase().includes(combinedSearch) ||
        (item.brand && item.brand.toLowerCase().includes(combinedSearch)) ||
        (item.sku && item.sku.toLowerCase().includes(combinedSearch))

      const matchesCategory =
        selectedCategory === 'All Categories' ||
        item.category === selectedCategory

      const matchesStatus =
        selectedStatus === 'All Status' || item.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, combinedSearch, selectedCategory, selectedStatus])

  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.includes(p.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id))
    }
  }

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSaveProduct = (saved) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === saved.id)
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p))
      }
      return [saved, ...prev]
    })
    setModalState({ open: false, product: null })
  }

  const requestDeleteProduct = (product) => {
    setConfirmState({
      title: 'Delete Product?',
      message: `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => p.id !== product.id))
        setSelectedIds((prev) => prev.filter((item) => item !== product.id))
        setConfirmState(null)
      },
    })
  }

  const requestBulkDelete = () => {
    const count = selectedIds.length
    setConfirmState({
      title: `Delete ${count} Selected ${count === 1 ? 'Product' : 'Products'}?`,
      message: `Are you sure you want to permanently delete ${count} selected ${count === 1 ? 'product' : 'products'} from your catalog?`,
      confirmText: `Delete (${count})`,
      variant: 'danger',
      onConfirm: () => {
        setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)))
        setSelectedIds([])
        setConfirmState(null)
      },
    })
  }

  const requestToggleStatus = (product) => {
    const nextStatus = product.status === 'Active' ? 'Inactive' : 'Active'
    const isDeactivating = nextStatus === 'Inactive'
    setConfirmState({
      title: isDeactivating ? 'Mark Product Inactive?' : 'Activate Product?',
      message: isDeactivating
        ? `Are you sure you want to deactivate "${product.name}"? It will be hidden from customers.`
        : `Are you sure you want to activate "${product.name}" and make it visible on the storefront?`,
      confirmText: isDeactivating ? 'Yes, Deactivate' : 'Yes, Activate',
      variant: isDeactivating ? 'warning' : 'success',
      onConfirm: () => {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, status: nextStatus } : p,
          ),
        )
        setConfirmState(null)
      },
    })
  }

  const isFiltered =
    Boolean(combinedSearch) ||
    selectedCategory !== 'All Categories' ||
    selectedStatus !== 'All Status'

  const totalDisplayCount = isFiltered
    ? filteredProducts.length
    : TOTAL_CATALOG_COUNT + (products.length - INITIAL_PRODUCTS.length)

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Products
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Manage your product catalog, prices, stock and rental options.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={requestBulkDelete}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-[#b91c1c] text-[12.5px] font-medium transition-colors cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setModalState({ open: true, product: null })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer"
          >
            <PlusIcon className="w-[17px] h-[17px]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Search Input */}
        <div className="w-full lg:max-w-[380px]">
          <div className="flex items-center gap-2.5 bg-white border border-[#d6dae2] rounded-lg px-3.5 py-2.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus-within:border-[#dc1414] focus-within:ring-2 focus-within:ring-[#dc1414]/15 transition-all">
            <SearchIcon className="w-4 h-4 text-[#4b5563] shrink-0" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
            />
          </div>
        </div>

        {/* Category & Status Dropdowns */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="category-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Category:
            </label>
            <div className="relative flex-1 sm:w-[190px]">
              <select
                id="category-filter"
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
              htmlFor="status-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Status:
            </label>
            <div className="relative flex-1 sm:w-[190px]">
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {STATUSES.map((status) => (
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

      {/* Products Table Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden">
        {/* Desktop & Tablet Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb] text-[13px] font-medium text-[#1f2937]">
                <th className="py-3.5 pl-4 pr-2 w-11">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all products"
                    className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3.5 px-3">Product</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Price</th>
                <th className="py-3.5 px-3 text-center">Stock</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const isChecked = selectedIds.includes(product.id)
                  const mainImg = product.images?.[0]?.url || ''
                  return (
                    <tr
                      key={product.id}
                      className={[
                        'transition-colors hover:bg-[#fafbfc]',
                        isChecked ? 'bg-red-50/35' : '',
                      ].join(' ')}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(product.id)}
                          aria-label={`Select ${product.name}`}
                          className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3.5">
                          <ProductThumb
                            variant={product.thumbVariant}
                            imageUrl={mainImg}
                          />
                          <div className="min-w-0">
                            <span className="font-medium text-[#111827] block">
                              {product.name}
                            </span>
                            {(product.specs?.processor || product.specs?.ram) && (
                              <span className="text-[12px] font-normal text-[#6b7280] block truncate max-w-[260px]">
                                {[product.specs?.processor, product.specs?.ram]
                                  .filter(Boolean)
                                  .join(' • ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#374151]">
                        {product.category}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#111827]">
                        {formatPrice(product.price)}
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium text-[#111827]">
                        {product.stock}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#374151]">
                        {product.type}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge
                          status={product.status}
                          onClick={() => requestToggleStatus(product)}
                        />
                      </td>
                      <td className="py-3.5 pl-3 pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setModalState({ open: true, product })
                            }
                            aria-label={`Edit ${product.name}`}
                            className="p-1.5 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteProduct(product)}
                            aria-label={`Delete ${product.name}`}
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
                    colSpan={8}
                    className="py-12 text-center text-[13px] font-normal text-[#6b7280]"
                  >
                    No products match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-[#eef0f4]">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const isChecked = selectedIds.includes(product.id)
              const mainImg = product.images?.[0]?.url || ''
              return (
                <div
                  key={product.id}
                  className={[
                    'p-4 space-y-3',
                    isChecked ? 'bg-red-50/35' : '',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectRow(product.id)}
                        aria-label={`Select ${product.name}`}
                        className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer shrink-0"
                      />
                      <ProductThumb
                        variant={product.thumbVariant}
                        imageUrl={mainImg}
                      />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#111827] truncate">
                          {product.name}
                        </p>
                        <p className="text-[12px] font-normal text-[#6b7280]">
                          {product.category} &bull; {product.type}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={product.status}
                      onClick={() => requestToggleStatus(product)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 pl-7">
                    <div className="flex items-center gap-4 text-[12.5px]">
                      <span className="font-medium text-[#111827]">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[#4b5563]">
                        Stock:{' '}
                        <strong className="font-medium text-[#111827]">
                          {product.stock}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setModalState({ open: true, product })}
                        aria-label={`Edit ${product.name}`}
                        className="p-1.5 rounded-lg text-[#374151] hover:bg-gray-100 cursor-pointer"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteProduct(product)}
                        aria-label={`Delete ${product.name}`}
                        className="p-1.5 rounded-lg text-[#dc1414] hover:bg-red-50 cursor-pointer"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-10 text-center text-[12.5px] text-[#6b7280]">
              No products match your current filters.
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
        <p className="text-[13px] font-normal text-[#4b5563]">
          {filteredProducts.length > 0
            ? `Showing 1 to ${filteredProducts.length} of ${totalDisplayCount} products`
            : 'Showing 0 products'}
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

      {/* Add / Edit Product Modal */}
      {modalState.open && (
        <ProductModal
          key={modalState.product?.id || 'new'}
          isOpen={modalState.open}
          editingProduct={modalState.product}
          onClose={() => setModalState({ open: false, product: null })}
          onSave={handleSaveProduct}
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
