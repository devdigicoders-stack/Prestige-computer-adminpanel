import { useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  BellIcon,
  CalendarIcon,
  CreditCardIcon,
  SettingsIcon,
  UserOutlineIcon,
} from '../../components/common/Icons'

const SETTINGS_TABS = [
  { id: 'general', label: 'Store Profile', icon: SettingsIcon },
  { id: 'rental', label: 'Rental & Policies', icon: CalendarIcon },
  { id: 'payments', label: 'Payments & Tax', icon: CreditCardIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'security', label: 'Security & Admin', icon: UserOutlineIcon },
]

const DEFAULT_SETTINGS = {
  // General
  storeName: 'Prestige Computers',
  tagline: 'A Tiny City Full of Amazing Computers',
  supportEmail: 'support@prestigecomputers.com',
  supportPhone: '+91 22 4890 1122',
  currency: 'USD ($)',
  timezone: 'Asia/Kolkata (IST)',
  address: 'Shop 14-16, Tech Plaza, Lamington Road, Mumbai 400007',
  maintenanceMode: false,

  // Rental & Policies
  requireKyc: true,
  allowStorePickup: true,
  autoReturnReminder: true,
  minRentalDays: '7',
  depositPercent: '20',
  lateFeePerDay: '15',

  // Payments & Tax
  enableCards: true,
  enableUpi: true,
  enableNetBanking: true,
  enableCod: true,
  liveGatewayMode: true,
  taxRate: '18',
  invoicePrefix: 'PC-INV-',

  // Notifications
  notifyNewOrder: true,
  notifyRentalOverdue: true,
  notifyLowStock: true,
  notifyKycPending: true,
  notifyDailyDigest: false,

  // Security
  adminName: 'Admin',
  adminEmail: 'admin@prestigecomputers.com',
  twoFactorAuth: true,
  sessionTimeout: '60 minutes',
}

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 first:pt-1 last:pb-1">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#111827]">{label}</p>
        {description && (
          <p className="text-[12px] font-normal text-[#6b7280] mt-0.5">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#dc1414]/30',
          checked ? 'bg-[#dc1414]' : 'bg-[#d1d5db]',
        ].join(' ')}
      >
        <span
          className={[
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs transform transition-transform duration-200',
            checked ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [form, setForm] = useState(DEFAULT_SETTINGS)
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [toast, setToast] = useState(null)
  const [confirmState, setConfirmState] = useState(null)

  const updateField = (key, value) => {
    if (key === 'maintenanceMode' && value === true) {
      setConfirmState({
        title: 'Enable Maintenance Mode?',
        message:
          'Turning on Maintenance Mode will temporarily hide the Prestige Computers storefront from customers. Continue?',
        confirmText: 'Yes, Enable',
        variant: 'warning',
        onConfirm: () => {
          setForm((prev) => ({ ...prev, maintenanceMode: true }))
          setConfirmState(null)
        },
      })
      return
    }
    if (key === 'liveGatewayMode' && value === false) {
      setConfirmState({
        title: 'Switch to Sandbox / Test Mode?',
        message:
          'Disabling Live Payment Gateway Mode will stop processing real customer payments. Are you sure?',
        confirmText: 'Yes, Disable Live Mode',
        variant: 'warning',
        onConfirm: () => {
          setForm((prev) => ({ ...prev, liveGatewayMode: false }))
          setConfirmState(null)
        },
      })
      return
    }
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone })
    window.setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev))
    }, 3200)
  }

  const handleSave = (e) => {
    e?.preventDefault()
    if (
      activeTab === 'security' &&
      (passwords.current || passwords.next || passwords.confirm)
    ) {
      if (!passwords.current || !passwords.next) {
        showToast('Please fill in both current and new password.', 'error')
        return
      }
      if (passwords.next !== passwords.confirm) {
        showToast('New password and confirm password do not match.', 'error')
        return
      }
      setPasswords({ current: '', next: '', confirm: '' })
    }
    showToast('Settings saved successfully!', 'success')
  }

  const handleReset = () => {
    setConfirmState({
      title: 'Reset Settings to Default?',
      message:
        'Are you sure you want to discard all custom changes and restore Prestige Computers default settings?',
      confirmText: 'Yes, Reset All',
      variant: 'danger',
      onConfirm: () => {
        setForm(DEFAULT_SETTINGS)
        setPasswords({ current: '', next: '', confirm: '' })
        setConfirmState(null)
        showToast('Settings restored to default values.', 'success')
      },
    })
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-[-0.02em] leading-tight">
            Settings
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Manage Prestige Computers store configuration, rental rules,
            payments and admin security.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-lg border border-[#d6dae2] bg-white hover:bg-[#f9fafb] text-[#1f2937] text-[12.5px] font-medium shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {toast && (
        <div
          role="status"
          className={[
            'rounded-xl px-4 py-3 text-[12.5px] font-medium border flex items-center gap-2.5',
            toast.tone === 'error'
              ? 'bg-red-50 border-red-200 text-[#b91c1c]'
              : 'bg-emerald-50 border-emerald-200 text-[#15803d]',
          ].join(' ')}
        >
          <CheckIcon className="w-4 h-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Split Layout: Tabs + Active Settings Card */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Settings Navigation */}
        <aside className="w-full lg:w-[250px] shrink-0 bg-white rounded-xl border border-[#e6e8ee] p-2.5 shadow-[0_2px_10px_rgba(16,24,40,0.04)]">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap transition-all cursor-pointer text-left',
                    isActive
                      ? 'bg-gradient-to-r from-[#e21212] to-[#c70b0b] text-white shadow-[0_4px_12px_rgba(220,16,16,0.28)]'
                      : 'text-[#374151] hover:bg-[#f3f4f6] hover:text-[#111827]',
                  ].join(' ')}
                >
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isActive ? 'text-white' : 'text-[#6b7280]'
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Active Settings Content Panel */}
        <form
          onSubmit={handleSave}
          className="flex-1 w-full bg-white rounded-xl border border-[#e6e8ee] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden"
        >
          {/* TAB 1: STORE PROFILE */}
          {activeTab === 'general' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="border-b border-[#eef0f4] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#111827]">
                    General Store Profile
                  </h2>
                  <p className="text-[13px] text-[#6b7280] mt-0.5">
                    Public identity, contact details and regional formatting.
                  </p>
                </div>
                <div className="px-3.5 py-2 rounded-lg bg-[#f8f9fb] border border-[#e5e7eb] self-start">
                  <img
                    src="/logo.png"
                    alt="Prestige Computers"
                    className="h-9 w-auto object-contain"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={form.storeName}
                    onChange={(e) => updateField('storeName', e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Store Tagline
                  </label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) =>
                      updateField('supportEmail', e.target.value)
                    }
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Support Phone
                  </label>
                  <input
                    type="text"
                    value={form.supportPhone}
                    onChange={(e) =>
                      updateField('supportPhone', e.target.value)
                    }
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dc1414]/15"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Default Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="EUR (€)">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={form.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  >
                    <option value="Asia/Kolkata (IST)">
                      Asia/Kolkata (IST)
                    </option>
                    <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                    <option value="America/New_York (EST)">
                      America/New_York (EST)
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                  Store &amp; Warehouse Address
                </label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="border-t border-[#eef0f4] pt-4">
                <ToggleSwitch
                  checked={form.maintenanceMode}
                  onChange={(val) => updateField('maintenanceMode', val)}
                  label="Storefront Maintenance Mode"
                  description="Temporarily hide the storefront from customers while keeping admin access active."
                />
              </div>
            </div>
          )}

          {/* TAB 2: RENTAL & POLICIES */}
          {activeTab === 'rental' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="border-b border-[#eef0f4] pb-4">
                <h2 className="text-[15px] font-semibold text-[#111827]">
                  Rental &amp; Store Policies
                </h2>
                <p className="text-[13px] text-[#6b7280] mt-0.5">
                  Control laptop/PC rental rules, security deposits and late
                  return penalties.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Min Rental Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.minRentalDays}
                    onChange={(e) =>
                      updateField('minRentalDays', e.target.value)
                    }
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Security Deposit (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.depositPercent}
                    onChange={(e) =>
                      updateField('depositPercent', e.target.value)
                    }
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Late Return Fee ($ / Day)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.lateFeePerDay}
                    onChange={(e) =>
                      updateField('lateFeePerDay', e.target.value)
                    }
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#eef0f4] border-t border-[#eef0f4] pt-2">
                <ToggleSwitch
                  checked={form.requireKyc}
                  onChange={(val) => updateField('requireKyc', val)}
                  label="Require Customer KYC for Rentals"
                  description="Mandate government ID verification before dispatching any rental laptop or gaming PC."
                />
                <ToggleSwitch
                  checked={form.allowStorePickup}
                  onChange={(val) => updateField('allowStorePickup', val)}
                  label="Allow Same-Day Store Pickup"
                  description="Let customers pick up purchases and rental hardware directly from Prestige Computers."
                />
                <ToggleSwitch
                  checked={form.autoReturnReminder}
                  onChange={(val) => updateField('autoReturnReminder', val)}
                  label="Automated Return Due Reminders"
                  description="Send automatic email & SMS alerts 48 hours before a rental booking expires."
                />
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS & TAX */}
          {activeTab === 'payments' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="border-b border-[#eef0f4] pb-4">
                <h2 className="text-[15px] font-semibold text-[#111827]">
                  Payments, Gateways &amp; Tax
                </h2>
                <p className="text-[13px] text-[#6b7280] mt-0.5">
                  Configure accepted checkout methods, gateway mode and invoice
                  tax rates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Tax / GST Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={form.taxRate}
                    onChange={(e) => updateField('taxRate', e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Invoice Number Prefix
                  </label>
                  <input
                    type="text"
                    value={form.invoicePrefix}
                    onChange={(e) =>
                      updateField('invoicePrefix', e.target.value)
                    }
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#eef0f4] border-t border-[#eef0f4] pt-2">
                <ToggleSwitch
                  checked={form.enableCards}
                  onChange={(val) => updateField('enableCards', val)}
                  label="Credit & Debit Cards"
                  description="Accept Visa, Mastercard, RuPay and international cards at checkout."
                />
                <ToggleSwitch
                  checked={form.enableUpi}
                  onChange={(val) => updateField('enableUpi', val)}
                  label="UPI Instant Payments"
                  description="Allow Google Pay, PhonePe, Paytm and BHIM UPI checkouts."
                />
                <ToggleSwitch
                  checked={form.enableNetBanking}
                  onChange={(val) => updateField('enableNetBanking', val)}
                  label="NetBanking"
                  description="Enable direct bank transfers for high-value desktop & corporate orders."
                />
                <ToggleSwitch
                  checked={form.enableCod}
                  onChange={(val) => updateField('enableCod', val)}
                  label="Cash on Delivery / Store POS"
                  description="Permit pay-on-delivery or in-store counter settlement."
                />
                <ToggleSwitch
                  checked={form.liveGatewayMode}
                  onChange={(val) => updateField('liveGatewayMode', val)}
                  label="Live Payment Gateway Mode"
                  description="Turn off to switch gateway into Sandbox/Test mode."
                />
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="border-b border-[#eef0f4] pb-4">
                <h2 className="text-[15px] font-semibold text-[#111827]">
                  Admin Notifications &amp; Alerts
                </h2>
                <p className="text-[13px] text-[#6b7280] mt-0.5">
                  Choose which store events trigger real-time dashboard and
                  email alerts.
                </p>
              </div>

              <div className="divide-y divide-[#eef0f4]">
                <ToggleSwitch
                  checked={form.notifyNewOrder}
                  onChange={(val) => updateField('notifyNewOrder', val)}
                  label="New Order Placed"
                  description="Instant notification whenever a customer completes a purchase or rental order."
                />
                <ToggleSwitch
                  checked={form.notifyRentalOverdue}
                  onChange={(val) => updateField('notifyRentalOverdue', val)}
                  label="Overdue Rental Escalations"
                  description="High-priority alert when a rented laptop or PC passes its return due date."
                />
                <ToggleSwitch
                  checked={form.notifyLowStock}
                  onChange={(val) => updateField('notifyLowStock', val)}
                  label="Low Stock & Out of Stock Alerts"
                  description="Notify inventory manager when any SKU falls below its reorder threshold."
                />
                <ToggleSwitch
                  checked={form.notifyKycPending}
                  onChange={(val) => updateField('notifyKycPending', val)}
                  label="Pending Customer KYC Reviews"
                  description="Alert admin when a renter uploads ID verification documents."
                />
                <ToggleSwitch
                  checked={form.notifyDailyDigest}
                  onChange={(val) => updateField('notifyDailyDigest', val)}
                  label="Daily Revenue Digest Email"
                  description="Receive a daily end-of-day sales, rentals and payout summary at 9:00 PM."
                />
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & ADMIN */}
          {activeTab === 'security' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="border-b border-[#eef0f4] pb-4">
                <h2 className="text-[15px] font-semibold text-[#111827]">
                  Admin Profile &amp; Security
                </h2>
                <p className="text-[13px] text-[#6b7280] mt-0.5">
                  Manage Super Admin credentials, two-factor protection and
                  session limits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={form.adminName}
                    onChange={(e) => updateField('adminName', e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={form.adminEmail}
                    onChange={(e) => updateField('adminEmail', e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-[#eef0f4] pt-4 space-y-4">
                <ToggleSwitch
                  checked={form.twoFactorAuth}
                  onChange={(val) => updateField('twoFactorAuth', val)}
                  label="Two-Factor Authentication (2FA)"
                  description="Require a verification code on every new device login to the admin panel."
                />

                <div className="max-w-[260px]">
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Auto Session Timeout
                  </label>
                  <select
                    value={form.sessionTimeout}
                    onChange={(e) =>
                      updateField('sessionTimeout', e.target.value)
                    }
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  >
                    <option value="30 minutes">30 minutes</option>
                    <option value="60 minutes">60 minutes</option>
                    <option value="4 hours">4 hours</option>
                    <option value="Never">Never</option>
                  </select>
                </div>
              </div>

              {/* Change Password */}
              <div className="border-t border-[#eef0f4] pt-5">
                <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">
                  Change Password
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwords.current}
                      onChange={(e) =>
                        setPasswords((p) => ({ ...p, current: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwords.next}
                      onChange={(e) =>
                        setPasswords((p) => ({ ...p, next: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords((p) => ({ ...p, confirm: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Confirmation Alert */}
      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmText={confirmState?.confirmText}
        variant={confirmState?.variant}
        onCancel={() => setConfirmState(null)}
        onConfirm={confirmState?.onConfirm}
      />
    </div>
  )
}
