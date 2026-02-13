import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2, Truck, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useRegion } from '../context/RegionContext'
import { useStoreSettings } from '../hooks/useStoreSettings'

/* ── Free Shipping Progress Bar ── */
function FreeShippingBar({ subtotal, threshold, formatPrice }: { subtotal: number; threshold: number; formatPrice: (n: number) => string }) {
  const progress = Math.min((subtotal / threshold) * 100, 100)
  const remaining = threshold - subtotal
  const isFree = subtotal >= threshold

  return (
    <div className="px-6 py-3.5 border-b border-f-border/20 bg-f-gray/20">
      {isFree ? (
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-f-green/20 flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-f-green-light" />
          </div>
          <p className="text-f-green-light text-[13px] font-medium">Gratis Versand freigeschaltet!</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Truck size={14} className="text-f-muted flex-shrink-0" />
            <p className="text-[12px] text-f-muted">
              Noch <span className="text-f-text font-medium">{formatPrice(remaining)}</span> bis zum Gratis Versand
            </p>
          </div>
          <div className="h-1.5 bg-f-border/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-f-green-light rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, updateItem, removeItem, itemCount } = useCart()
  const { formatPrice } = useRegion()
  const { freeShippingThreshold } = useStoreSettings()

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-f-black border-l border-white/[0.06] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-f-border/30">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-f-green-light" />
                <h2 className="font-heading text-2xl tracking-[0.05em]">WARENKORB</h2>
                {itemCount > 0 && (
                  <span className="text-[10px] bg-f-green/20 text-f-green-light px-2.5 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-f-muted hover:text-f-text hover:bg-white/[0.04] transition-all rounded-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free shipping progress */}
            {cart?.items && cart.items.length > 0 && (
              <FreeShippingBar
                subtotal={cart.subtotal || 0}
                threshold={freeShippingThreshold}
                formatPrice={formatPrice}
              />
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {(!cart?.items || cart.items.length === 0) ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-f-gray flex items-center justify-center mb-5">
                    <ShoppingBag size={24} className="text-f-muted/50" />
                  </div>
                  <p className="text-f-muted text-[15px] mb-2">Dein Warenkorb ist leer</p>
                  <p className="text-f-muted/60 text-[13px] mb-6">Entdecke unsere Produkte und finde dein neues Lieblingsstück.</p>
                  <Link
                    to="/shop"
                    onClick={() => setCartOpen(false)}
                    className="text-f-green-light text-[12px] uppercase tracking-[0.2em] hover:underline"
                  >
                    Zum Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 py-4 border-b border-f-border/20 last:border-0"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-24 bg-f-gray flex-shrink-0 overflow-hidden">
                        {(item.thumbnail || item.variant?.product?.thumbnail) && (
                          <img
                            src={item.thumbnail || item.variant?.product?.thumbnail || ''}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-medium truncate">{item.title}</h4>
                        {item.variant?.title && item.variant.title !== 'Default' && (
                          <p className="text-f-muted text-[12px] mt-0.5">{item.variant.title}</p>
                        )}
                        <p className="text-f-sand text-[14px] font-medium mt-2">
                          {formatPrice(item.unit_price)}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity controls */}
                          <div className="flex items-center border border-f-border/40">
                            <button
                              onClick={() => item.quantity > 1
                                ? updateItem(item.id, item.quantity - 1)
                                : removeItem(item.id)
                              }
                              className="w-8 h-8 flex items-center justify-center text-f-muted hover:text-f-text hover:bg-white/[0.04] transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center text-[13px]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItem(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-f-muted hover:text-f-text hover:bg-white/[0.04] transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-f-muted/50 hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Totals */}
            {cart?.items && cart.items.length > 0 && (
              <div className="border-t border-f-border/30 px-6 py-5 space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-f-muted">Zwischensumme</span>
                  <span>{formatPrice(cart.item_total || cart.subtotal || 0)}</span>
                </div>
                {(cart.discount_total || 0) > 0 && (
                  <div className="flex justify-between text-[13px] text-f-green-light">
                    <span>Rabatt</span>
                    <span>-{formatPrice(cart.discount_total)}</span>
                  </div>
                )}
                {(cart.shipping_total || 0) > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-f-muted">Versand</span>
                    <span>{formatPrice(cart.shipping_total || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[15px] font-semibold pt-2 border-t border-f-border/20">
                  <span>Total</span>
                  <span className="text-f-sand">{formatPrice(cart.total || cart.subtotal || 0)}</span>
                </div>
                <p className="text-f-muted/60 text-[11px] text-right">
                  inkl. {formatPrice(cart.tax_total || Math.round(((cart.total || cart.subtotal || 0) * 0.081 / 1.081) * 100) / 100)} MWST (8.1%)
                </p>

                <div className="pt-2 space-y-2.5">
                  <Link
                    to="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="btn-shimmer group relative overflow-hidden w-full bg-f-green text-white py-4 text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/20 transition-shadow duration-500"
                  >
                    <span className="relative z-10">Zur Kasse</span>
                    <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setCartOpen(false)}
                    className="w-full border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter py-3.5 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center transition-all"
                  >
                    Warenkorb ansehen
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
