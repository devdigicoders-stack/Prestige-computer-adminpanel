import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

export default function AdminLayout({
  searchQuery,
  onSearchChange,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const navigate = useNavigate()

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev)
    } else {
      setCollapsed((prev) => !prev)
    }
  }

  return (
    <div className="h-[100dvh] w-full flex bg-[#f4f5f7] overflow-hidden">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        collapsed={collapsed}
        onLogoutClick={() => setLogoutConfirmOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar
          onToggleSidebar={handleToggleSidebar}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenSettings={() => navigate('/settings')}
          onLogout={() => setLogoutConfirmOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-7 py-5 sm:py-6">
          <Outlet />
        </main>
      </div>

      {/* Global Logout Confirmation Alert */}
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Logout from Admin Panel?"
        message="Are you sure you want to logout of your Prestige Computers admin session? You will need to sign in again to continue."
        confirmText="Yes, Logout"
        cancelText="Stay Logged In"
        variant="danger"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false)
          onLogout?.()
        }}
      />
    </div>
  )
}
