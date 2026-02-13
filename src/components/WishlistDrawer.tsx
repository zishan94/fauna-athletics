import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import { useRegion } from '../context/RegionContext'

interface WishlistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { wishlist, toggleWishlist } = useWishlist()
  const { products } = useProducts({ limit: 50 })
  const { addItem, addLocalItem, isMedusaConnected } = useCart()
  const { formatPrice } = useRegion()

  const favProducts = products.filter(p => wishlist.includes(p.id))

  const handleAddToCart = (product: typeof favProducts[0]) => {
    const variantId = product.variants?.[0]?.id
    if (variantId) {
      addItem(variantId)
    } else if (!isMedusaConnected) {
      addLocalItem(product)
    }
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
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
                <Heart size={18} className="text-red-400" />
                <h2 className="font-heading text-2xl tracking-[0.05em]">FAVORITEN</h2>
                {wishlist.length > 0 && (
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-f-muted hover:text-f-text hover:bg-white/[0.04] transition-all rounded-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-f-gray flex items-center justify-center mb-5">
                    <Heart size={24} className="text-f-muted/50" />
                  </div>
                  <p className="text-f-muted text-[15px] mb-2">Keine Favoriten</p>
                  <p className="text-f-muted/60 text-[13px] mb-6">
                    Klicke auf das Herz bei einem Produkt, um es hier zu speichern.
                  </p>
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="text-f-green-light text-[12px] uppercase tracking-[0.2em] hover:underline"
                  >
                    Zum Shop
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {favProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex gap-4 py-4 border-b border-f-border/20 last:border-0"
                    >
                      {/* Thumbnail */}
                      <Link
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="w-20 h-24 bg-f-gray flex-shrink-0 overflow-hidden group"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${product.id}`} onClick={onClose}>
                          <h4 className="text-[14px] font-medium truncate hover:text-f-green-light transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        <p className="text-f-muted text-[12px] mt-0.5 truncate">{product.subtitle}</p>
                        <p className="text-f-sand text-[14px] font-medium mt-2">
                          {formatPrice(product.price)}
                        </p>

                        <div className="flex items-center gap-2 mt-3">
                          {/* Add to cart */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-f-green/10 border border-f-green/30 text-f-green-light text-[10px] uppercase tracking-[0.15em] hover:bg-f-green/20 transition-colors rounded-sm"
                          >
                            <ShoppingBag size={12} />
                            In den Warenkorb
                          </button>

                          {/* Remove from wishlist */}
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="w-8 h-8 flex items-center justify-center text-f-muted/50 hover:text-red-400 transition-colors"
                            aria-label="Entfernen"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading state: wishlist has IDs but products not loaded yet */}
                  {wishlist.length > 0 && favProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-f-green/30 border-t-f-green rounded-full animate-spin mb-4" />
                      <p className="text-f-muted text-[13px]">Favoriten werden geladen...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {favProducts.length > 0 && (
              <div className="border-t border-f-border/30 px-6 py-4">
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="w-full border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter py-3.5 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center transition-all"
                >
                  Weiter einkaufen
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
