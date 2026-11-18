import { NavLink } from 'react-router-dom'
import { SIDEBAR_NAV_ITEMS } from '../../constants/navigation'
import {
  BarChartIcon,
  CalendarIcon,
  CartIcon,
  CategoriesIcon,
  ChevronRightIcon,
  CloseIcon,
  CreditCardIcon,
  HomeIcon,
  InventoryIcon,
  LogoutIcon,
  ProductsIcon,
  SettingsIcon,
  UsersIcon,
} from '../common/Icons'

const ICON_MAP = {
  home: HomeIcon,
  products: ProductsIcon,
  categories: CategoriesIcon,
  inventory: InventoryIcon,
  orders: CartIcon,
  rentals: CalendarIcon,
  customers: UsersIcon,
  payments: CreditCardIcon,
  reports: BarChartIcon,
  settings: SettingsIcon,
}

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
  collapsed,
  onLogoutClick,
}) {
  return (
    <>
      {/* SVG filter so logo.png dark text renders crisp white on black sidebar */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="sidebar-logo-dark-bg" colorInterpolationFilters="sRGB">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="-3.2 0 0 0 1.45  -3.2 0 0 0 1.45  -3.2 0 0 0 1.45  0 0 0 1 0"
              result="blackToWhite"
            />
            <feBlend
              in="SourceGraphic"
              in2="blackToWhite"
              mode="screen"
              result="combined"
            />
            <feComposite in="combined" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>

      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px] lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-[#111215] text-white shrink-0 transition-all duration-200 ease-out select-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-[240px] lg:w-[76px]' : 'w-[240px] xl:w-[248px]',
        ].join(' ')}
      >
        {/* Brand Logo Header */}
        <div className="relative flex items-center justify-center px-3.5 pt-3.5 pb-3.5 border-b border-white/[0.06] shrink-0">
          <NavLink
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center justify-center"
          >
            <img
              src="/logo.png"
              alt="Prestige Computers"
              className={[
                'object-contain transition-all duration-200',
                collapsed ? 'lg:w-[50px] w-[172px]' : 'w-[174px]',
              ].join(' ')}
              style={{
                filter: 'url(#sidebar-logo-dark-bg)',
              }}
            />
          </NavLink>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="lg:hidden absolute right-2.5 top-3 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-2.5 space-y-0.5">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] || HomeIcon

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  [
                    'w-full flex items-center justify-between rounded-lg transition-all group',
                    collapsed
                      ? 'lg:justify-center px-3 py-2'
                      : 'px-3.5 py-2',
                    isActive
                      ? 'bg-gradient-to-r from-[#e21212] to-[#c70b0b] text-white font-medium shadow-[0_4px_12px_rgba(220,16,16,0.38)]'
                      : 'text-[#e5e7eb] hover:bg-white/[0.07] hover:text-white font-normal',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={[
                          'w-[18px] h-[18px] shrink-0 transition-colors',
                          isActive
                            ? 'text-white'
                            : 'text-[#d1d5db] group-hover:text-white',
                        ].join(' ')}
                      />
                      <span
                        className={[
                          'text-[12.5px] truncate',
                          collapsed ? 'lg:hidden' : '',
                        ].join(' ')}
                      >
                        {item.label}
                      </span>
                    </span>

                    {item.hasArrow && !isActive && (
                      <ChevronRightIcon
                        className={[
                          'w-3.5 h-3.5 shrink-0 transition-transform text-[#9ca3af] group-hover:text-white group-hover:translate-x-0.5',
                          collapsed ? 'lg:hidden' : '',
                        ].join(' ')}
                      />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Logout Button */}
        <div className="p-3 border-t border-white/[0.08] shrink-0">
          <button
            type="button"
            onClick={() => {
              onCloseMobile()
              onLogoutClick?.()
            }}
            title={collapsed ? 'Logout' : undefined}
            className={[
              'w-full flex items-center gap-3 rounded-lg text-[12.5px] font-medium text-[#f87171] hover:text-white hover:bg-[#dc1414]/90 transition-all cursor-pointer group',
              collapsed ? 'lg:justify-center px-3 py-2.5' : 'px-3.5 py-2.5',
            ].join(' ')}
          >
            <LogoutIcon className="w-[18px] h-[18px] shrink-0 text-[#f87171] group-hover:text-white transition-colors" />
            <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
