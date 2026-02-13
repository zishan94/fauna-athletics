import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="py-32 md:py-44 px-6 lg:px-8">
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="font-heading text-[8rem] md:text-[12rem] leading-none tracking-[0.02em] text-f-green/20 mb-2">404</h1>
          <h2 className="font-heading text-3xl md:text-4xl tracking-[0.02em] mb-4">SEITE NICHT GEFUNDEN</h2>
          <p className="text-f-muted text-[15px] mb-10 max-w-md mx-auto">
            Die gesuchte Seite existiert leider nicht. Möglicherweise wurde sie verschoben oder entfernt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-shimmer group relative overflow-hidden bg-f-green text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-f-green/20 transition-shadow duration-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Home size={14} /> Zur Startseite
              </span>
              <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </Link>
            <Link
              to="/shop"
              className="border border-f-border text-f-muted hover:text-f-text hover:border-f-lighter px-8 py-4 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
            >
              Zum Shop <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
