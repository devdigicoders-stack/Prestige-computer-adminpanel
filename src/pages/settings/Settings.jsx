import { useRef, useState } from 'react'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import {
  BellIcon,
  CalendarIcon,
  CreditCardIcon,
  SettingsIcon,
  UserOutlineIcon,
} from '../../components/common/Icons'
import { useAuth } from '../../hooks/useAuth'
import { getFullAvatarUrl } from '../../services/adminAuthService'

const SETTINGS_TABS = [
  { id: 'general', label: 'Store Profile', icon: SettingsIcon },
  { id: 'security', label: 'Admin Profile & Security', icon: UserOutlineIcon },
  { id: 'rental', label: 'Rental & Policies', icon: CalendarIcon },
  { id: 'payments', label: 'Payments & Tax', icon: CreditCardIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
]

const DEFAULT_SETTINGS = {
  // General
  storeName: 'Prestige Computers',
  tagline: 'Prestige Computer Services (PCS Doha)',
  supportEmail: 'info@pcsdoha.net',
  supportPhone: '+974 4145 3868',
  currency: 'INR (₹)',
  timezone: 'Asia/Qatar (GMT+3)',
  address: 'Tower I, 2nd Floor, Office No 201, Al-Mirqab Mall, Al Mirqab Al Jadeed St, Doha, Qatar',
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

function CameraIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

export default function Settings() {
  const { user, updateProfile, changePassword } = useAuth()

  const [activeTab, setActiveTab] = useState('security')
  const [form, setForm] = useState(DEFAULT_SETTINGS)

  // Dedicated admin profile fields initialized from user
  const [adminName, setAdminName] = useState(user?.name || 'Admin')
  const [adminEmail, setAdminEmail] = useState(user?.email || 'admin@gmail.com')
  const [adminPhone, setAdminPhone] = useState(user?.phone || '+974 6691 9155')

  // Avatar file upload states
  const [selectedFile, setSelectedFile] = useState(null)
  const [customAvatarPreview, setCustomAvatarPreview] = useState('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const fileInputRef = useRef(null)

  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [toast, setToast] = useState(null)
  const [confirmState, setConfirmState] = useState(null)

  const avatarDisplayUrl = customAvatarPreview || (user?.avatar ? getFullAvatarUrl(user.avatar) : '')

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
    }, 3800)
  }

  // Handle local image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP).', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit.', 'error')
      return
    }

    setSelectedFile(file)
    const localUrl = URL.createObjectURL(file)
    setCustomAvatarPreview(localUrl)
  }

  // Upload Avatar Image to Backend /uploads folder
  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      showToast('Please select an image file to upload.', 'error')
      return
    }

    try {
      setIsUploadingAvatar(true)
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const updated = await updateProfile(formData)
      setSelectedFile(null)
      if (updated?.avatar) {
        setCustomAvatarPreview(getFullAvatarUrl(updated.avatar))
      }
      showToast('Admin profile avatar uploaded and saved dynamically in backend uploads!', 'success')
    } catch (err) {
      console.error('Avatar upload failed:', err)
      showToast(err.message || 'Failed to upload avatar image.', 'error')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Save Admin Details (Name, Email, Phone) to Backend API
  const handleSaveAdminProfile = async () => {
    try {
      setIsSavingProfile(true)
      await updateProfile({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
      })
      showToast('Admin profile updated successfully!', 'success')
    } catch (err) {
      console.error('Profile update failed:', err)
      showToast(err.message || 'Failed to update profile.', 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Change Admin Password via API
  const handleChangePassword = async (e) => {
    e?.preventDefault()
    if (!passwords.current || !passwords.next) {
      showToast('Please fill in both current and new passwords.', 'error')
      return
    }

    if (passwords.next.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error')
      return
    }

    if (passwords.next !== passwords.confirm) {
      showToast('New password and confirm password do not match.', 'error')
      return
    }

    try {
      setIsChangingPassword(true)
      await changePassword(passwords.current, passwords.next)
      setPasswords({ current: '', next: '', confirm: '' })
      showToast('Password changed successfully!', 'success')
    } catch (err) {
      console.error('Password change error:', err)
      showToast(err.message || 'Failed to change password.', 'error')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // General Settings Save
  const handleSave = async (e) => {
    e?.preventDefault()
    if (activeTab === 'security') {
      await handleSaveAdminProfile()
      if (passwords.current || passwords.next || passwords.confirm) {
        await handleChangePassword()
      }
      return
    }
    showToast('Store settings saved successfully!', 'success')
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
        setSelectedFile(null)
        setCustomAvatarPreview('')
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
            Settings &amp; Admin Profile
          </h1>
          <p className="mt-0.5 text-[12.5px] sm:text-[13px] font-normal text-[#525866]">
            Manage Admin profile, dynamic avatar image, credentials, rental rules, and store configurations.
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
            disabled={isSavingProfile || isUploadingAvatar || isChangingPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] active:scale-[0.99] disabled:opacity-75 text-white text-[13px] font-medium shadow-[0_6px_16px_-4px_rgba(208,12,12,0.5)] transition-all cursor-pointer"
          >
            <CheckIcon className="w-4 h-4" />
            <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {toast && (
        <div
          role="status"
          className={[
            'rounded-xl px-4 py-3 text-[12.5px] font-medium border flex items-center gap-2.5 transition-all',
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
        <div className="flex-1 w-full bg-white rounded-xl border border-[#e6e8ee] shadow-[0_2px_10px_rgba(16,24,40,0.04)] overflow-hidden">
          {/* TAB 1: ADMIN PROFILE & SECURITY (TOP PRIORITY) */}
          {activeTab === 'security' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="border-b border-[#eef0f4] pb-4">
                <h2 className="text-[16px] font-semibold text-[#111827]">
                  Admin Profile, Avatar &amp; Credentials
                </h2>
                <p className="text-[13px] text-[#6b7280] mt-0.5">
                  Update Administrator information, upload dynamic profile photos to backend storage, and change login password.
                </p>
              </div>

              {/* DYNAMIC AVATAR UPLOAD SECTION */}
              <div className="p-4 rounded-xl bg-[#f8f9fb] border border-[#e5e7eb] flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-full border-2 border-[#dc1414] overflow-hidden bg-[#e5e7eb] flex items-center justify-center shadow-sm">
                    {avatarDisplayUrl ? (
                      <img
                        key={avatarDisplayUrl}
                        src={avatarDisplayUrl}
                        alt="Admin Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[28px] font-bold text-[#cc0e0e]">
                        {adminName?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload photo"
                    className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <CameraIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h3 className="text-[14px] font-semibold text-[#111827]">
                    Admin Profile Picture
                  </h3>
                  <p className="text-[12px] text-[#6b7280] mt-0.5">
                    Images are dynamically stored in backend <code className="text-[#cc0e0e] bg-red-50 px-1 py-0.5 rounded">backend/uploads</code> and served across the admin portal.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-[#d1d5db] bg-white hover:bg-[#f3f4f6] text-[12.5px] font-medium text-[#374151] transition-colors cursor-pointer"
                    >
                      Choose New Image
                    </button>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                        className="px-3.5 py-1.5 rounded-lg bg-[#cc0e0e] hover:bg-[#b50909] disabled:opacity-75 text-white text-[12.5px] font-medium transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        {isUploadingAvatar ? (
                          <>
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <CheckIcon className="w-3.5 h-3.5" />
                            <span>Save Photo</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ADMIN PROFILE DETAILS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAdminProfile}
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-black text-white text-[12.5px] font-medium transition-colors cursor-pointer"
                >
                  {isSavingProfile ? 'Saving Profile...' : 'Update Profile Info'}
                </button>
              </div>

              {/* CHANGE PASSWORD SECTION */}
              <div className="border-t border-[#eef0f4] pt-5">
                <h3 className="text-[14px] font-semibold text-[#111827] mb-1">
                  Change Administrator Password
                </h3>
                <p className="text-[12px] text-[#6b7280] mb-3">
                  Current password verification is required before setting a new password.
                </p>

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
                      New Password (Min 6 chars)
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
                      Confirm New Password
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

                <div className="mt-3.5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="px-4 py-2 rounded-lg bg-[#cc0e0e] hover:bg-[#b50909] disabled:opacity-75 text-white text-[12.5px] font-medium transition-all shadow-xs cursor-pointer"
                  >
                    {isChangingPassword ? 'Updating Password...' : 'Change Password'}
                  </button>
                </div>
              </div>

              {/* SECURITY EXTRAS */}
              <div className="border-t border-[#eef0f4] pt-4 space-y-4">
                <ToggleSwitch
                  checked={form.twoFactorAuth}
                  onChange={(val) => updateField('twoFactorAuth', val)}
                  label="Two-Factor Authentication (2FA)"
                  description="Require verification codes on new browser sessions."
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
            </div>
          )}

          {/* TAB 2: STORE PROFILE */}
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
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
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
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
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
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
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
                    className="w-full rounded-lg border border-[#d6dae2] bg-[#f8f9fb] px-3.5 py-2.5 text-[13px] font-medium text-[#111827] focus:border-[#dc1414] focus:bg-white focus:outline-none"
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
                    <option value="Asia/Qatar (GMT+3)">
                      Asia/Qatar (GMT+3)
                    </option>
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

          {/* TAB 3: RENTAL & POLICIES */}
          {activeTab === 'rental' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="border-b border-[#eef0f4] pb-4">
                <h2 className="text-[15px] font-semibold text-[#111827]">
                  Rental &amp; Store Policies
                </h2>
                <p className="text-[13px] text-[#6b7280] mt-0.5">
                  Control laptop/PC rental rules, security deposits and late return penalties.
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

          {/* TAB 4: PAYMENTS & TAX */}
          {activeTab === 'payments' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="border-b border-[#eef0f4] pb-4">
                <h2 className="text-[15px] font-semibold text-[#111827]">
                  Payments, Gateways &amp; Tax
                </h2>
                <p className="text-[13px] text-[#6b7280] mt-0.5">
                  Configure accepted checkout methods, gateway mode and invoice tax rates.
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

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="p-5 sm:p-6 space-y-5">
              <div className="border-b border-[#eef0f4] pb-4">
                <h2 className="text-[15px] font-semibold text-[#111827]">
                  Admin Notifications &amp; Alerts
                </h2>
                <p className="text-[13px] text-[#6b7280] mt-0.5">
                  Choose which store events trigger real-time dashboard and email alerts.
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
        </div>
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
