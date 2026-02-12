import { useState } from 'react'
import { motion } from 'framer-motion'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'

const categories = [
  { key: 'all', label: 'Alle' },
  { key: 'gloves', label: 'Handschuhe' },
  { key: 'shorts', label: 'Shorts' },
  { key: 'tops', label: 'Tops' },
  { key: 'bundles', label: 'Bundles' },
]

export default function Shop() {
  const [active, setActive] = useState('all')
  const filtered = active === 'all' ? products : products.filter(p => p.category === active)

  return (
    <div className="py-16 md:py-24 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="mb-12">
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-2 block">Shop</span>
          <h1 className="font-heading text-5xl md:text-7xl tracking-[0.02em] mb-6">ALLE PRODUKTE</h1>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            {categories.map(c => (
              <button key={c.key} onClick={() => setActive(c.key)}
                className={`px-5 py-2 text-[11px] uppercase tracking-[0.2em] border transition-all duration-300 ${
                  active === c.key
                    ? 'border-f-green bg-f-green/10 text-f-green-light'
                    : 'border-f-border text-f-muted hover:border-f-text hover:text-f-text'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-f-muted text-center py-20">Keine Produkte in dieser Kategorie.</p>
        )}
      </div>
    </div>
  )
}
