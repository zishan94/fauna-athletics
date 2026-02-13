import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, Lock, Truck, CreditCard, ShoppingBag, Loader2, AlertTriangle, MapPin, Plus, ShieldCheck, User } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'
import type { ShippingOption } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useRegion } from '../context/RegionContext'
import { useStoreSettings } from '../hooks/useStoreSettings'
import { notifyOrderPlaced } from '../lib/notifications'
import { sdk } from '../lib/sdk'
import PromoCode from '../components/PromoCode'

type Step = 'address' | 'shipping' | 'payment' | 'review'

const STEPS: { key: Step; label: string; icon: any }[] = [
  { key: 'address', label: 'Adresse', icon: ShoppingBag },
  { key: 'shipping', label: 'Versand', icon: Truck },
  { key: 'payment', label: 'Zahlung', icon: CreditCard },
  { key: 'review', label: 'Prüfen', icon: Check },
]

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null
const useStripePayment = !!STRIPE_KEY

/* ── Stripe Payment Form (rendered inside <Elements>) ── */
function StripePaymentForm({ onReady }: { onReady: () => void }) {
  return (
    <div className="bg-f-gray/30 border border-f-border/20 p-6 rounded-sm">
      <div className="mb-4">
        <Lock size={18} className="text-f-green-light inline mr-2" />
        <span className="text-[14px] font-medium">Sichere Zahlung</span>
      </div>
      <PaymentElement
        onReady={() => onReady()}
        options={{
          layout: 'tabs',
        }}
      />
    </div>
  )
}

/* ── Props for the extracted StripePaymentAndReview component ── */
interface StripePaymentAndReviewProps {
  step: Step
  setStep: (step: Step) => void
  form: {
    email: string; first_name: string; last_name: string
    address_1: string; address_2: string; city: string
    postal_code: string; country_code: string; phone: string
  }
  cart: any
  formatPrice: (amount: number) => string
  agbAccepted: boolean
  setAgbAccepted: (v: boolean) => void
  submitting: boolean
  setSubmitting: (v: boolean) => void
  checkoutError: string | null
  setCheckoutError: (v: string | null) => void
  paymentInitializing: boolean
  paymentReady: boolean
  setPaymentReady: (v: boolean) => void
  paymentError: string | null
  setPaymentError: (v: string | null) => void
  completeCart: () => Promise<any>
  navigate: (path: string, options?: any) => void
}

/**
 * Combined Payment + Review step — defined at **module level** so React
 * maintains a stable component identity across parent re-renders.
 * Both steps live inside the same <Elements> provider so the Stripe
 * PaymentElement stays mounted (hidden) during the review step.
 */
function StripePaymentAndReview({
  step, setStep, form, cart, formatPrice,
  agbAccepted, setAgbAccepted, submitting, setSubmitting,
  checkoutError, setCheckoutError,
  paymentInitializing, paymentReady, setPaymentReady,
  paymentError, setPaymentError, completeCart, navigate,
}: StripePaymentAndReviewProps) {
  const stripe = useStripe()
  const elements = useElements()

  const handleStripeConfirm = async () => {
    if (!stripe || !elements) return
    setSubmitting(true)
    setCheckoutError(null)

    try {
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          return_url: `${window.location.origin}/order/confirmed`,
        },
      })

      if (stripeError) {
        setCheckoutError(stripeError.message || 'Zahlung fehlgeschlagen.')
        setSubmitting(false)
        return
      }

      const result = await completeCart()
      if (result?.type === 'order' && result?.order) {
        notifyOrderPlaced()
        navigate(`/order/${result.order.id}/confirmed`, { state: { order: result } })
      } else {
        setCheckoutError('Unerwartete Antwort. Bitte versuche es erneut.')
      }
    } catch (err: any) {
      console.error('Stripe checkout failed:', err)
      setCheckoutError(err?.message || 'Bestellung konnte nicht abgeschlossen werden.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Payment form — keep mounted but visually hidden when on review step.
          Using visibility+height instead of display:none because Stripe requires
          the PaymentElement to remain "mounted" (display:none counts as unmounted). */}
      <div style={step === 'payment' ? {} : { visibility: 'hidden' as const, height: 0, overflow: 'hidden', position: 'absolute' as const }}>
        <h2 className="font-heading text-3xl tracking-[0.03em] mb-6">ZAHLUNGSMETHODE</h2>
        <StripePaymentForm
          onReady={() => setPaymentReady(true)}
        />
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setStep('shipping')}
            className="px-8 py-4 border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter text-[12px] uppercase tracking-[0.2em] transition-all"
          >
            Zurück
          </button>
          <button
            onClick={() => setStep('review')}
            disabled={paymentInitializing || !paymentReady}
            className="btn-shimmer group relative overflow-hidden flex-1 bg-f-green text-white py-4 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-2">
              Bestellung prüfen <ChevronRight size={14} />
            </span>
            <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>
      </div>

      {/* Review step */}
      {step === 'review' && (
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="font-heading text-3xl tracking-[0.03em] mb-6">BESTELLUNG PRÜFEN</h2>

          <div className="bg-f-gray/30 border border-f-border/20 p-6 mb-4">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[11px] uppercase tracking-[0.15em] text-f-muted">Lieferadresse</p>
              <button onClick={() => setStep('address')} className="text-f-green-light text-[12px] hover:underline">Ändern</button>
            </div>
            <p className="text-[14px]">{form.first_name} {form.last_name}</p>
            <p className="text-f-muted text-[13px]">{form.address_1}{form.address_2 ? `, ${form.address_2}` : ''}</p>
            <p className="text-f-muted text-[13px]">{form.postal_code} {form.city}</p>
            <p className="text-f-muted text-[13px]">{form.email}</p>
          </div>

          <div className="bg-f-gray/30 border border-f-border/20 p-6 mb-6">
            <p className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-4">Artikel</p>
            {cart?.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 py-2">
                <div className="w-12 h-14 bg-f-gray flex-shrink-0 overflow-hidden">
                  {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] truncate">{item.title}</p>
                  <p className="text-f-muted text-[12px]">Menge: {item.quantity}</p>
                </div>
                <span className="text-[14px] font-medium">{formatPrice(item.total || item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <label className="flex items-start gap-3 mb-8 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 accent-[#2d6a4f]"
              checked={agbAccepted}
              onChange={(e) => setAgbAccepted(e.target.checked)}
            />
            <span className="text-f-muted text-[13px] leading-relaxed">
              Ich habe die <Link to="/agb" className="text-f-green-light hover:underline">AGB</Link> und die{' '}
              <Link to="/widerruf" className="text-f-green-light hover:underline">Widerrufsbelehrung</Link> gelesen und stimme diesen zu.
            </span>
          </label>

          {checkoutError && (
            <div className="bg-red-900/20 border border-red-500/30 p-4 mb-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-[14px]">{checkoutError}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep('payment')}
              className="px-8 py-4 border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter text-[12px] uppercase tracking-[0.2em] transition-all"
            >
              Zurück
            </button>
            <button
              onClick={handleStripeConfirm}
              disabled={submitting || !agbAccepted || !stripe}
              className="btn-shimmer group relative overflow-hidden flex-1 bg-f-green text-white py-4.5 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-60"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Lock size={14} />
                {submitting ? 'Wird verarbeitet...' : 'Kostenpflichtig bestellen'}
              </span>
              <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default function Checkout() {
  const [step, setStep] = useState<Step>('address')
  const [submitting, setSubmitting] = useState(false)
  const [paymentInitializing, setPaymentInitializing] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const {
    cart, isMedusaConnected,
    setCartEmail, setShippingAddress,
    addShippingMethod, listShippingOptions, initializePaymentSession,
    completeCart,
  } = useCart()
  const { customer, isAuthenticated } = useAuth()
  const { formatPrice } = useRegion()
  const { freeShippingThreshold } = useStoreSettings()
  const navigate = useNavigate()

  // Determine if free shipping applies
  const qualifiesForFreeShipping = (cart?.subtotal || 0) >= freeShippingThreshold

  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    postal_code: '',
    country_code: 'ch',
    phone: '',
  })

  // Saved addresses from customer profile
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  // 'new' = manual entry, or saved address id
  const [addressMode, setAddressMode] = useState<string>('new')

  // Fetch saved addresses when user is authenticated
  const fetchSavedAddresses = useCallback(async () => {
    if (!isAuthenticated) return
    setAddressesLoading(true)
    try {
      const res: any = await sdk.store.customer.listAddress()
      const addrs = res.addresses || []
      setSavedAddresses(addrs)
      // Auto-select default address if available
      const defaultAddr = addrs.find((a: any) => a.is_default_shipping)
      if (defaultAddr) {
        setAddressMode(defaultAddr.id)
        setForm(prev => ({
          ...prev,
          email: customer?.email || prev.email,
          first_name: defaultAddr.first_name || '',
          last_name: defaultAddr.last_name || '',
          address_1: defaultAddr.address_1 || '',
          address_2: defaultAddr.address_2 || '',
          city: defaultAddr.city || '',
          postal_code: defaultAddr.postal_code || '',
          country_code: defaultAddr.country_code || 'ch',
          phone: defaultAddr.phone || '',
        }))
      } else if (addrs.length > 0) {
        // If no default, pre-select the first saved address
        setAddressMode(addrs[0].id)
        setForm(prev => ({
          ...prev,
          email: customer?.email || prev.email,
          first_name: addrs[0].first_name || '',
          last_name: addrs[0].last_name || '',
          address_1: addrs[0].address_1 || '',
          address_2: addrs[0].address_2 || '',
          city: addrs[0].city || '',
          postal_code: addrs[0].postal_code || '',
          country_code: addrs[0].country_code || 'ch',
          phone: addrs[0].phone || '',
        }))
      } else {
        // No saved addresses – pre-fill email only
        setForm(prev => ({
          ...prev,
          email: customer?.email || prev.email,
        }))
      }
    } catch {
      // Silently fail – user can still enter manually
    } finally {
      setAddressesLoading(false)
    }
  }, [isAuthenticated, customer])

  useEffect(() => {
    fetchSavedAddresses()
  }, [fetchSavedAddresses])

  // Pre-fill email for logged-in users without saved addresses
  useEffect(() => {
    if (isAuthenticated && customer?.email && !form.email) {
      setForm(prev => ({ ...prev, email: customer.email }))
    }
  }, [isAuthenticated, customer])

  // Handle selecting a saved address
  const handleSelectAddress = (addrId: string) => {
    setAddressMode(addrId)
    if (addrId === 'new') {
      // Clear form for manual entry (keep email)
      setForm(prev => ({
        email: prev.email,
        first_name: '',
        last_name: '',
        address_1: '',
        address_2: '',
        city: '',
        postal_code: '',
        country_code: 'ch',
        phone: '',
      }))
    } else {
      const addr = savedAddresses.find(a => a.id === addrId)
      if (addr) {
        setForm(prev => ({
          ...prev,
          first_name: addr.first_name || '',
          last_name: addr.last_name || '',
          address_1: addr.address_1 || '',
          address_2: addr.address_2 || '',
          city: addr.city || '',
          postal_code: addr.postal_code || '',
          country_code: addr.country_code || 'ch',
          phone: addr.phone || '',
        }))
      }
    }
  }

  const [selectedShipping, setSelectedShipping] = useState('')
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [agbAccepted, setAgbAccepted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    // If user manually edits form while a saved address is selected, switch to 'new'
    if (addressMode !== 'new') {
      setAddressMode('new')
    }
  }

  // Fetch shipping options when entering the shipping step
  useEffect(() => {
    if (step === 'shipping') {
      setShippingLoading(true)
      listShippingOptions()
        .then(options => {
          setShippingOptions(options)
          if (options.length > 0 && !selectedShipping) {
            setSelectedShipping(options[0].id)
          }
        })
        .finally(() => setShippingLoading(false))
    }
  }, [step, listShippingOptions])

  const goToShipping = async () => {
    await setCartEmail(form.email)
    await setShippingAddress({
      first_name: form.first_name,
      last_name: form.last_name,
      address_1: form.address_1,
      address_2: form.address_2,
      city: form.city,
      postal_code: form.postal_code,
      country_code: form.country_code,
      phone: form.phone,
    })
    setStep('shipping')
  }

  const goToPayment = async () => {
    if (selectedShipping) {
      await addShippingMethod(selectedShipping)
    }
    setStep('payment')
    setPaymentError(null)

    if (!isMedusaConnected) {
      setPaymentError('Keine Verbindung zum Backend. Checkout ist nur mit aktivem Medusa-Backend möglich.')
      setPaymentReady(false)
      return
    }

    setPaymentInitializing(true)
    setPaymentReady(false)
    setStripeClientSecret(null)
    try {
      const clientSecret = await initializePaymentSession()
      if (useStripePayment && clientSecret) {
        setStripeClientSecret(clientSecret)
      }
      setPaymentReady(true)
    } catch (err: any) {
      console.error('Payment session init failed:', err)
      setPaymentError(
        err?.message || 'Zahlungssession konnte nicht initialisiert werden. Bitte versuche es erneut.'
      )
      setPaymentReady(false)
    } finally {
      setPaymentInitializing(false)
    }
  }

  const handleComplete = async () => {
    setSubmitting(true)
    setCheckoutError(null)
    try {
      const result = await completeCart()
      if (result?.type === 'order' && result?.order) {
        const orderId = result.order.id
        notifyOrderPlaced()
        navigate(`/order/${orderId}/confirmed`, { state: { order: result } })
      } else {
        setCheckoutError('Unerwartete Antwort. Bitte versuche es erneut.')
      }
    } catch (err: any) {
      console.error('Checkout completion failed:', err)
      setCheckoutError(
        err?.message || 'Bestellung konnte nicht abgeschlossen werden. Bitte versuche es erneut.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const stepIndex = STEPS.findIndex(s => s.key === step)

  const inputClass = "w-full bg-f-gray/50 border border-f-border/40 px-5 py-3.5 text-[14px] text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/70 transition-all duration-300 rounded-sm"

  // Stripe Elements appearance
  const stripeOptions = useMemo(() => {
    if (!stripeClientSecret) return null
    return {
      clientSecret: stripeClientSecret,
      appearance: {
        theme: 'night' as const,
        variables: {
          colorPrimary: '#2d6a4f',
          colorBackground: '#131313',
          colorText: '#f0f0f0',
          colorDanger: '#ef4444',
          fontFamily: 'Space Grotesk, sans-serif',
          borderRadius: '2px',
        },
        rules: {
          '.Input': {
            border: '1px solid rgba(34,34,34,0.4)',
            backgroundColor: 'rgba(19,19,19,0.5)',
            padding: '14px 20px',
          },
          '.Input:focus': {
            borderColor: 'rgba(45,106,79,0.6)',
            boxShadow: '0 0 0 1px rgba(45,106,79,0.3)',
          },
          '.Label': {
            fontSize: '11px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.15em',
            color: '#8a8a8a',
          },
        },
      },
    }
  }, [stripeClientSecret])

  const renderPaymentAndReviewSteps = () => {
    if (paymentInitializing) {
      return (
        <div className="bg-f-gray/30 border border-f-border/20 p-8 text-center">
          <Loader2 size={32} className="text-f-green-light mx-auto mb-4 animate-spin" />
          <p className="text-[15px] font-medium mb-2">Zahlung wird vorbereitet...</p>
          <p className="text-f-muted text-[14px]">Bitte warte einen Moment.</p>
        </div>
      )
    }

    if (paymentError) {
      return (
        <div className="bg-f-gray/30 border border-f-border/20 p-8 text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-[15px] font-medium mb-2 text-red-300">Zahlung konnte nicht vorbereitet werden</p>
          <p className="text-f-muted text-[14px] mb-4">{paymentError}</p>
          <button
            onClick={async () => {
              setPaymentError(null)
              setPaymentInitializing(true)
              try {
                const cs = await initializePaymentSession()
                if (useStripePayment && cs) setStripeClientSecret(cs)
                setPaymentReady(true)
              } catch (err: any) {
                setPaymentError(err?.message || 'Erneuter Versuch fehlgeschlagen.')
                setPaymentReady(false)
              } finally {
                setPaymentInitializing(false)
              }
            }}
            className="px-6 py-2.5 bg-f-green/20 border border-f-green/40 text-f-green-light text-[12px] uppercase tracking-[0.15em] hover:bg-f-green/30 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      )
    }

    if (useStripePayment && stripeClientSecret && stripeOptions) {
      return (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <StripePaymentAndReview
            step={step}
            setStep={setStep}
            form={form}
            cart={cart}
            formatPrice={formatPrice}
            agbAccepted={agbAccepted}
            setAgbAccepted={setAgbAccepted}
            submitting={submitting}
            setSubmitting={setSubmitting}
            checkoutError={checkoutError}
            setCheckoutError={setCheckoutError}
            paymentInitializing={paymentInitializing}
            paymentReady={paymentReady}
            setPaymentReady={setPaymentReady}
            paymentError={paymentError}
            setPaymentError={setPaymentError}
            completeCart={completeCart}
            navigate={navigate}
          />
        </Elements>
      )
    }

    // Non-Stripe fallback
    return (
      <>
        {step === 'payment' && (
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h2 className="font-heading text-3xl tracking-[0.03em] mb-6">ZAHLUNGSMETHODE</h2>
            <div className="bg-f-gray/30 border border-f-border/20 p-8 text-center">
              <Lock size={32} className="text-f-green-light mx-auto mb-4" />
              <p className="text-[15px] font-medium mb-2">Sichere Zahlung</p>
              <p className="text-f-muted text-[14px] mb-4">Deine Bestellung wird sicher verarbeitet.</p>
              <div className="flex flex-wrap justify-center gap-3 text-[12px] text-f-muted">
                {['Visa', 'Mastercard', 'TWINT', 'PostFinance', 'Apple Pay'].map(m => (
                  <span key={m} className="px-3 py-1.5 bg-f-black/50 border border-f-border/30 rounded-sm">{m}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep('shipping')} className="px-8 py-4 border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter text-[12px] uppercase tracking-[0.2em] transition-all">Zurück</button>
              <button onClick={() => setStep('review')} className="btn-shimmer group relative overflow-hidden flex-1 bg-f-green text-white py-4 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500">
                <span className="relative z-10 flex items-center gap-2">Bestellung prüfen <ChevronRight size={14} /></span>
                <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>
          </motion.div>
        )}
        {step === 'review' && (
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <h2 className="font-heading text-3xl tracking-[0.03em] mb-6">BESTELLUNG PRÜFEN</h2>
            <div className="bg-f-gray/30 border border-f-border/20 p-6 mb-4">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[11px] uppercase tracking-[0.15em] text-f-muted">Lieferadresse</p>
                <button onClick={() => setStep('address')} className="text-f-green-light text-[12px] hover:underline">Ändern</button>
              </div>
              <p className="text-[14px]">{form.first_name} {form.last_name}</p>
              <p className="text-f-muted text-[13px]">{form.address_1}{form.address_2 ? `, ${form.address_2}` : ''}</p>
              <p className="text-f-muted text-[13px]">{form.postal_code} {form.city}</p>
              <p className="text-f-muted text-[13px]">{form.email}</p>
            </div>
            <div className="bg-f-gray/30 border border-f-border/20 p-6 mb-6">
              <p className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-4">Artikel</p>
              {cart?.items?.map(item => (
                <div key={item.id} className="flex items-center gap-4 py-2">
                  <div className="w-12 h-14 bg-f-gray flex-shrink-0 overflow-hidden">
                    {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] truncate">{item.title}</p>
                    <p className="text-f-muted text-[12px]">Menge: {item.quantity}</p>
                  </div>
                  <span className="text-[14px] font-medium">{formatPrice(item.total || item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <label className="flex items-start gap-3 mb-8 cursor-pointer">
              <input type="checkbox" className="mt-1 accent-[#2d6a4f]" checked={agbAccepted} onChange={(e) => setAgbAccepted(e.target.checked)} />
              <span className="text-f-muted text-[13px] leading-relaxed">
                Ich habe die <Link to="/agb" className="text-f-green-light hover:underline">AGB</Link> und die{' '}
                <Link to="/widerruf" className="text-f-green-light hover:underline">Widerrufsbelehrung</Link> gelesen und stimme diesen zu.
              </span>
            </label>
            {checkoutError && (
              <div className="bg-red-900/20 border border-red-500/30 p-4 mb-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-[14px]">{checkoutError}</p>
              </div>
            )}
            <div className="flex gap-4">
              <button onClick={() => setStep('payment')} className="px-8 py-4 border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter text-[12px] uppercase tracking-[0.2em] transition-all">Zurück</button>
              <button onClick={handleComplete} disabled={submitting || !agbAccepted} className="btn-shimmer group relative overflow-hidden flex-1 bg-f-green text-white py-4.5 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-60">
                <span className="relative z-10 flex items-center gap-2"><Lock size={14} />{submitting ? 'Wird verarbeitet...' : 'Kostenpflichtig bestellen'}</span>
                <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>
          </motion.div>
        )}
      </>
    )
  }

  return (
    <div className="py-12 md:py-20 px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-f-muted mb-8">
          <Link to="/cart" className="hover:text-f-text transition-colors">Warenkorb</Link>
          <ChevronRight size={12} />
          <span className="text-f-text">Kasse</span>
        </nav>

        {/* Guest checkout banner */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 bg-f-gray/40 border border-f-border/25 px-5 py-3.5 mb-8 rounded-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-f-green/10 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-f-green-light" />
              </div>
              <p className="text-[13px] text-f-muted">
                Du bestellst als <span className="text-f-text font-medium">Gast</span>. Für schnelleres Bestellen kannst du dich{' '}
                <Link to="/account" className="text-f-green-light hover:underline">anmelden</Link>.
              </p>
            </div>
          </motion.div>
        )}

        {/* Steps indicator — enhanced with numbered circles */}
        <div className="flex items-center gap-0 mb-12 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = i === stepIndex
            const isCompleted = i < stepIndex
            const isFuture = i > stepIndex
            return (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => isCompleted && setStep(s.key)}
                  disabled={isFuture}
                  className={`flex items-center gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap rounded-sm ${
                    isActive
                      ? 'bg-f-green/10 border border-f-green/40 text-f-green-light'
                      : isCompleted
                        ? 'text-f-green-light/70 border border-f-green/20 cursor-pointer hover:bg-f-green/5'
                        : 'text-f-muted/40 border border-f-border/15'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-f-green text-white'
                      : isActive
                        ? 'bg-f-green/20 text-f-green-light border border-f-green/40'
                        : 'bg-f-border/15 text-f-muted/40'
                  }`}>
                    {isCompleted ? <Check size={12} /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                  <Icon size={14} className="sm:hidden" />
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 md:w-10 h-[2px] flex-shrink-0 transition-colors duration-500 ${
                    isCompleted ? 'bg-f-green/40' : 'bg-f-border/20'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          {/* Form area */}
          <div>
            {/* Address Step */}
            {step === 'address' && (
              <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <h2 className="font-heading text-3xl tracking-[0.03em] mb-6">KONTAKT & LIEFERADRESSE</h2>

                {/* Saved Address Selector (only for logged-in users with saved addresses) */}
                {isAuthenticated && savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-3 font-medium flex items-center gap-2">
                      <MapPin size={13} />
                      Gespeicherte Adressen
                    </p>
                    <div className="space-y-2.5">
                      {savedAddresses.map((addr: any) => (
                        <label
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr.id)}
                          className={`flex items-start gap-4 p-4 border cursor-pointer transition-all duration-300 ${
                            addressMode === addr.id
                              ? 'border-f-green bg-f-green/5'
                              : 'border-f-border/30 hover:border-f-lighter'
                          }`}
                        >
                          <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            addressMode === addr.id ? 'border-f-green' : 'border-f-lighter'
                          }`}>
                            {addressMode === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-f-green" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[14px] font-medium">{addr.first_name} {addr.last_name}</p>
                              {addr.is_default_shipping && (
                                <span className="px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] bg-f-green/15 text-f-green-light rounded-sm">
                                  Standard
                                </span>
                              )}
                            </div>
                            <p className="text-f-muted text-[13px] mt-0.5">
                              {addr.address_1}{addr.address_2 ? `, ${addr.address_2}` : ''}
                            </p>
                            <p className="text-f-muted text-[13px]">
                              {addr.postal_code} {addr.city}, {addr.country_code?.toUpperCase()}
                            </p>
                            {addr.phone && <p className="text-f-muted/60 text-[12px] mt-0.5">{addr.phone}</p>}
                          </div>
                        </label>
                      ))}

                      {/* Option to use a new/different address */}
                      <label
                        onClick={() => handleSelectAddress('new')}
                        className={`flex items-center gap-4 p-4 border cursor-pointer transition-all duration-300 ${
                          addressMode === 'new'
                            ? 'border-f-green bg-f-green/5'
                            : 'border-f-border/30 hover:border-f-lighter'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          addressMode === 'new' ? 'border-f-green' : 'border-f-lighter'
                        }`}>
                          {addressMode === 'new' && <div className="w-2.5 h-2.5 rounded-full bg-f-green" />}
                        </div>
                        <div className="flex items-center gap-2 text-[14px]">
                          <Plus size={14} className="text-f-muted" />
                          <span>Andere Adresse verwenden</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {addressesLoading && isAuthenticated && (
                  <div className="flex items-center gap-3 mb-6 text-f-muted">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-[13px]">Gespeicherte Adressen werden geladen...</span>
                  </div>
                )}

                {/* Address form: always shown for guests, shown when 'new' selected or no saved addresses for logged-in */}
                <AnimatePresence mode="wait">
                  {(addressMode === 'new' || !isAuthenticated || savedAddresses.length === 0) && (
                    <motion.div
                      key="address-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">E-Mail *</label>
                          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="deine@email.ch" className={inputClass} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Vorname *</label>
                            <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Max" className={inputClass} />
                          </div>
                          <div>
                            <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Nachname *</label>
                            <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Muster" className={inputClass} />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Strasse & Hausnummer *</label>
                          <input name="address_1" value={form.address_1} onChange={handleChange} placeholder="Bahnhofstrasse 1" className={inputClass} />
                        </div>

                        <div>
                          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Adresszusatz</label>
                          <input name="address_2" value={form.address_2} onChange={handleChange} placeholder="c/o, Stockwerk, etc." className={inputClass} />
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-4">
                          <div>
                            <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">PLZ *</label>
                            <input name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="8001" className={inputClass} />
                          </div>
                          <div>
                            <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Ort *</label>
                            <input name="city" value={form.city} onChange={handleChange} placeholder="Zürich" className={inputClass} />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Land</label>
                          <select name="country_code" value={form.country_code} onChange={handleChange} className={inputClass}>
                            <option value="ch">Schweiz</option>
                            <option value="de">Deutschland</option>
                            <option value="at">Österreich</option>
                            <option value="li">Liechtenstein</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">Telefon</label>
                          <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+41 79 123 45 67" className={inputClass} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* When a saved address is selected, show a compact email field if needed */}
                {addressMode !== 'new' && isAuthenticated && savedAddresses.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.15em] text-f-muted mb-2 block">E-Mail *</label>
                      <input name="email" type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="deine@email.ch" className={inputClass} />
                    </div>
                  </div>
                )}

                <button
                  onClick={goToShipping}
                  disabled={!form.email || !form.first_name || !form.last_name || !form.address_1 || !form.postal_code || !form.city}
                  className="btn-shimmer group relative overflow-hidden w-full bg-f-green text-white py-4.5 text-[12px] uppercase tracking-[0.2em] font-medium mt-8 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Weiter zum Versand <ChevronRight size={14} />
                  </span>
                  <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </motion.div>
            )}

            {/* Shipping Step */}
            {step === 'shipping' && (
              <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <h2 className="font-heading text-3xl tracking-[0.03em] mb-6">VERSANDMETHODE</h2>

                {shippingLoading ? (
                  <div className="flex items-center justify-center py-12 text-f-muted">
                    <Loader2 size={20} className="animate-spin mr-3" />
                    <span className="text-[14px]">Versandoptionen werden geladen...</span>
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <div className="bg-f-gray/30 border border-f-border/20 p-8 text-center">
                    <p className="text-f-muted text-[14px]">Keine Versandoptionen verfügbar. Bitte überprüfe deine Adresse.</p>
                  </div>
                ) : (
                  <>
                    {qualifiesForFreeShipping && (
                      <div className="flex items-center gap-2.5 mb-4 bg-f-green/10 border border-f-green/30 p-4 rounded-sm">
                        <Truck size={18} className="text-f-green-light flex-shrink-0" />
                        <p className="text-f-green-light text-[14px] font-medium">
                          Gratis Versand! Deine Bestellung qualifiziert sich für kostenlosen Standardversand.
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {shippingOptions.map(option => {
                        // Standard shipping is free when order exceeds threshold
                        const isStandard = option.name.toLowerCase().includes('standard') || option.id === 'local_standard'
                        const effectiveAmount = (qualifiesForFreeShipping && isStandard) ? 0 : option.amount
                        return (
                          <label
                            key={option.id}
                            className={`flex items-center gap-4 p-5 border cursor-pointer transition-all duration-300 ${
                              selectedShipping === option.id
                                ? 'border-f-green bg-f-green/5'
                                : 'border-f-border/30 hover:border-f-lighter'
                            }`}
                          >
                            <input type="radio" name="shipping" value={option.id} checked={selectedShipping === option.id} onChange={() => setSelectedShipping(option.id)} className="sr-only" />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedShipping === option.id ? 'border-f-green' : 'border-f-lighter'
                            }`}>
                              {selectedShipping === option.id && <div className="w-2.5 h-2.5 rounded-full bg-f-green" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-[14px] font-medium">{option.name}</p>
                            </div>
                            <div className="text-right">
                              {effectiveAmount === 0 ? (
                                <div className="flex items-center gap-2">
                                  {option.amount > 0 && (
                                    <span className="text-f-muted text-[12px] line-through">{formatPrice(option.amount)}</span>
                                  )}
                                  <span className="text-f-green-light text-[14px] font-semibold">Gratis</span>
                                </div>
                              ) : (
                                <span className="text-[14px] font-semibold">{formatPrice(effectiveAmount)}</span>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </>
                )}

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep('address')} className="px-8 py-4 border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter text-[12px] uppercase tracking-[0.2em] transition-all">
                    Zurück
                  </button>
                  <button
                    onClick={goToPayment}
                    disabled={!selectedShipping}
                    className="btn-shimmer group relative overflow-hidden flex-1 bg-f-green text-white py-4 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Weiter zur Zahlung <ChevronRight size={14} />
                    </span>
                    <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Payment & Review Steps (share single Stripe Elements context) */}
            {(step === 'payment' || step === 'review') && renderPaymentAndReviewSteps()}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:sticky lg:top-28 h-fit space-y-4">
            <div className="bg-f-gray/40 border border-f-border/25 p-6 shadow-lg shadow-black/10">
              <h3 className="font-heading text-xl tracking-[0.05em] mb-5">ZUSAMMENFASSUNG</h3>

              <div className="max-h-48 overflow-y-auto mb-4 space-y-3">
                {cart?.items?.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-f-gray flex-shrink-0 overflow-hidden relative rounded-sm">
                      {item.thumbnail && <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />}
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-f-green text-[8px] text-white rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] truncate">{item.title}</p>
                    </div>
                    <span className="text-[13px] font-medium">{formatPrice(item.total || item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-f-border/20 pt-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-f-muted">Zwischensumme</span>
                  <span>{formatPrice(cart?.item_total || cart?.subtotal || 0)}</span>
                </div>
                {(cart?.discount_total || 0) > 0 && (
                  <div className="flex justify-between text-f-green-light">
                    <span>Rabatt</span>
                    <span>-{formatPrice(cart?.discount_total || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-f-muted">Versand</span>
                  <span>{(cart?.shipping_total || 0) > 0 ? formatPrice(cart?.shipping_total || 0) : '—'}</span>
                </div>
                <div className="border-t border-f-border/20 pt-3 mt-2">
                  <div className="flex justify-between text-[17px] font-bold">
                    <span>Total</span>
                    <span className="text-f-sand">{formatPrice(cart?.total || cart?.subtotal || 0)}</span>
                  </div>
                  <p className="text-f-muted/60 text-[11px] mt-1.5 text-right">
                    inkl. {formatPrice(cart?.tax_total || Math.round(((cart?.total || cart?.subtotal || 0) * 0.081 / 1.081) * 100) / 100)} MWST (8.1%)
                  </p>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-4 pt-4 border-t border-f-border/20">
                <PromoCode compact />
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-f-gray/20 border border-f-border/15 p-4 rounded-sm">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5 text-[11px] text-f-muted">
                  <ShieldCheck size={14} className="text-f-green-light flex-shrink-0" />
                  <span>SSL-verschlüsselte Übertragung</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-f-muted">
                  <Lock size={14} className="text-f-green-light flex-shrink-0" />
                  <span>Sichere Zahlungsabwicklung</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-f-muted">
                  <Truck size={14} className="text-f-green-light flex-shrink-0" />
                  <span>14 Tage Rückgaberecht</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
