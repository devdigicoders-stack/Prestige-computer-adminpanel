import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpIcon,
  CalendarIcon,
  CartIcon,
  ChevronDownIcon,
  CreditCardIcon,
  CubeIcon,
  UserOutlineIcon,
} from '../../components/common/Icons'

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year']

const KPI_CARDS = [
  {
    id: 'sales',
    label: 'Total Sales',
    value: '$124,560',
    growth: '+18.2%',
    icon: CartIcon,
  },
  {
    id: 'rentals',
    label: 'Total Rentals',
    value: '$36,420',
    growth: '+12.4%',
    icon: CalendarIcon,
  },
  {
    id: 'orders',
    label: 'Total Orders',
    value: '1,248',
    growth: '+9.7%',
    icon: CubeIcon,
  },
  {
    id: 'customers',
    label: 'Total Customers',
    value: '3,892',
    growth: '+16.1%',
    icon: UserOutlineIcon,
  },
]

const CHART_POINTS = [
  { date: 'Nov 1', showLabel: true, sales: 15.6, rentals: 6.9 },
  { date: 'Nov 3', showLabel: false, sales: 17.5, rentals: 8.1 },
  { date: 'Nov 5', showLabel: true, sales: 26.4, rentals: 12.0 },
  { date: 'Nov 9', showLabel: true, sales: 21.2, rentals: 10.1 },
  { date: 'Nov 13', showLabel: true, sales: 29.8, rentals: 17.9 },
  { date: 'Nov 17', showLabel: true, sales: 27.9, rentals: 16.0 },
  { date: 'Nov 21', showLabel: true, sales: 37.8, rentals: 23.2 },
  { date: 'Nov 25', showLabel: true, sales: 34.5, rentals: 20.4 },
  { date: 'Nov 30', showLabel: true, sales: 44.8, rentals: 28.6 },
]

const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'New order #PC12845',
    time: '2 min ago',
    icon: CartIcon,
  },
  {
    id: 2,
    title: 'Rental booked #RT7845',
    time: '10 min ago',
    icon: CalendarIcon,
  },
  {
    id: 3,
    title: 'Product stock updated',
    time: '25 min ago',
    icon: CubeIcon,
  },
  {
    id: 4,
    title: 'New customer registered',
    time: '40 min ago',
    icon: UserOutlineIcon,
  },
  {
    id: 5,
    title: 'Payment received $1,299',
    time: '1 hour ago',
    icon: CreditCardIcon,
  },
]

function buildSmoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2

    const tension = 0.2
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

function SalesRentalChart() {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const width = 500
  const height = 248
  const padLeft = 42
  const padRight = 16
  const padTop = 16
  const padBottom = 30
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom
  const maxY = 50
  const yTicks = [50, 40, 30, 20, 10, 0]

  const getX = (index) =>
    padLeft + (index / (CHART_POINTS.length - 1)) * plotW
  const getY = (val) => padTop + plotH - (val / maxY) * plotH

  const salesCoords = CHART_POINTS.map((p, idx) => ({
    x: getX(idx),
    y: getY(p.sales),
  }))
  const rentalsCoords = CHART_POINTS.map((p, idx) => ({
    x: getX(idx),
    y: getY(p.rentals),
  }))

  const salesLine = buildSmoothPath(salesCoords)
  const rentalsLine = buildSmoothPath(rentalsCoords)

  const bottomY = padTop + plotH
  const salesArea = `${salesLine} L ${salesCoords[salesCoords.length - 1].x.toFixed(2)} ${bottomY} L ${salesCoords[0].x.toFixed(2)} ${bottomY} Z`
  const rentalsArea = `${rentalsLine} L ${rentalsCoords[rentalsCoords.length - 1].x.toFixed(2)} ${bottomY} L ${rentalsCoords[0].x.toFixed(2)} ${bottomY} Z`

  const hoveredPoint = hoveredIndex !== null ? CHART_POINTS[hoveredIndex] : null
  const hoveredX = hoveredIndex !== null ? getX(hoveredIndex) : 0
  const hoveredSalesY = hoveredIndex !== null ? getY(hoveredPoint.sales) : 0

  return (
    <div className="bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827] tracking-[-0.01em]">
          Sales &amp; Rental Overview
        </h2>
        <div className="flex items-center gap-4 text-[12px] font-medium text-[#374151]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc1414]" />
            Sales
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1f2226]" />
            Rentals
          </span>
        </div>
      </div>

      {/* Responsive SVG Area Chart */}
      <div className="relative w-full flex-1 flex items-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label="Sales and Rental Overview line chart"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="salesFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11212" stopOpacity="0.28" />
              <stop offset="80%" stopColor="#e11212" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#e11212" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="rentalsFillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f2226" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#1f2226" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#1f2226" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
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
                  x={padLeft - 9}
                  y={y + 4}
                  textAnchor="end"
                  fill="#4b5563"
                  fontSize="11"
                  fontWeight="500"
                >
                  {tick === 0 ? '0' : `${tick}K`}
                </text>
              </g>
            )
          })}

          {/* Left Y-axis vertical subtle line */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={bottomY}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Area Fills */}
          <path d={salesArea} fill="url(#salesFillGrad)" />
          <path d={rentalsArea} fill="url(#rentalsFillGrad)" />

          {/* Hover vertical dashed guide */}
          {hoveredIndex !== null && (
            <line
              x1={hoveredX}
              y1={padTop}
              x2={hoveredX}
              y2={bottomY}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Smooth Line Strokes */}
          <path
            d={salesLine}
            fill="none"
            stroke="#dc1414"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d={rentalsLine}
            fill="none"
            stroke="#1f2226"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Data Point Circles + Invisible Hover Hit Zones */}
          {CHART_POINTS.map((point, idx) => {
            const sx = salesCoords[idx].x
            const sy = salesCoords[idx].y
            const ry = rentalsCoords[idx].y
            const isHovered = hoveredIndex === idx

            return (
              <g key={point.date}>
                {/* Sales dot */}
                <circle
                  cx={sx}
                  cy={sy}
                  r={isHovered ? 4.8 : 3.4}
                  fill="#ffffff"
                  stroke="#dc1414"
                  strokeWidth={isHovered ? 2.6 : 2.1}
                  className="transition-all duration-150"
                />
                {/* Rentals dot */}
                <circle
                  cx={sx}
                  cy={ry}
                  r={isHovered ? 4.8 : 3.4}
                  fill="#ffffff"
                  stroke="#1f2226"
                  strokeWidth={isHovered ? 2.6 : 2.1}
                  className="transition-all duration-150"
                />
                {/* X-Axis label */}
                {point.showLabel && (
                  <text
                    x={sx}
                    y={height - 8}
                    textAnchor="middle"
                    fill="#4b5563"
                    fontSize="10.8"
                    fontWeight="500"
                  >
                    {point.date}
                  </text>
                )}
                {/* Interactive column hit area */}
                <rect
                  x={sx - 24}
                  y={padTop}
                  width="48"
                  height={plotH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
              </g>
            )
          })}

          {/* Interactive Tooltip */}
          {hoveredPoint && (
            <g
              transform={`translate(${Math.min(
                Math.max(hoveredX - 62, padLeft + 4),
                width - 134,
              )}, ${Math.max(hoveredSalesY - 64, 4)})`}
              className="pointer-events-none"
            >
              <rect
                width="124"
                height="54"
                rx="8"
                fill="#111215"
                fillOpacity="0.95"
              />
              <text
                x="10"
                y="17"
                fill="#9ca3af"
                fontSize="10"
                fontWeight="600"
              >
                {hoveredPoint.date}
              </text>
              <circle cx="13" cy="31" r="3" fill="#ef1818" />
              <text
                x="21"
                y="34"
                fill="#ffffff"
                fontSize="10.5"
                fontWeight="600"
              >
                Sales: ${(hoveredPoint.sales * 1000).toLocaleString()}
              </text>
              <circle cx="13" cy="45" r="3" fill="#9ca3af" />
              <text
                x="21"
                y="48"
                fill="#e5e7eb"
                fontSize="10.5"
                fontWeight="500"
              >
                Rentals: ${(hoveredPoint.rentals * 1000).toLocaleString()}
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}

function RevenueDonutCard() {
  const radius = 64
  const strokeWidth = 22
  const circumference = 2 * Math.PI * radius
  const salesPct = 0.7
  const rentalsPct = 0.3
  const salesDash = circumference * salesPct
  const rentalsDash = circumference * rentalsPct

  return (
    <div className="bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex flex-col justify-between h-full">
      <h2 className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827] tracking-[-0.01em]">
        Revenue by Type
      </h2>

      {/* Donut Chart */}
      <div className="relative flex items-center justify-center my-4">
        <svg
          viewBox="0 0 180 180"
          className="w-[172px] h-[172px] sm:w-[182px] sm:h-[182px]"
          role="img"
          aria-label="Revenue by type donut chart: 70% Product Sales, 30% Product Rentals"
        >
          <defs>
            <linearGradient id="donutRedGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f01818" />
              <stop offset="100%" stopColor="#b80707" />
            </linearGradient>
            <linearGradient id="donutDarkGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#353941" />
              <stop offset="100%" stopColor="#16181c" />
            </linearGradient>
          </defs>

          {/* Subtle Track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#f1f3f6"
            strokeWidth={strokeWidth}
          />

          {/* Dark Charcoal Segment (30%) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="url(#donutDarkGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${rentalsDash} ${circumference}`}
            strokeDashoffset={-salesDash}
            transform="rotate(-90 90 90)"
          />

          {/* Crimson Red Segment (70%) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="url(#donutRedGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${salesDash} ${circumference}`}
            strokeDashoffset="0"
            transform="rotate(-90 90 90)"
          />
        </svg>

        {/* Center Total Revenue Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[18px] sm:text-[19px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            $178,320
          </span>
          <span className="text-[11.5px] font-normal text-[#525866] mt-0.5">
            Total Revenue
          </span>
        </div>
      </div>

      {/* Bottom Legend Rows */}
      <div className="space-y-2.5 pt-1 text-[13px]">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[#1f2937] font-medium min-w-0">
            <span className="w-3 h-3 rounded-[3px] bg-[#dc1414] shrink-0" />
            <span className="truncate">Product Sales</span>
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[#4b5563] font-normal">70%</span>
            <span className="font-medium text-[#111827] w-[68px] text-right">
              $124,560
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[#1f2937] font-medium min-w-0">
            <span className="w-3 h-3 rounded-[3px] bg-[#25282e] shrink-0" />
            <span className="truncate">Product Rentals</span>
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[#4b5563] font-normal">30%</span>
            <span className="font-medium text-[#111827] w-[68px] text-right">
              $53,760
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecentActivityCard({ searchQuery }) {
  const filteredActivities = searchQuery.trim()
    ? RECENT_ACTIVITIES.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : RECENT_ACTIVITIES

  return (
    <div className="bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827] tracking-[-0.01em]">
          Recent Activity
        </h2>
        <button
          type="button"
          className="text-[13px] font-medium text-[#dc1414] hover:text-[#a30b0b] transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="flex-1 flex flex-col justify-between divide-y divide-[#eef0f4]">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-1.5 last:pb-1 hover:bg-[#fafafa] rounded-lg px-1.5 -mx-1.5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[#dc1414] shrink-0">
                    <Icon className="w-[19px] h-[19px]" strokeWidth={1.9} />
                  </span>
                  <span className="text-[12.5px] font-medium text-[#1f2937] truncate">
                    {activity.title}
                  </span>
                </div>
                <span className="text-[12px] font-normal text-[#6b7280] whitespace-nowrap shrink-0">
                  {activity.time}
                </span>
              </div>
            )
          })
        ) : (
          <div className="py-10 text-center text-[13px] text-[#6b7280]">
            No matching activity found.
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard({ searchQuery = '' }) {
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [rangeOpen, setRangeOpen] = useState(false)
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

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Page Title & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Dashboard
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Welcome back! Here&apos;s what&apos;s happening at Prestige
            Computers.
          </p>
        </div>

        {/* Date Range Dropdown */}
        <div className="relative self-start sm:self-auto" ref={rangeRef}>
          <button
            type="button"
            onClick={() => setRangeOpen((prev) => !prev)}
            className="inline-flex items-center gap-2.5 bg-white border border-[#dfe3ea] rounded-lg px-3.5 py-2 text-[13px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-[#f9fafb] transition-colors cursor-pointer"
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
      </div>

      {/* Row 1: 4 KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className="bg-white rounded-xl border border-[#e6e8ee] px-5 py-4 shadow-[0_2px_10px_rgba(16,24,40,0.04)] hover:shadow-[0_6px_16px_rgba(16,24,40,0.07)] transition-shadow flex items-center gap-4"
            >
              <div className="text-[#dc1414] shrink-0">
                <Icon className="w-10 h-10" strokeWidth={1.75} />
              </div>

              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#374151] truncate">
                  {card.label}
                </p>
                <p className="mt-0.5 text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
                  {card.value}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-[#15803d]">
                  <ArrowUpIcon className="w-3.5 h-3.5" />
                  <span>{card.growth}</span>
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Row 2: Sales & Rental Overview + Revenue by Type + Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5">
          <SalesRentalChart />
        </div>
        <div className="lg:col-span-3">
          <RevenueDonutCard />
        </div>
        <div className="lg:col-span-4">
          <RecentActivityCard searchQuery={searchQuery} />
        </div>
      </section>
    </div>
  )
}
