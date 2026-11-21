import { useEffect, useMemo, useRef, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  ChevronDownIcon,
  CloseIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/common/Icons'
import categoryService from '../../services/categoryService'
import productService, { getFullProductImageUrl } from '../../services/productService'
import ProductDetailsModal from './ProductDetailsModal'
import Pagination from '../../components/common/Pagination'

const STATUSES = ['All Status', 'Active', 'Inactive', 'Out of Stock', 'Draft']
const PRODUCT_TYPES = ['Buy & Rent', 'Buy Only', 'Rent Only']
const ITEMS_PER_PAGE = 6

function formatPrice(value) {
  if (value === null || value === undefined || isNaN(value)) return '₹0.00'
  return `₹${Number(value).toLocaleString('en-IN', {
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

function ProductThumb({ imageUrl = '' }) {
  if (imageUrl) {
    return (
      <div className="w-12 h-9 rounded-md border border-[#e5e7eb] bg-white overflow-hidden shrink-0 flex items-center justify-center p-0.5">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className="w-12 h-9 rounded-md border border-[#e5e7eb] bg-[#f8f9fb] text-[#9ca3af] flex items-center justify-center shrink-0">
      <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="2" strokeWidth="1.5" />
        <path d="M7 20h10M12 16v4" strokeWidth="1.5" strokeLinecap="round" />
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

function ProductModal({ isOpen, editingProduct, onClose, onSave, categories = [] }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [saving, setSaving] = useState(false)

  // Basic Info
  const [name, setName] = useState(editingProduct?.name || editingProduct?.title || '')
  const [brand, setBrand] = useState(editingProduct?.brand || '')
  const [sku, setSku] = useState(editingProduct?.sku || '')
  const [category, setCategory] = useState(
    editingProduct?.categoryName ||
      editingProduct?.category?.name ||
      editingProduct?.category ||
      (categories[0]?.name || 'Laptops'),
  )
  const [type, setType] = useState(editingProduct?.type || 'Buy & Rent')
  const [status, setStatus] = useState(editingProduct?.status || 'Active')
  const [warranty, setWarranty] = useState(editingProduct?.warranty || '')

  // Pricing & Stock
  const [price, setPrice] = useState(
    editingProduct?.price !== undefined ? String(editingProduct.price) : '',
  )
  const [comparePrice, setComparePrice] = useState(
    editingProduct?.comparePrice ? String(editingProduct.comparePrice) : (editingProduct?.originalPrice ? String(editingProduct.originalPrice) : ''),
  )
  const [stock, setStock] = useState(
    editingProduct?.stock !== undefined ? String(editingProduct.stock) : '15',
  )
  const [rentPrice, setRentPrice] = useState(
    editingProduct?.rentPerMonth ? String(editingProduct.rentPerMonth) : (editingProduct?.rentPrice ? String(editingProduct.rentPrice).replace(/[^\d.]/g, '') : ''),
  )
  const [deposit, setDeposit] = useState(
    editingProduct?.deposit ? String(editingProduct.deposit) : '',
  )
  const [isFreeDelivery, setIsFreeDelivery] = useState(
    editingProduct?.isFreeDelivery !== undefined ? Boolean(editingProduct.isFreeDelivery) : true,
  )
  const [deliveryCharge, setDeliveryCharge] = useState(
    editingProduct?.deliveryCharge !== undefined ? String(editingProduct.deliveryCharge) : '0',
  )

  // Images state: can contain objects { id, name, url, file? }
  const [images, setImages] = useState(() => {
    if (!editingProduct) return []
    const rawImages = editingProduct.images?.length
      ? editingProduct.images
      : editingProduct.image
      ? [editingProduct.image]
      : []
    return rawImages.map((img, idx) => {
      const url = typeof img === 'string' ? img : img?.url || ''
      return {
        id: `existing-${idx}-${url}`,
        name: `Image ${idx + 1}`,
        url: getFullProductImageUrl(url),
        rawPath: url,
      }
    })
  })

  // Hardware Specifications
  const [specs, setSpecs] = useState({
    processor: editingProduct?.specs?.processor || editingProduct?.specs?.cpu || '',
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
              ? [
                  ...prev,
                  {
                    id: `${Date.now()}-${file.name}`,
                    name: file.name,
                    url: result,
                    file: file,
                  },
                ]
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

  const handleSubmit = async (e) => {
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

    try {
      setSaving(true)
      setError('')

      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('brand', brand.trim() || 'Prestige')
      formData.append('sku', sku.trim())
      formData.append('category', category)
      formData.append('price', String(parsedPrice))
      if (!Number.isNaN(parsedCompare)) formData.append('comparePrice', String(parsedCompare))
      
      // Dynamic Rental Price & Terms Handling
      if (type === 'Buy & Rent' || type === 'Rent Only') {
        if (!Number.isNaN(parsedRent) && parsedRent > 0) {
          formData.append('rentPerMonth', String(parsedRent))
          formData.append('rentPrice', `₹${parsedRent.toLocaleString('en-IN')}/mo`)
        } else {
          formData.append('rentPerMonth', '0')
          formData.append('rentPrice', '')
        }
        if (!Number.isNaN(parsedDeposit) && parsedDeposit >= 0) {
          formData.append('deposit', String(parsedDeposit))
        } else {
          formData.append('deposit', '0')
        }
      } else {
        formData.append('rentPerMonth', '0')
        formData.append('rentPrice', '')
        formData.append('deposit', '0')
      }

      formData.append('stock', String(parsedStock))
      formData.append('isFreeDelivery', String(isFreeDelivery))
      formData.append('deliveryCharge', String(isFreeDelivery ? 0 : (Number.parseFloat(deliveryCharge) || 0)))
      formData.append('type', type)
      formData.append('status', status)
      formData.append('warranty', warranty.trim())
      formData.append('description', description.trim())
      formData.append('specs', JSON.stringify(specs))
      formData.append('customSpecs', JSON.stringify(cleanCustomSpecs))

      // Keep existing images
      const retainedImages = images
        .filter((img) => !img.file)
        .map((img) => img.rawPath || img.url)
      formData.append('images', JSON.stringify(retainedImages))

      // Append new files
      images.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file)
        }
      })

      await onSave(formData, editingProduct)
    } catch (err) {
      setError(err?.message || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
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
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6"
        >
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-[12.5px] font-medium text-[#b91c1c]">
              {error}
            </div>
          )}

          {/* SECTION 1: PRODUCT IMAGES */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[12.5px] font-medium text-[#111827]">
                  Product Images
                </h4>
                <p className="text-[12px] text-[#6b7280]">
                  Upload up to 5 high-resolution photos. First image will be primary.
                </p>
              </div>
              <span className="text-[11.5px] font-medium text-[#6b7280]">
                {images.length}/5 uploaded
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                'rounded-xl border-2 border-dashed p-5 text-center cursor-pointer transition-colors',
                isDragging
                  ? 'border-[#dc1414] bg-red-50/50'
                  : 'border-[#d6dae2] bg-[#fafbfc] hover:border-[#dc1414] hover:bg-red-50/20',
              ].join(' ')}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-red-50 text-[#dc1414] flex items-center justify-center">
                  <UploadCloudIcon className="w-5 h-5" />
                </div>
                <p className="text-[12.5px] font-medium text-[#111827]">
                  Click to upload{' '}
                  <span className="font-normal text-[#6b7280]">or drag and drop</span>
                </p>
                <p className="text-[11.5px] text-[#9ca3af]">
                  PNG, JPG, WEBP or SVG up to 5MB
                </p>
              </div>
            </div>

            {/* Uploaded Images Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2.5 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative group rounded-lg border border-[#e5e7eb] bg-[#f8f9fb] aspect-[4/3] overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#dc1414] text-white">
                        Cover
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(idx)}
                          title="Set as primary"
                          className="p-1 rounded bg-white/90 text-[10px] font-semibold text-[#111827] hover:bg-white"
                        >
                          Top
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        title="Remove"
                        className="p-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dell Inspiron 15 (2025)"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Brand <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Dell, HP, Lenovo, Apple, ASUS"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. PCS-DL-INS15"
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
                  {categories.map((c) => {
                    const cName = typeof c === 'string' ? c : c.name
                    return (
                      <option key={cName} value={cName}>
                        {cName}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Offering Type
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

          {/* SECTION 3: PRICING & STOCK */}
          <section className="space-y-3.5 border-t border-[#eef0f4] pt-5">
            <h4 className="text-[12.5px] font-medium text-[#111827]">
              Pricing, Inventory & Terms
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Sale Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="52999"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Compare Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="59999"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="25"
                  className={inputClass}
                />
              </div>

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

              <div className="sm:col-span-2">
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

            {/* DEDICATED RENTAL PRICING & CONFIGURATION BOX */}
            {showRentalFields && (
              <div className="mt-4 p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#dc1414] animate-pulse" />
                    <h5 className="text-[13px] font-bold text-[#111827]">
                      Rental Pricing & Terms Configuration
                    </h5>
                  </div>
                  <span className="text-[10.5px] font-bold text-[#dc1414] bg-white border border-rose-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {type}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                      Monthly Rental Rate (₹/month) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#6b7280]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={rentPrice}
                        onChange={(e) => setRentPrice(e.target.value)}
                        placeholder="2500"
                        className={`${inputClass} pl-7`}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#6b7280]">
                      The monthly recurring fee billed to the customer.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">
                      Refundable Security Deposit (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#6b7280]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={deposit}
                        onChange={(e) => setDeposit(e.target.value)}
                        placeholder="8000"
                        className={`${inputClass} pl-7`}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#6b7280]">
                      100% refundable upon device return after QC.
                    </p>
                  </div>
                </div>

                {Number(rentPrice) > 0 && (
                  <div className="p-2.5 rounded-lg bg-white border border-rose-200/80 flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Storefront Button Preview:</span>
                    <span className="font-bold text-[#dc1414] bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                      Rent from ₹{Number(rentPrice).toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* SECTION: SHIPPING & DELIVERY */}
          <section className="space-y-3.5 border-t border-[#eef0f4] pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[12.5px] font-semibold text-[#111827]">
                  Shipping & Delivery Charges
                </h4>
                <p className="text-[12px] text-[#6b7280]">
                  Set whether this product qualifies for Free Delivery or requires an additional shipping charge.
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${isFreeDelivery ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {isFreeDelivery ? '✓ Free Delivery' : `Paid: ₹${Number(deliveryCharge || 0)}`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Delivery Type Option 1: Free Delivery */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isFreeDelivery
                    ? 'border-[#dc1414] bg-red-50/20 ring-1 ring-[#dc1414]/20'
                    : 'border-[#d6dae2] bg-[#f8f9fb] hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={isFreeDelivery}
                  onChange={() => {
                    setIsFreeDelivery(true)
                    setDeliveryCharge('0')
                  }}
                  className="mt-0.5 text-[#dc1414] focus:ring-[#dc1414]"
                />
                <div>
                  <span className="text-[13px] font-bold text-[#111827] block">
                    Free Delivery
                  </span>
                  <span className="text-[11.5px] text-[#6b7280] leading-snug block mt-0.5">
                    Customers will not be charged any shipping fee for this item.
                  </span>
                </div>
              </label>

              {/* Delivery Type Option 2: Paid Delivery */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  !isFreeDelivery
                    ? 'border-[#dc1414] bg-red-50/20 ring-1 ring-[#dc1414]/20'
                    : 'border-[#d6dae2] bg-[#f8f9fb] hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={!isFreeDelivery}
                  onChange={() => {
                    setIsFreeDelivery(false)
                    if (!deliveryCharge || deliveryCharge === '0') setDeliveryCharge('150')
                  }}
                  className="mt-0.5 text-[#dc1414] focus:ring-[#dc1414]"
                />
                <div className="flex-1">
                  <span className="text-[13px] font-bold text-[#111827] block">
                    Paid Delivery Charge
                  </span>
                  <span className="text-[11.5px] text-[#6b7280] leading-snug block mt-0.5">
                    Add a shipping charge that gets calculated dynamically into cart and checkout.
                  </span>
                </div>
              </label>
            </div>

            {!isFreeDelivery && (
              <div className="pt-1">
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Delivery Charge Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-[13px] font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required={!isFreeDelivery}
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    placeholder="e.g. 150"
                    className={`${inputClass} pl-8`}
                  />
                </div>
                <p className="text-[11px] text-[#6b7280] mt-1">
                  This charge will be applied to the order subtotal when a customer buys this product.
                </p>
              </div>
            )}
          </section>

          {/* SECTION 4: HARDWARE SPECIFICATIONS */}
          <section className="space-y-3.5 border-t border-[#eef0f4] pt-5">
            <h4 className="text-[12.5px] font-medium text-[#111827]">
              Hardware Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                  Processor (CPU)
                </label>
                <input
                  type="text"
                  value={specs.processor}
                  onChange={(e) => updateSpec('processor', e.target.value)}
                  placeholder="e.g. 13th Gen Intel Core i5-1335U"
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
                  placeholder="e.g. 512GB PCIe NVMe SSD"
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
                  placeholder="e.g. Intel Iris Xe / NVIDIA RTX 4060"
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
                  placeholder='e.g. 15.6" FHD 120Hz Anti-Glare'
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
                  placeholder="e.g. Windows 11 Home / macOS"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* SECTION 5: CUSTOM SPECS */}
          <section className="space-y-3.5 border-t border-[#eef0f4] pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[12.5px] font-medium text-[#111827]">
                  Custom Specifications
                </h4>
                <p className="text-[12px] text-[#6b7280]">
                  Add extra details like Battery, Weight, Ports, Cooling, etc.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomSpec}
                className="text-[12px] font-semibold text-[#dc1414] hover:text-[#a80b0b] cursor-pointer"
              >
                + Add Spec
              </button>
            </div>

            <div className="space-y-2">
              {customSpecs.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.key}
                    onChange={(e) => handleCustomSpecChange(idx, 'key', e.target.value)}
                    placeholder="Key (e.g. Battery)"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleCustomSpecChange(idx, 'value', e.target.value)}
                    placeholder="Value (e.g. 54Wh 4-Cell)"
                    className={inputClass}
                  />
                  {customSpecs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomSpec(idx)}
                      className="p-2 text-[#9ca3af] hover:text-red-600 cursor-pointer"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: DESCRIPTION */}
          <section className="space-y-2 border-t border-[#eef0f4] pt-5">
            <label className="block text-[12px] font-medium text-[#374151]">
              Product Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of features, materials, and warranty information..."
              className={inputClass}
            />
          </section>
        </form>

        {/* Sticky Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 border-t border-[#eef0f4] bg-[#f8f9fb] shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-[#d6dae2] bg-white hover:bg-gray-50 text-[#374151] text-[12.5px] font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] disabled:opacity-50 text-white text-[12.5px] font-medium shadow-xs cursor-pointer"
          >
            {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products({ globalSearch = '' }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [liveCategories, setLiveCategories] = useState([])
  const [localSearch, setLocalSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [detailsProduct, setDetailsProduct] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState({ open: false, product: null })
  const [confirmState, setConfirmState] = useState(null)

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getAll({ all: 'true' }).catch(() => null),
        categoryService.getAll({ all: 'true' }).catch(() => null),
      ])

      if (prodRes?.data?.products) {
        setProducts(prodRes.data.products)
      } else if (Array.isArray(prodRes?.data)) {
        setProducts(prodRes.data)
      }

      if (catRes?.data) {
        setLiveCategories(catRes.data)
      }
    } catch (err) {
      console.warn('Failed to load products/categories:', err?.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    Promise.all([
      productService.getAll({ all: 'true' }).catch(() => null),
      categoryService.getAll({ all: 'true' }).catch(() => null),
    ]).then(([prodRes, catRes]) => {
      if (!isMounted) return
      if (prodRes?.data?.products) {
        setProducts(prodRes.data.products)
      } else if (Array.isArray(prodRes?.data)) {
        setProducts(prodRes.data)
      }

      if (catRes?.data) {
        setLiveCategories(catRes.data)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const categoryFilterOptions = useMemo(() => {
    return ['All Categories', ...liveCategories.map((c) => c.name)]
  }, [liveCategories])

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const pName = (item.name || item.title || '').toLowerCase()
      const pCat = (item.categoryName || item.category?.name || item.category || '').toLowerCase()
      const pType = (item.type || '').toLowerCase()
      const pBrand = (item.brand || '').toLowerCase()
      const pSku = (item.sku || '').toLowerCase()

      const matchesSearch =
        !combinedSearch ||
        pName.includes(combinedSearch) ||
        pCat.includes(combinedSearch) ||
        pType.includes(combinedSearch) ||
        pBrand.includes(combinedSearch) ||
        pSku.includes(combinedSearch)

      const matchesCategory =
        selectedCategory === 'All Categories' ||
        (item.categoryName === selectedCategory) ||
        (item.category?.name === selectedCategory) ||
        (item.category === selectedCategory)

      const matchesStatus =
        selectedStatus === 'All Status' || item.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, combinedSearch, selectedCategory, selectedStatus])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, safePage])

  const handleSaveProduct = async (formData, editingProduct) => {
    try {
      const targetId = editingProduct?._id || editingProduct?.id
      if (editingProduct && targetId && !targetId.toString().startsWith('PRD-')) {
        await productService.update(targetId, formData)
      } else {
        await productService.create(formData)
      }
      await loadData()
      setModalState({ open: false, product: null })
    } catch (err) {
      alert(err?.message || 'Failed to save product.')
    }
  }

  const requestDeleteProduct = (product) => {
    const pid = product._id || product.id
    setConfirmState({
      title: 'Delete Product?',
      message: `Are you sure you want to permanently delete "${product.name || product.title}"? This action cannot be undone.`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (pid && !pid.toString().startsWith('PRD-')) {
            await productService.delete(pid)
          }
          setProducts((prev) => prev.filter((p) => (p._id || p.id) !== pid))
        } catch (err) {
          alert(err?.message || 'Failed to delete product.')
        } finally {
          setConfirmState(null)
        }
      },
    })
  }

  const requestToggleStatus = (product) => {
    const pid = product._id || product.id
    const nextStatus = product.status === 'Active' ? 'Inactive' : 'Active'
    const isDeactivating = nextStatus === 'Inactive'
    setConfirmState({
      title: isDeactivating ? 'Mark Product Inactive?' : 'Activate Product?',
      message: isDeactivating
        ? `Are you sure you want to deactivate "${product.name || product.title}"? It will be hidden from customers.`
        : `Are you sure you want to activate "${product.name || product.title}" and make it visible on the storefront?`,
      confirmText: isDeactivating ? 'Yes, Deactivate' : 'Yes, Activate',
      variant: isDeactivating ? 'warning' : 'success',
      onConfirm: async () => {
        try {
          if (pid && !pid.toString().startsWith('PRD-')) {
            await productService.toggleStatus(pid)
          }
          setProducts((prev) =>
            prev.map((p) =>
              (p._id || p.id) === pid ? { ...p, status: nextStatus } : p,
            ),
          )
        } catch (err) {
          alert(err?.message || 'Failed to update status.')
        } finally {
          setConfirmState(null)
        }
      },
    })
  }

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
              htmlFor="status-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Status:
            </label>
            <div className="relative flex-1 sm:w-[160px]">
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

      {/* Product Table Container */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0_1px_3px_rgba(16,24,40,0.04)] overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-[12.5px] border-collapse">
            <thead>
              <tr className="border-b border-[#eef0f4] bg-[#f8f9fb] text-[#4b5563] font-medium">
                <th className="py-3.5 pl-5 pr-3">Product</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Price</th>
                <th className="py-3.5 px-3 text-center">Stock</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6b7280]">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#dc1414] border-t-transparent rounded-full animate-spin" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const pid = product._id || product.id
                  const rawImg = product.image || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url) || ''
                  const mainImg = getFullProductImageUrl(rawImg)

                  const catDisplay = product.categoryName || product.category?.name || product.category || 'Laptops'

                  return (
                    <tr
                      key={pid}
                      className="transition-colors hover:bg-[#fafbfc]"
                    >
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3.5">
                          <button
                            type="button"
                            onClick={() => setDetailsProduct(product)}
                            className="cursor-pointer shrink-0 transition-transform hover:scale-105"
                            title="Click to view details"
                          >
                            <ProductThumb
                              variant={product.imageVariant || product.thumbVariant}
                              imageUrl={mainImg}
                            />
                          </button>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setDetailsProduct(product)}
                              className="font-medium text-[#111827] block text-left hover:text-[#dc1414] transition-colors cursor-pointer truncate max-w-[280px]"
                              title="Click to view full details"
                            >
                              {product.name || product.title}
                            </button>
                            {(product.specs?.processor || product.specs?.cpu || product.specs?.ram) && (
                              <span className="text-[12px] font-normal text-[#6b7280] block truncate max-w-[260px]">
                                {[product.specs?.processor || product.specs?.cpu, product.specs?.ram]
                                  .filter(Boolean)
                                  .join(' • ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#374151]">
                        {catDisplay}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#111827]">
                        <div>{formatPrice(product.price)}</div>
                        {product.type !== 'Buy Only' && (Number(product.rentPerMonth) > 0 || product.rentPrice) && (
                          <div className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#dc1414] bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded mt-0.5">
                            Rent: {product.rentPrice || `₹${Number(product.rentPerMonth).toLocaleString('en-IN')}/mo`}
                          </div>
                        )}
                        <span className="text-[10.5px] font-medium text-emerald-600 block leading-tight mt-0.5">
                          {product.isFreeDelivery !== false && Number(product.deliveryCharge || 0) === 0 ? 'Free Delivery' : `+₹${product.deliveryCharge} delivery`}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium text-[#111827]">
                        {product.stock ?? 15}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#374151]">
                        {product.type || 'Buy & Rent'}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge
                          status={product.status || 'Active'}
                          onClick={() => requestToggleStatus(product)}
                        />
                      </td>
                      <td className="py-3.5 pl-3 pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailsProduct(product)}
                            title="View Full Product Details"
                            aria-label={`View full details of ${product.name || product.title}`}
                            className="p-1.5 rounded-lg text-[#2563eb] hover:text-[#1d4ed8] hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <EyeIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setModalState({ open: true, product })
                            }
                            aria-label={`Edit ${product.name || product.title}`}
                            className="p-1.5 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteProduct(product)}
                            aria-label={`Delete ${product.name || product.title}`}
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
                    colSpan={7}
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
          {loading ? (
            <div className="py-10 text-center text-[12.5px] text-[#6b7280]">
              Loading products...
            </div>
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => {
              const pid = product._id || product.id
              const rawImg = product.image || (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url) || ''
              const mainImg = getFullProductImageUrl(rawImg)
              const catDisplay = product.categoryName || product.category?.name || product.category || 'Laptops'

              return (
                <div
                  key={pid}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setDetailsProduct(product)}
                        className="cursor-pointer shrink-0"
                      >
                        <ProductThumb
                          variant={product.imageVariant || product.thumbVariant}
                          imageUrl={mainImg}
                        />
                      </button>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setDetailsProduct(product)}
                          className="text-[13px] font-medium text-[#111827] truncate block text-left hover:text-[#dc1414] cursor-pointer"
                        >
                          {product.name || product.title}
                        </button>
                        <p className="text-[12px] font-normal text-[#6b7280]">
                          {catDisplay} &bull; {product.type || 'Buy & Rent'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={product.status || 'Active'}
                      onClick={() => requestToggleStatus(product)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-4 text-[12.5px]">
                      <span className="font-medium text-[#111827]">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[#4b5563]">
                        Stock:{' '}
                        <strong className="font-medium text-[#111827]">
                          {product.stock ?? 15}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailsProduct(product)}
                        title="View Details"
                        aria-label={`View details of ${product.name || product.title}`}
                        className="p-1.5 rounded-lg text-[#2563eb] hover:bg-blue-50 cursor-pointer"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalState({ open: true, product })}
                        aria-label={`Edit ${product.name || product.title}`}
                        className="p-1.5 rounded-lg text-[#374151] hover:bg-gray-100 cursor-pointer"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteProduct(product)}
                        aria-label={`Delete ${product.name || product.title}`}
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

      {/* Fully Dynamic Pagination Footer */}
      <Pagination
        currentPage={safePage}
        totalItems={filteredProducts.length}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
        itemName="products"
      />

      {/* Add / Edit Product Modal */}
      {modalState.open && (
        <ProductModal
          key={modalState.product?._id || modalState.product?.id || 'new'}
          isOpen={modalState.open}
          editingProduct={modalState.product}
          categories={liveCategories}
          onClose={() => setModalState({ open: false, product: null })}
          onSave={handleSaveProduct}
        />
      )}

      {/* Product Full Details Modal */}
      {detailsProduct && (
        <ProductDetailsModal
          product={detailsProduct}
          onClose={() => setDetailsProduct(null)}
          onEdit={(prod) => {
            setDetailsProduct(null)
            setModalState({ open: true, product: prod })
          }}
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