import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, Search } from 'lucide-react'

const LOGO = 'https://fauna-athletics.ch/wp-content/uploads/2025/05/cropped-Logo-Webseite-transparent-500-x-180-px.png'

const links = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Über uns', to: '/about' },
  { label: 'Kontakt', to: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-f-black/95 backdrop-blur-xl shadow-2xl shadow-black/40 border-b border-white/[0.03]'
          : 'bg-f-dark border-b border-white/[0.03]'
      }`}>
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[70px]">
            {/* Mobile menu */}
            <button onClick={() => setOpen(!open)} className="lg:hidden text-f-text p-1">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Left nav */}
            <div className="hidden lg:flex items-center gap-8">
              {links.slice(0, 2).map((l) => (
                <Link key={l.to} to={l.to}
                  className={`relative text-[12px] uppercase tracking-[0.2em] transition-colors duration-300 group py-2 ${
                    location.pathname === l.to ? 'text-f-green-light' : 'text-f-muted hover:text-f-text'
                  }`}>
                  {l.label}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-f-green transition-all duration-400 ${
                    location.pathname === l.to ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </div>

            {/* Center Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src={LOGO} alt="Fauna Athletics" className="h-9 md:h-10 invert brightness-200" />
            </Link>

            {/* Right nav */}
            <div className="hidden lg:flex items-center gap-8">
              {links.slice(2).map((l) => (
                <Link key={l.to} to={l.to}
                  className={`relative text-[12px] uppercase tracking-[0.2em] transition-colors duration-300 group py-2 ${
                    location.pathname === l.to ? 'text-f-green-light' : 'text-f-muted hover:text-f-text'
                  }`}>
                  {l.label}
                  <span className={`absolute bottom-0 left-0 h-[2px] bg-f-green transition-all duration-400 ${
                    location.pathname === l.to ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 flex items-center justify-center text-f-muted hover:text-f-text transition-colors">
                <Search size={17} />
              </button>
              <Link to="/shop" className="relative w-9 h-9 flex items-center justify-center text-f-muted hover:text-f-text transition-colors">
                <ShoppingBag size={17} />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-f-green rounded-full flex items-center justify-center text-[8px] text-white font-bold">0</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-30 bg-f-black/[0.98]"
          >
            <div className="pt-24 px-8 flex flex-col gap-3">
              {links.map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
                  <Link to={l.to} className="font-heading text-5xl tracking-[0.1em] text-f-text hover:text-f-green-light transition-colors py-2 block border-b border-f-light/10">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
