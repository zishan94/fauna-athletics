import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSearch } from '../hooks/useSearch'
import { useRegion } from '../context/RegionContext'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { results, loading, query, search, clear } = useSearch()
  const { formatPrice } = useRegion()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      clear()
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, clear])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-f-black/90 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-0 z-50 max-h-[85vh] overflow-y-auto"
          >
            <div className="max-w-3xl mx-auto px-6 pt-20 pb-10">
              {/* Search input */}
              <div className="relative mb-8">
                <Search size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-f-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => search(e.target.value)}
                  placeholder="Produkte suchen..."
                  className="w-full bg-transparent border-b-2 border-f-border/40 focus:border-f-green pl-8 pr-10 py-4 text-2xl font-heading tracking-[0.05em] text-f-text placeholder:text-f-muted/40 focus:outline-none transition-colors"
                />
                <button
                  onClick={onClose}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-f-muted hover:text-f-text transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center gap-3 py-8">
                  <div className="w-5 h-5 border-2 border-f-green/30 border-t-f-green rounded-full animate-spin" />
                  <span className="text-f-muted text-sm">Suche...</span>
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-f-muted text-[11px] uppercase tracking-[0.2em] mb-4">
                    {results.length} {results.length === 1 ? 'Ergebnis' : 'Ergebnisse'}
                  </p>
                  {results.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center gap-5 py-4 px-4 hover:bg-white/[0.03] transition-colors group rounded-sm"
                      >
                        <div className="w-16 h-16 bg-f-gray flex-shrink-0 overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[15px] font-medium group-hover:text-f-green-light transition-colors truncate">
                            {product.name}
                          </h4>
                          <p className="text-f-muted text-[13px]">{product.subtitle}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[15px] font-semibold">{formatPrice(product.price)}</p>
                          <ArrowRight size={14} className="text-f-muted ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* No results */}
              {!loading && query.trim() && results.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-f-muted text-lg mb-2">Keine Ergebnisse gefunden</p>
                  <p className="text-f-muted/60 text-sm">Versuche einen anderen Suchbegriff.</p>
                </div>
              )}

              {/* Suggestions when empty */}
              {!query.trim() && (
                <div className="py-4">
                  <p className="text-f-muted/50 text-[11px] uppercase tracking-[0.2em] mb-4">Beliebte Suchen</p>
                  <div className="flex flex-wrap gap-2">
                    {['Boxhandschuhe', 'MMA Shorts', 'Rashguard', 'Trainings-Bundle'].map(term => (
                      <button
                        key={term}
                        onClick={() => search(term)}
                        className="px-4 py-2 bg-f-gray/50 border border-f-border/30 text-f-muted text-[13px] hover:text-f-text hover:border-f-lighter transition-colors rounded-sm"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
