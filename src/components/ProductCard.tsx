import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Eye } from 'lucide-react'
import type { Product } from '../data/products'
import { useCart } from '../context/CartContext'
import { useRegion } from '../context/RegionContext'
import { useWishlist } from '../context/WishlistContext'
import QuickView from './QuickView'

export default function ProductCard({ product, index = 0, inView = true }: { product: Product; index?: number; inView?: boolean }) {
  const { addItem, addLocalItem, isMedusaConnected } = useCart()
  const { formatPrice } = useRegion()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [noVariantWarning, setNoVariantWarning] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const isFav = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setNoVariantWarning(false)

    // If product has Medusa variants, use the API cart
    const variantId = product.variants?.[0]?.id
    if (variantId) {
      addItem(variantId)
    } else if (isMedusaConnected) {
      // Medusa is active but product has no variant – cannot add to Medusa cart
      setNoVariantWarning(true)
      setTimeout(() => setNoVariantWarning(false), 3000)
    } else {
      // Offline browsing fallback
      addLocalItem(product)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.04 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-f-gray mb-4 border border-transparent card-glow">
          <img src={product.image} alt={product.name} className="product-img w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-f-black/0 group-hover:bg-f-black/10 transition-all duration-500" />

          {product.tag && (
            <div className="absolute top-3 left-3">
              <span className={`inline-block px-3.5 py-1.5 text-[9px] uppercase tracking-[0.2em] font-semibold rounded-sm ${
                product.tag === 'BESTSELLER' ? 'bg-gradient-to-r from-f-gold-dark to-f-gold text-white shadow-lg shadow-f-gold/20' :
                product.tag === 'NEU' ? 'bg-white text-f-black' :
                'bg-f-sand text-f-black'
              }`}>{product.tag === 'BESTSELLER' ? '\u2605 ' + product.tag : product.tag}</span>
            </div>
          )}

          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-400 ${isFav ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0'}`}>
            <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id, product.name) }} className="w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-colors rounded-sm shadow-lg shadow-black/10" aria-label="Wunschliste">
              <Heart size={14} className={isFav ? 'text-red-500 fill-red-500' : 'text-f-black'} />
            </button>
            <button onClick={e => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true) }} className="w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-colors rounded-sm shadow-lg shadow-black/10" aria-label="Schnellansicht">
              <Eye size={14} className="text-f-black" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {noVariantWarning ? (
              <div className="w-full bg-red-900/80 py-3.5 flex items-center justify-center gap-2 text-white text-[10px] uppercase tracking-[0.2em] font-medium">
                Produkt nicht verfügbar
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full bg-f-green hover:bg-f-green-dark py-3.5 flex items-center justify-center gap-2 text-white text-[10px] uppercase tracking-[0.2em] font-medium transition-colors"
              >
                <ShoppingBag size={13} />
                In den Warenkorb
              </button>
            )}
          </div>
        </div>
      </Link>

      <Link to={`/product/${product.id}`}>
        <h3 className="text-[15px] font-medium mb-1 group-hover:text-f-green-light transition-colors duration-300">{product.name}</h3>
      </Link>
      <p className="text-f-muted text-[13px] mb-2.5">{product.subtitle}</p>
      <div className="flex items-center gap-3">
        <span className="text-[15px] font-semibold">{formatPrice(product.price)}</span>
        {product.originalPrice && (
          <span className="text-f-muted text-[13px] line-through">{formatPrice(product.originalPrice)}</span>
        )}
      </div>
      {product.colors.length > 0 && (
        <div className="flex gap-1.5 mt-3">
          {product.colors.map((c, i) => (
            <span key={i} className="w-4 h-4 rounded-full border border-f-lighter/40 hover:scale-110 transition-transform cursor-pointer" style={{ backgroundColor: c }} />
          ))}
        </div>
      )}

      <QuickView product={product} isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </motion.div>
  )
}
