import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import Login from '../pages/auth/Login'
import Categories from '../pages/categories/Categories'
import Customers from '../pages/customers/Customers'
import Dashboard from '../pages/dashboard/Dashboard'
import Inventory from '../pages/inventory/Inventory'
import Orders from '../pages/orders/Orders'
import Payments from '../pages/payments/Payments'
import Products from '../pages/products/Products'
import Rentals from '../pages/rentals/Rentals'
import Reports from '../pages/reports/Reports'
import Settings from '../pages/settings/Settings'

const AUTH_STORAGE_KEY = 'pcs_admin_authenticated'

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) !== 'false'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true')
    setIsAuthenticated(true)
    navigate('/dashboard', { replace: true })
  }

  const handleLogout = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'false')
    setIsAuthenticated(false)
    setSearchQuery('')
    navigate('/login', { replace: true })
  }

  return (
    <Routes>
      {/* Auth Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
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
          path="payments"
          element={<Payments globalSearch={searchQuery} />}
        />
        <Route
          path="reports"
          element={<Reports globalSearch={searchQuery} />}
        />
        <Route path="settings" element={<Settings />} />
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
