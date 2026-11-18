import { useEffect, useRef, useState } from 'react'
import {
  BellIcon,
  ChevronDownIcon,
  HelpCircleIcon,
  LogoutIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  UserOutlineIcon,
} from '../common/Icons'

function AdminAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-[#e5e7eb] border border-[#d1d5db] overflow-hidden shrink-0 flex items-end justify-center">
      <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
        <rect width="40" height="40" fill="#e5e7eb" />
        {/* Shoulders / Suit */}
        <path
          d="M7 40c1-7.5 6.3-11.5 13-11.5S32 32.5 33 40H7Z"
          fill="#1f2937"
        />
        {/* White Shirt Collar */}
        <path d="M16.2 29.2 20 34.5l3.8-5.3-3.8-1.4-3.8 1.4Z" fill="#ffffff" />
        {/* Neck */}
        <rect x="17.2" y="23" width="5.6" height="6" rx="2" fill="#e5b89b" />
        {/* Face */}
        <ellipse cx="20" cy="17.5" rx="6.2" ry="7.2" fill="#f1c7a8" />
        {/* Hair */}
        <path
          d="M13.6 16.5c-.2-4.8 2.6-8.1 6.6-8.1 3.9 0 6.5 2.7 6.3 7.6-.8-2.4-2.5-3.8-5.9-3.9-3.2-.1-5.6 1.5-7 4.4Z"
          fill="#1c1917"
        />
        {/* Subtle Beard */}
        <path
          d="M14.4 18.8c.5 3.7 2.6 5.9 5.6 5.9s5.1-2.2 5.6-5.9c-.9 2-2.9 3.2-5.6 3.2s-4.7-1.2-5.6-3.2Z"
          fill="#292524"
          fillOpacity="0.65"
        />
        {/* Eyes */}
        <circle cx="17.7" cy="17.4" r="0.85" fill="#1c1917" />
        <circle cx="22.3" cy="17.4" r="0.85" fill="#1c1917" />
      </svg>
    </div>
  )
}

export default function Topbar({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  onOpenSettings,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <header className="h-[62px] sm:h-[64px] bg-white border-b border-[#e5e7eb] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-30">
      {/* Left: Menu Toggle + Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 -ml-1.5 rounded-lg text-[#1f2937] hover:bg-[#f3f4f6] transition-colors cursor-pointer shrink-0"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-[440px]">
          <div className="flex items-center gap-2.5 bg-[#eef0f4] rounded-lg px-3.5 py-2 border border-transparent focus-within:bg-white focus-within:border-[#dc1414]/40 focus-within:ring-2 focus-within:ring-[#dc1414]/15 transition-all">
            <SearchIcon className="w-4 h-4 text-[#4b5563] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for products, orders, customers..."
              className="w-full bg-transparent text-[12.5px] text-[#111827] placeholder:text-[#6b7280] focus:outline-none min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Right: Notification, Help & Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* Notifications Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-[#1f2937] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
        >
          <BellIcon className="w-[21px] h-[21px]" />
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#e11212] text-white text-[10px] font-medium flex items-center justify-center leading-none shadow-xs">
            1
          </span>
        </button>

        {/* Help Button */}
        <button
          type="button"
          aria-label="Help center"
          className="hidden sm:inline-flex p-2 rounded-lg text-[#1f2937] hover:bg-[#f3f4f6] transition-colors cursor-pointer"
        >
          <HelpCircleIcon className="w-[21px] h-[21px]" />
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 pl-1 pr-1.5 py-1 rounded-lg hover:bg-[#f3f4f6] transition-colors cursor-pointer"
          >
            <AdminAvatar />
            <div className="hidden md:block text-left leading-tight">
              <div className="text-[12.5px] font-medium text-[#111827]">Admin</div>
              <div className="text-[11.5px] font-normal text-[#6b7280]">
                Super Admin
              </div>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-[#4b5563] hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-[#e5e7eb] shadow-[0_10px_28px_rgba(16,24,40,0.12)] py-1.5 z-50">
              <div className="px-3.5 py-2 border-b border-[#f0f2f5] md:hidden">
                <p className="text-[13px] font-medium text-[#111827]">Admin</p>
                <p className="text-[11.5px] text-[#6b7280]">Super Admin</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2.5 cursor-pointer"
              >
                <UserOutlineIcon className="w-4 h-4 text-[#6b7280]" />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onOpenSettings?.()
                }}
                className="w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2.5 cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4 text-[#6b7280]" />
                <span>Settings</span>
              </button>
              <div className="my-1 border-t border-[#f0f2f5]" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onLogout?.()
                }}
                className="w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#dc1414] hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
              >
                <LogoutIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
