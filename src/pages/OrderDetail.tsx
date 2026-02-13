import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Loader2, AlertTriangle, ExternalLink, XCircle } from 'lucide-react'
import { useRegion } from '../context/RegionContext'
import { sdk } from '../lib/sdk'

interface OrderData {
  id: string
  display_id?: number
  email?: string
  total?: number
  subtotal?: number
  shipping_total?: number
  tax_total?: number
  discount_total?: number
  status?: string
  fulfillment_status?: string
  payment_status?: string
  items?: any[]
  shipping_address?: any
  billing_address?: any
  shipping_methods?: any[]
  fulfillments?: any[]
  payment_collections?: any[]
  created_at?: string
  currency_code?: string
}

/** Map Medusa payment provider IDs to user-friendly German labels */
function getPaymentMethodLabel(order: OrderData): string | null {
  const collections = order.payment_collections || []
  for (const col of collections) {
    const payments = col.payments || col.payment_sessions || []
    for (const p of payments) {
      const provider = p.provider_id || ''
      if (provider.includes('stripe')) return 'Kreditkarte (Stripe)'
      if (provider.includes('paypal')) return 'PayPal'
      if (provider.includes('klarna')) return 'Klarna'
      if (provider.includes('twint')) return 'TWINT'
      if (provider.includes('manual')) return 'Manuelle Zahlung'
      if (provider.includes('system_default')) return 'Standardzahlung'
      if (provider) return provider.replace(/^pp_/, '').replace(/_/g, ' ')
    }
  }
  return null
}

const ORDER_STEPS = [
  { key: 'placed', label: 'Bestellt', icon: Clock },
  { key: 'processing', label: 'In Bearbeitung', icon: Package },
  { key: 'shipped', label: 'Versendet', icon: Truck },
  { key: 'delivered', label: 'Zugestellt', icon: CheckCircle },
]

function getOrderStep(order: OrderData): number {
  const hasFulfillment = order.fulfillments && order.fulfillments.length > 0
  const allFulfilled = hasFulfillment && order.fulfillments!.every((f: any) =>
    f.shipped_at || f.delivered_at
  )
  const anyDelivered = hasFulfillment && order.fulfillments!.some((f: any) => f.delivered_at)

  if (order.status === 'canceled') return -1
  if (anyDelivered) return 3
  if (allFulfilled) return 2
  if (hasFulfillment) return 2
  if (order.fulfillment_status === 'shipped' || order.fulfillment_status === 'delivered') return 2
  if (order.fulfillment_status === 'partially_shipped') return 2
  if (order.status === 'completed' || order.status === 'archived') return 3
  if (order.payment_status === 'captured' || order.payment_status === 'paid') return 1
  return 0
}

function OrderTimeline({ order }: { order: OrderData }) {
  const currentStep = getOrderStep(order)
  const isCanceled = order.status === 'canceled'

  if (isCanceled) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 p-6 rounded-sm flex items-center gap-4">
        <XCircle size={24} className="text-red-400 flex-shrink-0" />
        <div>
          <p className="text-red-300 font-medium text-[15px]">Bestellung storniert</p>
          <p className="text-red-400/70 text-[13px] mt-1">Diese Bestellung wurde storniert.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between relative px-2">
      {/* Background progress line */}
      <div className="absolute top-5 left-5 right-5 h-[2px] bg-f-border/20" />
      {/* Animated progress fill */}
      <motion.div
        className="absolute top-5 left-5 h-[2px] bg-gradient-to-r from-f-green to-f-green-light"
        initial={{ width: 0 }}
        animate={{ width: `calc(${(currentStep / (ORDER_STEPS.length - 1)) * 100}% - 40px)` }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
      {ORDER_STEPS.map((step, i) => {
        const Icon = step.icon
        const isComplete = i <= currentStep
        const isCurrent = i === currentStep
        return (
          <motion.div
            key={step.key}
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.12 }}
          >
            <div className="relative">
              {/* Pulsing ring for current step */}
              {isCurrent && (
                <motion.div
                  className="absolute -inset-1.5 rounded-full bg-f-green/20"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                isComplete
                  ? 'bg-f-green text-white shadow-md shadow-f-green/20'
                  : 'bg-f-gray border border-f-border/40 text-f-muted/50'
              }`}>
                <Icon size={16} />
              </div>
            </div>
            <span className={`text-[10px] uppercase tracking-[0.12em] mt-3 whitespace-nowrap ${
              isComplete ? 'text-f-green-light font-medium' : 'text-f-muted/40'
            }`}>{step.label}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

export { OrderTimeline, getOrderStep, ORDER_STEPS }
export type { OrderData }

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { formatPrice } = useRegion()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    sdk.store.order.retrieve(id, {
      fields: '+items,+items.variant,+shipping_methods,+shipping_address,+fulfillments,+fulfillments.tracking_links,+payment_collections,+payment_collections.payments',
    } as any)
      .then((res: any) => {
        setOrder(res.order || res)
      })
      .catch((err: any) => {
        console.error('Failed to fetch order:', err)
        setError('Bestellung konnte nicht geladen werden.')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="py-20 md:py-28 px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-f-green/10 border border-f-green/20 flex items-center justify-center mb-4">
            <Loader2 size={28} className="text-f-green-light animate-spin" />
          </div>
          <p className="text-f-muted text-[14px]">Bestelldetails werden geladen...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="py-20 md:py-28 px-6 lg:px-8">
        <div className="max-w-[900px] mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-500/20 mx-auto flex items-center justify-center mb-5">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <h2 className="font-heading text-2xl mb-3">BESTELLUNG NICHT GEFUNDEN</h2>
          <p className="text-f-muted text-[15px] mb-6 max-w-sm mx-auto">{error || 'Die Bestellung konnte nicht gefunden werden.'}</p>
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-f-green-light text-[12px] uppercase tracking-[0.2em] hover:underline"
          >
            <ArrowLeft size={14} /> Zurück zum Konto
          </Link>
        </div>
      </div>
    )
  }

  // Gather tracking info
  const trackingLinks: { number: string; url?: string }[] = []
  order.fulfillments?.forEach((f: any) => {
    f.tracking_links?.forEach((t: any) => {
      trackingLinks.push({ number: t.tracking_number || t.number, url: t.url })
    })
  })

  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-[900px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Back link */}
          <Link to="/account" className="inline-flex items-center gap-2 text-f-muted hover:text-f-green-light text-[13px] mb-8 transition-colors">
            <ArrowLeft size={14} /> Zurück zum Konto
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl tracking-[0.02em]">
                BESTELLUNG #{order.display_id || order.id.slice(-8)}
              </h1>
              <p className="text-f-muted text-[13px] mt-1.5">
                {order.created_at && new Date(order.created_at).toLocaleDateString('de-CH', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`inline-block px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm ${
                order.status === 'canceled' ? 'bg-red-900/30 text-red-400 border border-red-500/30' :
                order.status === 'completed' ? 'bg-f-green/15 text-f-green-light border border-f-green/30' :
                'bg-f-gray border border-f-border/30 text-f-muted'
              }`}>
                {order.status === 'canceled' ? 'Storniert' :
                 order.status === 'completed' ? 'Abgeschlossen' :
                 order.status === 'archived' ? 'Archiviert' : 'Offen'}
              </span>
            </div>
          </div>

          <div className="accent-line mb-8" />

          {/* Order Timeline */}
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
                <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-4 font-medium flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-f-green/10 flex items-center justify-center">
                    <MapPin size={12} className="text-f-green-light" />
                  </div>
                  Lieferadresse
                </h3>
                <p className="text-[14px] font-medium">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                <p className="text-f-muted text-[13px] mt-1">{order.shipping_address.address_1}</p>
                {order.shipping_address.address_2 && <p className="text-f-muted text-[13px]">{order.shipping_address.address_2}</p>}
                <p className="text-f-muted text-[13px]">{order.shipping_address.postal_code} {order.shipping_address.city}</p>
                <p className="text-f-muted text-[13px]">{order.shipping_address.country_code?.toUpperCase()}</p>
              </div>
            )}

            {/* Payment & Summary */}
            <div className="bg-f-gray/40 border border-f-border/25 p-6 hover:border-f-border/40 transition-colors duration-300">
              <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-4 font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-f-green/10 flex items-center justify-center">
                  <CreditCard size={12} className="text-f-green-light" />
                </div>
                Zahlung
              </h3>
              <div className="space-y-2.5 text-[13px]">
                {getPaymentMethodLabel(order) && (
                  <div className="flex justify-between mb-1">
                    <span className="text-f-muted">Zahlungsart</span>
                    <span className="font-medium">{getPaymentMethodLabel(order)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-f-muted">Zwischensumme</span>
                  <span>{formatPrice(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-f-muted">Versand</span>
                  <span>{formatPrice(order.shipping_total || 0)}</span>
                </div>
                {(order.discount_total || 0) > 0 && (
                  <div className="flex justify-between text-f-green-light">
                    <span>Rabatt</span>
                    <span>-{formatPrice(order.discount_total || 0)}</span>
                  </div>
                )}
                <div className="border-t border-f-border/20 pt-2.5 mt-2">
                  <div className="flex justify-between text-[16px] font-bold">
                    <span>Total</span>
                    <span className="text-f-sand">{formatPrice(order.total || 0)}</span>
                  </div>
                  <p className="text-f-muted/60 text-[11px] mt-1.5 text-right">
                    inkl. {formatPrice(order.tax_total || Math.round(((order.total || 0) * 0.081 / 1.081) * 100) / 100)} MWST (8.1%)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-f-gray/40 border border-f-border/25 p-6">
            <h3 className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-4 font-medium">
              Artikel ({order.items?.length || 0})
            </h3>
            <div className="space-y-0">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-f-border/10 last:border-0 hover:bg-white/[0.01] transition-colors duration-200 -mx-2 px-2 rounded-sm">
                  <div className="w-16 h-20 bg-f-gray flex-shrink-0 overflow-hidden rounded-sm">
                    {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium truncate">{item.title}</p>
                    {item.variant?.title && item.variant.title !== 'Default' && (
                      <p className="text-f-muted text-[12px] mt-0.5">{item.variant.title}</p>
                    )}
                    <p className="text-f-muted text-[12px] mt-0.5">Menge: {item.quantity}</p>
                  </div>
                  <span className="text-[14px] font-semibold">{formatPrice(item.total ?? item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
