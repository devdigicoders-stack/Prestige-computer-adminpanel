import { useCallback, useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

function getAuthHeaders() {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('pcs_admin_token')
  const h = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: getAuthHeaders(), ...opts })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || `Request failed (${res.status})`)
  return json
}

/* ── Icons ── */
function StarIcon({ filled }) {
  return (
    <svg viewBox="0 0 20 20" className={`w-3.5 h-3.5 fill-current shrink-0 ${filled ? 'text-amber-400' : 'text-gray-200'}`} aria-hidden="true">
      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.96a1 1 0 0 0 .95.69h4.16c.97 0 1.37 1.24.59 1.81l-3.37 2.45a1 1 0 0 0-.36 1.12l1.29 3.96c.3.92-.75 1.69-1.54 1.12l-3.37-2.45a1 1 0 0 0-1.18 0l-3.37 2.45c-.79.57-1.84-.2-1.54-1.12l1.29-3.96a1 1 0 0 0-.36-1.12L2.06 9.39c-.78-.57-.38-1.81.59-1.81h4.16a1 1 0 0 0 .95-.69l1.29-3.96Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 8l4 4 7-7" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l10 10M13 3L3 13" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 4h12M5 4V2.5h6V4M6 7v5M10 7v5M3 4l.8 9.5A1 1 0 0 0 4.8 14.5h6.4a1 1 0 0 0 1-.9L13 4" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l5 5 5-5" />
    </svg>
  )
}

function StarFeaturedIcon({ filled }) {
  return (
    <svg viewBox="0 0 20 20" className={`w-4 h-4 fill-current ${filled ? 'text-violet-500' : 'text-gray-300'}`}>
      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.29 3.96a1 1 0 0 0 .95.69h4.16c.97 0 1.37 1.24.59 1.81l-3.37 2.45a1 1 0 0 0-.36 1.12l1.29 3.96c.3.92-.75 1.69-1.54 1.12l-3.37-2.45a1 1 0 0 0-1.18 0l-3.37 2.45c-.79.57-1.84-.2-1.54-1.12l1.29-3.96a1 1 0 0 0-.36-1.12L2.06 9.39c-.78-.57-.38-1.81.59-1.81h4.16a1 1 0 0 0 .95-.69l1.29-3.96Z" />
    </svg>
  )
}

/* ── Helpers ── */
const AVATAR_COLORS = [
  ['#fee2e2', '#dc2626'], ['#dbeafe', '#1d4ed8'], ['#dcfce7', '#16a34a'],
  ['#fef3c7', '#d97706'], ['#f3e8ff', '#7c3aed'], ['#fce7f3', '#be185d'],
]

function Avatar({ name }) {
  const initials = (name || 'U').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  const [bg, fg] = AVATAR_COLORS[(name || 'U').charCodeAt(0) % AVATAR_COLORS.length]
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ring-2 ring-white" style={{ background: bg, color: fg }}>
      {initials}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  )
}

/* ── Review Row ── */
function ReviewRow({ review, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const patch = async (body) => {
    setUpdating(true)
    try {
      await apiFetch(`/reviews/admin/${review._id}`, { method: 'PATCH', body: JSON.stringify(body) })
      onUpdate()
    } catch (err) {
      alert(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return }
    try {
      await apiFetch(`/reviews/admin/${review._id}`, { method: 'DELETE' })
      onUpdate()
    } catch (err) {
      alert(err.message)
    }
  }

  const productName = review.product?.name || review.productName || '—'
  const reviewerName = review.user?.name || review.userName || 'Guest'
  const date = new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <>
      <tr className={`border-b border-gray-100 transition-colors ${expanded ? 'bg-violet-50/30' : 'hover:bg-gray-50/60'}`}>
        {/* Reviewer */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={reviewerName} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate max-w-[120px]">{reviewerName}</p>
              {review.userEmail && <p className="text-[11px] text-gray-400 truncate max-w-[120px]">{review.userEmail}</p>}
              {review.isVerifiedBuyer && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                  <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3"><path d="M6 .9a5.1 5.1 0 1 0 0 10.2A5.1 5.1 0 0 0 6 .9Zm2.33 4.05-2.78 2.85a.56.56 0 0 1-.81 0L3.64 6.68a.56.56 0 1 1 .8-.8l.71.72 2.39-2.44a.56.56 0 1 1 .8.8Z" /></svg>
                  Verified
                </span>
              )}
            </div>
          </div>
        </td>

        {/* Product */}
        <td className="px-4 py-3">
          <p className="text-[12px] font-medium text-gray-700 max-w-[130px] truncate" title={productName}>{productName}</p>
        </td>

        {/* Rating + Preview */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-0.5 mb-1">
            {[1,2,3,4,5].map((s) => <StarIcon key={s} filled={s <= review.rating} />)}
            <span className="ml-1 text-[11px] font-bold text-amber-600">{review.rating}.0</span>
          </div>
          {review.title && <p className="text-[11.5px] font-semibold text-gray-800 mb-0.5 truncate max-w-[200px]">{review.title}</p>}
          <p className="text-[11px] text-gray-500 max-w-[200px] line-clamp-1">{review.body}</p>
        </td>

        {/* Status */}
        <td className="px-4 py-3"><StatusBadge status={review.status} /></td>

        {/* Featured Toggle */}
        <td className="px-4 py-3">
          <button
            type="button"
            disabled={updating}
            onClick={() => patch({ isFeatured: !review.isFeatured })}
            title={review.isFeatured ? 'Remove from homepage' : 'Show on homepage'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-50 ${
              review.isFeatured
                ? 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'
                : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600'
            }`}
          >
            <StarFeaturedIcon filled={review.isFeatured} />
            {review.isFeatured ? 'Featured' : 'Feature'}
          </button>
        </td>

        {/* Date */}
        <td className="px-4 py-3 text-[11px] text-gray-400 whitespace-nowrap">{date}</td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            {review.status !== 'approved' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => patch({ status: 'approved' })}
                title="Approve"
                className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckIcon />
              </button>
            )}
            {review.status !== 'rejected' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => patch({ status: 'rejected' })}
                title="Reject"
                className="w-7 h-7 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              >
                <XIcon />
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              title={confirmDelete ? 'Click again to confirm' : 'Delete'}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                confirmDelete
                  ? 'bg-red-500 border-red-500 text-white animate-pulse'
                  : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
              }`}
            >
              <TrashIcon />
            </button>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              title="Expand"
              className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronIcon open={expanded} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Row */}
      {expanded && (
        <tr className="bg-violet-50/20 border-b border-gray-100">
          <td colSpan={7} className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Full Review</p>
                {review.title && <p className="text-[13px] font-bold text-gray-800 mb-1">{review.title}</p>}
                <p className="text-[13px] text-gray-600 leading-relaxed">&ldquo;{review.body}&rdquo;</p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Details</p>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-gray-400 w-20">Product:</span>
                  <span className="font-medium text-gray-700">{productName}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-gray-400 w-20">Helpful:</span>
                  <span className="font-medium text-gray-700">{review.helpfulCount || 0} votes</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-gray-400 w-20">Homepage:</span>
                  <span className={`font-semibold ${review.isFeatured ? 'text-violet-600' : 'text-gray-400'}`}>
                    {review.isFeatured ? '✓ Shown on homepage' : 'Not featured'}
                  </span>
                </div>
                {review.adminNote && (
                  <div className="flex items-start gap-2 text-[12px]">
                    <span className="text-gray-400 w-20 shrink-0">Note:</span>
                    <span className="text-gray-600">{review.adminNote}</span>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ── Main Page ── */
export default function Reviews() {
  const [data, setData] = useState({ reviews: [], total: 0, pages: 0, statusCounts: {} })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const TABS = [
    { key: 'all', label: 'All Reviews' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'featured', label: '⭐ Homepage' },
  ]

  useEffect(() => {
    let ignore = false
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 15 })
    if (activeTab !== 'all' && activeTab !== 'featured') params.set('status', activeTab)
    if (activeTab === 'featured') params.set('featured', 'true')
    apiFetch(`/reviews/admin?${params}`)
      .then((json) => { if (!ignore) { setData(json.data); setLoading(false) } })
      .catch(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [activeTab, page, refreshKey])

  const handleUpdate = useCallback(() => setRefreshKey((k) => k + 1), [])

  const counts = data.statusCounts || {}

  const filtered = search.trim()
    ? data.reviews.filter((r) =>
        (r.userName || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.body || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.product?.name || r.productName || '').toLowerCase().includes(search.toLowerCase())
      )
    : data.reviews

  const KPI_CARDS = [
    { label: 'Total Reviews', value: counts.all || 0, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Pending', value: counts.pending || 0, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: 'Approved', value: counts.approved || 0, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Rejected', value: counts.rejected || 0, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
  ]

  return (
    <div className="p-5 sm:p-6 max-w-[1400px] mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-black text-gray-900 tracking-tight">Customer Reviews</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Approve, reject and feature reviews on homepage</p>
        </div>
        {counts.pending > 0 && (
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-[13px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {counts.pending} review{counts.pending > 1 ? 's' : ''} awaiting approval
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} border ${kpi.border} rounded-2xl p-4`}>
            <p className="text-[12px] font-medium text-gray-500">{kpi.label}</p>
            <p className={`mt-1 text-[28px] font-black ${kpi.color} leading-none`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Featured Info Banner */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl px-4 py-3 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
          <StarFeaturedIcon filled />
        </div>
        <div>
          <p className="text-[13px] font-bold text-violet-800">Homepage Testimonials</p>
          <p className="text-[12px] text-violet-600 mt-0.5">
            Click the <strong>Feature</strong> button on any approved review to show it in the homepage testimonials section. Only featured reviews appear there.
          </p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); setPage(1) }}
              className={`px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.key !== 'featured' && counts[tab.key] > 0 && (
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full sm:w-64 pl-9 pr-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {['Reviewer', 'Product', 'Review', 'Status', 'Homepage', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11.5px] font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gray-100" />
                        <div className="space-y-1.5">
                          <div className="h-3 w-24 bg-gray-100 rounded-full" />
                          <div className="h-2.5 w-16 bg-gray-100 rounded-full" />
                        </div>
                      </div>
                    </td>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-gray-100 rounded-full w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-gray-200">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
                        <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <p className="text-[14px] font-semibold text-gray-400">No reviews found</p>
                      <p className="text-[12px] text-gray-300">Try a different filter or search term</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((review) => (
                  <ReviewRow key={review._id} review={review} onUpdate={handleUpdate} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[12px] text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of <span className="font-semibold text-gray-700">{data.total}</span> reviews
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium border border-gray-200 rounded-lg bg-white hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
              Prev
            </button>
            <span className="px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg">
              {page} / {data.pages || 1}
            </span>
            <button
              type="button"
              disabled={page >= (data.pages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium border border-gray-200 rounded-lg bg-white hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
