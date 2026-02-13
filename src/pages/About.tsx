import { motion } from 'framer-motion'
import { useInView } from '../components/useInView'
import { Shield, Leaf, Award, Mountain, Droplets, Zap } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'

export default function About() {
  const { ref: storyRef, inView: storyIn } = useInView(0.15)
  const { ref: valRef, inView: valIn } = useInView(0.1)
  const { products } = useProducts({ limit: 4 })

  return (
    <div>
      {/* Hero */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/products/hero-athlete.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-f-black/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-f-black/30 via-transparent to-f-black/50" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-4 block">Über uns</span>
            <h1 className="font-heading text-5xl md:text-8xl tracking-[0.02em] leading-[0.88] mb-6">
              NICHT NUR EIN BRAND.<br/><span className="gradient-text">EINE HALTUNG.</span>
            </h1>
            <p className="text-f-muted text-[16px] leading-relaxed max-w-xl mx-auto">
              Fauna Athletics steht für kompromisslose Qualität, nachhaltige Produktion und die Leidenschaft 
              für den Kampfsport. Von Athleten entwickelt, in Portugal gefertigt.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section ref={storyRef} className="py-28 md:py-40 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={storyIn ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] overflow-hidden bg-f-gray group">
                  {products[0] && <img src={products[0].image} alt={products[0].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                </div>
                <div className="aspect-square overflow-hidden bg-f-gray group">
                  {products[1] && <img src={products[1].image} alt={products[1].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                </div>
              </div>
              <div className="pt-10 space-y-4">
                <div className="aspect-square overflow-hidden bg-f-gray group">
                  {products[2] && <img src={products[2].image} alt={products[2].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                </div>
                <div className="aspect-[3/4] overflow-hidden bg-f-gray group">
                  {products[3] && <img src={products[3].image} alt={products[3].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={storyIn ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.1 }}>
            <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-5 block">Unsere Geschichte</span>
            <h2 className="font-heading text-4xl md:text-6xl tracking-[0.02em] leading-[0.88] mb-7">
              VON DER MATTE<br/>IN DIE WELT.
            </h2>
            <div className="space-y-5 text-f-muted text-[15px] leading-relaxed">
              <p>
                Fauna Athletics wurde 2024 in der Schweiz gegründet — aus Frustration über den Mangel 
                an wirklich hochwertiger Kampfsportbekleidung. Zu viele bunte Prints, zu wenig Substanz.
              </p>
              <p>
                Unser Team besteht aus aktiven Kampfsportlern, die jeden Tag im Training stehen. 
                Wir wissen, was funktioniert — und was nicht. Deshalb entwickeln wir jedes Produkt 
                selbst und lassen es in Portugal unter höchsten Standards fertigen.
              </p>
              <p>
                Echtes Leder für unsere Handschuhe. Hochfunktionale Stoffe für unsere Bekleidung. 
                Faire Löhne und nachhaltige Produktion. Das ist unser Standard — ohne Kompromisse.
              </p>
            </div>

            <div className="flex gap-12 mt-12 pt-8 border-t border-f-border/20">
              {[
                { v: '2024', l: 'Gegründet' },
                { v: 'PT', l: 'Made in Portugal' },
                { v: '100%', l: 'Echtleder' },
              ].map(s => (
                <div key={s.l}>
                  <p className="font-heading text-2xl text-f-green-light">{s.v}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-f-muted mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section ref={valRef} className="py-28 md:py-40 px-6 lg:px-8 bg-f-dark">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={valIn ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
            className="text-center mb-16">
            <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Werte</span>
            <h2 className="font-heading text-5xl md:text-7xl tracking-[0.02em]">WOFÜR WIR STEHEN</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'Qualität', desc: 'Keine Kompromisse bei Materialien und Verarbeitung. Jedes Detail zählt.' },
              { icon: Leaf, title: 'Nachhaltigkeit', desc: 'Fair und umweltbewusst in Portugal produziert. Transparente Lieferketten.' },
              { icon: Award, title: 'Von Athleten', desc: 'Entwickelt von aktiven Kampfsportlern, die wissen was funktioniert.' },
              { icon: Mountain, title: 'Haltbarkeit', desc: 'Intensive Belastungstests für jedes Produkt. Gemacht für harte Trainings.' },
              { icon: Droplets, title: 'Innovation', desc: 'Hochfunktionale Materialien und Technologien für maximale Performance.' },
              { icon: Zap, title: 'Leidenschaft', desc: 'Kampfsport ist unser Leben — nicht nur Business. Das spürt man in jedem Produkt.' },
            ].map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 25 }} animate={valIn ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.08 * i, duration: 0.6 }}
                className="group bg-f-gray/40 border border-f-border/20 p-8 hover:border-f-green/20 hover:bg-f-gray/60 transition-all duration-500">
                <div className="w-11 h-11 flex items-center justify-center bg-f-green/10 mb-5 rounded-sm group-hover:bg-f-green/15 transition-colors">
                  <v.icon size={20} className="text-f-green-light" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-xl tracking-[0.08em] mb-2.5 group-hover:text-f-green-light transition-colors">{v.title}</h3>
                <p className="text-f-muted text-[14px] leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
