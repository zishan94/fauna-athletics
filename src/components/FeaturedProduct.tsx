import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { ShoppingBag, Star, Check } from 'lucide-react'

export default function FeaturedProduct() {
  const { ref, inView } = useInView(0.15)

  return (
    <section ref={ref} className="relative py-20 md:py-32 overflow-hidden">
      {/* Dark background band */}
      <div className="absolute inset-0 bg-fauna-dark" />
      <div className="absolute top-0 left-0 right-0 accent-line" />
      <div className="absolute bottom-0 left-0 right-0 accent-line" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Large product image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-square lg:aspect-[4/5] overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1509255502683-2c2bffc4b231?w=900&q=85&auto=format"
              alt="Fauna Pro Boxhandschuhe"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-fauna-dark/60 to-transparent" />

            {/* Best seller badge */}
            <div className="absolute top-6 left-6 bg-fauna-accent px-4 py-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white font-medium">★ Bestseller</span>
            </div>
          </motion.div>

          {/* Right: Product details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[11px] uppercase tracking-[0.5em] text-fauna-accent mb-4 block">Featured Product</span>
            <h3 className="font-heading text-4xl md:text-5xl lg:text-6xl tracking-[0.02em] leading-[0.9] mb-4">
              FAUNA PRO<br />BOXHANDSCHUHE
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="text-fauna-gold fill-fauna-gold" />
                ))}
              </div>
              <span className="text-fauna-muted text-xs">(47 Bewertungen)</span>
            </div>

            <p className="text-fauna-muted leading-relaxed mb-8">
              Unsere Flaggschiff-Handschuhe aus 100% echtem Leder mit Multi-Layer-Schaumstoff 
              für ultimativen Schutz. Entwickelt für Sparring und Wettkampf — getestet von 
              Profi-Kämpfern in der Schweiz und Portugal.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {[
                '100% echtes Premium-Rindsleder',
                'Multi-Layer Foam für optimalen Schutz',
                'Atmungsaktives Innenfutter',
                'Verstärkte Handgelenkstütze',
                'Handgefertigt in Portugal',
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-fauna-accent/10 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-fauna-accent" />
                  </div>
                  <span className="text-sm text-fauna-text/80">{f}</span>
                </div>
              ))}
            </div>

            {/* Size selector */}
            <div className="mb-8">
              <p className="text-[11px] uppercase tracking-[0.2em] text-fauna-muted mb-3">Grösse wählen</p>
              <div className="flex gap-2">
                {['10oz', '12oz', '14oz', '16oz'].map((s, i) => (
                  <button key={s} className={`px-5 py-2.5 text-xs uppercase tracking-[0.15em] border transition-all duration-300 ${
                    i === 1
                      ? 'border-fauna-accent bg-fauna-accent/10 text-fauna-accent'
                      : 'border-fauna-lighter text-fauna-muted hover:border-fauna-text hover:text-fauna-text'
                  }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price + CTA */}
            <div className="flex items-end gap-6 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-fauna-muted mb-1">Preis</p>
                <p className="font-heading text-4xl text-fauna-gold">CHF 129.00</p>
              </div>
              <button className="group relative overflow-hidden bg-fauna-accent text-white px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium flex items-center gap-3">
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingBag size={16} />
                  In den Warenkorb
                </span>
                <span className="absolute inset-0 bg-fauna-accent-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>

            <p className="text-fauna-muted/50 text-[11px]">Kostenloser Versand · 30 Tage Rückgaberecht</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
