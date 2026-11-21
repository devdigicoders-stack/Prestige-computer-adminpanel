import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { useAuth } from '../../hooks/useAuth'
import { getFullAvatarUrl } from '../../services/adminAuthService'

function DefaultAdminAvatar({ name = 'Admin' }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'A'

  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#cc0e0e] to-[#800505] text-white font-semibold text-[13px] flex items-center justify-center border border-white/20 shadow-xs shrink-0 select-none">
      {initial}
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
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [failedAvatar, setFailedAvatar] = useState('')
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const handleProfileClick = () => {
    setMenuOpen(false)
    navigate('/settings')
  }

  const handleLogoutClick = () => {
    setMenuOpen(false)
    if (onLogout) {
      onLogout()
    } else {
      logout()
      navigate('/login', { replace: true })
    }
  }

  const avatarUrl = user?.avatar ? getFullAvatarUrl(user.avatar) : ''
  const showImage = Boolean(avatarUrl && failedAvatar !== avatarUrl)

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

      {/* Right: Notification, Help & Dynamic Admin Profile */}
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

        {/* Dynamic Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 pl-1 pr-1.5 py-1 rounded-lg hover:bg-[#f3f4f6] transition-colors cursor-pointer"
          >
            {showImage ? (
              <img
                key={avatarUrl}
                src={avatarUrl}
                alt={user?.name || 'Admin'}
                onError={() => setFailedAvatar(avatarUrl)}
                className="w-9 h-9 rounded-full object-cover border border-[#d1d5db] shadow-2xs"
              />
            ) : (
              <DefaultAdminAvatar name={user?.name || 'Admin'} />
            )}

            <div className="hidden md:block text-left leading-tight">
              <div className="text-[12.5px] font-semibold text-[#111827] max-w-[120px] truncate">
                {user?.name || 'Admin'}
              </div>
              <div className="text-[11px] font-normal text-[#6b7280] uppercase tracking-wide">
                {user?.role === 'admin' ? 'Super Admin' : user?.role || 'Admin'}
              </div>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-[#4b5563] hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-[#e5e7eb] shadow-[0_10px_28px_rgba(16,24,40,0.12)] py-1.5 z-50">
              <div className="px-3.5 py-2.5 border-b border-[#f0f2f5]">
                <p className="text-[13px] font-semibold text-[#111827] truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[11.5px] text-[#6b7280] truncate">
                  {user?.email || 'admin@gmail.com'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleProfileClick}
                className="w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2.5 cursor-pointer"
              >
                <UserOutlineIcon className="w-4 h-4 text-[#6b7280]" />
                <span>My Profile &amp; Avatar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  if (onOpenSettings) onOpenSettings()
                  else navigate('/settings')
                }}
                className="w-full px-3.5 py-2 text-left text-[13px] font-medium text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2.5 cursor-pointer"
              >
                <SettingsIcon className="w-4 h-4 text-[#6b7280]" />
                <span>Store Settings</span>
              </button>

              <div className="my-1 border-t border-[#f0f2f5]" />

              <button
                type="button"
                onClick={handleLogoutClick}
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
