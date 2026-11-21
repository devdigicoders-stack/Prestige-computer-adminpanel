import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  itemName = 'items',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Clamp current page to valid bounds
  const safePage = Math.min(Math.max(1, currentPage), totalPages)

  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endIndex = Math.min(safePage * pageSize, totalItems)

  // Generate page numbers array (with ellipsis if totalPages > 7)
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (safePage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }

    if (safePage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages]
  }

  const pages = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
      <p className="text-[13px] font-normal text-[#4b5563]">
        {totalItems > 0
          ? `Showing ${startIndex} to ${endIndex} of ${totalItems} ${itemName}`
          : `Showing 0 ${itemName}`}
      </p>

      {totalPages > 0 && (
        <div className="flex items-center gap-1.5 self-start sm:self-auto select-none">
          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => onPageChange?.(safePage - 1)}
            disabled={safePage <= 1}
            aria-label="Previous page"
            className="w-8 h-8 rounded-md border border-[#dce0e8] bg-white text-[#374151] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          </button>

          {/* Page Numbers */}
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 text-[13px] text-[#9ca3af] flex items-center justify-center font-bold"
                >
                  ...
                </span>
              )
            }

            const isActive = safePage === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange?.(p)}
                aria-label={`Go to page ${p}`}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'w-8 h-8 rounded-md text-[13px] font-medium flex items-center justify-center border transition-all cursor-pointer',
                  isActive
                    ? 'bg-gradient-to-b from-[#e01414] to-[#c40b0b] text-white border-[#c40b0b] shadow-xs font-semibold'
                    : 'bg-white border-[#dce0e8] text-[#1f2937] hover:bg-[#f9fafb]',
                ].join(' ')}
              >
                {p}
              </button>
            )
          })}

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => onPageChange?.(safePage + 1)}
            disabled={safePage >= totalPages}
            aria-label="Next page"
            className="w-8 h-8 rounded-md border border-[#dce0e8] bg-white text-[#374151] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
