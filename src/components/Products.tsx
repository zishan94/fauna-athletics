import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { ShoppingBag, Heart, Eye } from 'lucide-react'

interface Product {
  name: string
  subtitle: string
  price: string
  originalPrice?: string
  tag?: string
  image: string
  colors?: string[]
}

const products: Product[] = [
  {
    name: 'Fauna Pro Boxhandschuhe',
    subtitle: 'Echtes Leder · Multi-Layer Foam',
    price: 'CHF 129.00',
    tag: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1509255502683-2c2bffc4b231?w=600&q=80&auto=format',
    colors: ['#1a1a1a', '#8B0000', '#1c3d5a'],
  },
  {
    name: 'Fauna MMA Handschuhe',
    subtitle: 'Premium Leder · Open Palm',
    price: 'CHF 89.00',
    tag: 'NEU',
    image: 'https://images.unsplash.com/photo-1615117950532-b25ec586f594?w=600&q=80&auto=format',
    colors: ['#1a1a1a', '#8B0000'],
  },
  {
    name: 'Fauna Fight Shorts 2.0',
    subtitle: '2-teilig · 4-Way Stretch',
    price: 'CHF 69.00',
    image: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80&auto=format',
    colors: ['#1a1a1a', '#2d3436', '#8B0000'],
  },
  {
    name: 'Fauna Rashguard Pro',
    subtitle: 'Kompression · UV-Schutz',
    price: 'CHF 59.00',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80&auto=format',
    colors: ['#1a1a1a', '#1c3d5a'],
  },
  {
    name: 'Fauna Raglan Tee',
    subtitle: 'Atmungsaktiv · Perfect Fit',
    price: 'CHF 49.00',
    originalPrice: 'CHF 59.00',
    image: 'https://images.unsplash.com/photo-1583473848882-f9a5a4c8e532?w=600&q=80&auto=format',
    colors: ['#1a1a1a', '#2d3436', '#f5f5f5'],
  },
  {
    name: 'Fauna Training Bundle',
    subtitle: 'Shorts + Rashguard Set',
    price: 'CHF 109.00',
    originalPrice: 'CHF 128.00',
    tag: 'SPARE 15%',
    image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600&q=80&auto=format',
    colors: ['#1a1a1a'],
  },
]

function ProductCard({ product, index, inView }: { product: Product; index: number; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.05 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-fauna-gray mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="product-img w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-fauna-black/0 group-hover:bg-fauna-black/20 transition-all duration-500" />

        {/* Tag */}
        {product.tag && (
          <div className="absolute top-3 left-3">
            <span className={`inline-block px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] font-medium ${
              product.tag === 'BESTSELLER' ? 'bg-fauna-accent text-white' :
              product.tag === 'NEU' ? 'bg-white text-fauna-black' :
              'bg-fauna-gold text-fauna-black'
            }`}>
              {product.tag}
            </span>
          </div>
        )}

        {/* Quick action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-400">
          <button className="w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-colors">
            <Heart size={14} className="text-fauna-black" />
          </button>
          <button className="w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-colors">
            <Eye size={14} className="text-fauna-black" />
          </button>
        </div>

        {/* Add to cart bar */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <button className="w-full bg-fauna-accent hover:bg-fauna-accent-dark py-3.5 flex items-center justify-center gap-2 text-white text-[11px] uppercase tracking-[0.25em] font-medium transition-colors">
            <ShoppingBag size={14} />
            In den Warenkorb
          </button>
        </div>
      </div>

      {/* Info */}
      <div>
        <h3 className="text-sm font-medium mb-1 group-hover:text-fauna-accent transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-fauna-muted text-xs mb-2">{product.subtitle}</p>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{product.price}</span>
          {product.originalPrice && (
            <span className="text-fauna-muted text-xs line-through">{product.originalPrice}</span>
          )}
        </div>
        {/* Color options */}
        {product.colors && (
          <div className="flex gap-1.5 mt-3">
            {product.colors.map((c, i) => (
              <button key={i} className="w-4 h-4 rounded-full border border-fauna-lighter/30 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function Products() {
  const { ref, inView } = useInView(0.05)

  return (
    <section id="products" ref={ref} className="relative py-28 md:py-40 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <span className="text-[11px] uppercase tracking-[0.5em] text-fauna-accent mb-3 block">Kollektion</span>
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-[0.02em]">
              UNSERE PRODUKTE
            </h2>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            {['Alle', 'Handschuhe', 'Bekleidung', 'Sets'].map((f, i) => (
              <button key={f} className={`text-[11px] uppercase tracking-[0.2em] pb-1 border-b-2 transition-colors duration-300 ${
                i === 0 ? 'text-fauna-text border-fauna-accent' : 'text-fauna-muted border-transparent hover:text-fauna-text'
              }`}>
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
          {products.map((p, i) => (
            <ProductCard key={p.name} product={p} index={i} inView={inView} />
          ))}
        </div>

        {/* View all */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-14"
        >
          <a href="#" className="inline-flex items-center gap-3 border border-fauna-lighter text-fauna-text hover:border-fauna-accent hover:text-fauna-accent px-10 py-4 text-[11px] uppercase tracking-[0.3em] transition-all duration-300">
            Alle Produkte anzeigen
          </a>
        </motion.div>
      </div>
    </section>
  )
}
