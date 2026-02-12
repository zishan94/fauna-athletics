import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section id="hero" className="relative">
      {/* Full-width hero with split layout */}
      <div className="grid lg:grid-cols-2 min-h-[85vh]">
        {/* Left: Content */}
        <div className="flex items-center px-8 lg:px-16 py-20 lg:py-0 relative">
          <div className="absolute inset-0 bg-fauna-black" />
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-fauna-lighter/20 to-transparent hidden lg:block" />

          <div className="relative z-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 bg-fauna-accent/10 border border-fauna-accent/20 px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 bg-fauna-accent rounded-full animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-fauna-accent font-medium">Neue Kollektion 2025</span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-[clamp(3.5rem,7vw,7rem)] leading-[0.88] tracking-[0.02em] mb-6"
            >
              PREMIUM<br />
              KAMPFSPORT<span className="text-fauna-accent">-</span><br />
              <span className="text-stroke">BEKLEIDUNG</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-fauna-muted text-base leading-relaxed mb-10 max-w-md"
            >
              Von Kampfsportlern entwickelt, in Portugal produziert. 
              Kompromisslose Qualität für kompromisslose Athleten.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#products" className="group relative overflow-hidden bg-fauna-accent text-white px-10 py-4 text-[11px] uppercase tracking-[0.3em] font-medium flex items-center gap-3">
                <span className="relative z-10 flex items-center gap-3">
                  Jetzt shoppen
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <span className="absolute inset-0 bg-fauna-accent-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </a>
              <a href="#brand" className="border border-fauna-lighter text-fauna-text hover:border-fauna-accent hover:text-fauna-accent px-10 py-4 text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-300">
                Mehr erfahren
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex gap-8 mt-14 pt-8 border-t border-fauna-light/15"
            >
              {[
                { val: '100%', label: 'Echtleder' },
                { val: 'Free', label: 'Versand ab 69.-' },
                { val: '30d', label: 'Rückgabe' },
              ].map((b) => (
                <div key={b.label}>
                  <p className="font-heading text-xl text-fauna-accent">{b.val}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-fauna-muted mt-0.5">{b.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right: Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&q=80&auto=format"
            alt="Boxing gloves"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-fauna-black via-fauna-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-fauna-black/60 to-transparent" />
          
          {/* Floating product badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 right-8 glass px-5 py-4"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-fauna-muted mb-1">Ab</p>
            <p className="font-heading text-3xl text-fauna-gold">CHF 49.-</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
