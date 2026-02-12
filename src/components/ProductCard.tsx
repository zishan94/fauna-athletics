import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart } from 'lucide-react'
import type { Product } from '../data/products'

export default function ProductCard({ product, index = 0, inView = true }: { product: Product; index?: number; inView?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.04 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-f-gray mb-4">
          <img src={product.image} alt={product.name} className="product-img w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-f-black/0 group-hover:bg-f-black/15 transition-all duration-500" />

          {product.tag && (
            <div className="absolute top-3 left-3">
              <span className={`inline-block px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-medium ${
                product.tag === 'BESTSELLER' ? 'bg-f-green text-white' :
                product.tag === 'NEU' ? 'bg-white text-f-black' :
                'bg-f-sand text-f-black'
              }`}>{product.tag}</span>
            </div>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <button onClick={e => e.preventDefault()} className="w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-colors">
              <Heart size={14} className="text-f-black" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <button onClick={e => e.preventDefault()} className="w-full bg-f-green hover:bg-f-green-dark py-3.5 flex items-center justify-center gap-2 text-white text-[10px] uppercase tracking-[0.2em] font-medium transition-colors">
              <ShoppingBag size={13} />
              In den Warenkorb
            </button>
          </div>
        </div>
      </Link>

      <Link to={`/product/${product.id}`}>
        <h3 className="text-sm font-medium mb-1 group-hover:text-f-green-light transition-colors duration-300">{product.name}</h3>
      </Link>
      <p className="text-f-muted text-xs mb-2">{product.subtitle}</p>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">CHF {product.price.toFixed(2)}</span>
        {product.originalPrice && (
          <span className="text-f-muted text-xs line-through">CHF {product.originalPrice.toFixed(2)}</span>
        )}
      </div>
      {product.colors.length > 0 && (
        <div className="flex gap-1.5 mt-2.5">
          {product.colors.map((c, i) => (
            <span key={i} className="w-3.5 h-3.5 rounded-full border border-f-lighter/40" style={{ backgroundColor: c }} />
          ))}
        </div>
      )}
    </motion.div>
  )
}
