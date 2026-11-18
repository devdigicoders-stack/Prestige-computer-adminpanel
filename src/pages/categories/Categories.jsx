import { useMemo, useRef, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  CategoriesIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  CubeIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/common/Icons'

const INITIAL_CATEGORIES = [
  {
    id: 'CAT-001',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Business ultrabooks, student & everyday laptops',
    productCount: 48,
    type: 'Buy & Rent',
    status: 'Active',
    iconType: 'laptop',
  },
  {
    id: 'CAT-002',
    name: 'Gaming Laptops',
    slug: 'gaming-laptops',
    description: 'High-refresh RTX gaming & creator laptops',
    productCount: 26,
    type: 'Buy & Rent',
    status: 'Active',
    iconType: 'gaming',
  },
  {
    id: 'CAT-003',
    name: 'Desktop PCs',
    slug: 'desktop-pcs',
    description: 'Custom RGB gaming towers & office workstations',
    productCount: 22,
    type: 'Buy & Rent',
    status: 'Active',
    iconType: 'desktop',
  },
  {
    id: 'CAT-004',
    name: 'Monitors & Displays',
    slug: 'monitors-displays',
    description: '4K studio, ultrawide & 144Hz gaming monitors',
    productCount: 19,
    type: 'Buy & Rent',
    status: 'Active',
    iconType: 'monitor',
  },
  {
    id: 'CAT-005',
    name: 'PC Components',
    slug: 'pc-components',
    description: 'Graphics cards, processors, RAM, NVMe SSDs',
    productCount: 15,
    type: 'Buy Only',
    status: 'Active',
    iconType: 'components',
  },
  {
    id: 'CAT-006',
    name: 'Accessories & Peripherals',
    slug: 'accessories-peripherals',
    description: 'Gaming headsets, mechanical keyboards & mice',
    productCount: 12,
    type: 'Buy Only',
    status: 'Hidden',
    iconType: 'accessories',
  },
]

const TYPES = ['All Types', 'Buy & Rent', 'Buy Only', 'Rent Only']
const STATUSES = ['All Status', 'Active', 'Hidden']
const ICON_OPTIONS = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'desktop', label: 'Desktop Tower' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'components', label: 'PC Components' },
  { value: 'accessories', label: 'Accessories' },
]

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function UploadCloudIcon({ className = 'w-6 h-6' }) {
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

function CategoryThumbIcon({ type = 'laptop', imageUrl = '' }) {
  if (imageUrl) {
    return (
      <div className="w-10 h-10 rounded-lg border border-[#e5e7eb] bg-[#f8f9fb] overflow-hidden shrink-0">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className="w-10 h-10 rounded-lg bg-[#fef2f2] border border-[#fee2e2] text-[#dc1414] flex items-center justify-center shrink-0">
      {type === 'laptop' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="5" width="16" height="11" rx="1.8" />
          <path d="M2 18.5h20" />
        </svg>
      )}
      {type === 'gaming' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="6.5" width="18" height="11" rx="4" />
          <path d="M8 10v4" />
          <path d="M6 12h4" />
          <circle cx="15.5" cy="11" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="17.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      )}
      {type === 'desktop' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="6" y="3" width="12" height="18" rx="2" />
          <circle cx="12" cy="9" r="2.2" />
          <circle cx="12" cy="15.5" r="2.2" />
        </svg>
      )}
      {type === 'monitor' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="12.5" rx="2" />
          <path d="M9 20h6" />
          <path d="M12 16.5V20" />
        </svg>
      )}
      {type === 'components' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="6.5" y="6.5" width="11" height="11" rx="1.8" />
          <rect x="9.5" y="9.5" width="5" height="5" rx="0.6" />
          <path d="M9.5 3.5v3M14.5 3.5v3M9.5 17.5v3M14.5 17.5v3M3.5 9.5h3M3.5 14.5h3M17.5 9.5h3M17.5 14.5h3" />
        </svg>
      )}
      {type === 'accessories' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 13a8 8 0 0 1 16 0" />
          <rect x="3" y="13" width="3.5" height="6" rx="1.5" />
          <rect x="17.5" y="13" width="3.5" height="6" rx="1.5" />
        </svg>
      )}
    </div>
  )
}

function StatusBadge({ status, onClick }) {
  const styles = {
    Active: 'bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0]',
    Hidden: 'bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        status === 'Active'
          ? 'Click to hide category'
          : 'Click to activate category'
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

function CategoryModal({ isOpen, editingCategory, onClose, onSave }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [image, setImage] = useState(editingCategory?.image || '')
  const [imageName, setImageName] = useState(editingCategory?.imageName || '')
  const [name, setName] = useState(editingCategory?.name || '')
  const [slug, setSlug] = useState(editingCategory?.slug || '')
  const [slugTouched, setSlugTouched] = useState(Boolean(editingCategory))
  const [description, setDescription] = useState(
    editingCategory?.description || '',
  )
  const [type, setType] = useState(editingCategory?.type || 'Buy & Rent')
  const [status, setStatus] = useState(editingCategory?.status || 'Active')
  const [iconType, setIconType] = useState(
    editingCategory?.iconType || 'laptop',
  )
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setImage(ev.target.result)
        setImageName(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleImageFile(e.dataTransfer.files?.[0])
  }

  const handleNameChange = (val) => {
    setName(val)
    if (!slugTouched) {
      setSlug(slugify(val))
    }
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a category name.')
      return
    }
    const cleanSlug = slugify(slug || name)
    if (!cleanSlug) {
      setError('Please enter a valid URL slug.')
      return
    }

    onSave({
      id: editingCategory?.id || `CAT-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      slug: cleanSlug,
      description:
        description.trim() || 'Computer store category products & accessories',
      productCount: editingCategory?.productCount ?? 0,
      type,
      status,
      iconType,
      image,
      imageName,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[1px] p-3 sm:p-4">
      <div className="w-full max-w-[540px] max-h-[92vh] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_24px_60px_rgba(16,24,40,0.25)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef0f4] shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-[#111827]">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              Upload a category thumbnail and configure storefront details.
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

        <form
          id="category-form"
          onSubmit={handleSubmit}
          className="p-5 space-y-4 overflow-y-auto flex-1"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[13px] font-medium text-[#b91c1c]">
              {error}
            </div>
          )}

          {/* Category Image Upload */}
          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Category Image
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleImageFile(e.target.files?.[0])
                e.target.value = ''
              }}
              className="hidden"
            />

            {image ? (
              <div className="flex items-center gap-4 p-3 rounded-xl border border-[#e5e7eb] bg-[#f8f9fb]">
                <div className="w-20 h-16 rounded-lg overflow-hidden border border-[#dce0e8] bg-white shrink-0">
                  <img
                    src={image}
                    alt={name || 'Category preview'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#111827] truncate">
                    {imageName || 'Category thumbnail'}
                  </p>
                  <p className="text-[11.5px] font-normal text-[#6b7280] mt-0.5">
                    Displayed in category table &amp; storefront cards
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-md border border-[#d6dae2] bg-white hover:bg-gray-50 text-[12px] font-medium text-[#1f2937] cursor-pointer"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImage('')
                        setImageName('')
                      }}
                      className="px-2.5 py-1 rounded-md text-[12px] font-medium text-[#dc1414] hover:bg-red-50 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={[
                  'rounded-xl border-2 border-dashed px-4 py-4 text-center cursor-pointer transition-all',
                  isDragging
                    ? 'border-[#dc1414] bg-red-50/50'
                    : 'border-[#d6dae2] bg-[#f8f9fb] hover:border-[#dc1414]/60 hover:bg-red-50/20',
                ].join(' ')}
              >
                <div className="w-10 h-10 rounded-full bg-[#fef2f2] border border-[#fee2e2] text-[#dc1414] flex items-center justify-center mx-auto">
                  <UploadCloudIcon className="w-5 h-5" />
                </div>
                <p className="mt-2 text-[13px] font-medium text-[#111827]">
                  <span className="text-[#dc1414]">Click to upload</span> or
                  drag &amp; drop image
                </p>
                <p className="text-[11.5px] text-[#6b7280] mt-0.5">
                  PNG, JPG or WebP (recommended 400&times;400px)
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Category Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Gaming Laptops"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value)
                }}
                placeholder="gaming-laptops"
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description shown for this category..."
              className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Fallback Icon
              </label>
              <select
                value={iconType}
                onChange={(e) => setIconType(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              >
                {TYPES.filter((t) => t !== 'All Types').map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
              >
                {STATUSES.filter((s) => s !== 'All Status').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </form>

        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#eef0f4] bg-[#fafbfc] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#d6dae2] bg-white text-[12.5px] font-medium text-[#374151] hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="category-form"
            className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white text-[12.5px] font-medium shadow-xs cursor-pointer"
          >
            {editingCategory ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Categories({ globalSearch = '' }) {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [localSearch, setLocalSearch] = useState('')
  const [selectedType, setSelectedType] = useState('All Types')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState({ open: false, category: null })
  const [confirmState, setConfirmState] = useState(null)

  const combinedSearch = (localSearch || globalSearch).trim().toLowerCase()

  const filteredCategories = useMemo(() => {
    return categories.filter((item) => {
      const matchesSearch =
        !combinedSearch ||
        item.name.toLowerCase().includes(combinedSearch) ||
        item.slug.toLowerCase().includes(combinedSearch) ||
        item.description.toLowerCase().includes(combinedSearch)

      const matchesType =
        selectedType === 'All Types' || item.type === selectedType

      const matchesStatus =
        selectedStatus === 'All Status' || item.status === selectedStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [categories, combinedSearch, selectedType, selectedStatus])

  const stats = useMemo(() => {
    const activeCount = categories.filter((c) => c.status === 'Active').length
    const totalLinked = categories.reduce((sum, c) => sum + c.productCount, 0)
    const rentalEnabled = categories.filter(
      (c) => c.type === 'Buy & Rent' || c.type === 'Rent Only',
    ).length

    return [
      {
        label: 'Total Categories',
        value: categories.length,
        icon: CategoriesIcon,
      },
      {
        label: 'Active Categories',
        value: activeCount,
        icon: CubeIcon,
      },
      {
        label: 'Products Linked',
        value: totalLinked,
        icon: CubeIcon,
      },
      {
        label: 'Rental Enabled',
        value: rentalEnabled,
        icon: CategoriesIcon,
      },
    ]
  }, [categories])

  const allSelected =
    filteredCategories.length > 0 &&
    filteredCategories.every((c) => selectedIds.includes(c.id))

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredCategories.map((c) => c.id))
    }
  }

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSaveCategory = (saved) => {
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === saved.id)
      if (exists) {
        return prev.map((c) => (c.id === saved.id ? saved : c))
      }
      return [saved, ...prev]
    })
    setModalState({ open: false, category: null })
  }

  const requestDeleteCategory = (category) => {
    setConfirmState({
      title: 'Delete Category?',
      message: `Are you sure you want to delete "${category.name}"? Products linked to this category will need reassignment.`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: () => {
        setCategories((prev) => prev.filter((c) => c.id !== category.id))
        setSelectedIds((prev) => prev.filter((item) => item !== category.id))
        setConfirmState(null)
      },
    })
  }

  const requestBulkDelete = () => {
    const count = selectedIds.length
    setConfirmState({
      title: `Delete ${count} Selected ${count === 1 ? 'Category' : 'Categories'}?`,
      message: `Are you sure you want to permanently delete ${count} selected ${count === 1 ? 'category' : 'categories'}?`,
      confirmText: `Delete (${count})`,
      variant: 'danger',
      onConfirm: () => {
        setCategories((prev) => prev.filter((c) => !selectedIds.includes(c.id)))
        setSelectedIds([])
        setConfirmState(null)
      },
    })
  }

  const requestToggleStatus = (category) => {
    const nextStatus = category.status === 'Active' ? 'Hidden' : 'Active'
    const isHiding = nextStatus === 'Hidden'
    setConfirmState({
      title: isHiding ? 'Deactivate Category?' : 'Activate Category?',
      message: isHiding
        ? `Are you sure you want to hide "${category.name}" from the storefront?`
        : `Are you sure you want to activate "${category.name}" and make it visible to customers?`,
      confirmText: isHiding ? 'Yes, Hide' : 'Yes, Activate',
      variant: isHiding ? 'warning' : 'success',
      onConfirm: () => {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === category.id ? { ...c, status: nextStatus } : c,
          ),
        )
        setConfirmState(null)
      },
    })
  }

  const pages = [1, 2]

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Categories
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Organize your product categories, rental availability and store
            visibility.
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
            onClick={() => setModalState({ open: true, category: null })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer"
          >
            <PlusIcon className="w-[17px] h-[17px]" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Stats */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3.5">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-[#e6e8ee] px-4 py-3.5 shadow-[0_2px_8px_rgba(16,24,40,0.03)] flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-[#fef2f2] border border-[#fee2e2] text-[#dc1414] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-normal text-[#4b5563] truncate">
                  {stat.label}
                </p>
                <p className="text-[19px] font-semibold text-[#111827] leading-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          )
        })}
      </section>

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
              placeholder="Search categories..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
            />
          </div>
        </div>

        {/* Type & Status Dropdowns */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="cat-type-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Type:
            </label>
            <div className="relative flex-1 sm:w-[180px]">
              <select
                id="cat-type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {TYPES.map((typeOption) => (
                  <option key={typeOption} value={typeOption}>
                    {typeOption}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label
              htmlFor="cat-status-filter"
              className="text-[12.5px] font-medium text-[#1f2937] whitespace-nowrap"
            >
              Status:
            </label>
            <div className="relative flex-1 sm:w-[180px]">
              <select
                id="cat-status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[#d6dae2] bg-white pl-3.5 pr-9 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.03)] focus:border-[#dc1414] focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15 cursor-pointer"
              >
                {STATUSES.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden">
        {/* Desktop & Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f5f7] border-b border-[#e5e7eb] text-[13px] font-medium text-[#1f2937]">
                <th className="py-3.5 pl-4 pr-2 w-11">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all categories"
                    className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Description</th>
                <th className="py-3.5 px-3 text-center">Products</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef0f4] text-[13px]">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => {
                  const isChecked = selectedIds.includes(category.id)
                  return (
                    <tr
                      key={category.id}
                      className={[
                        'transition-colors hover:bg-[#fafbfc]',
                        isChecked ? 'bg-red-50/35' : '',
                      ].join(' ')}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(category.id)}
                          aria-label={`Select ${category.name}`}
                          className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer align-middle"
                        />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <CategoryThumbIcon
                            type={category.iconType}
                            imageUrl={category.image}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-[#111827] leading-snug">
                              {category.name}
                            </p>
                            <p className="text-[12px] font-normal text-[#6b7280]">
                              /{category.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[12.5px] text-[#4b5563] max-w-[300px]">
                        <p className="truncate">{category.description}</p>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[36px] px-2.5 py-0.5 rounded-md bg-[#f3f4f6] text-[13px] font-medium text-[#111827]">
                          {category.productCount}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#374151] whitespace-nowrap">
                        {category.type}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <StatusBadge
                          status={category.status}
                          onClick={() => requestToggleStatus(category)}
                        />
                      </td>
                      <td className="py-3.5 pl-3 pr-5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setModalState({ open: true, category })
                            }
                            aria-label={`Edit ${category.name}`}
                            className="p-1.5 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteCategory(category)}
                            aria-label={`Delete ${category.name}`}
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
                    No categories match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-[#eef0f4]">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const isChecked = selectedIds.includes(category.id)
              return (
                <div
                  key={category.id}
                  className={[
                    'p-4 space-y-2.5',
                    isChecked ? 'bg-red-50/35' : '',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectRow(category.id)}
                        aria-label={`Select ${category.name}`}
                        className="w-4 h-4 rounded-[3px] border-[#cbd5e1] accent-[#dc1414] cursor-pointer shrink-0"
                      />
                      <CategoryThumbIcon
                            type={category.iconType}
                            imageUrl={category.image}
                          />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#111827] truncate">
                          {category.name}
                        </p>
                        <p className="text-[12px] font-normal text-[#6b7280]">
                          /{category.slug} &bull; {category.type}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={category.status}
                      onClick={() => requestToggleStatus(category)}
                    />
                  </div>

                  <p className="text-[13px] text-[#4b5563] pl-7">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 pl-7">
                    <span className="text-[13px] font-normal text-[#4b5563]">
                      Products:{' '}
                      <strong className="font-medium text-[#111827]">
                        {category.productCount}
                      </strong>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setModalState({ open: true, category })}
                        aria-label={`Edit ${category.name}`}
                        className="p-1.5 rounded-lg text-[#374151] hover:bg-gray-100 cursor-pointer"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteCategory(category)}
                        aria-label={`Delete ${category.name}`}
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
              No categories match your current filters.
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-0.5">
        <p className="text-[13px] font-normal text-[#4b5563]">
          {filteredCategories.length > 0
            ? `Showing 1 to ${filteredCategories.length} of ${categories.length} categories`
            : 'Showing 0 categories'}
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

      {/* Add / Edit Category Modal */}
      {modalState.open && (
        <CategoryModal
          key={modalState.category?.id || 'new'}
          isOpen={modalState.open}
          editingCategory={modalState.category}
          onClose={() => setModalState({ open: false, category: null })}
          onSave={handleSaveCategory}
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
