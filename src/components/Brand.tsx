import { motion } from 'framer-motion'
import { useInView } from './useInView'

export default function Brand() {
  const { ref, inView } = useInView(0.15)

  return (
    <section id="brand" ref={ref} className="relative py-28 md:py-40 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left image grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1517438322307-e67111335449?w=600&q=80&auto=format" alt="Boxer training" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-square overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80&auto=format" alt="MMA training" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="pt-8 space-y-3">
                <div className="aspect-square overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1583473848882-f9a5a4c8e532?w=400&q=80&auto=format" alt="Boxing gloves detail" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-[3/4] overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1615117950532-b25ec586f594?w=600&q=80&auto=format" alt="Athlete" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
            {/* Floating stat */}
            <div className="absolute -bottom-4 -right-4 lg:right-auto lg:-left-4 glass px-6 py-4 z-10">
              <p className="font-heading text-3xl text-fauna-accent">Since 2024</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-fauna-muted">Zürich, Switzerland</p>
            </div>
          </motion.div>

          {/* Right text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 lg:col-start-7"
          >
            <span className="text-[11px] uppercase tracking-[0.5em] text-fauna-accent mb-5 block">Unsere Geschichte</span>
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-[0.02em] leading-[0.9] mb-8">
              NICHT NUR<br />EIN BRAND.<br />
              <span className="gradient-text">EINE HALTUNG.</span>
            </h2>

            <div className="space-y-4 text-fauna-muted leading-relaxed mb-10">
              <p>
                Wir wollen nicht der nächste Brand sein mit bunten Prints, regulären Passformen 
                und latschigen Materialien. Das gibt es schon hundertfach.
              </p>
              <p>
                Fauna Athletics steht für etwas anderes: Kampfsportbekleidung, die von aktiven 
                Athleten entwickelt und in Portugal unter strengsten Qualitätsstandards produziert wird. 
                Echtes Leder. Hochfunktionale Stoffe. Faire Produktion.
              </p>
              <p>
                Jedes Produkt durchläuft intensive Tests im Ring, auf der Matte und im Gym — 
                bevor es in deine Hände gelangt.
              </p>
            </div>

            {/* Values grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '🥊', title: 'Von Athleten', desc: 'Entwickelt von aktiven Kampfsportlern' },
                { icon: '🇵🇹', title: 'Made in Portugal', desc: 'Höchste europäische Standards' },
                { icon: '🌱', title: 'Nachhaltig', desc: 'Fair & umweltbewusst produziert' },
              ].map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-fauna-gray/60 border border-fauna-light/10 p-4 hover:border-fauna-accent/15 transition-colors duration-500"
                >
                  <span className="text-2xl mb-2 block">{v.icon}</span>
                  <p className="font-heading text-sm tracking-[0.1em] mb-1">{v.title}</p>
                  <p className="text-fauna-muted text-[11px] leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
