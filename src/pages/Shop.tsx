import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'

const categories = [
  { key: 'all', label: 'Alle' },
  { key: 'gloves', label: 'Handschuhe' },
  { key: 'shorts', label: 'Shorts' },
  { key: 'tops', label: 'Tops' },
  { key: 'bundles', label: 'Bundles' },
]

const sortOptions = [
  { key: '', label: 'Empfohlen' },
  { key: 'created_at', label: 'Neueste' },
  { key: 'title', label: 'A-Z' },
]

export default function Shop() {
  const [active, setActive] = useState('all')
  const [sort, setSort] = useState('')

  const { products, loading } = useProducts({
    order: sort || undefined,
  })

  const filtered = active === 'all'
    ? products
    : products.filter(p => p.category === active)

  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="mb-14">
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Shop</span>
          <h1 className="font-heading text-5xl md:text-7xl tracking-[0.02em] mb-4">ALLE PRODUKTE</h1>
          <p className="text-f-muted text-[15px] mb-8">Entdecke unsere gesamte Kollektion — von Handschuhen bis Bekleidung.</p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              {categories.map(c => (
                <button key={c.key} onClick={() => setActive(c.key)}
                  className={`relative px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] border transition-all duration-300 ${
                    active === c.key
                      ? 'border-f-green bg-f-green/10 text-f-green-light'
                      : 'border-f-border text-f-muted hover:border-f-lighter hover:text-f-text'
                  }`}>
                  {c.label}
                  {active === c.key && (
                    <motion.span layoutId="activeFilter" className="absolute inset-0 border-2 border-f-green/30 pointer-events-none" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </button>
              ))}
              <span className="text-f-muted/60 text-sm ml-2">{filtered.length} {filtered.length === 1 ? 'Produkt' : 'Produkte'}</span>
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-f-gray/50 border border-f-border/40 px-4 py-2.5 text-[12px] text-f-muted focus:outline-none focus:border-f-green/40 transition-colors rounded-sm cursor-pointer"
            >
              {sortOptions.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="accent-line mb-10" />

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-f-gray mb-4" />
                <div className="h-4 bg-f-gray w-3/4 mb-2" />
                <div className="h-3 bg-f-gray w-1/2 mb-3" />
                <div className="h-4 bg-f-gray w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24">
                <p className="text-f-muted text-lg mb-2">Keine Produkte in dieser Kategorie.</p>
                <button onClick={() => setActive('all')} className="text-f-green-light text-sm hover:underline">Alle Produkte anzeigen</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
