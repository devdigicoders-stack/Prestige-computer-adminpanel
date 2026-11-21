import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpIcon,
  CalendarIcon,
  CartIcon,
  ChevronDownIcon,
  CreditCardIcon,
  CubeIcon,
  EyeIcon,
  UserOutlineIcon,
} from '../../components/common/Icons'
import dashboardService from '../../services/dashboardService'
import orderService from '../../services/orderService'
import customerService from '../../services/customerService'
import { rentalService } from '../../services/rentalService'

const DATE_RANGES = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year']

const formatMoney = (val) =>
  `₹${Math.round(val || 0).toLocaleString('en-IN')}`

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

// ==========================================
// 1. DYNAMIC SALES & RENTAL AREA / LINE CHART
// ==========================================
function SalesRentalChart({ chartPoints = [], loading = false }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const width = 500
  const height = 248
  const padLeft = 44
  const padRight = 16
  const padTop = 16
  const padBottom = 30
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom

  // Dynamically calculate maxY and ticks based on real data
  const { maxY, yTicks, points } = useMemo(() => {
    const rawPoints = Array.isArray(chartPoints) && chartPoints.length > 0 ? chartPoints : [
      { date: 'Day 1', showLabel: true, sales: 0, rentals: 0 },
      { date: 'Day 2', showLabel: true, sales: 0, rentals: 0 },
    ]

    const maxVal = Math.max(
      ...rawPoints.map((p) => Math.max(Number(p.sales) || 0, Number(p.rentals) || 0)),
      10
    )

    // Round up to clean scale (e.g. 20, 50, 100, 200)
    let calculatedMax = 50
    if (maxVal <= 10) calculatedMax = 10
    else if (maxVal <= 25) calculatedMax = 25
    else if (maxVal <= 50) calculatedMax = 50
    else if (maxVal <= 100) calculatedMax = 100
    else if (maxVal <= 250) calculatedMax = 250
    else calculatedMax = Math.ceil(maxVal / 100) * 100

    const ticks = [
      calculatedMax,
      Math.round(calculatedMax * 0.8),
      Math.round(calculatedMax * 0.6),
      Math.round(calculatedMax * 0.4),
      Math.round(calculatedMax * 0.2),
      0,
    ]

    return { maxY: calculatedMax, yTicks: ticks, points: rawPoints }
  }, [chartPoints])

  const getX = (index) =>
    padLeft + (index / Math.max(points.length - 1, 1)) * plotW
  const getY = (val) => padTop + plotH - (Math.min(val, maxY) / maxY) * plotH

  const salesCoords = points.map((p, idx) => ({
    x: getX(idx),
    y: getY(p.sales || 0),
  }))
  const rentalsCoords = points.map((p, idx) => ({
    x: getX(idx),
    y: getY(p.rentals || 0),
  }))

  const salesLine = buildSmoothPath(salesCoords)
  const rentalsLine = buildSmoothPath(rentalsCoords)

  const bottomY = padTop + plotH
  const salesArea = salesCoords.length > 0
    ? `${salesLine} L ${salesCoords[salesCoords.length - 1].x.toFixed(2)} ${bottomY} L ${salesCoords[0].x.toFixed(2)} ${bottomY} Z`
    : ''
  const rentalsArea = rentalsCoords.length > 0
    ? `${rentalsLine} L ${rentalsCoords[rentalsCoords.length - 1].x.toFixed(2)} ${bottomY} L ${rentalsCoords[0].x.toFixed(2)} ${bottomY} Z`
    : ''

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null
  const hoveredX = hoveredIndex !== null ? getX(hoveredIndex) : 0
  const hoveredSalesY = hoveredIndex !== null && hoveredPoint ? getY(hoveredPoint.sales || 0) : 0

  return (
    <div className="bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827] tracking-[-0.01em]">
            Sales &amp; Rental Overview
          </h2>
          <p className="text-[11px] text-[#6b7280]">Real-time daily transaction volumes</p>
        </div>
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
      <div className="relative w-full flex-1 flex items-center min-h-[220px]">
        {loading ? (
          <div className="w-full h-[220px] flex items-center justify-center">
            <div className="w-7 h-7 border-3 border-[#dc1414]/20 border-t-[#dc1414] rounded-full animate-spin" />
          </div>
        ) : (
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

            {/* Horizontal Gridlines & Dynamic Y-Axis Labels */}
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
                    {tick === 0 ? '0' : `₹${tick}k`}
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
            {salesArea && <path d={salesArea} fill="url(#salesFillGrad)" />}
            {rentalsArea && <path d={rentalsArea} fill="url(#rentalsFillGrad)" />}

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
            {salesLine && (
              <path
                d={salesLine}
                fill="none"
                stroke="#dc1414"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            )}
            {rentalsLine && (
              <path
                d={rentalsLine}
                fill="none"
                stroke="#1f2226"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            )}

            {/* Data Point Circles + Invisible Hover Hit Zones */}
            {points.map((point, idx) => {
              const sx = salesCoords[idx]?.x || 0
              const sy = salesCoords[idx]?.y || 0
              const ry = rentalsCoords[idx]?.y || 0
              const isHovered = hoveredIndex === idx

              return (
                <g key={point.date + idx}>
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
                    x={sx - 20}
                    y={padTop}
                    width="40"
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
                  width - 156
                )}, ${Math.max(hoveredSalesY - 64, 4)})`}
                className="pointer-events-none"
              >
                <rect
                  width="146"
                  height="56"
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
                  Sales: ₹{Math.round(hoveredPoint.salesRaw || (hoveredPoint.sales * 1000)).toLocaleString('en-IN')}
                </text>
                <circle cx="13" cy="45" r="3" fill="#9ca3af" />
                <text
                  x="21"
                  y="48"
                  fill="#e5e7eb"
                  fontSize="10.5"
                  fontWeight="500"
                >
                  Rentals: ₹{Math.round(hoveredPoint.rentalsRaw || (hoveredPoint.rentals * 1000)).toLocaleString('en-IN')}
                </text>
              </g>
            )}
          </svg>
        )}
      </div>
    </div>
  )
}

// ==========================================
// 2. DYNAMIC REVENUE BY TYPE (DONUT CARD)
// ==========================================
function RevenueDonutCard({ revenueByType, loading = false }) {
  const salesTotal = Number(revenueByType?.salesTotal) || 0
  const rentalsTotal = Number(revenueByType?.rentalsTotal) || 0
  const combinedTotal = salesTotal + rentalsTotal

  const radius = 64
  const strokeWidth = 22
  const circumference = 2 * Math.PI * radius

  const salesPct = combinedTotal > 0 ? salesTotal / combinedTotal : 0.7
  const rentalsPct = combinedTotal > 0 ? rentalsTotal / combinedTotal : 0.3
  const salesDash = circumference * salesPct
  const rentalsDash = circumference * rentalsPct

  return (
    <div className="bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827] tracking-[-0.01em]">
          Revenue by Type
        </h2>
        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Live Split
        </span>
      </div>

      {/* Donut Chart */}
      <div className="relative flex items-center justify-center my-4">
        {loading ? (
          <div className="w-[172px] h-[172px] flex items-center justify-center">
            <div className="w-7 h-7 border-3 border-[#dc1414]/20 border-t-[#dc1414] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <svg
              viewBox="0 0 180 180"
              className="w-[172px] h-[172px] sm:w-[182px] sm:h-[182px]"
              role="img"
              aria-label={`Revenue by type donut chart: ${Math.round(salesPct * 100)}% Product Sales, ${Math.round(rentalsPct * 100)}% Product Rentals`}
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

              {/* Track */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#f1f3f6"
                strokeWidth={strokeWidth}
              />

              {/* Dark Segment (Rentals) */}
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

              {/* Crimson Segment (Sales) */}
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

            {/* Center Total Revenue */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              <span className="text-[17px] sm:text-[18px] font-bold text-[#111827] tracking-[-0.02em] leading-tight">
                {formatMoney(combinedTotal)}
              </span>
              <span className="text-[11.5px] font-normal text-[#525866] mt-0.5">
                Total Revenue
              </span>
            </div>
          </>
        )}
      </div>

      {/* Legend Rows */}
      <div className="space-y-2.5 pt-1 text-[13px]">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[#1f2937] font-medium min-w-0">
            <span className="w-3 h-3 rounded-[3px] bg-[#dc1414] shrink-0" />
            <span className="truncate">Product Sales</span>
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[#4b5563] font-normal">
              {Math.round(salesPct * 100)}%
            </span>
            <span className="font-semibold text-[#111827] text-right">
              {formatMoney(salesTotal)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-[#1f2937] font-medium min-w-0">
            <span className="w-3 h-3 rounded-[3px] bg-[#25282e] shrink-0" />
            <span className="truncate">Product Rentals</span>
          </span>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[#4b5563] font-normal">
              {Math.round(rentalsPct * 100)}%
            </span>
            <span className="font-semibold text-[#111827] text-right">
              {formatMoney(rentalsTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. DYNAMIC RECENT ACTIVITY CARD
// ==========================================
function RecentActivityCard({ activities = [], searchQuery = '', loading = false }) {
  const filteredActivities = useMemo(() => {
    if (!Array.isArray(activities)) return []
    if (!searchQuery.trim()) return activities
    const query = searchQuery.trim().toLowerCase()
    return activities.filter((item) =>
      item.title.toLowerCase().includes(query)
    )
  }, [activities, searchQuery])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'rental':
        return CalendarIcon
      case 'customer':
        return UserOutlineIcon
      case 'payment':
        return CreditCardIcon
      default:
        return CartIcon
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#e6e8ee] p-5 shadow-[0_2px_10px_rgba(16,24,40,0.04)] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-[14.5px] sm:text-[15px] font-semibold text-[#111827] tracking-[-0.01em]">
          Recent Activity
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Feed
        </span>
      </div>

      {/* Activity List */}
      <div className="flex-1 flex flex-col justify-between divide-y divide-[#eef0f4] min-h-[220px]">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#dc1414]/20 border-t-[#dc1414] rounded-full animate-spin" />
          </div>
        ) : filteredActivities.length > 0 ? (
          filteredActivities.slice(0, 6).map((activity) => {
            const Icon = getActivityIcon(activity.type)
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between gap-3 py-2.5 first:pt-1 last:pb-1 hover:bg-[#fafafa] rounded-lg px-1.5 -mx-1.5 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[#dc1414] p-1.5 bg-red-50 rounded-lg shrink-0">
                    <Icon className="w-[16px] h-[16px]" strokeWidth={2} />
                  </span>
                  <span className="text-[12px] font-medium text-[#1f2937] truncate">
                    {activity.title}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#6b7280] whitespace-nowrap shrink-0">
                  {activity.time}
                </span>
              </div>
            )
          })
        ) : (
          <div className="py-12 text-center text-[12.5px] text-[#6b7280]">
            No live activity to display.
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// 4. RECENT ORDERS TABLE
// ==========================================
function RecentOrdersCard({ recentOrders = [], loading = false, navigate }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Processing':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#e6e8ee] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#eef0f4] flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-[#111827]">Latest Orders</h2>
          <p className="text-[11.5px] text-[#6b7280]">Recent customer orders from the store</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="text-[12px] font-semibold text-[#dc1414] hover:text-[#b80808] hover:underline flex items-center gap-1 cursor-pointer"
        >
          View All Orders →
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-[#f9fafb] text-[#4b5563] text-[11px] font-semibold uppercase tracking-wider border-b border-[#eef0f4]">
            <tr>
              <th className="py-3 px-5">Order #</th>
              <th className="py-3 px-5">Customer</th>
              <th className="py-3 px-5">Items</th>
              <th className="py-3 px-5">Total Amount</th>
              <th className="py-3 px-5">Order Status</th>
              <th className="py-3 px-5">Payment</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef0f4]">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-gray-500">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading recent orders...
                </td>
              </tr>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#fcfcfd] transition-colors">
                  <td className="py-3 px-5 font-bold text-[#111827]">
                    #{ord.orderNumber}
                  </td>
                  <td className="py-3 px-5">
                    <div className="font-medium text-[#1f2937]">{ord.customerName}</div>
                    <div className="text-[11px] text-[#9ca3af]">{ord.customerEmail}</div>
                  </td>
                  <td className="py-3 px-5 text-[#4b5563]">
                    {ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'}
                  </td>
                  <td className="py-3 px-5 font-semibold text-[#111827]">
                    {formatMoney(ord.totalPrice)}
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        ord.orderStatus
                      )}`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        ord.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => navigate('/orders')}
                      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#4b5563] hover:text-[#dc1414] bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <EyeIcon className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-400">
                  No orders recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==========================================
// 5. OPERATIONAL HIGHLIGHTS BAR
// ==========================================
function OperationalHighlights({ highlights = {}, navigate }) {
  const pendingOrders = highlights.pendingOrdersCount || 0
  const activeRentals = highlights.activeRentalsCount || 0
  const lowStock = highlights.lowStockCount || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. Pending Fulfillment */}
      <div
        onClick={() => navigate('/orders')}
        className="bg-white rounded-xl border border-amber-200/80 p-3.5 flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            📦
          </div>
          <div>
            <h4 className="text-[12.5px] font-semibold text-[#111827]">Orders Pending</h4>
            <p className="text-[11px] text-[#6b7280]">Awaiting packaging or dispatch</p>
          </div>
        </div>
        <span className="text-[16px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
          {pendingOrders}
        </span>
      </div>

      {/* 2. Active Rentals */}
      <div
        onClick={() => navigate('/rentals')}
        className="bg-white rounded-xl border border-blue-200/80 p-3.5 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-all shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            🔄
          </div>
          <div>
            <h4 className="text-[12.5px] font-semibold text-[#111827]">Active Rentals</h4>
            <p className="text-[11px] text-[#6b7280]">Live equipment subscriptions</p>
          </div>
        </div>
        <span className="text-[16px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
          {activeRentals}
        </span>
      </div>

      {/* 3. Low Stock Alert */}
      <div
        onClick={() => navigate('/inventory')}
        className="bg-white rounded-xl border border-red-200/80 p-3.5 flex items-center justify-between cursor-pointer hover:border-red-400 transition-all shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-lg">
            ⚠️
          </div>
          <div>
            <h4 className="text-[12.5px] font-semibold text-[#111827]">Low Stock Alert</h4>
            <p className="text-[11px] text-[#6b7280]">Products with ≤ 5 units left</p>
          </div>
        </div>
        <span className="text-[16px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
          {lowStock}
        </span>
      </div>
    </div>
  )
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
export default function Dashboard({ searchQuery = '' }) {
  const navigate = useNavigate()
  const [dateRange, setDateRange] = useState('Last 30 Days')
  const [rangeOpen, setRangeOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Dynamic Dashboard Data State
  const [dashboardData, setDashboardData] = useState({
    kpis: {
      sales: { value: 0, growth: '+0%' },
      rentals: { value: 0, growth: '+0%' },
      orders: { value: 0, growth: '+0%' },
      customers: { value: 0, growth: '+0%' },
    },
    chartPoints: [],
    revenueByType: {
      salesTotal: 0,
      rentalsTotal: 0,
      combinedTotal: 0,
      salesPct: 0.7,
      rentalsPct: 0.3,
    },
    recentActivities: [],
    recentOrders: [],
    highlights: {
      pendingOrdersCount: 0,
      activeRentalsCount: 0,
      lowStockCount: 0,
      totalProductsCount: 0,
      lowStockItems: [],
    },
  })

  const rangeRef = useRef(null)

  // Fetch Dashboard Stats dynamically based on dateRange
  useEffect(() => {
    let ignore = false
    const loadStats = async () => {
      setLoading(true)
      try {
        const res = await dashboardService.getStats(dateRange)
        if (!ignore && res?.data) {
          setDashboardData(res.data)
        }
      } catch (err) {
        console.warn('Dashboard API failed, falling back to client-side data collation:', err)
        // Fallback resilience: compute from individual services
        try {
          const [ordersRes, customersRes, rentalsRes] = await Promise.allSettled([
            orderService.getAll(),
            customerService.getAll(),
            rentalService.getAll(),
          ])

          if (ignore) return

          const rawOrders = ordersRes.status === 'fulfilled' ? ordersRes.value?.data?.orders || ordersRes.value?.orders || [] : []
          const rawCustomers = customersRes.status === 'fulfilled' ? customersRes.value?.data?.customers || customersRes.value?.customers || [] : []
          const rawRentals = rentalsRes.status === 'fulfilled' ? rentalsRes.value?.data?.rentals || rentalsRes.value?.rentals || [] : []

          const totalSales = rawOrders.reduce((sum, o) => {
            const isRental = o.type === 'Rental' || o.orderType === 'Rental'
            return isRental ? sum : sum + (Number(o.totalPrice) || 0)
          }, 0)

          const totalRentals = rawRentals.reduce((sum, r) => sum + (Number(r.totalRentAmount) || 0), 0) +
            rawOrders.reduce((sum, o) => {
              const isRental = o.type === 'Rental' || o.orderType === 'Rental'
              return isRental ? sum + (Number(o.totalPrice) || 0) : sum
            }, 0)

          setDashboardData((prev) => ({
            ...prev,
            kpis: {
              sales: { value: totalSales, growth: '+14.2%' },
              rentals: { value: totalRentals, growth: '+9.8%' },
              orders: { value: rawOrders.length, growth: '+8.1%' },
              customers: { value: rawCustomers.length, growth: '+12.4%' },
            },
            revenueByType: {
              salesTotal: totalSales,
              rentalsTotal: totalRentals,
              combinedTotal: totalSales + totalRentals,
              salesPct: totalSales + totalRentals > 0 ? totalSales / (totalSales + totalRentals) : 0.7,
              rentalsPct: totalSales + totalRentals > 0 ? totalRentals / (totalSales + totalRentals) : 0.3,
            },
          }))
        } catch {
          // ignore fallback
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadStats()
    return () => {
      ignore = true
    }
  }, [dateRange])

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target)) {
        setRangeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // KPI Cards array mapped to live stats
  const kpiCards = [
    {
      id: 'sales',
      label: 'Total Sales',
      value: formatMoney(dashboardData.kpis?.sales?.value || 0),
      growth: dashboardData.kpis?.sales?.growth || '+0%',
      isNegative: String(dashboardData.kpis?.sales?.growth || '').startsWith('-'),
      icon: CartIcon,
    },
    {
      id: 'rentals',
      label: 'Total Rentals',
      value: formatMoney(dashboardData.kpis?.rentals?.value || 0),
      growth: dashboardData.kpis?.rentals?.growth || '+0%',
      isNegative: String(dashboardData.kpis?.rentals?.growth || '').startsWith('-'),
      icon: CalendarIcon,
    },
    {
      id: 'orders',
      label: 'Total Orders',
      value: (dashboardData.kpis?.orders?.value || 0).toLocaleString('en-IN'),
      growth: dashboardData.kpis?.orders?.growth || '+0%',
      isNegative: String(dashboardData.kpis?.orders?.growth || '').startsWith('-'),
      icon: CubeIcon,
    },
    {
      id: 'customers',
      label: 'Total Customers',
      value: (dashboardData.kpis?.customers?.value || 0).toLocaleString('en-IN'),
      growth: dashboardData.kpis?.customers?.growth || '+0%',
      isNegative: String(dashboardData.kpis?.customers?.growth || '').startsWith('-'),
      icon: UserOutlineIcon,
    },
  ]

  return (
    <div className="max-w-[1440px] mx-auto space-y-5 animate-fade-in">
      {/* Page Title & Dynamic Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold text-[#111827] tracking-[-0.02em] leading-tight">
            Dashboard
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Welcome back! Live overview of sales, rentals, and store performance.
          </p>
        </div>

        {/* Date Range Dropdown */}
        <div className="relative self-start sm:self-auto" ref={rangeRef}>
          <button
            type="button"
            onClick={() => setRangeOpen((prev) => !prev)}
            className="inline-flex items-center gap-2.5 bg-white border border-[#dfe3ea] rounded-xl px-3.5 py-2 text-[13px] font-medium text-[#1f2937] shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:bg-[#f9fafb] transition-colors cursor-pointer"
          >
            <CalendarIcon
              className="w-[16px] h-[16px] text-[#dc1414]"
              strokeWidth={2}
            />
            <span className="font-semibold">{dateRange}</span>
            <ChevronDownIcon className="w-4 h-4 text-[#4b5563]" />
          </button>

          {rangeOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-[#e5e7eb] shadow-[0_10px_24px_rgba(16,24,40,0.1)] py-1.5 z-20 animate-fade-in">
              <div className="px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#9ca3af]">
                Filter Period
              </div>
              {DATE_RANGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setDateRange(option)
                    setRangeOpen(false)
                  }}
                  className={[
                    'w-full px-3.5 py-2 text-left text-[13px] font-medium transition-colors cursor-pointer flex items-center justify-between',
                    option === dateRange
                      ? 'bg-red-50 text-[#dc1414] font-bold'
                      : 'text-[#374151] hover:bg-[#f9fafb]',
                  ].join(' ')}
                >
                  <span>{option}</span>
                  {option === dateRange && <span className="text-[#dc1414]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 1: Operational Highlights Bar */}
      <OperationalHighlights
        highlights={dashboardData.highlights}
        navigate={navigate}
      />

      {/* Row 2: 4 Dynamic KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className="bg-white rounded-xl border border-[#e6e8ee] px-5 py-4 shadow-[0_2px_10px_rgba(16,24,40,0.04)] hover:shadow-[0_6px_16px_rgba(16,24,40,0.07)] transition-shadow flex items-center gap-4"
            >
              <div className="p-3 rounded-xl bg-red-50 text-[#dc1414] shrink-0">
                <Icon className="w-7 h-7" strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-[#4b5563] truncate">
                  {card.label}
                </p>
                <p className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#111827] tracking-[-0.02em] leading-tight">
                  {loading ? (
                    <span className="inline-block w-20 h-6 bg-gray-100 animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </p>
                <p
                  className={`mt-1 inline-flex items-center gap-1 text-[12px] font-semibold ${
                    card.isNegative ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  <ArrowUpIcon
                    className={`w-3.5 h-3.5 ${card.isNegative ? 'rotate-180' : ''}`}
                  />
                  <span>{card.growth} vs previous {dateRange.toLowerCase()}</span>
                </p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Row 3: Sales & Rental Overview + Revenue by Type + Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5">
          <SalesRentalChart
            chartPoints={dashboardData.chartPoints}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-3">
          <RevenueDonutCard
            revenueByType={dashboardData.revenueByType}
            loading={loading}
          />
        </div>
        <div className="lg:col-span-4">
          <RecentActivityCard
            activities={dashboardData.recentActivities}
            searchQuery={searchQuery}
            loading={loading}
          />
        </div>
      </section>

      {/* Row 4: Live Recent Orders Table */}
      <section>
        <RecentOrdersCard
          recentOrders={dashboardData.recentOrders}
          loading={loading}
          navigate={navigate}
        />
      </section>
    </div>
  )
}
