import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  const { ref, inView } = useInView(0.2)

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden">
      {/* Full background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1600&q=80&auto=format"
          alt="Hintergrund"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-fauna-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-fauna-black via-transparent to-fauna-black/60" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[11px] uppercase tracking-[0.5em] text-fauna-accent mb-5 block">Werde Teil des Rudels</span>
          <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl tracking-[0.02em] leading-[0.88] mb-6">
            WERDE TEIL<br />
            <span className="gradient-text">DES RUDELS.</span>
          </h2>
          <p className="text-fauna-muted text-base leading-relaxed max-w-lg mx-auto mb-10">
            Melde dich für unseren Newsletter an und erhalte 10% auf deine erste Bestellung. 
            Plus: exklusive Drops, Einblicke hinter die Kulissen und mehr.
          </p>

          {/* Email signup */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
            <input
              type="email"
              placeholder="Deine E-Mail Adresse"
              className="flex-1 bg-white/5 border border-fauna-lighter/30 px-5 py-4 text-sm text-fauna-text placeholder:text-fauna-muted/40 focus:outline-none focus:border-fauna-accent/50 transition-colors"
            />
            <button className="group relative overflow-hidden bg-fauna-accent text-white px-8 py-4 text-[11px] uppercase tracking-[0.25em] font-medium flex items-center justify-center gap-2 whitespace-nowrap">
              <span className="relative z-10 flex items-center gap-2">
                Anmelden
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-fauna-accent-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </div>

          <p className="text-fauna-muted/30 text-[10px] uppercase tracking-[0.2em]">
            Kein Spam · Jederzeit abmeldbar · 10% Willkommensrabatt
          </p>
        </motion.div>
      </div>
    </section>
  )
}
