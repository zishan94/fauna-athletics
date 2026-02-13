import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Heart, Star, ArrowRight } from 'lucide-react'
import type { Product } from '../data/products'
import { useCart } from '../context/CartContext'
import { useRegion } from '../context/RegionContext'
import { useWishlist } from '../context/WishlistContext'

interface QuickViewProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const { addItem, addLocalItem, isMedusaConnected } = useCart()
  const { formatPrice } = useRegion()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [selectedSize, setSelectedSize] = useState(0)
  const [adding, setAdding] = useState(false)

  if (!product) return null

  const isFav = isInWishlist(product.id)

  const handleAddToCart = async () => {
    setAdding(true)
    const variantId = product.variants?.[0]?.id
    if (variantId) {
      await addItem(variantId)
    } else if (!isMedusaConnected) {
      addLocalItem(product)
    }
    setAdding(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="relative w-full max-w-3xl bg-f-dark border border-f-border/30 shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-f-muted hover:text-f-text bg-f-black/50 backdrop-blur-sm transition-colors rounded-sm"
                aria-label="Schliessen"
              >
                <X size={16} />
              </button>

              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="aspect-square bg-f-gray overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.tag && (
                    <span className={`absolute top-4 left-4 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-semibold rounded-sm ${
                      product.tag === 'BESTSELLER' ? 'bg-gradient-to-r from-f-gold-dark to-f-gold text-white' :
                      product.tag === 'NEU' ? 'bg-white text-f-black' :
                      'bg-f-sand text-f-black'
                    }`}>{product.tag === 'BESTSELLER' ? '\u2605 ' + product.tag : product.tag}</span>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 md:p-8 flex flex-col">
                  <h2 className="font-heading text-3xl tracking-[0.02em] mb-1">{product.name}</h2>
                  <p className="text-f-muted text-[13px] mb-4">{product.subtitle}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={12} className="text-f-sand fill-f-sand"/>)}</div>
                    <span className="text-f-muted text-[12px]">5.0</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-heading text-3xl text-f-sand">{formatPrice(product.price)}</span>
                    {product.originalPrice && <span className="text-f-muted line-through text-[14px]">{formatPrice(product.originalPrice)}</span>}
                  </div>

                  <p className="text-f-muted text-[13px] leading-relaxed mb-5 line-clamp-3">{product.description}</p>

                  {/* Sizes */}
                  {product.sizes.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-f-muted mb-2">Grösse</p>
                      <div className="flex gap-2 flex-wrap">
                        {product.sizes.map((s, i) => (
                          <button key={s} onClick={() => setSelectedSize(i)}
                            className={`px-4 py-2 text-[11px] uppercase tracking-[0.1em] border transition-all ${
                              i === selectedSize ? 'border-f-green bg-f-green/10 text-f-green-light' : 'border-f-border text-f-muted hover:border-f-lighter'
                            }`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto space-y-3">
                    {/* Add to cart */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className="btn-shimmer group relative overflow-hidden flex-1 bg-f-green text-white py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/25 transition-all duration-500 disabled:opacity-50"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <ShoppingBag size={14} />
                          {adding ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
                        </span>
                        <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      </button>
                      <button
                        onClick={() => toggleWishlist(product.id, product.name)}
                        className={`w-12 border flex items-center justify-center transition-all ${
                          isFav
                            ? 'border-red-500/40 bg-red-500/10 text-red-500'
                            : 'border-f-border hover:border-f-green/40 text-f-muted hover:text-f-green-light'
                        }`}
                      >
                        <Heart size={16} className={isFav ? 'fill-red-500' : ''} />
                      </button>
                    </div>

                    {/* View full details */}
                    <Link
                      to={`/product/${product.id}`}
                      onClick={onClose}
                      className="flex items-center justify-center gap-2 py-2.5 text-f-green-light text-[11px] uppercase tracking-[0.2em] hover:gap-3 transition-all"
                    >
                      Alle Details ansehen <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
