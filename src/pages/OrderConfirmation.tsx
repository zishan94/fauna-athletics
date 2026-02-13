import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Home, Loader2, AlertTriangle, Search, Copy, Check, Mail, ShieldCheck } from 'lucide-react'
import { useRegion } from '../context/RegionContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { sdk } from '../lib/sdk'
import { notifyOrderPlaced } from '../lib/notifications'
import { saveGuestOrder } from './TrackOrder'

interface OrderData {
  id?: string
  display_id?: number
  email?: string
  total?: number
  items?: any[]
  shipping_address?: any
  currency_code?: string
}

export default function OrderConfirmation() {
  const location = useLocation()
  const { orderId } = useParams<{ orderId?: string }>()
  const { formatPrice } = useRegion()
  const { completeCart, cart, loading: cartLoading, isMedusaConnected } = useCart()
  const { isAuthenticated } = useAuth()

  // Order data from route state (passed immediately after cart.complete)
  const stateOrder = (location.state as any)?.order?.order as OrderData | undefined

  // Detect Stripe redirect (TWINT, Klarna, etc.) from query params
  const isStripeRedirect = new URLSearchParams(location.search).has('payment_intent')

  const [order, setOrder] = useState<OrderData | null>(stateOrder ?? null)
  const [loading, setLoading] = useState(!stateOrder && (!!orderId || isStripeRedirect))
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Prevent double-completion in React StrictMode / multiple renders
  const completionAttempted = useRef(false)

  const copyOrderId = useCallback(() => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }, [order?.id])

  // ── Handle Stripe redirect (TWINT, Klarna, Apple Pay, Google Pay, etc.) ──
  useEffect(() => {
    if (stateOrder || orderId || order) return
    if (completionAttempted.current) return

    const params = new URLSearchParams(location.search)
    const redirectStatus = params.get('redirect_status')
    const paymentIntent = params.get('payment_intent')

    if (!redirectStatus || !paymentIntent) {
      setLoading(false)
      return
    }

    if (redirectStatus === 'failed' || redirectStatus === 'requires_payment_method') {
      setLoading(false)
      setError('Zahlung fehlgeschlagen. Bitte kehre zurück und versuche es erneut.')
      return
    }

    if (cartLoading) return

    if (!cart || !isMedusaConnected) {
      setLoading(false)
      setError(
        'Deine Zahlung war erfolgreich, aber wir konnten die Bestellung nicht zuordnen. ' +
        'Bitte überprüfe deinen E-Mail-Eingang oder kontaktiere den Support.'
      )
      return
    }

    completionAttempted.current = true
    setLoading(true)
    setError(null)

    completeCart()
      .then((result: any) => {
        if (result?.type === 'order' && result?.order) {
          setOrder(result.order)
          notifyOrderPlaced()
        } else {
          setError('Unerwartete Antwort beim Abschliessen der Bestellung. Bitte kontaktiere den Support.')
        }
      })
      .catch((err: any) => {
        console.error('Failed to complete cart after payment redirect:', err)
        setError(
          'Deine Zahlung war erfolgreich, aber die Bestellung konnte nicht abgeschlossen werden. ' +
          'Bitte kontaktiere den Support mit deiner Zahlungsreferenz: ' + paymentIntent
        )
      })
      .finally(() => setLoading(false))
  }, [location.search, stateOrder, orderId, order, cart, cartLoading, isMedusaConnected, completeCart])

  // If we don't have order data from route state, fetch it from Medusa by ID
  useEffect(() => {
    if (stateOrder || !orderId) return

    setLoading(true)
    setError(null)
    sdk.store.order.retrieve(orderId)
      .then((res: any) => {
        if (res?.order) {
          setOrder(res.order)
        } else {
          setError('Bestellung konnte nicht geladen werden.')
        }
      })
      .catch((err: any) => {
        console.error('Failed to fetch order:', err)
        setError('Bestellung nicht gefunden. Möglicherweise ist die Bestellnummer ungültig.')
      })
      .finally(() => setLoading(false))
  }, [orderId, stateOrder])

  // Save guest order reference for tracking
  useEffect(() => {
    const o = order || stateOrder
    if (o?.id && o?.email) {
      saveGuestOrder(o.id, o.email)
    }
  }, [order, stateOrder])

  // Loading state
  if (loading) {
    return (
      <div className="py-20 md:py-32 px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-20 h-20 rounded-full bg-f-green/10 border border-f-green/20 mx-auto flex items-center justify-center mb-6">
              <Loader2 size={32} className="text-f-green-light animate-spin" />
            </div>
            <h2 className="font-heading text-2xl tracking-[0.02em] mb-3">BESTELLUNG WIRD VERARBEITET</h2>
            <p className="text-f-muted text-[15px]">Deine Zahlung wird bestätigt, bitte warte einen Moment...</p>
          </motion.div>
        </div>
      </div>
    )
  }

  // Error state / no order found
  if (error || (!order && !stateOrder)) {
    return (
      <div className="py-20 md:py-32 px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="w-20 h-20 rounded-full bg-red-900/20 border border-red-500/20 mx-auto flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h1 className="font-heading text-3xl tracking-[0.02em] mb-3">BESTELLUNG NICHT GEFUNDEN</h1>
            <p className="text-f-muted text-[15px] mb-8 max-w-md mx-auto leading-relaxed">
              {error || 'Es wurden keine Bestelldaten gefunden. Bitte überprüfe den Link oder kontaktiere den Support.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="btn-shimmer group relative overflow-hidden bg-f-green text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/20 transition-shadow duration-500"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Zum Shop <ArrowRight size={14} />
                </span>
                <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
              <Link
                to="/"
                className="border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter px-8 py-4 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
              >
                <Home size={14} /> Zur Startseite
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 md:py-32 px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-10"
        >
          {/* Animated success icon with rings */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full bg-f-green/5"
              initial={{ scale: 0 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-f-green/8"
              initial={{ scale: 0 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-f-green/20 to-f-green/5 border-2 border-f-green/30 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle size={52} className="text-f-green-light" />
              </motion.div>
            </div>
          </div>

          <motion.h1
            className="font-heading text-5xl md:text-6xl tracking-[0.02em] mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            VIELEN DANK!
          </motion.h1>
          <motion.p
            className="text-f-muted text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Deine Bestellung wurde erfolgreich aufgegeben.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="space-y-5"
        >
          {/* Order Details Card */}
          <div className="bg-f-gray/40 border border-f-border/30 p-6 md:p-8 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-f-green/15 flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-f-green-light" />
              </div>
              <h2 className="font-heading text-xl tracking-[0.05em]">BESTELLDETAILS</h2>
            </div>

            <div className="space-y-0">
              {order?.display_id && (
                <div className="flex justify-between items-center py-3 border-b border-f-border/15">
                  <span className="text-f-muted text-[14px]">Bestellnummer</span>
                  <span className="text-[15px] font-semibold text-f-green-light">#{order.display_id}</span>
                </div>
              )}
              {order?.email && (
                <div className="flex justify-between items-center py-3 border-b border-f-border/15">
                  <span className="text-f-muted text-[14px]">E-Mail</span>
                  <span className="text-[14px]">{order.email}</span>
                </div>
              )}
              {order?.total != null && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-f-muted text-[14px]">Total</span>
                  <span className="text-[17px] font-bold text-f-sand">{formatPrice(order.total)}</span>
                </div>
              )}
            </div>

            {/* Order items */}
            {order?.items && order.items.length > 0 && (
              <div className="mt-5 pt-5 border-t border-f-border/15">
                <p className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-4 font-medium">
                  Artikel ({order.items.length})
                </p>
                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3.5">
                      {item.thumbnail && (
                        <div className="w-12 h-14 bg-f-gray flex-shrink-0 overflow-hidden rounded-sm">
                          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] truncate font-medium">{item.title}</p>
                        <p className="text-f-muted text-[12px]">Menge: {item.quantity}</p>
                      </div>
                      <span className="text-[14px] font-medium">{formatPrice(item.total ?? item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order ID with Copy Button — more prominent for guests */}
          {order?.id && (
            <div className={`border p-5 md:p-6 text-left rounded-sm ${
              !isAuthenticated
                ? 'bg-f-green/5 border-f-green/25'
                : 'bg-f-gray/30 border-f-border/20'
            }`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-f-muted font-medium mb-1">
                    {!isAuthenticated ? 'Wichtig: Bestellnummer speichern' : 'Deine Bestellnummer'}
                  </p>
                  {!isAuthenticated && (
                    <p className="text-[13px] text-f-muted/70 leading-relaxed">
                      Speichere diese Nummer, um den Status deiner Bestellung jederzeit zu verfolgen.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="flex-1 text-[13px] font-mono text-f-text bg-f-black/50 px-4 py-3 border border-f-border/20 rounded-sm break-all select-all">
                  {order.id}
                </p>
                <button
                  onClick={copyOrderId}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-[11px] uppercase tracking-[0.15em] font-medium border rounded-sm transition-all duration-300 ${
                    copied
                      ? 'bg-f-green/15 border-f-green/40 text-f-green-light'
                      : 'bg-f-gray/50 border-f-border/30 text-f-muted hover:text-f-text hover:border-f-lighter'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Kopiert' : 'Kopieren'}
                </button>
              </div>
            </div>
          )}

          {/* Confirmation info */}
          <div className="bg-f-gray/30 border border-f-border/20 p-5 md:p-6 rounded-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-full bg-f-green/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={15} className="text-f-green-light" />
              </div>
              <div>
                <p className="text-[14px] font-medium mb-1.5">Bestätigungs-E-Mail</p>
                <p className="text-[13px] text-f-muted leading-relaxed">
                  Eine Bestätigungs-E-Mail wird in Kürze an <span className="text-f-text">{order?.email || 'deine E-Mail-Adresse'}</span> gesendet.
                  Du kannst den Status deiner Bestellung jederzeit{' '}
                  <Link to="/track-order" className="text-f-green-light hover:underline">verfolgen</Link>
                  {isAuthenticated && (
                    <>
                      {' '}oder in deinem{' '}
                      <Link to="/account" className="text-f-green-light hover:underline">Konto</Link>
                    </>
                  )}
                  {' '}einsehen.
                </p>
              </div>
            </div>
          </div>

          {/* Trust / security badge */}
          <div className="flex items-center justify-center gap-6 py-3 text-f-muted/50">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck size={13} />
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <CheckCircle size={13} />
              <span>Sichere Bezahlung</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              to="/track-order"
              className="btn-shimmer group relative overflow-hidden bg-f-green text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/20 transition-shadow duration-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Search size={14} /> Bestellung verfolgen
              </span>
              <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
            <Link
              to="/shop"
              className="border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter px-8 py-4 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
            >
              Weiter shoppen <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
