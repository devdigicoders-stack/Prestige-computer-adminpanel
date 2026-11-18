import { CloseIcon } from './Icons'

function AlertIcon({ variant = 'danger' }) {
  if (variant === 'success') {
    return (
      <div className="w-11 h-11 rounded-full bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] flex items-center justify-center shrink-0">
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="m8.8 12.2 2.2 2.2 4.4-4.6" />
        </svg>
      </div>
    )
  }

  if (variant === 'warning') {
    return (
      <div className="w-11 h-11 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#b45309] flex items-center justify-center shrink-0">
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9.5v4.2" />
          <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </div>
    )
  }

  return (
    <div className="w-11 h-11 rounded-full bg-[#fee2e2] border border-[#fecaca] text-[#dc1414] flex items-center justify-center shrink-0">
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5" />
        <circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    </div>
  )
}

export default function ConfirmDialog({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  const confirmBtnClass =
    variant === 'success'
      ? 'bg-gradient-to-b from-[#16a34a] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white'
      : variant === 'warning'
        ? 'bg-gradient-to-b from-[#f59e0b] to-[#d97706] hover:from-[#d97706] hover:to-[#b45309] text-white'
        : 'bg-gradient-to-b from-[#e01414] to-[#c00a0a] hover:from-[#eb1717] hover:to-[#ab0808] text-white'

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 backdrop-blur-[1.5px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-[420px] rounded-xl bg-white border border-[#e5e7eb] shadow-[0_24px_60px_rgba(16,24,40,0.28)] overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3.5">
            <AlertIcon variant={variant} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3
                  id="confirm-dialog-title"
                  className="text-[15px] font-semibold text-[#111827] leading-snug"
                >
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onCancel}
                  aria-label="Close confirmation"
                  className="p-1 -mr-1 -mt-1 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-gray-100 cursor-pointer"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-1.5 text-[12.5px] font-normal text-[#525866] leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#eef0f4] bg-[#fafbfc]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#d6dae2] bg-white hover:bg-gray-50 text-[12.5px] font-medium text-[#374151] transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4.5 py-2 rounded-lg text-[12.5px] font-medium shadow-xs active:scale-[0.99] transition-all cursor-pointer ${confirmBtnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
