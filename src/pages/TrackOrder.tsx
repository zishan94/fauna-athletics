import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Package, Loader2, AlertTriangle, MapPin, CreditCard, Truck, ExternalLink } from 'lucide-react'
import { useRegion } from '../context/RegionContext'
import { sdk } from '../lib/sdk'
import { OrderTimeline } from './OrderDetail'
import type { OrderData } from './OrderDetail'

const GUEST_ORDERS_KEY = 'fauna_guest_orders'

interface GuestOrderRef {
  orderId: string
  email: string
  date: string
}

function loadGuestOrders(): GuestOrderRef[] {
  try {
    const saved = localStorage.getItem(GUEST_ORDERS_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveGuestOrder(orderId: string, email: string) {
  const existing = loadGuestOrders()
  const updated = [{ orderId, email, date: new Date().toISOString() }, ...existing.filter(o => o.orderId !== orderId)].slice(0, 10)
  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(updated))
}

export default function TrackOrder() {
  const { formatPrice } = useRegion()
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [guestOrders] = useState<GuestOrderRef[]>(loadGuestOrders)

  // Auto-populate from most recent guest order
  useEffect(() => {
    if (guestOrders.length > 0 && !orderId && !email) {
      setOrderId(guestOrders[0].orderId)
      setEmail(guestOrders[0].email)
    }
  }, [guestOrders])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const res = await sdk.store.order.retrieve(orderId.trim(), {
        fields: '+items,+items.variant,+shipping_methods,+shipping_address,+fulfillments,+fulfillments.tracking_links',
      } as any) as any
      const fetchedOrder = res.order || res

      // Verify email matches (basic security for guest lookups)
      if (email && fetchedOrder.email && fetchedOrder.email.toLowerCase() !== email.toLowerCase()) {
        setError('Die E-Mail-Adresse stimmt nicht mit der Bestellung überein.')
        return
      }

      setOrder(fetchedOrder)
    } catch (err: any) {
      console.error('Order lookup failed:', err)
      setError('Bestellung nicht gefunden. Bitte überprüfe die Bestellnummer und E-Mail-Adresse.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-f-gray/50 border border-f-border/40 px-5 py-3.5 text-[14px] text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/70 transition-all duration-300 rounded-sm"

  // Gather tracking info
  const trackingLinks: { number: string; url?: string }[] = []
  order?.fulfillments?.forEach((f: any) => {
    f.tracking_links?.forEach((t: any) => {
      trackingLinks.push({ number: t.tracking_number || t.number, url: t.url })
    })
  })

  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-[700px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-f-green/10 border border-f-green/25 flex items-center justify-center mx-auto mb-5">
              <Package size={24} className="text-f-green-light" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl tracking-[0.02em] mb-3">BESTELLUNG VERFOLGEN</h1>
            <p className="text-f-muted text-[15px] max-w-md mx-auto">
              Gib deine Bestellnummer und E-Mail-Adresse ein, um den Status deiner Bestellung einzusehen.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-f-gray/40 border border-f-border/25 p-6 md:p-8 mb-8 shadow-lg shadow-black/5">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Bestellnummer *</label>
                <input
                  value={orderId}
                  onChange={e => setOrderId(e.target.value)}
                  placeholder="z.B. order_01J..."
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">E-Mail-Adresse *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="deine@email.ch"
                  className={inputClass}
                  required
                />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2.5 mt-4 bg-red-900/20 border border-red-500/30 p-4 rounded-sm">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-[13px]">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !orderId.trim() || !email.trim()}
              className="btn-shimmer group relative overflow-hidden w-full bg-f-green text-white py-4 text-[12px] uppercase tracking-[0.2em] font-medium mt-6 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-40"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                {loading ? 'Suche...' : 'Bestellung suchen'}
              </span>
              <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </form>

          {/* Recent Guest Orders */}
          {!order && guestOrders.length > 1 && (
            <div className="mb-8">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-3 font-medium">Letzte Bestellungen</h3>
              <div className="space-y-2">
                {guestOrders.slice(0, 5).map(ref => (
                  <button
                    key={ref.orderId}
                    onClick={() => { setOrderId(ref.orderId); setEmail(ref.email) }}
                    className="w-full text-left bg-f-gray/30 border border-f-border/20 p-4 hover:border-f-green/20 hover:bg-f-gray/50 transition-all duration-300 text-[13px] rounded-sm"
                  >
                    <span className="text-f-text font-medium">{ref.orderId.slice(0, 20)}...</span>
                    <span className="text-f-muted ml-3">{new Date(ref.date).toLocaleDateString('de-CH')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Order Results */}
          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-2xl tracking-[0.02em]">
                    BESTELLUNG #{order.display_id || order.id?.slice(-8)}
                  </h2>
                  <p className="text-f-muted text-[13px] mt-1">
                    {order.created_at && new Date(order.created_at).toLocaleDateString('de-CH', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`inline-block px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm ${
                  order.status === 'canceled' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                  order.status === 'completed' ? 'bg-f-green/15 text-f-green-light border border-f-green/30' :
                  'bg-f-gray border border-f-border/30 text-f-muted'
                }`}>
                  {order.status === 'canceled' ? 'Storniert' :
                   order.status === 'completed' ? 'Abgeschlossen' : 'Offen'}
                </span>
              </div>

              {/* Timeline */}
              <div className="bg-f-gray/40 border border-f-border/25 p-8 mb-6 shadow-lg shadow-black/5">
                <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-6 font-medium">Bestellstatus</h3>
                <OrderTimeline order={order} />
              </div>

              {/* Tracking Numbers */}
              {trackingLinks.length > 0 && (
                <div className="bg-f-green/5 border border-f-green/20 p-6 mb-6 rounded-sm">
                  <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-green-light mb-3 font-medium flex items-center gap-2">
                    <Truck size={14} /> Sendungsverfolgung
                  </h3>
                  <div className="space-y-2">
                    {trackingLinks.map((t, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[14px] font-mono">{t.number}</span>
                        {t.url && (
                          <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-f-green-light hover:underline text-[13px] flex items-center gap-1">
                            Verfolgen <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Shipping Address */}
                {order.shipping_address && (
                  <div className="bg-f-gray/40 border border-f-border/25 p-6 hover:border-f-border/40 transition-colors duration-300">
                    <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-3 font-medium flex items-center gap-2">
                      <MapPin size={14} className="text-f-green-light" /> Lieferadresse
                    </h3>
                    <p className="text-[14px]">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                    <p className="text-f-muted text-[13px]">{order.shipping_address.address_1}</p>
                    <p className="text-f-muted text-[13px]">{order.shipping_address.postal_code} {order.shipping_address.city}</p>
                  </div>
                )}

                {/* Payment */}
                <div className="bg-f-gray/40 border border-f-border/25 p-6 hover:border-f-border/40 transition-colors duration-300">
                  <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-3 font-medium flex items-center gap-2">
                    <CreditCard size={14} className="text-f-green-light" /> Zusammenfassung
                  </h3>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-f-muted">Zwischensumme</span>
                      <span>{formatPrice(order.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-f-muted">Versand</span>
                      <span>{formatPrice(order.shipping_total || 0)}</span>
                    </div>
                    <div className="border-t border-f-border/20 pt-2 mt-2">
                      <div className="flex justify-between text-[15px] font-semibold">
                        <span>Total</span>
                        <span className="text-f-sand">{formatPrice(order.total || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-f-gray/40 border border-f-border/25 p-6">
                <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-4 font-medium">
                  Artikel ({order.items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 py-2">
                      <div className="w-14 h-16 bg-f-gray flex-shrink-0 overflow-hidden">
                        {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium truncate">{item.title}</p>
                        <p className="text-f-muted text-[12px]">x{item.quantity}</p>
                      </div>
                      <span className="text-[14px] font-semibold">{formatPrice(item.total ?? item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Help text */}
          {!order && (
            <div className="text-center">
              <p className="text-f-muted/60 text-[13px]">
                Du findest deine Bestellnummer in der Bestätigungs-E-Mail.
              </p>
              <Link to="/account" className="text-f-green-light text-[12px] uppercase tracking-[0.15em] hover:underline mt-4 inline-block">
                Oder melde dich in deinem Konto an
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
