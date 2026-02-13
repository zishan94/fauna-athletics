import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useStoreSettings } from '../hooks/useStoreSettings'

const DISMISS_KEY = 'fauna_banner_dismissed'
const DEFAULT_MESSAGES = [
  'KOSTENLOSER VERSAND AB CHF 69.-',
  'HERGESTELLT IN PORTUGAL',
  'NACHHALTIG & FAIR',
  '14 TAGE RÜCKGABERECHT',
]

export default function TopBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      const val = localStorage.getItem(DISMISS_KEY)
      // Re-show after 24 hours
      if (val) {
        const ts = parseInt(val, 10)
        return Date.now() - ts < 24 * 60 * 60 * 1000
      }
    } catch {}
    return false
  })
  const { freeShippingThreshold } = useStoreSettings()

  const messages = DEFAULT_MESSAGES.map(m =>
    m.includes('CHF 69') ? `KOSTENLOSER VERSAND AB CHF ${freeShippingThreshold}.-` : m
  )

  // Rotating message for mobile (single message shown)
  const [currentMsg, setCurrentMsg] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMsg(prev => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [messages.length])

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {}
  }

  // Build marquee items with separators
  const items = messages.flatMap(m => [m, '\u00B7'])

  return (
    <div className="bg-gradient-to-r from-f-green-dark via-f-green to-f-green-dark overflow-hidden py-2 relative z-50 group">
      {/* Desktop: marquee */}
      <div className="hidden sm:flex whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className={`mx-3 text-[10px] font-medium uppercase tracking-[0.25em] ${
            item === '\u00B7' ? 'text-white/40' : 'text-white/90'
          }`}>{item}</span>
        ))}
      </div>
      {/* Mobile: rotating single message */}
      <div className="sm:hidden text-center px-10">
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/90 transition-opacity duration-500">
          {messages[currentMsg]}
        </span>
      </div>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Banner schliessen"
      >
        <X size={12} />
      </button>
    </div>
  )
}
