import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import Login from '../pages/auth/Login'
import Blogs from '../pages/blogs/Blogs'
import Categories from '../pages/categories/Categories'
import Customers from '../pages/customers/Customers'
import Enquiries from '../pages/enquiries/Enquiries'
import Coupons from '../pages/coupons/Coupons'
import Dashboard from '../pages/dashboard/Dashboard'
import Inventory from '../pages/inventory/Inventory'
import Orders from '../pages/orders/Orders'
import Payments from '../pages/payments/Payments'
import Products from '../pages/products/Products'
import Rentals from '../pages/rentals/Rentals'
import Reports from '../pages/reports/Reports'
import Reviews from '../pages/reviews/Reviews'
import Settings from '../pages/settings/Settings'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute({ isAuthenticated, loading, children }) {
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0d0e12] text-white">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#dc1414]/20 border-t-[#dc1414] animate-spin" />
          <img src="/logo.png" alt="Prestige Computers" className="w-8 h-8 object-contain absolute" />
        </div>
        <p className="mt-4 text-[13px] font-medium text-gray-400 tracking-wide">
          Verifying Admin Session...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function AppRoutes() {
  const { isAuthenticated, loading, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setSearchQuery('')
    navigate('/login', { replace: true })
  }

  return (
    <Routes>
      {/* Auth Route */}
      <Route
        path="/login"
        element={
          !loading && isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLoginSuccess={() => navigate('/dashboard', { replace: true })} />
          )
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} loading={loading}>
            <AdminLayout
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={<Dashboard searchQuery={searchQuery} />}
        />
        <Route
          path="products"
          element={<Products globalSearch={searchQuery} />}
        />
        <Route
          path="categories"
          element={<Categories globalSearch={searchQuery} />}
        />
        <Route
          path="inventory"
          element={<Inventory globalSearch={searchQuery} />}
        />
        <Route
          path="orders"
          element={<Orders globalSearch={searchQuery} />}
        />
        <Route
          path="rentals"
          element={<Rentals globalSearch={searchQuery} />}
        />
        <Route
          path="customers"
          element={<Customers globalSearch={searchQuery} />}
        />
        <Route
          path="enquiries"
          element={<Enquiries globalSearch={searchQuery} />}
        />
        <Route
          path="payments"
          element={<Payments globalSearch={searchQuery} />}
        />
        <Route
          path="coupons"
          element={<Coupons globalSearch={searchQuery} />}
        />
        <Route
          path="reports"
          element={<Reports globalSearch={searchQuery} />}
        />
        <Route path="blogs" element={<Blogs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="reviews" element={<Reviews />} />
      </Route>

      {/* Fallback Route */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
        }
      />
    </Routes>
  )
}
