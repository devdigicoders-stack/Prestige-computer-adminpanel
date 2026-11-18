import { useState } from 'react'

function UserIcon({ className = 'w-[19px] h-[19px]', strokeWidth = 1.8 }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M5 19.5c0-3.4 3.1-5.8 7-5.8s7 2.4 7 5.8" />
    </svg>
  )
}

function LockIcon({ className = 'w-[18px] h-[18px]' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.2" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

function EyeIcon({ className = 'w-[19px] h-[19px]' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.25 12S5.75 5.5 12 5.5 21.75 12 21.75 12 18.25 18.5 12 18.5 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className = 'w-[19px] h-[19px]' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58A3 3 0 0 0 13.42 13.42" />
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.9c6.25 0 9.75 7.1 9.75 7.1a17.6 17.6 0 0 1-3.19 4.35" />
      <path d="M6.61 6.61A17.8 17.8 0 0 0 2.25 12s3.5 7.1 9.75 7.1a10.4 10.4 0 0 0 4.34-.93" />
    </svg>
  )
}

function ArrowRightIcon({ className = 'w-[18px] h-[18px]' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter both Email Address and Password.')
      return
    }
    setError('')
    onLoginSuccess?.()
  }

  return (
    <div className="h-[100dvh] w-screen overflow-hidden flex flex-col lg:flex-row bg-[#0b0b0d]">
      {/* SVG filter: turns black text/outline in logo.png crisp white on dark background while preserving red & white */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <filter id="logo-dark-bg" colorInterpolationFilters="sRGB">
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

      {/* LEFT / TOP BRAND VISUAL PANEL */}
      <section className="relative h-[26vh] min-h-[165px] max-h-[230px] lg:h-full lg:min-h-0 lg:max-h-none lg:w-[54%] shrink-0 bg-[#0b0b0d] overflow-hidden select-none">
        {/* Background Hardware & Red Wave Image (public/login.png) */}
        <img
          src="/login.png"
          alt="Prestige Computers Gaming PC, Laptop and Headphones"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Subtle dark readability vignette on mobile so logo pops cleanly */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/75 pointer-events-none" />

        {/* Subtle desktop top-center dark depth behind logo */}
        <div className="hidden lg:block absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-black/35 via-black/15 to-transparent pointer-events-none" />

        {/* Prestige Computers Logo (public/logo.png) */}
        <div className="relative z-10 h-full lg:h-auto flex items-center justify-center lg:pt-[7vh] xl:pt-[8vh] px-6">
          <img
            src="/logo.png"
            alt="Prestige Computers - A Tiny City Full of Amazing Computers"
            className="w-[235px] sm:w-[275px] lg:w-[62%] lg:max-w-[430px] h-auto object-contain"
            style={{
              filter:
                'url(#logo-dark-bg) drop-shadow(0 4px 14px rgba(0, 0, 0, 0.55))',
            }}
          />
        </div>

        {/* Thin red accent line at bottom on mobile */}
        <div className="lg:hidden absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#8b0000] via-[#e01212] to-[#8b0000]" />
      </section>

      {/* RIGHT / BOTTOM WHITE LOGIN PANEL */}
      <section className="flex-1 lg:h-full lg:w-[46%] bg-white flex items-center justify-center px-6 sm:px-10 lg:px-12 xl:px-16 overflow-y-auto lg:overflow-hidden">
        <div className="w-full max-w-[395px] py-5 sm:py-6">
          {/* Red Circular Admin User Badge */}
          <div className="flex justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#e01414] to-[#b50909] text-white flex items-center justify-center shadow-[0_6px_16px_-3px_rgba(204,14,14,0.45)]">
              <UserIcon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.9} />
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="mt-3.5 sm:mt-4 text-center">
            <h1 className="text-[21px] sm:text-[25px] font-semibold text-[#111111] tracking-[-0.02em] leading-tight">
              Admin Login
            </h1>
            <p className="mt-1 sm:mt-1.5 text-[12.5px] sm:text-[13.5px] font-medium text-[#555555]">
              Sign in to manage Prestige Computers
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-5 sm:mt-7 space-y-3.5 sm:space-y-4"
            noValidate
          >
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-[12px] sm:text-[13px] font-medium text-[#b91c1c] text-center"
              >
                {error}
              </div>
            )}

            {/* Email Address Input */}
            <div>
              <label htmlFor="admin-email" className="sr-only">
                Email Address
              </label>
              <div className="flex items-center rounded-lg border border-[#d6dae2] bg-[#f7f8fa] transition-all focus-within:border-[#cc0e0e] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#cc0e0e]/10">
                <span className="pl-3.5 text-[#5a606c] shrink-0">
                  <UserIcon className="w-[18px] h-[18px]" strokeWidth={1.7} />
                </span>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Email Address"
                  className="w-full bg-transparent px-3 py-3 text-[13px] sm:text-[13.5px] font-normal text-[#111827] placeholder:text-[#6b7280] placeholder:font-normal focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="admin-password" className="sr-only">
                Password
              </label>
              <div className="flex items-center rounded-lg border border-[#d6dae2] bg-[#f7f8fa] transition-all focus-within:border-[#cc0e0e] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#cc0e0e]/10">
                <span className="pl-3.5 text-[#5a606c] shrink-0">
                  <LockIcon />
                </span>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Password"
                  className="w-full bg-transparent px-3 py-3 text-[13px] sm:text-[13.5px] font-normal text-[#111827] placeholder:text-[#6b7280] placeholder:font-normal focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="pr-3.5 pl-2 py-2 text-[#4b5563] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5 text-[12.5px] sm:text-[13px]">
              <label className="inline-flex items-center gap-2 text-[#374151] font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-[3px] border border-[#6b7280] accent-[#cc0e0e] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="text-[#d31212] hover:text-[#a30b0b] font-medium transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 sm:py-3.5 rounded-lg bg-gradient-to-r from-[#e21414] via-[#c70b0b] to-[#a60707] hover:from-[#ed1717] hover:via-[#d10d0d] hover:to-[#940606] text-white text-[14px] sm:text-[14.5px] font-medium shadow-[0_8px_20px_-5px_rgba(199,11,11,0.65)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Login</span>
              <ArrowRightIcon />
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
