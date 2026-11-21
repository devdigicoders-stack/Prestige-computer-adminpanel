import { useState } from 'react'
import { CloseIcon, PencilIcon } from '../../components/common/Icons'
import { getFullProductImageUrl } from '../../services/productService'

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00'
  return `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export default function ProductDetailsModal({ product, onClose, onEdit }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  if (!product) return null

  // Extract all images
  const rawImages = []
  if (Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url
      if (url) rawImages.push(getFullProductImageUrl(url))
    })
  } else if (product.image) {
    rawImages.push(getFullProductImageUrl(product.image))
  }

  const activeImage = rawImages[activeImageIndex] || rawImages[0] || ''

  const categoryName =
    product.categoryName ||
    product.category?.name ||
    product.category ||
    'General'

  const specs = product.specs || {}
  const customSpecs = Array.isArray(product.customSpecs) ? product.customSpecs : []

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#e5e7eb]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eef0f4] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-6 rounded-full bg-[#dc1414]" />
            <div>
              <h2
                id="product-details-title"
                className="text-[17px] font-bold text-[#111827] leading-tight"
              >
                Product Details
              </h2>
              <p className="text-[12px] text-[#6b7280]">
                SKU: <span className="font-mono text-[#111827]">{product.sku || 'N/A'}</span> &bull; Slug: <span className="font-mono text-[#111827]">{product.slug || 'N/A'}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Product Media & Highlights */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Photo Showcase */}
              <div className="w-full h-64 sm:h-72 rounded-xl border border-[#e5e7eb] bg-[#f8f9fb] p-4 flex items-center justify-center overflow-hidden relative group">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.name || 'Product'}
                    className="max-w-full max-h-full object-contain drop-shadow-[0_8px_16px_rgba(15,23,42,0.12)] transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#9ca3af] gap-1.5">
                    <svg className="w-12 h-12 stroke-current" fill="none" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="12" rx="2" strokeWidth="1.5" />
                      <path d="M7 20h10M12 16v4" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs">No Photo Available</span>
                  </div>
                )}

                {/* Badge Overlay */}
                {product.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dc1414] text-white shadow-xs">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails list if multiple */}
              {rawImages.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {rawImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-14 h-14 rounded-lg border p-1 bg-white shrink-0 overflow-hidden transition-all cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#dc1414] ring-2 ring-[#dc1414]/20'
                          : 'border-[#e5e7eb] hover:border-[#9ca3af]'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Status & Inventory Card */}
              <div className="bg-[#f8f9fb] rounded-xl border border-[#e5e7eb] p-3.5 space-y-2.5 text-[12.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#6b7280]">Listing Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      product.status === 'Active'
                        ? 'bg-[#dcfce7] text-[#15803d]'
                        : product.status === 'Out of Stock'
                        ? 'bg-[#fee2e2] text-[#dc2626]'
                        : 'bg-[#f3f4f6] text-[#4b5563]'
                    }`}
                  >
                    {product.status || 'Active'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6b7280]">Available Stock:</span>
                  <span className="font-bold text-[#111827]">
                    {product.stock ?? 0} units{' '}
                    <span
                      className={`text-[11px] font-normal ${
                        product.inStock !== false ? 'text-[#15803d]' : 'text-[#dc2626]'
                      }`}
                    >
                      ({product.inStock !== false ? 'In Stock' : 'Out of Stock'})
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6b7280]">Offering Type:</span>
                  <span className="font-semibold text-[#111827]">
                    {product.type || 'Buy & Rent'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6b7280]">Customer Rating:</span>
                  <div className="flex items-center gap-1 font-semibold text-[#d97706]">
                    <span>★ {product.rating || 4.8}</span>
                    <span className="text-[11px] font-normal text-[#6b7280]">
                      ({product.reviewCount || product.numReviews || 0} reviews)
                    </span>
                  </div>
                </div>

                {product.soldCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#6b7280]">Sales Volume:</span>
                    <span className="font-medium text-[#111827]">{product.soldCount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Detailed Product Attributes */}
            <div className="lg:col-span-7 space-y-5">
              {/* Title & Brand */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#fee2e2] text-[#dc1414] text-[11px] font-bold uppercase tracking-wider">
                    {categoryName}
                  </span>
                  {product.brand && (
                    <span className="px-2 py-0.5 rounded-md bg-[#e0e7ff] text-[#3730a3] text-[11px] font-semibold">
                      Brand: {product.brand}
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] text-[11px] font-semibold">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="text-[20px] font-extrabold text-[#111827] leading-snug">
                  {product.name || product.title}
                </h1>
                {product.subtitle && (
                  <p className="mt-1 text-[13px] text-[#6b7280] leading-relaxed">
                    {product.subtitle}
                  </p>
                )}
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f8f9fb] rounded-xl border border-[#e5e7eb] p-3.5">
                <div className="space-y-0.5">
                  <p className="text-[11px] text-[#6b7280] uppercase tracking-wide">Selling Price</p>
                  <p className="text-[18px] font-black text-[#dc1414]">
                    {formatCurrency(product.price)}
                  </p>
                  {(product.originalPrice || product.comparePrice) && (
                    <p className="text-[11px] text-[#9ca3af] line-through">
                      {formatCurrency(product.originalPrice || product.comparePrice)}
                    </p>
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-[11px] text-[#6b7280] uppercase tracking-wide">Monthly Rent</p>
                  <p className="text-[16px] font-bold text-[#111827]">
                    {product.type === 'Buy Only'
                      ? 'Not Available for Rent'
                      : (product.rentPrice ||
                          (product.rentPerMonth
                            ? `₹${Number(product.rentPerMonth).toLocaleString('en-IN')}/mo`
                            : 'Not Configured'))}
                  </p>
                  {product.type !== 'Buy Only' && product.deposit && (
                    <p className="text-[11px] text-[#6b7280]">
                      Deposit: ₹{Number(product.deposit).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>

                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <p className="text-[11px] text-[#6b7280] uppercase tracking-wide">Discount / EMI</p>
                  <p className="text-[13px] font-semibold text-[#15803d]">
                    {product.discount || 'Special Price'}
                  </p>
                  {product.emi && (
                    <p className="text-[11px] text-[#6b7280] truncate">
                      EMI: {product.emi}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery & Shipping Info Card */}
              <div className="bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] p-3 flex items-center justify-between text-[12.5px]">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#dcfce7] text-[#15803d] flex items-center justify-center font-bold">
                    🚚
                  </span>
                  <div>
                    <span className="font-bold text-[#14532d] block leading-tight">
                      {product.isFreeDelivery !== false && Number(product.deliveryCharge || 0) === 0
                        ? 'Free Shipping & Delivery'
                        : `Paid Delivery: ₹${Number(product.deliveryCharge || 0)}`}
                    </span>
                    <span className="text-[11px] text-[#166534]">
                      {product.isFreeDelivery !== false && Number(product.deliveryCharge || 0) === 0
                        ? 'Standard delivery is free on all orders for this product.'
                        : `Shipping fee of ₹${Number(product.deliveryCharge || 0)} applies per item at checkout.`}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${product.isFreeDelivery !== false && Number(product.deliveryCharge || 0) === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {product.isFreeDelivery !== false && Number(product.deliveryCharge || 0) === 0 ? 'Free' : `₹${product.deliveryCharge}`}
                </span>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-2">
                <h3 className="text-[13.5px] font-bold text-[#111827] uppercase tracking-wide">
                  Core Specifications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12.5px]">
                  <div className="p-2.5 rounded-lg border border-[#e5e7eb] bg-white">
                    <span className="text-[#6b7280] block text-[11px]">Processor / CPU</span>
                    <span className="font-semibold text-[#111827]">
                      {specs.processor || specs.cpu || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-[#e5e7eb] bg-white">
                    <span className="text-[#6b7280] block text-[11px]">Memory (RAM)</span>
                    <span className="font-semibold text-[#111827]">
                      {specs.ram || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-[#e5e7eb] bg-white">
                    <span className="text-[#6b7280] block text-[11px]">Storage (SSD/HDD)</span>
                    <span className="font-semibold text-[#111827]">
                      {specs.storage || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-[#e5e7eb] bg-white">
                    <span className="text-[#6b7280] block text-[11px]">Display</span>
                    <span className="font-semibold text-[#111827]">
                      {specs.display || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-[#e5e7eb] bg-white">
                    <span className="text-[#6b7280] block text-[11px]">Graphics (GPU)</span>
                    <span className="font-semibold text-[#111827]">
                      {specs.graphics || 'Integrated'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-[#e5e7eb] bg-white">
                    <span className="text-[#6b7280] block text-[11px]">Operating System</span>
                    <span className="font-semibold text-[#111827]">
                      {specs.os || 'Windows 11'}
                    </span>
                  </div>

                  {specs.warranty && (
                    <div className="p-2.5 rounded-lg border border-[#e5e7eb] bg-white sm:col-span-2">
                      <span className="text-[#6b7280] block text-[11px]">Warranty & Protection</span>
                      <span className="font-semibold text-[#111827]">{specs.warranty}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Specs if available */}
              {customSpecs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[13.5px] font-bold text-[#111827] uppercase tracking-wide">
                    Additional Hardware Specs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12.5px]">
                    {customSpecs.map((cs, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-[#f8f9fb] border border-[#e5e7eb]">
                        <span className="text-[#6b7280] text-[11px] block">{cs.key}</span>
                        <span className="font-medium text-[#111827]">{cs.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="space-y-1.5">
                  <h3 className="text-[13.5px] font-bold text-[#111827] uppercase tracking-wide">
                    Description
                  </h3>
                  <p className="text-[12.5px] text-[#4b5563] leading-relaxed whitespace-pre-line bg-[#f8f9fb] p-3 rounded-lg border border-[#e5e7eb]">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Filter Tags & Badges */}
              {Array.isArray(product.tags) && product.tags.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-[#6b7280] uppercase tracking-wide block">
                    Product Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#f3f4f6] text-[#374151] text-[11px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Record Metadata */}
              <div className="pt-2 border-t border-[#eef0f4] text-[11px] text-[#9ca3af] flex flex-wrap gap-4">
                <span>Created: {formatDate(product.createdAt)}</span>
                <span>Updated: {formatDate(product.updatedAt)}</span>
                <span>Sort Order: #{product.sortOrder ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#eef0f4] bg-[#f8f9fb] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#d1d5db] text-[#374151] hover:bg-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              onEdit?.(product)
            }}
            className="px-4 py-2 rounded-lg bg-[#dc1414] hover:bg-[#b91c1c] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            <span>Edit Product</span>
          </button>
        </div>
      </div>
    </div>
  )
}
