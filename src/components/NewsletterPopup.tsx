import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Gift } from 'lucide-react'
import { notifyNewsletter } from '../lib/notifications'

const POPUP_KEY = 'fauna_nl_popup'
const SUBSCRIBED_KEY = 'fauna_nl_subscribed'
const POPUP_DELAY = 25000 // 25 seconds

export default function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Don't show if already subscribed or recently dismissed
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY)) return
      const dismissed = localStorage.getItem(POPUP_KEY)
      if (dismissed) {
        const ts = parseInt(dismissed, 10)
        // Re-show after 3 days
        if (Date.now() - ts < 3 * 24 * 60 * 60 * 1000) return
      }
    } catch {}

    const timer = setTimeout(() => setShow(true), POPUP_DELAY)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(POPUP_KEY, String(Date.now()))
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setSuccess(true)
      notifyNewsletter()
      try {
        localStorage.setItem(SUBSCRIBED_KEY, '1')
      } catch {}
      setTimeout(() => setShow(false), 3000)
    } catch {
      // Silently fail
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-f-dark border border-f-border/30 overflow-hidden shadow-2xl">
              {/* Close */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-f-muted hover:text-f-text transition-colors"
                aria-label="Schliessen"
              >
                <X size={18} />
              </button>

              {/* Decorative top bar */}
              <div className="h-1 bg-gradient-to-r from-f-green-dark via-f-green to-f-green-dark" />

              <div className="px-8 py-10 text-center">
                {/* Icon */}
                <div className="w-14 h-14 mx-auto mb-5 bg-f-green/10 border border-f-green/25 rounded-full flex items-center justify-center">
                  <Gift size={24} className="text-f-green-light" />
                </div>

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <h3 className="font-heading text-3xl tracking-[0.02em]">WILLKOMMEN IM RUDEL!</h3>
                    <p className="text-f-muted text-[14px]">Dein 10% Rabattcode kommt per E-Mail.</p>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="font-heading text-3xl tracking-[0.02em] mb-2">10% RABATT</h3>
                    <p className="text-f-muted text-[14px] leading-relaxed mb-6">
                      Melde dich für unseren Newsletter an und erhalte<br />
                      <span className="text-f-gold-light font-medium">10% auf deine erste Bestellung.</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-f-muted/50" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="Deine E-Mail-Adresse"
                          required
                          className="w-full bg-f-gray/50 border border-f-border/40 pl-11 pr-5 py-3.5 text-[14px] text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-f-green/60 transition-all duration-300 rounded-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-shimmer group relative overflow-hidden w-full bg-f-green text-white py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-50"
                      >
                        <span className="relative z-10">
                          {submitting ? 'Wird angemeldet...' : 'Jetzt 10% sichern'}
                        </span>
                        <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      </button>
                    </form>

                    <button
                      onClick={handleDismiss}
                      className="mt-4 text-f-muted/50 text-[12px] hover:text-f-muted transition-colors"
                    >
                      Nein danke, ich zahle den vollen Preis
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
