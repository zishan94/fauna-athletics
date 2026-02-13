import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { Gem, Zap, Shirt, Droplets, Mountain, Leaf } from 'lucide-react'

const features = [
  { icon: Gem, title: 'Echtes Leder', desc: 'Premium-Rindsleder für unübertroffenen Grip und Haltbarkeit.', num: '01' },
  { icon: Droplets, title: 'Feuchtigkeitsableitung', desc: '3x schnellere Feuchtigkeitsableitung als Standard-Materialien.', num: '02' },
  { icon: Shirt, title: 'Perfekte Passform', desc: '360° Bewegungsfreiheit — kein Verrutschen, kein Einengen.', num: '03' },
  { icon: Zap, title: 'Maximale Leistung', desc: 'Hochfunktionale Materialien für dein bestes Training.', num: '04' },
  { icon: Mountain, title: 'Unzerstörbar', desc: 'Intensive Belastungstests garantieren maximale Haltbarkeit.', num: '05' },
  { icon: Leaf, title: 'Nachhaltig', desc: 'Fair und umweltbewusst in Portugal produziert.', num: '06' },
]

export default function Features() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="features" ref={ref} className="relative py-28 md:py-40 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-[11px] uppercase tracking-[0.5em] text-fauna-accent mb-3 block">Warum Fauna</span>
          <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl tracking-[0.02em]">
            UNSERE <span className="gradient-text">VORTEILE</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.06 * i }}
              className="group relative bg-fauna-gray/50 border border-fauna-light/8 p-6 md:p-8 hover:border-fauna-accent/15 transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-fauna-accent group-hover:w-full transition-all duration-600" />
              <span className="font-heading text-4xl text-fauna-light/15 absolute top-4 right-5">{f.num}</span>
              <div className="w-10 h-10 flex items-center justify-center bg-fauna-accent/8 mb-5">
                <f.icon size={18} className="text-fauna-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading text-lg md:text-xl tracking-[0.08em] mb-2 group-hover:text-fauna-accent transition-colors duration-400">{f.title}</h3>
              <p className="text-fauna-muted text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
