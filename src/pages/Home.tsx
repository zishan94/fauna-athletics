import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Check, Instagram as IgIcon } from 'lucide-react'
import { products } from '../data/products'
import ProductCard from '../components/ProductCard'
import { useInView } from '../components/useInView'

/* ── Hero ── */
function Hero() {
  return (
    <section className="relative">
      <div className="grid lg:grid-cols-2 min-h-[80vh]">
        <div className="flex items-center px-6 lg:px-16 py-16 lg:py-0 relative">
          <div className="absolute inset-0 bg-f-black" />
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-f-lighter/15 to-transparent hidden lg:block" />
          <div className="relative z-10 max-w-xl">
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16,1,0.3,1] }}
              className="inline-flex items-center gap-2 bg-f-green/10 border border-f-green/20 px-4 py-1.5 mb-7">
              <span className="w-1.5 h-1.5 bg-f-green-light rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-f-green-light font-medium">Neue Kollektion 2025</span>
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="font-heading text-[clamp(3.2rem,6.5vw,6.5rem)] leading-[0.87] tracking-[0.02em] mb-5">
              PREMIUM<br/>KAMPFSPORT<span className="text-f-green-light">-</span><br/>
              <span className="text-stroke">BEKLEIDUNG</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
              className="text-f-muted leading-relaxed mb-9 max-w-md">
              Von Kampfsportlern entwickelt, in Portugal produziert. Kompromisslose Qualität für kompromisslose Athleten.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7 }}
              className="flex flex-wrap gap-4">
              <Link to="/shop" className="group relative overflow-hidden bg-f-green text-white px-9 py-3.5 text-[11px] uppercase tracking-[0.25em] font-medium flex items-center gap-2">
                <span className="relative z-10 flex items-center gap-2">Jetzt shoppen <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
                <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
              <Link to="/about" className="border border-f-lighter text-f-text hover:border-f-green hover:text-f-green-light px-9 py-3.5 text-[11px] uppercase tracking-[0.25em] transition-all duration-300">
                Mehr erfahren
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="flex gap-8 mt-12 pt-7 border-t border-f-light/15">
              {[{ v:'100%', l:'Echtleder' }, { v:'Free', l:'Versand ab 69.-' }, { v:'30d', l:'Rückgabe' }].map(b => (
                <div key={b.l}>
                  <p className="font-heading text-lg text-f-green-light">{b.v}</p>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-f-muted mt-0.5">{b.l}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.16,1,0.3,1] }}
          className="relative overflow-hidden min-h-[50vh] lg:min-h-0">
          <img src="https://fauna-athletics.ch/wp-content/uploads/2024/08/N3-scaled-e1724327298628.jpg" alt="Fauna Athletics" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-f-black via-f-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-f-black/40 to-transparent" />
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
            className="absolute bottom-6 right-6 glass px-5 py-3">
            <p className="text-[9px] uppercase tracking-[0.3em] text-f-muted">Ab</p>
            <p className="font-heading text-2xl text-f-sand">CHF 49.-</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Featured Products ── */
function FeaturedProducts() {
  const { ref, inView } = useInView(0.05)
  return (
    <section ref={ref} className="py-24 md:py-36 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-2 block">Kollektion</span>
            <h2 className="font-heading text-4xl md:text-6xl tracking-[0.02em]">UNSERE PRODUKTE</h2>
          </div>
          <Link to="/shop" className="text-f-green-light text-[12px] uppercase tracking-[0.2em] flex items-center gap-2 mt-4 md:mt-0 hover:gap-3 transition-all">
            Alle anzeigen <ArrowRight size={14} />
          </Link>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
          {products.slice(0, 6).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Featured Highlight ── */
function Highlight() {
  const { ref, inView } = useInView(0.15)
  const p = products[0]
  return (
    <section ref={ref} className="py-16 md:py-28 bg-f-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 accent-line" />
      <div className="absolute bottom-0 left-0 right-0 accent-line" />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
          className="relative aspect-square lg:aspect-[4/5] overflow-hidden">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
          <div className="absolute top-5 left-5 bg-f-green px-3 py-1.5"><span className="text-[9px] uppercase tracking-[0.25em] text-white font-medium">★ Bestseller</span></div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.1, ease: [0.16,1,0.3,1] }}>
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Featured</span>
          <h3 className="font-heading text-4xl md:text-5xl tracking-[0.02em] leading-[0.9] mb-4">FAUNA PRO<br/>BOXHANDSCHUHE</h3>
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={13} className="text-f-sand fill-f-sand"/>)}</div>
            <span className="text-f-muted text-xs">(47 Bewertungen)</span>
          </div>
          <p className="text-f-muted leading-relaxed mb-7">{p.description}</p>
          <div className="space-y-2.5 mb-7">
            {p.features.map(f=>(
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4.5 h-4.5 bg-f-green/10 flex items-center justify-center flex-shrink-0"><Check size={11} className="text-f-green-light"/></div>
                <span className="text-sm text-f-text/75">{f}</span>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-5">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-f-muted mb-0.5">Preis</p>
              <p className="font-heading text-3xl text-f-sand">CHF {p.price.toFixed(2)}</p>
            </div>
            <Link to={`/product/${p.id}`} className="group relative overflow-hidden bg-f-green text-white px-8 py-3.5 text-[10px] uppercase tracking-[0.2em] font-medium">
              <span className="relative z-10">Details ansehen</span>
              <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ── Testimonials ── */
function Testimonials() {
  const { ref, inView } = useInView(0.15)
  const reviews = [
    { name:'Marco L.', role:'MMA Fighter · Zürich', text:'Die Handschuhe sind nächstes Level. Das Leder fühlt sich premium an.', img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    { name:'Sarah K.', role:'Kickboxerin · Bern', text:'Die Passform hat mich sofort überzeugt. Besser als bekannte Marken.', img:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
    { name:'Dominic R.', role:'BJJ Coach · Basel', text:'Der Rashguard trocknet super schnell. Absolute Empfehlung!', img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
  ]
  return (
    <section ref={ref} className="py-24 md:py-36 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
          className="text-center mb-14">
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-2 block">Community</span>
          <h2 className="font-heading text-4xl md:text-6xl tracking-[0.02em]">WAS ATHLETEN SAGEN</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((t,i)=>(
            <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} animate={inView?{ opacity: 1, y: 0 }:{}} transition={{ duration: 0.5, delay: 0.1+i*0.1 }}
              className="bg-f-gray/40 border border-f-border/30 p-6 hover:border-f-green/15 transition-all duration-500">
              <div className="flex gap-0.5 mb-4">{Array.from({length:5}).map((_,j)=><Star key={j} size={11} className="text-f-sand fill-f-sand"/>)}</div>
              <p className="text-f-text/75 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-f-border/20">
                <img src={t.img} alt={t.name} className="w-8 h-8 rounded-full object-cover"/>
                <div><p className="text-sm font-medium">{t.name}</p><p className="text-[10px] text-f-muted">{t.role}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Instagram ── */
function InstaSection() {
  const { ref, inView } = useInView(0.1)
  const imgs = [
    'https://fauna-athletics.ch/wp-content/uploads/2024/08/boxhanschuhe-fuer-anfaenger-und-sparring.png',
    'https://fauna-athletics.ch/wp-content/uploads/2024/08/grappling-handschuhe-grau-fuer-maenner-seitenansicht-weit.png',
    'https://fauna-athletics.ch/wp-content/uploads/2024/08/MMA-Fightshorts-scaled.jpg',
    'https://fauna-athletics.ch/wp-content/uploads/2024/07/grappling-kleidung-scaled.jpg',
    'https://fauna-athletics.ch/wp-content/uploads/2024/08/MMA-Trainingstshirt-scaled.jpg',
    'https://fauna-athletics.ch/wp-content/uploads/2024/08/N3-scaled-e1724327298628.jpg',
  ]
  return (
    <section ref={ref}>
      <motion.div initial={{ opacity: 0 }} animate={inView?{ opacity: 1 }:{}} transition={{ duration: 0.8 }}
        className="text-center py-10 px-6">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-f-muted hover:text-f-green-light transition-colors">
          <IgIcon size={17}/><span className="text-[11px] uppercase tracking-[0.3em]">@fauna.athletics</span>
        </a>
      </motion.div>
      <div className="grid grid-cols-3 md:grid-cols-6">
        {imgs.map((img,i)=>(
          <motion.div key={i} initial={{ opacity: 0 }} animate={inView?{ opacity: 1 }:{}} transition={{ delay: 0.04*i }}
            className="group relative aspect-square overflow-hidden cursor-pointer">
            <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
            <div className="absolute inset-0 bg-f-green/0 group-hover:bg-f-green/25 flex items-center justify-center transition-all duration-500">
              <IgIcon size={24} className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-400"/>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

/* ── Newsletter CTA ── */
function Newsletter() {
  const { ref, inView } = useInView(0.2)
  return (
    <section ref={ref} className="relative py-28 md:py-40 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://fauna-athletics.ch/wp-content/uploads/2024/08/N3-scaled-e1724327298628.jpg" alt="" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-f-black/85"/>
      </div>
      <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
        <motion.div initial={{ opacity: 0, y: 35 }} animate={inView?{ opacity: 1, y: 0 }:{}} transition={{ duration: 0.8 }}>
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-4 block">Newsletter</span>
          <h2 className="font-heading text-4xl md:text-6xl tracking-[0.02em] leading-[0.9] mb-4">WERDE TEIL<br/><span className="gradient-text">DES RUDELS.</span></h2>
          <p className="text-f-muted leading-relaxed mb-8">10% auf deine erste Bestellung. Exklusive Drops und Behind-the-Scenes.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Deine E-Mail" className="flex-1 bg-white/5 border border-f-lighter/30 px-5 py-3.5 text-sm text-f-text placeholder:text-f-muted/40 focus:outline-none focus:border-f-green/50 transition-colors"/>
            <button className="group relative overflow-hidden bg-f-green text-white px-7 py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium">
              <span className="relative z-10">Anmelden</span>
              <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Highlight />
      <Testimonials />
      <InstaSection />
      <Newsletter />
    </>
  )
}
