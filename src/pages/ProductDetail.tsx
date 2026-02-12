import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Star, Check, ChevronRight, Truck, RotateCcw } from 'lucide-react'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const product = products.find(p => p.id === id)
  const [selectedSize, setSelectedSize] = useState(0)

  if (!product) return (
    <div className="py-40 text-center">
      <p className="text-f-muted">Produkt nicht gefunden.</p>
      <Link to="/shop" className="text-f-green-light mt-4 inline-block">Zurück zum Shop</Link>
    </div>
  )

  const related = products.filter(p => p.id !== id).slice(0, 3)

  return (
    <div className="py-10 md:py-16 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-f-muted mb-8">
          <Link to="/" className="hover:text-f-text transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-f-text transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-f-text">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}>
            <div className="aspect-square bg-f-gray overflow-hidden relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              {product.tag && (
                <span className={`absolute top-4 left-4 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-medium ${
                  product.tag === 'BESTSELLER' ? 'bg-f-green text-white' :
                  product.tag === 'NEU' ? 'bg-white text-f-black' : 'bg-f-sand text-f-black'
                }`}>{product.tag}</span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <div key={i} className="w-20 h-20 bg-f-gray overflow-hidden border-2 border-f-border/30 hover:border-f-green/40 transition-colors cursor-pointer">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16,1,0.3,1] }}>
            <h1 className="font-heading text-3xl md:text-4xl tracking-[0.02em] mb-2">{product.name}</h1>
            <p className="text-f-muted text-sm mb-4">{product.subtitle}</p>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={13} className="text-f-sand fill-f-sand"/>)}</div>
              <span className="text-f-muted text-xs">(47 Bewertungen)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-heading text-3xl text-f-sand">CHF {product.price.toFixed(2)}</span>
              {product.originalPrice && <span className="text-f-muted line-through">CHF {product.originalPrice.toFixed(2)}</span>}
            </div>

            <p className="text-f-muted leading-relaxed mb-7">{product.description}</p>

            {/* Colors */}
            <div className="mb-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2.5">Farbe</p>
              <div className="flex gap-2">
                {product.colors.map((c, i) => (
                  <button key={i} className="w-7 h-7 rounded-full border-2 border-f-lighter/40 hover:border-f-green/60 transition-colors" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2.5">Grösse</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((s, i) => (
                  <button key={s} onClick={() => setSelectedSize(i)}
                    className={`px-5 py-2.5 text-xs uppercase tracking-[0.15em] border transition-all duration-300 ${
                      i === selectedSize ? 'border-f-green bg-f-green/10 text-f-green-light' : 'border-f-border text-f-muted hover:border-f-text hover:text-f-text'
                    }`}>{s}</button>
                ))}
              </div>
            </div>

            {/* Add to cart */}
            <div className="flex gap-3 mb-6">
              <button className="group relative overflow-hidden flex-1 bg-f-green text-white py-4 text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2">
                <span className="relative z-10 flex items-center gap-2"><ShoppingBag size={16}/>In den Warenkorb</span>
                <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
              </button>
              <button className="w-14 border border-f-border hover:border-f-green/40 flex items-center justify-center text-f-muted hover:text-f-green-light transition-all">
                <Heart size={18}/>
              </button>
            </div>

            {/* Trust */}
            <div className="flex gap-5 pt-6 border-t border-f-border/30">
              <div className="flex items-center gap-2 text-f-muted text-xs"><Truck size={14} className="text-f-green-light"/>Gratis ab CHF 69.-</div>
              <div className="flex items-center gap-2 text-f-muted text-xs"><RotateCcw size={14} className="text-f-green-light"/>30 Tage Rückgabe</div>
            </div>

            {/* Features */}
            <div className="mt-8 pt-6 border-t border-f-border/30">
              <p className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-4">Features</p>
              <div className="space-y-2.5">
                {product.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 bg-f-green/10 flex items-center justify-center flex-shrink-0"><Check size={10} className="text-f-green-light"/></div>
                    <span className="text-sm text-f-text/75">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24 pt-16 border-t border-f-border/20">
            <h3 className="font-heading text-3xl tracking-[0.02em] mb-8">DAS KÖNNTE DIR AUCH GEFALLEN</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
