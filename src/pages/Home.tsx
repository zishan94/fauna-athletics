import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Check, Instagram as IgIcon, Quote, ChevronDown, Volume2, VolumeX } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useInstagram } from '../hooks/useInstagram'
import { useRegion } from '../context/RegionContext'
import { useStoreSettings } from '../hooks/useStoreSettings'
import { notifyNewsletter } from '../lib/notifications'
import type { Product } from '../data/products'
import ProductCard from '../components/ProductCard'
import { useInView } from '../components/useInView'

/* ── Hero ── */
function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const { freeShippingThreshold } = useStoreSettings()

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const playVideo = () => {
      v.play().catch(() => {
        // Autoplay blocked — show fallback image
        setVideoError(true)
      })
    }

    // Try playing once data is available
    if (v.readyState >= 3) {
      playVideo()
    } else {
      v.addEventListener('canplay', playVideo, { once: true })
    }

    const handleError = () => setVideoError(true)
    v.addEventListener('error', handleError)

    return () => {
      v.removeEventListener('canplay', playVideo)
      v.removeEventListener('error', handleError)
    }
  }, [])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  return (
    <section className="relative h-screen min-h-[600px] max-h-[1200px] overflow-hidden -mt-[72px] pt-0">
      {/* ── Video background ── */}
      <div className="absolute inset-0 z-0">
        {/* Fallback / loading state */}
        <div
          className={`absolute inset-0 bg-f-black transition-opacity duration-1000 ${videoLoaded && !videoError ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <img
            src="/images/products/hero-athlete.jpg"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          {/* Loading pulse indicator — hide when error (show fallback image instead) */}
          {!videoError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-white/20 border-t-f-green rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Video element — local optimized files (WebM + MP4 fallback) */}
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/products/hero-athlete.jpg"
            onCanPlay={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className={`w-full h-full object-cover transition-opacity duration-[1500ms] ease-out ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ willChange: 'opacity' }}
          >
            <source src="/videos/hero.webm" type="video/webm" />
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
        )}

        {/* Cinematic overlays — softened to let the video breathe */}
        <div className="absolute inset-0 bg-f-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-f-black via-transparent to-f-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-f-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-f-black to-transparent" />
        {/* Cinematic vignette */}
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 200px 40px rgba(0,0,0,0.4)' }} />
      </div>

      {/* ── Hero content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="max-w-2xl pt-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: [0.16,1,0.3,1] }}
              className="inline-flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.1] backdrop-blur-sm px-5 py-2.5 mb-8 rounded-sm"
            >
              <span className="w-1.5 h-1.5 bg-f-green-light rounded-full animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-f-gold-light font-medium">
                Neue Kollektion 2026
              </span>
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1, ease: [0.16,1,0.3,1] }}
              className="font-heading text-[clamp(3.5rem,8vw,8rem)] leading-[0.85] tracking-[0.02em] mb-7"
              style={{ textShadow: '0 2px 40px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)' }}
            >
              PREMIUM<br />
              KAMPFSPORT<span className="text-f-green-light">-</span><br />
              <span className="hero-text-stroke">BEKLEIDUNG</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="text-white/75 text-base md:text-lg leading-relaxed mb-10 max-w-lg"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
            >
              Von Kampfsportlern entwickelt, in Portugal produziert.
              Kompromisslose Qualität für kompromisslose Athleten.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/shop"
                className="btn-shimmer group relative overflow-hidden bg-f-green text-white px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium flex items-center gap-2 hover:shadow-xl hover:shadow-f-green/25 transition-all duration-500"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Jetzt shoppen
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Link>
              <Link
                to="/about"
                className="border border-white/20 text-white hover:border-f-green hover:text-f-green-light px-10 py-4 text-[11px] uppercase tracking-[0.25em] transition-all duration-300 backdrop-blur-sm bg-white/[0.04] hover:bg-white/[0.06]"
              >
                Mehr erfahren
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="flex gap-10 mt-14 pt-8 border-t border-white/10"
            >
              {[
                { v: '100%', l: 'Echtleder' },
                { v: 'Gratis', l: `Versand ab ${freeShippingThreshold}.-` },
                { v: '14d', l: 'Rückgabe' },
              ].map((b) => (
                <div key={b.l}>
                  <p className="font-heading text-2xl text-f-green-light" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}>{b.v}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">{b.l}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Mute toggle ── */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 200, damping: 20 }}
        onClick={toggleMute}
        className="absolute bottom-8 right-8 z-20 w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.12] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.15] hover:scale-110 transition-all duration-300"
        aria-label={muted ? 'Ton ein' : 'Ton aus'}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </motion.button>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] uppercase tracking-[0.35em] text-white/35">Scrollen</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} className="text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ── Featured Products ── */
function FeaturedProducts({ products, loading }: { products: Product[]; loading: boolean }) {
  const { ref, inView } = useInView(0.05)

  return (
    <section ref={ref} className="py-28 md:py-40 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-14">
          <div>
            <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Kollektion</span>
            <h2 className="font-heading text-5xl md:text-7xl tracking-[0.02em]">UNSERE PRODUKTE</h2>
          </div>
          <Link to="/shop" className="text-f-green-light text-[12px] uppercase tracking-[0.2em] flex items-center gap-2 mt-4 md:mt-0 hover:gap-3 transition-all group">
            Alle anzeigen <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
        <div className="accent-line mb-10" />
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-f-gray mb-4" />
                <div className="h-4 bg-f-gray w-3/4 mb-2" />
                <div className="h-3 bg-f-gray w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} inView={inView} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Featured Highlight ── */
function Highlight({ product: p }: { product: Product }) {
  const { ref, inView } = useInView(0.15)
  const { formatPrice } = useRegion()

  return (
    <section ref={ref} className="py-20 md:py-32 bg-f-dark relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 accent-line" />
      <div className="absolute bottom-0 left-0 right-0 accent-line" />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, ease: [0.16,1,0.3,1] }}
          className="relative aspect-square lg:aspect-[4/5] overflow-hidden group">
          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          {p.tag && (
            <div className="absolute top-5 left-5 bg-gradient-to-r from-f-gold-dark to-f-gold px-4 py-2 rounded-sm shadow-lg shadow-f-gold/20">
              <span className="text-[10px] uppercase tracking-[0.25em] text-white font-medium">{'\u2605'} {p.tag}</span>
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.1, ease: [0.16,1,0.3,1] }}>
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-4 block">Featured</span>
          <h3 className="font-heading text-4xl md:text-6xl tracking-[0.02em] leading-[0.88] mb-5">{p.name.toUpperCase()}</h3>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} size={14} className="text-f-sand fill-f-sand"/>)}</div>
            <span className="text-f-muted text-sm">5.0</span>
          </div>
          <p className="text-f-muted text-[15px] leading-relaxed mb-8">{p.description}</p>
          {p.features.length > 0 && (
            <div className="space-y-3 mb-8">
              {p.features.map(f=>(
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-f-green/10 flex items-center justify-center flex-shrink-0 rounded-sm"><Check size={12} className="text-f-green-light"/></div>
                  <span className="text-[15px] text-f-text/80">{f}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-6 pt-6 border-t border-f-border/20">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-f-muted mb-1">Preis</p>
              <p className="font-heading text-4xl text-f-sand">{formatPrice(p.price)}</p>
            </div>
            <Link to={`/product/${p.id}`} className="btn-shimmer group relative overflow-hidden bg-f-green text-white px-9 py-4 text-[11px] uppercase tracking-[0.2em] font-medium hover:shadow-lg hover:shadow-f-green/20 transition-shadow duration-500">
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
    { name:'Adam Arbogast', initials:'AA', role:'Kampfsportler', text:'Ich muss sagen die Qualität von Fauna ist unglaublich und sehr bequem. Kann die Produkte nur weiterempfehlen.' },
    { name:'Mervan Gencer', initials:'MG', role:'MMA Fighter', text:'Die MMA-Handschuhe bestehen aus hochwertigem Echtleder und überzeugen durch eine angenehme Passform. Hände und Finger werden zuverlässig geschützt.' },
    { name:'Dominik Laritz', initials:'DL', role:'Kampfsportler', text:'Die Produkte sind krass bequem - liebe es. Die Handschuhe haben eine gute Qualität und eine schöne Farbe.' },
  ]
  return (
    <section ref={ref} className="py-28 md:py-40 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
          className="text-center mb-16">
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Community</span>
          <h2 className="font-heading text-5xl md:text-7xl tracking-[0.02em]">WAS ATHLETEN SAGEN</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((t,i)=>(
            <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} animate={inView?{ opacity: 1, y: 0 }:{}} transition={{ duration: 0.5, delay: 0.1+i*0.12 }}
              className="bg-f-gray/50 border border-f-border/30 p-7 md:p-8 hover:border-f-green/20 hover:bg-f-gray/70 transition-all duration-500 group">
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-0.5">{Array.from({length:5}).map((_,j)=><Star key={j} size={13} className="text-f-sand fill-f-sand"/>)}</div>
                <Quote size={20} className="text-f-border/40 group-hover:text-f-green/30 transition-colors duration-500" />
              </div>
              <p className="text-f-text/80 text-[15px] leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-f-border/20">
                <div className="w-10 h-10 rounded-full bg-f-green/15 border border-f-green/25 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-semibold text-f-green-light tracking-wide">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[11px] text-f-muted mt-0.5">{t.role}</p>
                </div>
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
  const { posts, loading } = useInstagram(6)
  const { products } = useProducts({ limit: 6 })

  // Use real Instagram posts when available, otherwise fall back to product images
  const hasRealPosts = posts.length > 0

  const imgs = hasRealPosts
    ? posts.map(p => ({
        src: p.media_url,
        label: p.caption?.slice(0, 60) || '',
        href: p.permalink,
      }))
    : products.slice(0, 6).map(p => ({
        src: p.image,
        label: p.name,
        href: 'https://www.instagram.com/fauna_athletics/',
      }))

  if (imgs.length === 0 && !loading) return null

  return (
    <section ref={ref}>
      <motion.div initial={{ opacity: 0 }} animate={inView?{ opacity: 1 }:{}} transition={{ duration: 0.8 }}
        className="text-center py-12 px-6">
        <a href="https://www.instagram.com/fauna_athletics/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-f-muted hover:text-f-green-light transition-colors group">
          <IgIcon size={18} className="group-hover:scale-110 transition-transform"/><span className="text-[11px] uppercase tracking-[0.3em]">@fauna_athletics</span>
        </a>
      </motion.div>
      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-f-gray animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6">
          {imgs.map((img,i)=>(
            <motion.a
              key={i}
              href={img.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={inView?{ opacity: 1 }:{}}
              transition={{ delay: 0.05*i }}
              className="group relative aspect-square overflow-hidden cursor-pointer block"
            >
              <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
              <div className="absolute inset-0 bg-gradient-to-t from-f-black/70 via-f-green/0 to-f-green/0 group-hover:from-f-green/50 group-hover:via-f-green/20 group-hover:to-transparent flex flex-col items-center justify-end pb-4 transition-all duration-500">
                <IgIcon size={20} className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-400 mb-2"/>
                {img.label && (
                  <span className="text-white text-[10px] uppercase tracking-[0.15em] font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400 px-2 text-center line-clamp-2">{img.label}</span>
                )}
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </section>
  )
}

/* ── Newsletter CTA ── */
function Newsletter() {
  const { ref, inView } = useInView(0.2)
  const [nlEmail, setNlEmail] = useState('')
  const [nlSubmitting, setNlSubmitting] = useState(false)
  const [nlSuccess, setNlSuccess] = useState(false)
  const [nlError, setNlError] = useState('')

  const handleNlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nlEmail) return
    setNlSubmitting(true)
    setNlError('')
    try {
      // Simulate subscription - replace with actual API call when available
      await new Promise(resolve => setTimeout(resolve, 800))
      setNlSuccess(true)
      setNlEmail('')
      notifyNewsletter()
    } catch {
      setNlError('Anmeldung fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setNlSubmitting(false)
    }
  }

  return (
    <section ref={ref} className="relative py-32 md:py-44 overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/products/hero-athlete.jpg" alt="" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-f-black/85"/>
        <div className="absolute inset-0 bg-gradient-to-b from-f-black/30 via-transparent to-f-black/50" />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
        <motion.div initial={{ opacity: 0, y: 35 }} animate={inView?{ opacity: 1, y: 0 }:{}} transition={{ duration: 0.8 }}>
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-5 block">Newsletter</span>
          <h2 className="font-heading text-5xl md:text-7xl tracking-[0.02em] leading-[0.88] mb-5">WERDE TEIL<br/><span className="gradient-text">DES RUDELS.</span></h2>
          <p className="text-f-muted text-[15px] leading-relaxed mb-10 max-w-lg mx-auto">10% auf deine erste Bestellung. Exklusive Drops und Behind-the-Scenes direkt in deine Inbox.</p>
          {nlSuccess ? (
            <div className="bg-f-green/10 border border-f-green/30 px-6 py-5 rounded-sm max-w-lg mx-auto">
              <p className="text-f-green-light text-[15px] font-medium mb-1">Willkommen im Rudel!</p>
              <p className="text-f-muted text-[13px]">Du erhältst in Kürze eine Bestätigung per E-Mail.</p>
            </div>
          ) : (
            <form onSubmit={handleNlSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input type="email" value={nlEmail} onChange={e => setNlEmail(e.target.value)} placeholder="Deine E-Mail" required className="flex-1 bg-white/5 border border-f-lighter/30 px-6 py-4 text-sm text-f-text placeholder:text-f-muted/50 focus:outline-none focus:border-f-green/60 focus:bg-white/[0.07] transition-all duration-300 rounded-sm"/>
              <button type="submit" disabled={nlSubmitting} className="btn-shimmer group relative overflow-hidden bg-f-green text-white px-8 py-4 text-[11px] uppercase tracking-[0.2em] font-medium rounded-sm hover:shadow-lg hover:shadow-f-green/20 transition-shadow duration-500 disabled:opacity-50">
                <span className="relative z-10">{nlSubmitting ? 'Wird angemeldet...' : 'Anmelden'}</span>
                <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500"/>
              </button>
            </form>
          )}
          {nlError && <p className="text-red-400 text-[13px] mt-3">{nlError}</p>}
          {!nlSuccess && <p className="text-f-muted/50 text-[11px] mt-4">Kein Spam. Jederzeit abmeldbar.</p>}
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  const { products, loading } = useProducts({ limit: 12 })

  // Pick the featured/highlight product by tag — configurable in Medusa
  // (set a product tag to "BESTSELLER" in the Medusa admin to feature it here)
  const bestseller = products.find(p => p.tag?.toUpperCase() === 'BESTSELLER') || null

  // Grid products: exclude the bestseller so it only appears once (in the highlight)
  const gridProducts = bestseller
    ? products.filter(p => p.id !== bestseller.id).slice(0, 6)
    : products.slice(0, 6)

  return (
    <>
      <Hero />
      <FeaturedProducts products={gridProducts} loading={loading} />
      {!loading && bestseller && <Highlight product={bestseller} />}
      <Testimonials />
      <InstaSection />
      <Newsletter />
    </>
  )
}
