import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, X, Loader2, Check, AlertCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useRegion } from '../context/RegionContext'

export default function PromoCode({ compact = false }: { compact?: boolean }) {
  const { cart, applyPromoCode, removePromoCode, isMedusaConnected } = useCart()
  const { formatPrice } = useRegion()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const appliedCodes = cart?.promotions?.map(p => p.code).filter(Boolean) || []
  const discountTotal = cart?.discount_total || 0

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    if (appliedCodes.includes(trimmed)) {
      setError('Dieser Code wurde bereits eingelöst.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    const result = await applyPromoCode(trimmed)
    if (result.success) {
      setSuccess(true)
      setCode('')
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || 'Ungültiger Gutscheincode.')
    }
    setLoading(false)
  }

  const handleRemove = async (promoCode: string) => {
    await removePromoCode(promoCode)
  }

  if (!isMedusaConnected) return null

  return (
    <div className={compact ? '' : 'bg-f-gray/20 border border-f-border/20 p-5 rounded-sm'}>
      {!compact && (
        <div className="flex items-center gap-2 mb-3">
          <Tag size={14} className="text-f-green-light" />
          <p className="text-[11px] uppercase tracking-[0.15em] text-f-muted font-medium">Gutscheincode</p>
        </div>
      )}

      {/* Applied promo codes */}
      <AnimatePresence>
        {appliedCodes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 space-y-2"
          >
            {appliedCodes.map(promoCode => (
              <div
                key={promoCode}
                className="flex items-center justify-between bg-f-green/10 border border-f-green/25 px-3 py-2 rounded-sm"
              >
                <div className="flex items-center gap-2">
                  <Check size={13} className="text-f-green-light" />
                  <span className="text-[13px] text-f-green-light font-medium">{promoCode}</span>
                </div>
                <button
                  onClick={() => handleRemove(promoCode)}
                  className="text-f-muted/50 hover:text-red-400 transition-colors p-0.5"
                  aria-label="Code entfernen"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {discountTotal > 0 && (
              <p className="text-f-green-light text-[13px] font-medium">
                Rabatt: -{formatPrice(discountTotal)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input form */}
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
          placeholder="Gutscheincode eingeben"
          className="flex-1 bg-f-gray/50 border border-f-border/40 px-4 py-2.5 text-[13px] text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-f-green/60 transition-all duration-300 rounded-sm uppercase tracking-wide"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="px-5 py-2.5 bg-f-green/20 border border-f-green/40 text-f-green-light text-[11px] uppercase tracking-[0.15em] font-medium hover:bg-f-green/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-sm flex items-center gap-1.5"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : null}
          {success ? <Check size={13} /> : null}
          Einlösen
        </button>
      </form>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mt-2 text-red-400 text-[12px]">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
