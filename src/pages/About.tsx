import { motion } from 'framer-motion'
import { useInView } from '../components/useInView'
import { Shield, Leaf, Award, Mountain, Droplets, Zap } from 'lucide-react'

export default function About() {
  const { ref: storyRef, inView: storyIn } = useInView(0.15)
  const { ref: valRef, inView: valIn } = useInView(0.1)

  return (
    <div>
      {/* Hero */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://fauna-athletics.ch/wp-content/uploads/2024/08/N3-scaled-e1724327298628.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-f-black/80" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Über uns</span>
            <h1 className="font-heading text-5xl md:text-7xl tracking-[0.02em] leading-[0.9] mb-5">
              NICHT NUR EIN BRAND.<br/><span className="gradient-text">EINE HALTUNG.</span>
            </h1>
            <p className="text-f-muted leading-relaxed max-w-xl mx-auto">
              Fauna Athletics steht für kompromisslose Qualität, nachhaltige Produktion und die Leidenschaft 
              für den Kampfsport. Von Athleten entwickelt, in Portugal gefertigt.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section ref={storyRef} className="py-24 md:py-36 px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={storyIn ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="aspect-[3/4] overflow-hidden bg-f-gray">
                  <img src="https://fauna-athletics.ch/wp-content/uploads/2024/08/boxhanschuhe-fuer-anfaenger-und-sparring.png" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-square overflow-hidden bg-f-gray">
                  <img src="https://fauna-athletics.ch/wp-content/uploads/2024/08/MMA-Fightshorts-scaled.jpg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="pt-8 space-y-3">
                <div className="aspect-square overflow-hidden bg-f-gray">
                  <img src="https://fauna-athletics.ch/wp-content/uploads/2024/08/grappling-handschuhe-grau-fuer-maenner-seitenansicht-weit.png" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="aspect-[3/4] overflow-hidden bg-f-gray">
                  <img src="https://fauna-athletics.ch/wp-content/uploads/2024/07/grappling-kleidung-scaled.jpg" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={storyIn ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.1 }}>
            <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-4 block">Unsere Geschichte</span>
            <h2 className="font-heading text-4xl md:text-5xl tracking-[0.02em] leading-[0.9] mb-6">
              VON DER MATTE<br/>IN DIE WELT.
            </h2>
            <div className="space-y-4 text-f-muted leading-relaxed">
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

            <div className="flex gap-10 mt-10 pt-8 border-t border-f-border/20">
              {[
                { v: '2024', l: 'Gegründet' },
                { v: '🇵🇹', l: 'Made in Portugal' },
                { v: '100%', l: 'Echtleder' },
              ].map(s => (
                <div key={s.l}>
                  <p className="font-heading text-2xl text-f-green-light">{s.v}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-f-muted mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section ref={valRef} className="py-24 md:py-36 px-6 lg:px-8 bg-f-dark">
        <div className="max-w-[1400px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={valIn ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
            className="text-center mb-14">
            <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-2 block">Werte</span>
            <h2 className="font-heading text-4xl md:text-6xl tracking-[0.02em]">WOFÜR WIR STEHEN</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Qualität', desc: 'Keine Kompromisse bei Materialien und Verarbeitung.' },
              { icon: Leaf, title: 'Nachhaltigkeit', desc: 'Fair und umweltbewusst in Portugal produziert.' },
              { icon: Award, title: 'Von Athleten', desc: 'Entwickelt von aktiven Kampfsportlern.' },
              { icon: Mountain, title: 'Haltbarkeit', desc: 'Intensive Belastungstests für jedes Produkt.' },
              { icon: Droplets, title: 'Innovation', desc: 'Hochfunktionale Materialien für Performance.' },
              { icon: Zap, title: 'Leidenschaft', desc: 'Kampfsport ist unser Leben — nicht nur Business.' },
            ].map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} animate={valIn ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.06 * i }}
                className="group bg-f-gray/40 border border-f-border/20 p-7 hover:border-f-green/15 transition-all duration-500">
                <div className="w-10 h-10 flex items-center justify-center bg-f-green/8 mb-4">
                  <v.icon size={18} className="text-f-green-light" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-xl tracking-[0.08em] mb-2 group-hover:text-f-green-light transition-colors">{v.title}</h3>
                <p className="text-f-muted text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
