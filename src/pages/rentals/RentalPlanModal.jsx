import { useEffect, useState } from 'react'
import { CloseIcon } from '../../components/common/Icons'
import { rentalService } from '../../services/rentalService'

export default function RentalPlanModal({ isOpen, onClose, onPlansUpdated }) {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [months, setMonths] = useState('')
  const [label, setLabel] = useState('')
  const [discount, setDiscount] = useState('0')
  const [tag, setTag] = useState('')
  const [isPopular, setIsPopular] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    let ignore = false
    rentalService
      .getRentalPlans()
      .then((res) => {
        if (!ignore && res?.data && Array.isArray(res.data)) {
          setPlans(res.data)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setErrorMsg(err.message || 'Failed to load rental plans from database')
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [isOpen])

  if (!isOpen) return null

  const resetForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setMonths('')
    setLabel('')
    setDiscount('0')
    setTag('')
    setIsPopular(false)
    setIsActive(true)
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const handleEdit = (plan) => {
    setEditingId(plan._id)
    setMonths(String(plan.months))
    setLabel(plan.label || '')
    setDiscount(String(plan.discount || 0))
    setTag(plan.tag || '')
    setIsPopular(Boolean(plan.isPopular))
    setIsActive(plan.isActive !== false)
    setIsFormOpen(true)
    setErrorMsg('')
    setSuccessMsg('')
  }

  const handleToggleActive = async (plan) => {
    try {
      const updatedActive = !plan.isActive
      await rentalService.updateRentalPlan(plan._id, { isActive: updatedActive })
      setPlans((prev) =>
        prev.map((p) => (p._id === plan._id ? { ...p, isActive: updatedActive } : p))
      )
      setSuccessMsg(`Plan "${plan.label}" marked as ${updatedActive ? 'Active' : 'Inactive'}`)
      setTimeout(() => setSuccessMsg(''), 3000)
      onPlansUpdated?.()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to toggle plan status')
    }
  }

  const handleDelete = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete the "${plan.label}" duration plan?`)) {
      return
    }

    setDeletingId(plan._id)
    setErrorMsg('')
    try {
      await rentalService.deleteRentalPlan(plan._id)
      setPlans((prev) => prev.filter((p) => p._id !== plan._id))
      setSuccessMsg(`Plan "${plan.label}" deleted successfully`)
      setTimeout(() => setSuccessMsg(''), 3000)
      onPlansUpdated?.()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete rental plan')
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    const numMonths = parseInt(months, 10)
    if (isNaN(numMonths) || numMonths < 1) {
      setErrorMsg('Duration in months must be at least 1')
      return
    }

    const numDiscount = parseFloat(discount)
    if (isNaN(numDiscount) || numDiscount < 0 || numDiscount > 90) {
      setErrorMsg('Discount must be between 0% and 90%')
      return
    }

    setIsSaving(true)
    setErrorMsg('')

    const payload = {
      months: numMonths,
      label: label.trim() || `${numMonths} Month${numMonths > 1 ? 's' : ''}`,
      discount: numDiscount,
      tag: tag.trim() || (numDiscount > 0 ? `${numDiscount}% OFF` : 'Standard Term'),
      isPopular,
      isActive,
      sortOrder: numMonths,
    }

    try {
      if (editingId) {
        const res = await rentalService.updateRentalPlan(editingId, payload)
        setPlans((prev) => prev.map((p) => (p._id === editingId ? res.data : p)))
        setSuccessMsg(`Plan "${payload.label}" updated successfully`)
      } else {
        const res = await rentalService.createRentalPlan(payload)
        setPlans((prev) => [...prev, res.data].sort((a, b) => a.months - b.months))
        setSuccessMsg(`New plan "${payload.label}" created successfully`)
      }
      resetForm()
      setTimeout(() => setSuccessMsg(''), 3000)
      onPlansUpdated?.()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save rental plan')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#e5e7eb] overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9] bg-[#fafbfc] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc1414]" />
              <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                Rental Duration Plans &amp; Discounts Configuration
              </h3>
            </div>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Control the selectable lease tenures, discount percentages, and tags displayed in the website rental modal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#9ca3af] hover:text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-[#dc1414] flex items-center justify-between">
              <span>{errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg('')} className="font-bold text-sm">
                &times;
              </button>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
              <span>✓ {successMsg}</span>
              <button type="button" onClick={() => setSuccessMsg('')} className="font-bold text-sm">
                &times;
              </button>
            </div>
          )}

          {/* Top Actions & Stats */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-[#6b7280]">
              Total Configured Plans:{' '}
              <strong className="text-[#111827]">{plans.length}</strong> ({plans.filter((p) => p.isActive).length} Active on Storefront)
            </div>
            {!isFormOpen && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#dc1414] hover:bg-[#b91c1c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>+</span>
                <span>Add New Duration Plan</span>
              </button>
            )}
          </div>

          {/* Add / Edit Form Card */}
          {isFormOpen && (
            <div className="p-4 rounded-xl border border-[#dc1414]/30 bg-[#fef2f2]/20 space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#991b1b]">
                  {editingId ? 'Edit Rental Duration Plan' : 'Add New Rental Duration Plan'}
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Duration (Months) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={months}
                      onChange={(e) => {
                        setMonths(e.target.value)
                        if (!editingId && !label) {
                          setLabel(`${e.target.value} Month${Number(e.target.value) > 1 ? 's' : ''}`)
                        }
                      }}
                      placeholder="e.g. 3"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:border-[#dc1414] outline-none bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Display Label *
                    </label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. 3 Months"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:border-[#dc1414] outline-none bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Discount % *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="90"
                      step="0.5"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:border-[#dc1414] outline-none bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Tag / Badge Subtitle
                    </label>
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => setTag(e.target.value)}
                      placeholder="e.g. 5% OFF or Popular"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:border-[#dc1414] outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="rounded border-gray-300 text-[#dc1414] focus:ring-[#dc1414] accent-[#dc1414]"
                    />
                    <span>Highlight as Popular (★)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 accent-emerald-600"
                    />
                    <span>Active on Website Storefront</span>
                  </label>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 rounded-lg bg-[#dc1414] hover:bg-[#b91c1c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                    >
                      {isSaving ? 'Saving...' : editingId ? 'Update Plan' : 'Create Plan'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Plans Table / Cards */}
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">
              <div className="w-8 h-8 rounded-full border-2 border-[#dc1414] border-t-transparent animate-spin mx-auto mb-2" />
              Loading database rental plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No rental duration plans found. Click &quot;Add New Duration Plan&quot; to create one.
            </div>
          ) : (
            <div className="rounded-xl border border-[#e5e7eb] overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e5e7eb] text-[#475569] font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Label &amp; Tag</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Popular</th>
                    <th className="py-3 px-4">Storefront Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {plans.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#111827]">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-extrabold text-[#111827]">
                            {p.months}M
                          </span>
                          <span>{p.months} Month{p.months > 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#111827]">{p.label}</div>
                        {p.tag && (
                          <span className="inline-block text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded mt-0.5">
                            {p.tag}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.discount > 0 ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {p.discount}% OFF
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium">0% (Base Rent)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.isPopular ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            ★ Popular
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-600' : 'bg-gray-400'}`}
                          />
                          <span>{p.isActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(p)}
                            className="px-2.5 py-1 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === p._id}
                            onClick={() => handleDelete(p)}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === p._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Helper Info Note */}
          <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#f1f5f9] text-[11.5px] text-[#6b7280] leading-relaxed">
            <strong className="text-[#111827]">Live Sync Guarantee:</strong> Any changes made here are saved directly to MongoDB Atlas. When a customer opens the rental agreement modal on the website, they immediately see the updated durations, custom labels, and recalculated discounts in real time.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-[#f1f5f9] bg-[#fafbfc] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close Configuration
          </button>
        </div>
      </div>
    </div>
  )
}
