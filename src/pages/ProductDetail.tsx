import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Star, Check, ChevronRight, Truck, RotateCcw, Shield, AlertTriangle, Eye, Share2, Ruler, X, Copy, MessageCircle } from 'lucide-react'
import { notifySuccess } from '../lib/notifications'
import { useProduct } from '../hooks/useProduct'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'
import { useRegion } from '../context/RegionContext'
import { useWishlist } from '../context/WishlistContext'
import { useStoreSettings } from '../hooks/useStoreSettings'
import ProductCard from '../components/ProductCard'
import RecentlyViewed, { addToRecentlyViewed } from '../components/RecentlyViewed'

export default function ProductDetail() {
  const { id } = useParams()
  const { product, loading } = useProduct(id)
  const { products: allProducts } = useProducts()
  const { addItem, addLocalItem, isMedusaConnected } = useCart()
  const { formatPrice } = useRegion()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { freeShippingThreshold } = useStoreSettings()
  const [selectedSize, setSelectedSize] = useState(0)
  const [selectedImage, setSelectedImage] = useState(0)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [showShare, setShowShare] = useState(false)

  // Simulated live viewer count (stable per product per session)
  const viewerCount = useMemo(() => Math.floor(Math.random() * 12) + 3, [id])

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        subtitle: product.subtitle,
      })
    }
  }, [product])

  // Low stock detection (check Medusa inventory or fallback)
  const isLowStock = useMemo(() => {
    if (!product?.variants) return false
    return product.variants.some((v: any) => {
      const qty = v.inventory_quantity ?? v.manage_inventory_quantity
      return typeof qty === 'number' && qty > 0 && qty <= 10
    })
  }, [product])

  if (loading) {
    return (
      <div className="py-12 md:py-20 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="aspect-square bg-f-gray animate-pulse" />
            <div className="space-y-4 py-8">
              <div className="h-8 bg-f-gray w-3/4 animate-pulse" />
              <div className="h-4 bg-f-gray w-1/2 animate-pulse" />
              <div className="h-10 bg-f-gray w-1/3 animate-pulse mt-4" />
              <div className="h-20 bg-f-gray w-full animate-pulse mt-6" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) return (
    <div className="py-40 text-center">
      <h2 className="font-heading text-3xl mb-4">Produkt nicht gefunden</h2>
      <p className="text-f-muted mb-6">Das gesuchte Produkt existiert leider nicht.</p>
      <Link to="/shop" className="text-f-green-light hover:underline">Zurück zum Shop</Link>
    </div>
  )

  const related = allProducts.filter(p => p.id !== id).slice(0, 3)

  const handleAddToCart = async () => {
    setAdding(true)
    setAddError(null)

    // Find the variant whose option values match the selected size.
    // This is more robust than indexing into variants[] directly, which
    // breaks when variants are ordered differently from option values or
    // when a product has multiple options (size + color).
    const selectedSizeValue = product.sizes[selectedSize]
    const variant = product.variants?.find((v: any) =>
      v.options?.some((o: any) => {
        const val = typeof o === 'string' ? o : (o.value ?? o)
        return val === selectedSizeValue
      })
    ) || product.variants?.[0]

    if (variant?.id) {
      // Medusa API cart
      await addItem(variant.id)
    } else if (isMedusaConnected) {
      // Medusa is active but this product has no variant – cannot add to backend cart
      setAddError('Dieses Produkt hat keine verfügbare Variante und kann nicht in den Warenkorb gelegt werden.')
    } else {
      // Offline browsing fallback
      addLocalItem(product)
    }
    setAdding(false)
  }

  return (
    <div className="py-12 md:py-20 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-f-muted mb-10">
          <Link to="/" className="hover:text-f-text transition-colors">Startseite</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-f-text transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-f-text">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}>
            <div className="aspect-square bg-f-gray overflow-hidden relative group">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
              />
              {product.tag && (
                <span className={`absolute top-5 left-5 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-medium rounded-sm ${
                  product.tag === 'BESTSELLER' ? 'bg-gradient-to-r from-f-gold-dark to-f-gold text-white shadow-lg shadow-f-gold/20' :
                  product.tag === 'NEU' ? 'bg-white text-f-black' : 'bg-f-sand text-f-black'
                }`}>{product.tag === 'BESTSELLER' ? '\u2605 ' + product.tag : product.tag}</span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 bg-f-gray overflow-hidden transition-all duration-300 ${
                      i === selectedImage
                        ? 'border-2 border-f-green ring-1 ring-f-green/30'
                        : 'border-2 border-f-border/30 hover:border-f-lighter'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16,1,0.3,1] }}>
            <h1 className="font-heading text-4xl md:text-5xl tracking-[0.02em] mb-2">{product.name}</h1>
            <p className="text-f-muted text-[15px] mb-4">{product.subtitle}</p>

            {/* Social proof & urgency */}
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div className="flex items-center gap-2 text-f-muted text-[12px]">
                <span className="w-2 h-2 rounded-full bg-f-green-light viewer-dot" />
                <Eye size={13} className="text-f-green-light" />
                <span>{viewerCount} Personen sehen sich dieses Produkt gerade an</span>
              </div>
              {isLowStock && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-f-gold-light bg-f-gold/10 border border-f-gold/25 px-3 py-1 rounded-sm low-stock-pulse">
                  Nur noch wenige verfügbar
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={14} className="text-f-sand fill-f-sand"/>)}</div>
              <span className="text-f-muted text-sm">5.0</span>
            </div>

            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-heading text-4xl text-f-sand">{formatPrice(product.price)}</span>
              {product.originalPrice && <span className="text-f-muted text-lg line-through">{formatPrice(product.originalPrice)}</span>}
            </div>
            <p className="text-f-muted/50 text-[11px] mb-7">inkl. MWST</p>

            <p className="text-f-muted text-[15px] leading-relaxed mb-8">{product.description}</p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mb-7">
                <p className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-3">Farbe</p>
                <div className="flex gap-2.5">
                  {product.colors.map((c, i) => (
                    <button key={i} className="w-8 h-8 rounded-full border-2 border-f-lighter/40 hover:border-f-green/60 transition-colors hover:scale-110" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-f-muted">Grösse</p>
                  <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1.5 text-f-green-light text-[11px] hover:underline transition-colors">
                    <Ruler size={12} /> Grössentabelle
                  </button>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {product.sizes.map((s, i) => (
                    <button key={s} onClick={() => setSelectedSize(i)}
                      className={`px-6 py-3 text-[12px] uppercase tracking-[0.15em] border transition-all duration-300 ${
                        i === selectedSize ? 'border-f-green bg-f-green/10 text-f-green-light' : 'border-f-border text-f-muted hover:border-f-lighter hover:text-f-text'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Share button */}
            <div className="mb-7">
              <button
                onClick={() => setShowShare(!showShare)}
                className="flex items-center gap-2 text-f-muted text-[12px] hover:text-f-green-light transition-colors"
              >
                <Share2 size={14} /> Teilen
              </button>
              {showShare && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      notifySuccess('Link kopiert!')
                      setShowShare(false)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-f-gray border border-f-border/30 text-[11px] text-f-muted hover:text-f-text hover:border-f-lighter transition-all rounded-sm"
                  >
                    <Copy size={12} /> Link kopieren
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(product.name + ' - ' + window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-f-gray border border-f-border/30 text-[11px] text-f-muted hover:text-f-text hover:border-f-lighter transition-all rounded-sm"
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* Add to cart */}
            <div className="flex gap-3 mb-7">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-shimmer group relative overflow-hidden flex-1 bg-f-green text-white py-4.5 text-[12px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2.5 hover:shadow-lg hover:shadow-f-green/25 transition-shadow duration-500 disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <ShoppingBag size={17}/>
                  {adding ? 'Wird hinzugefügt...' : 'In den Warenkorb'}
                </span>
                <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
              </button>
              <button
                onClick={() => product && toggleWishlist(product.id, product.name)}
                className={`w-14 border flex items-center justify-center transition-all ${
                  product && isInWishlist(product.id)
                    ? 'border-red-500/40 bg-red-500/10 text-red-500'
                    : 'border-f-border hover:border-f-green/40 hover:bg-f-green/5 text-f-muted hover:text-f-green-light'
                }`}
              >
                <Heart size={18} className={product && isInWishlist(product.id) ? 'fill-red-500' : ''} />
              </button>
            </div>

            {/* Add-to-cart error */}
            {addError && (
              <div className="flex items-start gap-2.5 mb-5 bg-red-900/20 border border-red-500/30 p-4 rounded-sm">
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-[13px]">{addError}</p>
              </div>
            )}

            {/* Trust signals */}
            <div className="flex flex-wrap gap-6 pt-7 border-t border-f-border/30">
              <div className="flex items-center gap-2.5 text-f-muted text-[13px]"><Truck size={16} className="text-f-green-light"/>Gratis ab CHF {freeShippingThreshold}.-</div>
              <div className="flex items-center gap-2.5 text-f-muted text-[13px]"><RotateCcw size={16} className="text-f-green-light"/>14 Tage Rückgabe</div>
              <div className="flex items-center gap-2.5 text-f-muted text-[13px]"><Shield size={16} className="text-f-green-light"/>Sichere Zahlung</div>
            </div>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="mt-9 pt-7 border-t border-f-border/30">
                <p className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-5">Features</p>
                <div className="space-y-3">
                  {product.features.map(f => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-f-green/10 flex items-center justify-center flex-shrink-0 rounded-sm"><Check size={12} className="text-f-green-light"/></div>
                      <span className="text-[15px] text-f-text/80">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-28 pt-16 border-t border-f-border/20">
            <div className="flex items-end justify-between mb-10">
              <h3 className="font-heading text-3xl md:text-4xl tracking-[0.02em]">DAS KÖNNTE DIR AUCH GEFALLEN</h3>
              <Link to="/shop" className="hidden md:flex text-f-green-light text-[12px] uppercase tracking-[0.2em] items-center gap-2 hover:gap-3 transition-all">
                Alle Produkte
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        <RecentlyViewed excludeId={id} />
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSizeGuide(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setShowSizeGuide(false)}
            >
              <div className="relative w-full max-w-lg bg-f-dark border border-f-border/30 shadow-2xl p-8" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowSizeGuide(false)} className="absolute top-4 right-4 text-f-muted hover:text-f-text transition-colors" aria-label="Schliessen">
                  <X size={18} />
                </button>
                <h3 className="font-heading text-2xl tracking-[0.02em] mb-6">GRÖSSENTABELLE</h3>
                <div className="overflow-x-auto">
                  {product.sizeGuide ? (
                    /* Dynamic size guide from Medusa product metadata */
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-f-border/30">
                          {product.sizeGuide.columns.map((col, i) => (
                            <th key={i} className={`py-3 ${i === 0 ? 'text-left pr-4' : 'text-center px-3'} text-f-muted text-[10px] uppercase tracking-[0.15em]`}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {product.sizeGuide.rows.map((row, ri) => (
                          <tr key={ri} className="border-b border-f-border/15 hover:bg-f-gray/30 transition-colors">
                            {row.map((cell, ci) => (
                              <td key={ci} className={`py-3 ${ci === 0 ? 'pr-4 font-medium' : 'px-3 text-center text-f-muted'}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    /* Fallback hardcoded size guide */
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-f-border/30">
                          <th className="text-left py-3 pr-4 text-f-muted text-[10px] uppercase tracking-[0.15em]">Grösse</th>
                          <th className="text-center py-3 px-3 text-f-muted text-[10px] uppercase tracking-[0.15em]">Brust (cm)</th>
                          <th className="text-center py-3 px-3 text-f-muted text-[10px] uppercase tracking-[0.15em]">Taille (cm)</th>
                          <th className="text-center py-3 pl-3 text-f-muted text-[10px] uppercase tracking-[0.15em]">Hüfte (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['S', '86-91', '71-76', '86-91'],
                          ['M', '91-97', '76-81', '91-97'],
                          ['L', '97-102', '81-86', '97-102'],
                          ['XL', '102-107', '86-91', '102-107'],
                          ['XXL', '107-112', '91-97', '107-112'],
                        ].map((row) => (
                          <tr key={row[0]} className="border-b border-f-border/15 hover:bg-f-gray/30 transition-colors">
                            <td className="py-3 pr-4 font-medium">{row[0]}</td>
                            <td className="py-3 px-3 text-center text-f-muted">{row[1]}</td>
                            <td className="py-3 px-3 text-center text-f-muted">{row[2]}</td>
                            <td className="py-3 pl-3 text-center text-f-muted">{row[3]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <p className="text-f-muted/50 text-[11px] mt-4">Alle Angaben in cm. Bei Fragen kontaktiere uns gerne.</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
