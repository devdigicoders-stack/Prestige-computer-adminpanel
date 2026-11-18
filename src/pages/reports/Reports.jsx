import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpIcon,
  BarChartIcon,
  CalendarIcon,
  CartIcon,
  ChevronDownIcon,
  CreditCardIcon,
  UsersIcon,
} from '../../components/common/Icons'

const PERIOD_DATA = {
  'Last 7 Days': {
    kpis: [
      { label: 'Gross Revenue', value: '$42,680', growth: '+14.2%', icon: CreditCardIcon },
      { label: 'Avg. Order Value', value: '$1,390', growth: '+5.1%', icon: CartIcon },
      { label: 'Rental Utilization', value: '81.0%', growth: '+6.8%', icon: BarChartIcon },
      { label: 'Repeat Customers', value: '64.5%', growth: '+3.9%', icon: UsersIcon },
    ],
    bars: [
      { label: 'Mon', sales: 4.8, rentals: 1.9 },
      { label: 'Tue', sales: 5.4, rentals: 2.2 },
      { label: 'Wed', sales: 4.1, rentals: 1.8 },
      { label: 'Thu', sales: 6.2, rentals: 2.5 },
      { label: 'Fri', sales: 7.4, rentals: 3.1 },
      { label: 'Sat', sales: 8.1, rentals: 3.4 },
      { label: 'Sun', sales: 6.6, rentals: 2.6 },
    ],
    maxBarY: 10,
    categories: [
      { name: 'Laptops', share: 44, revenue: 18779 },
      { name: 'Gaming Laptops', share: 23, revenue: 9816 },
      { name: 'Desktop PCs', share: 17, revenue: 7256 },
      { name: 'Monitors & Displays', share: 10, revenue: 4268 },
      { name: 'Components & Accessories', share: 6, revenue: 2561 },
    ],
  },
  'Last 30 Days': {
    kpis: [
      { label: 'Gross Revenue', value: '$178,320', growth: '+16.8%', icon: CreditCardIcon },
      { label: 'Avg. Order Value', value: '$1,428', growth: '+6.4%', icon: CartIcon },
      { label: 'Rental Utilization', value: '84.5%', growth: '+9.2%', icon: BarChartIcon },
      { label: 'Repeat Customers', value: '68.2%', growth: '+4.7%', icon: UsersIcon },
    ],
    bars: [
      { label: 'Wk 1', sales: 24.5, rentals: 11.2 },
      { label: 'Wk 2', sales: 29.8, rentals: 12.8 },
      { label: 'Wk 3', sales: 32.4, rentals: 14.1 },
      { label: 'Wk 4', sales: 37.9, rentals: 15.7 },
    ],
    maxBarY: 45,
    categories: [
      { name: 'Laptops', share: 42, revenue: 74894 },
      { name: 'Gaming Laptops', share: 24, revenue: 42797 },
      { name: 'Desktop PCs', share: 18, revenue: 32098 },
      { name: 'Monitors & Displays', share: 10, revenue: 17832 },
      { name: 'Components & Accessories', share: 6, revenue: 10699 },
    ],
  },
  'Last 90 Days': {
    kpis: [
      { label: 'Gross Revenue', value: '$512,940', growth: '+21.4%', icon: CreditCardIcon },
      { label: 'Avg. Order Value', value: '$1,465', growth: '+8.1%', icon: CartIcon },
      { label: 'Rental Utilization', value: '86.2%', growth: '+11.5%', icon: BarChartIcon },
      { label: 'Repeat Customers', value: '71.4%', growth: '+6.2%', icon: UsersIcon },
    ],
    bars: [
      { label: 'Sep', sales: 112, rentals: 44 },
      { label: 'Oct', sales: 124, rentals: 51 },
      { label: 'Nov', sales: 138, rentals: 58 },
    ],
    maxBarY: 160,
    categories: [
      { name: 'Laptops', share: 41, revenue: 210305 },
      { name: 'Gaming Laptops', share: 26, revenue: 133364 },
      { name: 'Desktop PCs', share: 17, revenue: 87200 },
      { name: 'Monitors & Displays', share: 10, revenue: 51294 },
      { name: 'Components & Accessories', share: 6, revenue: 30777 },
    ],
  },
  'This Year': {
    kpis: [
      { label: 'Gross Revenue', value: '$1,842,600', growth: '+28.6%', icon: CreditCardIcon },
      { label: 'Avg. Order Value', value: '$1,492', growth: '+9.8%', icon: CartIcon },
      { label: 'Rental Utilization', value: '88.1%', growth: '+14.3%', icon: BarChartIcon },
      { label: 'Repeat Customers', value: '74.0%', growth: '+8.5%', icon: UsersIcon },
    ],
    bars: [
      { label: 'Jan', sales: 82, rentals: 32 },
      { label: 'Mar', sales: 96, rentals: 38 },
      { label: 'May', sales: 108, rentals: 44 },
      { label: 'Jul', sales: 119, rentals: 49 },
      { label: 'Sep', sales: 128, rentals: 52 },
      { label: 'Nov', sales: 145, rentals: 61 },
    ],
    maxBarY: 160,
    categories: [
      { name: 'Laptops', share: 43, revenue: 792318 },
      { name: 'Gaming Laptops', share: 25, revenue: 460650 },
      { name: 'Desktop PCs', share: 17, revenue: 313242 },
      { name: 'Monitors & Displays', share: 9, revenue: 165834 },
      { name: 'Components & Accessories', share: 6, revenue: 110556 },
    ],
  },
}

const TOP_PRODUCTS = [
  {
    id: 1,
    name: 'Dell XPS 15 (2024)',
    category: 'Laptops',
    unitsSold: 42,
    rentals: 18,
    revenue: 79140,
    growth: '+22.4%',
  },
  {
    id: 2,
    name: 'ASUS ROG Strix G16',
    category: 'Gaming Laptops',
    unitsSold: 29,
    rentals: 9,
    revenue: 62810,
    growth: '+19.1%',
  },
  {
    id: 3,
    name: 'Apple MacBook Air M2',
    category: 'Laptops',
    unitsSold: 34,
    rentals: 26,
    revenue: 56140,
    growth: '+17.6%',
  },
  {
    id: 4,
    name: 'HP EliteBook 840 G10',
    category: 'Laptops',
    unitsSold: 31,
    rentals: 22,
    revenue: 44890,
    growth: '+14.3%',
  },
  {
    id: 5,
    name: 'RTX 4070 Custom RGB Tower',
    category: 'Desktop PCs',
    unitsSold: 16,
    rentals: 7,
    revenue: 42280,
    growth: '+25.8%',
  },
]

const PAYMENT_METHODS = [
  { name: 'Credit / Debit Card', share: 48, color: '#dc1414' },
  { name: 'UPI Payments', share: 34, color: '#18191d' },
  { name: 'NetBanking', share: 11, color: '#6b7280' },
  { name: 'Cash / POS', share: 7, color: '#d1d5db' },
]

const DATE_RANGES = Object.keys(PERIOD_DATA)

function formatCurrency(val) {
  return `$${Number(val).toLocaleString('en-US')}`
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

function RevenueGroupedBarChart({ bars, maxBarY }) {
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const width = 540
  const height = 250
  const padLeft = 44
  const padRight = 18
  const padTop = 16
  const padBottom = 32
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom

  const tickSteps = 4
  const yTicks = Array.from({ length: tickSteps + 1 }, (_, idx) =>
    Math.round((maxBarY / tickSteps) * (tickSteps - idx)),
  )

  const groupW = plotW / bars.length
  const barW = Math.min(26, groupW * 0.28)
  const barGap = 6

  const getY = (val) => padTop + plotH - (val / maxBarY) * plotH
  const bottomY = padTop + plotH

  return (
    <div className="bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex flex-col justify-between h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827]">
            Revenue Comparison
          </h2>
          <p className="text-[12px] font-normal text-[#6b7280]">
            Product Sales vs Rental Income ($K)
          </p>
        </div>
        <div className="flex items-center gap-4 text-[12px] font-medium text-[#374151]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#dc1414]" />
            Sales
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#18191d]" />
            Rentals
          </span>
        </div>
      </div>

      <div className="w-full flex-1 flex items-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label="Sales versus Rentals revenue bar chart"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="barRedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef1818" />
              <stop offset="100%" stopColor="#b80909" />
            </linearGradient>
            <linearGradient id="barDarkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#353941" />
              <stop offset="100%" stopColor="#141619" />
            </linearGradient>
          </defs>

          {/* Gridlines & Y Labels */}
          {yTicks.map((tick) => {
            const y = getY(tick)
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={tick === 0 ? '#d5dae3' : '#eceff4'}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#4b5563"
                  fontSize="11"
                  fontWeight="500"
                >
                  {tick === 0 ? '$0' : `$${tick}K`}
                </text>
              </g>
            )
          })}

          {/* Grouped Bars */}
          {bars.map((item, idx) => {
            const centerX = padLeft + idx * groupW + groupW / 2
            const salesX = centerX - barW - barGap / 2
            const rentalsX = centerX + barGap / 2
            const salesY = getY(item.sales)
            const rentalsY = getY(item.rentals)
            const salesH = Math.max(2, bottomY - salesY)
            const rentalsH = Math.max(2, bottomY - rentalsY)
            const isHovered = hoveredIdx === idx

            return (
              <g
                key={item.label}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
              >
                {isHovered && (
                  <rect
                    x={padLeft + idx * groupW + 6}
                    y={padTop}
                    width={groupW - 12}
                    height={plotH}
                    rx="6"
                    fill="#f4f5f7"
                  />
                )}

                <rect
                  x={salesX}
                  y={salesY}
                  width={barW}
                  height={salesH}
                  rx="4"
                  fill="url(#barRedGrad)"
                  opacity={hoveredIdx === null || isHovered ? 1 : 0.65}
                  className="transition-opacity duration-150"
                />
                <rect
                  x={rentalsX}
                  y={rentalsY}
                  width={barW}
                  height={rentalsH}
                  rx="4"
                  fill="url(#barDarkGrad)"
                  opacity={hoveredIdx === null || isHovered ? 1 : 0.65}
                  className="transition-opacity duration-150"
                />

                <text
                  x={centerX}
                  y={height - 10}
                  textAnchor="middle"
                  fill={isHovered ? '#111827' : '#4b5563'}
                  fontSize="11.5"
                  fontWeight={isHovered ? '700' : '500'}
                >
                  {item.label}
                </text>
              </g>
            )
          })}

          {/* Hover Tooltip */}
          {hoveredIdx !== null && (
            <g
              transform={`translate(${Math.min(
                Math.max(
                  padLeft + hoveredIdx * groupW + groupW / 2 - 68,
                  padLeft + 4,
                ),
                width - 144,
              )}, 6)`}
              className="pointer-events-none"
            >
              <rect
                width="136"
                height="56"
                rx="8"
                fill="#111215"
                fillOpacity="0.96"
              />
              <text
                x="10"
                y="17"
                fill="#9ca3af"
                fontSize="10"
                fontWeight="700"
              >
                {bars[hoveredIdx].label} Revenue
              </text>
              <circle cx="13" cy="31" r="3" fill="#ef1818" />
              <text
                x="21"
                y="34"
                fill="#ffffff"
                fontSize="10.5"
                fontWeight="600"
              >
                Sales: ${(bars[hoveredIdx].sales * 1000).toLocaleString()}
              </text>
              <circle cx="13" cy="46" r="3" fill="#9ca3af" />
              <text
                x="21"
                y="49"
                fill="#e5e7eb"
                fontSize="10.5"
                fontWeight="500"
              >
                Rentals: ${(bars[hoveredIdx].rentals * 1000).toLocaleString()}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

export default function Reports({ globalSearch = '' }) {
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [rangeOpen, setRangeOpen] = useState(false)
  const [productSort, setProductSort] = useState('revenue')
  const rangeRef = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) {
        setRangeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const activePeriod = PERIOD_DATA[dateRange] || PERIOD_DATA['Last 30 Days']

  const sortedProducts = useMemo(() => {
    const q = globalSearch.trim().toLowerCase()
    const list = TOP_PRODUCTS.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )

    return [...list].sort((a, b) => {
      if (productSort === 'sales') return b.unitsSold - a.unitsSold
      if (productSort === 'rentals') return b.rentals - a.rentals
      return b.revenue - a.revenue
    })
  }, [globalSearch, productSort])

  const downloadCsv = (filename, headers, rows) => {
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportMainReport = () => {
    downloadCsv(
      `prestige-computers-report-${dateRange.toLowerCase().replace(/\s+/g, '-')}.csv`,
      ['Product', 'Category', 'Units Sold', 'Active Rentals', 'Revenue', 'Growth'],
      sortedProducts.map((p) => [
        `"${p.name}"`,
        p.category,
        p.unitsSold,
        p.rentals,
        p.revenue,
        p.growth,
      ]),
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Reports &amp; Analytics
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Track revenue trends, category share, rental utilization and top
            hardware performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Date Range Dropdown */}
          <div className="relative" ref={rangeRef}>
            <button
              type="button"
              onClick={() => setRangeOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 bg-white border border-[#d6dae2] rounded-lg px-3.5 py-2.5 text-[12.5px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-[#f9fafb] transition-colors cursor-pointer"
            >
              <CalendarIcon
                className="w-[16px] h-[16px] text-[#374151]"
                strokeWidth={1.9}
              />
              <span>{dateRange}</span>
              <ChevronDownIcon className="w-4 h-4 text-[#4b5563]" />
            </button>

            {rangeOpen && (
              <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white border border-[#e5e7eb] shadow-[0_10px_24px_rgba(16,24,40,0.1)] py-1 z-20">
                {DATE_RANGES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setDateRange(option)
                      setRangeOpen(false)
                    }}
                    className={[
                      'w-full px-3.5 py-2 text-left text-[13px] font-medium transition-colors cursor-pointer',
                      option === dateRange
                        ? 'bg-red-50 text-[#dc1414] font-medium'
                        : 'text-[#374151] hover:bg-[#f9fafb]',
                    ].join(' ')}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportMainReport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Dynamic KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {activePeriod.kpis.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-[#e6e8ee] px-5 py-4 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#fef2f2] border border-[#fee2e2] text-[#dc1414] flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-normal text-[#4b5563] truncate">
                  {card.label}
                </p>
                <p className="text-[20px] sm:text-[21px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight mt-0.5">
                  {card.value}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-[#15803d]">
                  <ArrowUpIcon className="w-3.5 h-3.5" />
                  <span>{card.growth}</span>
                  <span className="text-[#6b7280] font-normal ml-0.5">
                    vs prev
                  </span>
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Row 2: Revenue Grouped Bar Chart + Category Breakdown */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7">
          <RevenueGroupedBarChart
            bars={activePeriod.bars}
            maxBarY={activePeriod.maxBarY}
          />
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex flex-col justify-between">
          <div>
            <h2 className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827]">
              Revenue by Category
            </h2>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              Share of total sales &amp; rentals ({dateRange})
            </p>
          </div>

          <div className="mt-4 space-y-4">
            {activePeriod.categories.map((cat, idx) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#1f2937]">
                    {cat.name}
                  </span>
                  <span className="text-[#4b5563]">
                    <strong className="font-medium text-[#111827]">
                      {formatCurrency(cat.revenue)}
                    </strong>{' '}
                    ({cat.share}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#eef0f4] overflow-hidden">
                  <div
                    className={[
                      'h-full rounded-full transition-all duration-300',
                      idx === 0
                        ? 'bg-gradient-to-r from-[#e21212] to-[#b90b0b]'
                        : idx === 1
                          ? 'bg-[#dc1414]/80'
                          : idx === 2
                            ? 'bg-[#1f2226]'
                            : idx === 3
                              ? 'bg-[#4b5563]'
                              : 'bg-[#9ca3af]',
                    ].join(' ')}
                    style={{ width: `${cat.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Row 3: Top Products Table + Payment Mix & Quick Exports */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Top Performing Products */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#e6e8ee] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#eef0f4] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827]">
                Top Performing Products
              </h2>
              <p className="text-[12px] font-normal text-[#6b7280]">
                Best-selling &amp; most-rented computer hardware
              </p>
            </div>

            <div className="inline-flex rounded-lg bg-[#f3f4f6] p-1 text-[12px] font-medium">
              {[
                { id: 'revenue', label: 'By Revenue' },
                { id: 'sales', label: 'By Sales' },
                { id: 'rentals', label: 'By Rentals' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setProductSort(tab.id)}
                  className={[
                    'px-3 py-1 rounded-md transition-all cursor-pointer',
                    productSort === tab.id
                      ? 'bg-white text-[#111827] shadow-xs'
                      : 'text-[#6b7280] hover:text-[#111827]',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fb] border-b border-[#eef0f4] text-[12px] font-normal text-[#4b5563]">
                  <th className="py-3 pl-5 pr-2 w-12">#</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3 text-center">Units Sold</th>
                  <th className="py-3 px-3 text-center">Rentals</th>
                  <th className="py-3 px-3 text-right">Revenue</th>
                  <th className="py-3 pl-3 pr-5 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f4] text-[12.5px]">
                {sortedProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#fafbfc] transition-colors"
                  >
                    <td className="py-3 pl-5 pr-2 font-normal text-[#6b7280]">
                      0{index + 1}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-[#111827]">{product.name}</p>
                      <p className="text-[12px] text-[#6b7280]">
                        {product.category}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-[#1f2937]">
                      {product.unitsSold}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-[#1f2937]">
                      {product.rentals}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-[#111827]">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[#15803d]">
                        <ArrowUpIcon className="w-3 h-3" />
                        {product.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Payment Mix + Quick Downloads */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Payment Methods Breakdown */}
          <div className="bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
            <h2 className="text-[14.5px] font-semibold text-[#111827]">
              Payment Methods Share
            </h2>
            <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
              Distribution across completed checkouts
            </p>

            {/* Stacked Segmented Bar */}
            <div className="mt-4 h-3 w-full rounded-full overflow-hidden flex gap-0.5 bg-[#f3f4f6]">
              {PAYMENT_METHODS.map((pm) => (
                <div
                  key={pm.name}
                  style={{ width: `${pm.share}%`, backgroundColor: pm.color }}
                  title={`${pm.name}: ${pm.share}%`}
                />
              ))}
            </div>

            <div className="mt-4 space-y-2.5 text-[13px]">
              {PAYMENT_METHODS.map((pm) => (
                <div
                  key={pm.name}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex items-center gap-2 font-medium text-[#374151]">
                    <span
                      className="w-2.5 h-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: pm.color }}
                    />
                    {pm.name}
                  </span>
                  <span className="font-medium text-[#111827]">{pm.share}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Downloadable Reports */}
          <div className="bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex-1">
            <h2 className="text-[14.5px] font-semibold text-[#111827] mb-3">
              Quick Reports
            </h2>
            <div className="space-y-2.5">
              {[
                {
                  title: 'Sales & Revenue Summary',
                  meta: 'CSV • Category breakdown',
                  onClick: () =>
                    downloadCsv(
                      'sales-category-summary.csv',
                      ['Category', 'Share %', 'Revenue'],
                      activePeriod.categories.map((c) => [
                        `"${c.name}"`,
                        `${c.share}%`,
                        c.revenue,
                      ]),
                    ),
                },
                {
                  title: 'Rental Performance Sheet',
                  meta: 'CSV • Hardware rental metrics',
                  onClick: () =>
                    downloadCsv(
                      'rental-performance.csv',
                      ['Product', 'Category', 'Active Rentals', 'Revenue'],
                      TOP_PRODUCTS.map((p) => [
                        `"${p.name}"`,
                        p.category,
                        p.rentals,
                        p.revenue,
                      ]),
                    ),
                },
                {
                  title: 'Payment Channel Mix',
                  meta: 'CSV • Gateway distribution',
                  onClick: () =>
                    downloadCsv(
                      'payment-channel-mix.csv',
                      ['Method', 'Share %'],
                      PAYMENT_METHODS.map((m) => [`"${m.name}"`, `${m.share}%`]),
                    ),
                },
              ].map((rep) => (
                <button
                  key={rep.title}
                  type="button"
                  onClick={rep.onClick}
                  className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-[#e5e7eb] hover:border-[#dc1414]/40 hover:bg-[#fef2f2]/40 transition-all text-left cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#111827] truncate">
                      {rep.title}
                    </p>
                    <p className="text-[11.5px] font-normal text-[#6b7280]">
                      {rep.meta}
                    </p>
                  </div>
                  <span className="p-1.5 rounded-md bg-[#f3f4f6] text-[#374151] group-hover:bg-[#dc1414] group-hover:text-white transition-colors shrink-0">
                    <DownloadIcon className="w-3.5 h-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
