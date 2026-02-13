import { useState, useEffect } from 'react'

interface StoreSettings {
  /** Free shipping threshold in CHF (e.g. 69) */
  freeShippingThreshold: number
  loading: boolean
}

const DEFAULT_FREE_SHIPPING_THRESHOLD = 69

let cachedSettings: { freeShippingThreshold: number } | null = null

/**
 * Fetches configurable store settings from the Medusa backend.
 * Falls back to sensible defaults (CHF 69 free shipping) if backend is unavailable.
 */
export function useStoreSettings(): StoreSettings {
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    cachedSettings?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD
  )
  const [loading, setLoading] = useState(!cachedSettings)

  useEffect(() => {
    if (cachedSettings) {
      setFreeShippingThreshold(cachedSettings.freeShippingThreshold)
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchSettings = async () => {
      try {
        const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ''
        const res = await fetch('/store/settings', {
          headers: {
            'x-publishable-api-key': publishableKey,
          },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        if (!cancelled) {
          // Threshold comes from backend in cents (e.g. 6900) or direct CHF (e.g. 69)
          const raw = data.free_shipping_threshold
          const threshold = typeof raw === 'number'
            ? (raw >= 1000 ? raw / 100 : raw) // If >= 1000 treat as cents
            : DEFAULT_FREE_SHIPPING_THRESHOLD

          cachedSettings = { freeShippingThreshold: threshold }
          setFreeShippingThreshold(threshold)
        }
      } catch {
        // Backend unavailable — use defaults
        if (!cancelled) {
          cachedSettings = { freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSettings()
    return () => { cancelled = true }
  }, [])

  return { freeShippingThreshold, loading }
}
