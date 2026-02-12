import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Marco L.',
    role: 'MMA Fighter',
    location: 'Zürich',
    text: 'Die Handschuhe sind nächstes Level. Das Leder fühlt sich premium an und der Schutz ist genau da, wo man ihn braucht.',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format',
    product: 'Fauna Pro Boxhandschuhe',
  },
  {
    name: 'Sarah K.',
    role: 'Kickboxerin',
    location: 'Bern',
    text: 'Die Passform hat mich sofort überzeugt. Die Shorts sitzen perfekt und die Qualität ist besser als bei bekannteren Marken.',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format',
    product: 'Fauna Fight Shorts',
  },
  {
    name: 'Dominic R.',
    role: 'BJJ Coach',
    location: 'Basel',
    text: 'Der Rashguard ist unglaublich bequem und trocknet super schnell. Meine Schüler fragen ständig, woher ich den habe.',
    stars: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80&auto=format',
    product: 'Fauna Rashguard Pro',
  },
]

export default function Testimonials() {
  const { ref, inView } = useInView(0.15)

  return (
    <section ref={ref} className="relative py-28 md:py-40 px-6 lg:px-8 bg-fauna-dark">
      <div className="absolute top-0 left-0 right-0 accent-line" />
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-14"
        >
          <div>
            <span className="text-[11px] uppercase tracking-[0.5em] text-fauna-accent mb-3 block">Bewertungen</span>
            <h2 className="font-heading text-5xl md:text-6xl tracking-[0.02em]">
              WAS ATHLETEN SAGEN
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="text-fauna-gold fill-fauna-gold" />
              ))}
            </div>
            <span className="text-fauna-muted text-xs">4.9/5 (127 Bewertungen)</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 35 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group bg-fauna-gray/40 border border-fauna-light/8 p-7 hover:border-fauna-accent/15 transition-all duration-500 relative"
            >
              <Quote size={28} className="text-fauna-accent/8 absolute top-5 right-5" />
              
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={12} className="text-fauna-gold fill-fauna-gold" />
                ))}
              </div>
              
              <p className="text-fauna-text/80 text-sm leading-relaxed mb-6">"{t.text}"</p>
              
              <p className="text-fauna-accent text-[10px] uppercase tracking-[0.2em] mb-5">Re: {t.product}</p>

              <div className="flex items-center gap-3 pt-5 border-t border-fauna-light/8">
                <img src={t.image} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[10px] text-fauna-muted">{t.role} · {t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
