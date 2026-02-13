import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Truck, Check, ShieldCheck, Lock } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useRegion } from '../context/RegionContext'
import { useStoreSettings } from '../hooks/useStoreSettings'
import PromoCode from '../components/PromoCode'

export default function Cart() {
  const { cart, loading, updateItem, removeItem, itemCount } = useCart()
  const { formatPrice } = useRegion()
  const { freeShippingThreshold } = useStoreSettings()

  if (loading) {
    return (
      <div className="py-28 px-6 lg:px-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-6">
                <div className="w-28 h-32 bg-f-gray" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-f-gray w-1/2" />
                  <div className="h-3 bg-f-gray w-1/3" />
                  <div className="h-4 bg-f-gray w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isEmpty = !cart?.items || cart.items.length === 0

  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Warenkorb</span>
          <h1 className="font-heading text-5xl md:text-7xl tracking-[0.02em] mb-4">DEIN WARENKORB</h1>
          {!isEmpty && (
            <p className="text-f-muted text-[15px] mb-10">
              {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'} in deinem Warenkorb
            </p>
          )}
        </motion.div>

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-24"
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full bg-f-gray/50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 rounded-full bg-f-gray border border-f-border/20 flex items-center justify-center">
                <ShoppingBag size={36} className="text-f-muted/30" />
              </div>
            </div>
            <h2 className="font-heading text-2xl tracking-[0.02em] mb-2">DEIN WARENKORB IST LEER</h2>
            <p className="text-f-muted text-[15px] mb-2">Noch keine Artikel hinzugefügt.</p>
            <p className="text-f-muted/50 text-[13px] mb-10 max-w-sm mx-auto">
              Entdecke unsere Premium-Kampfsportbekleidung und finde die perfekte Ausrüstung für dein Training.
            </p>
            <Link
              to="/shop"
              className="btn-shimmer group relative overflow-hidden inline-flex items-center gap-2 bg-f-green text-white px-10 py-4.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:shadow-lg hover:shadow-f-green/20 transition-shadow duration-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                Jetzt shoppen <ArrowRight size={14} />
              </span>
              <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            {/* Cart items */}
            <div>
              <div className="accent-line mb-8" />
              <div className="space-y-1">
                {cart!.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.06 }}
                    className="flex gap-6 py-6 border-b border-f-border/20 hover:bg-white/[0.01] transition-colors duration-300 -mx-4 px-4 rounded-sm"
                  >
                    <Link to={item.variant?.product?.handle ? `/product/${item.variant.product.handle}` : '/shop'} className="w-28 h-36 bg-f-gray flex-shrink-0 overflow-hidden group">
                      {(item.thumbnail || item.variant?.product?.thumbnail) && (
                        <img
                          src={item.thumbnail || item.variant?.product?.thumbnail || ''}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-medium mb-1">{item.title}</h3>
                      {item.variant?.title && item.variant.title !== 'Default' && (
                        <p className="text-f-muted text-[13px] mb-3">{item.variant.title}</p>
                      )}
                      <p className="text-f-sand text-[16px] font-semibold mb-4">
                        {formatPrice(item.unit_price)}
                      </p>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center border border-f-border/40">
                          <button
                            onClick={() => item.quantity > 1
                              ? updateItem(item.id, item.quantity - 1)
                              : removeItem(item.id)
                            }
                            className="w-10 h-10 flex items-center justify-center text-f-muted hover:text-f-text hover:bg-white/[0.04] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-12 h-10 flex items-center justify-center text-[14px] border-x border-f-border/40">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-f-muted hover:text-f-text hover:bg-white/[0.04] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-2 text-f-muted/60 hover:text-red-400 text-[12px] transition-colors"
                        >
                          <Trash2 size={14} />
                          <span className="hidden sm:inline">Entfernen</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-[16px] font-semibold">{formatPrice(item.total || item.unit_price * item.quantity)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 text-f-muted text-[12px] uppercase tracking-[0.2em] mt-8 hover:text-f-green-light transition-colors"
              >
                <ArrowLeft size={14} /> Weiter einkaufen
              </Link>
            </div>

            {/* Order summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:sticky lg:top-28 h-fit"
            >
              {/* Promo Code */}
              <PromoCode />

              <div className="bg-f-gray/40 border border-f-border/25 p-7 mt-4 shadow-lg shadow-black/10">
                <h3 className="font-heading text-2xl tracking-[0.05em] mb-6">BESTELLÜBERSICHT</h3>

                <div className="space-y-3 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-f-muted">Zwischensumme</span>
                    <span>{formatPrice(cart!.item_total || cart!.subtotal || 0)}</span>
                  </div>
                  {(cart!.discount_total || 0) > 0 && (
                    <div className="flex justify-between text-f-green-light">
                      <span>Rabatt</span>
                      <span>-{formatPrice(cart!.discount_total)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-f-muted">Versand</span>
                    <span className="text-f-muted/60">
                      {(cart!.shipping_total || 0) > 0
                        ? formatPrice(cart!.shipping_total || 0)
                        : 'Wird an der Kasse berechnet'}
                    </span>
                  </div>

                  <div className="border-t border-f-border/30 pt-3 mt-3">
                    <div className="flex justify-between text-[17px] font-semibold">
                      <span>Total</span>
                      <span className="text-f-sand">{formatPrice(cart!.total || cart!.subtotal || 0)}</span>
                    </div>
                    <p className="text-f-muted/60 text-[12px] mt-1.5 text-right">
                      inkl. {formatPrice(cart!.tax_total || Math.round(((cart!.total || cart!.subtotal || 0) * 0.081 / 1.081) * 100) / 100)} MWST (8.1%)
                    </p>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="btn-shimmer group relative overflow-hidden w-full bg-f-green text-white py-4.5 text-[12px] uppercase tracking-[0.2em] font-medium mt-6 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-shadow duration-500"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Zur Kasse <ArrowRight size={14} />
                  </span>
                  <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </Link>

                {/* Free shipping progress */}
                {(() => {
                  const subtotal = cart!.subtotal || 0
                  const isFree = subtotal >= freeShippingThreshold
                  const remaining = freeShippingThreshold - subtotal
                  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100)
                  return (
                    <div className="mt-5 pt-4 border-t border-f-border/20">
                      {isFree ? (
                        <div className="flex items-center gap-2.5 justify-center">
                          <div className="w-5 h-5 rounded-full bg-f-green/20 flex items-center justify-center flex-shrink-0">
                            <Check size={10} className="text-f-green-light" />
                          </div>
                          <p className="text-f-green-light text-[13px] font-medium">Gratis Versand freigeschaltet!</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-2 justify-center">
                            <Truck size={14} className="text-f-muted" />
                            <p className="text-[12px] text-f-muted">
                              Noch <span className="text-f-text font-medium">{formatPrice(remaining)}</span> bis zum Gratis Versand
                            </p>
                          </div>
                          <div className="h-1.5 bg-f-border/30 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-f-green-light rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-5 mt-4 py-3 text-f-muted/40">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <ShieldCheck size={12} />
                  <span>SSL</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Lock size={12} />
                  <span>Sicher</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Truck size={12} />
                  <span>14 Tage Rückgabe</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
