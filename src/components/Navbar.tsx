import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ShoppingBag, Search, User, Heart, Package, LogOut, Settings, ChevronRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'

/* ── Animated Badge ── */
function AnimatedBadge({ count, color = 'bg-f-green' }: { count: number; color?: string }) {
  const [animate, setAnimate] = useState(false)
  const prevCount = useRef(count)

  useEffect(() => {
    if (count !== prevCount.current) {
      setAnimate(true)
      prevCount.current = count
      const timer = setTimeout(() => setAnimate(false), 400)
      return () => clearTimeout(timer)
    }
  }, [count])

  return (
    <span className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] text-white font-bold transition-all ${color} ${
      count > 0 ? 'scale-100' : 'scale-75 opacity-50'
    } ${animate ? 'badge-bounce' : ''}`}>
      {count > 9 ? '9+' : count}
    </span>
  )
}

const LOGO = '/images/logo.png'

const links = [
  { label: 'Startseite', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Über uns', to: '/about' },
  { label: 'Kontakt', to: '/contact' },
]

interface NavbarProps {
  onSearchOpen?: () => void
  onWishlistOpen?: () => void
}

/* ── User Initials Avatar ── */
function UserAvatar({ firstName, lastName, size = 'md' }: { firstName?: string; lastName?: string; size?: 'sm' | 'md' }) {
  const initials = `${(firstName || '?')[0]}${(lastName || '')[0] || ''}`.toUpperCase()
  const px = size === 'sm' ? 'w-7 h-7 text-[9px]' : 'w-8 h-8 text-[10px]'
  return (
    <div className={`${px} rounded-full bg-f-green/20 border border-f-green/40 flex items-center justify-center text-f-green-light font-semibold tracking-wide select-none`}>
      {initials}
    </div>
  )
}

/* ── Account Dropdown ── */
function AccountDropdown({ onClose }: { onClose: () => void }) {
  const { customer, logout } = useAuth()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleNav = (to: string) => {
    onClose()
    navigate(to)
  }

  const handleLogout = async () => {
    onClose()
    await logout()
    navigate('/')
  }

  const menuItems = [
    { label: 'Mein Konto', icon: User, action: () => handleNav('/account') },
    { label: 'Bestellungen', icon: Package, action: () => handleNav('/account') },
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-full right-0 mt-2 w-64 bg-f-black/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/60 rounded-sm overflow-hidden z-50"
    >
      {/* User info header */}
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <UserAvatar firstName={customer?.first_name} lastName={customer?.last_name} />
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate">
              {customer?.first_name} {customer?.last_name}
            </p>
            <p className="text-[11px] text-f-muted truncate">{customer?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1.5">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-[12px] text-f-muted hover:text-f-text hover:bg-white/[0.04] transition-colors"
          >
            <item.icon size={14} className="flex-shrink-0" />
            {item.label}
            <ChevronRight size={12} className="ml-auto opacity-40" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-white/[0.06] py-1.5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-[12px] text-f-muted hover:text-red-400 hover:bg-red-500/[0.05] transition-colors"
        >
          <LogOut size={14} className="flex-shrink-0" />
          Abmelden
        </button>
      </div>
    </motion.div>
  )
}

export default function Navbar({ onSearchOpen, onWishlistOpen }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount, setCartOpen } = useCart()
  const { customer, isAuthenticated, logout } = useAuth()
  const { wishlist } = useWishlist()

  const wishlistCount = wishlist.length

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    setOpen(false)
    setDropdownOpen(false)
  }, [location])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isHome = location.pathname === '/'

  const iconColor = isHome && !scrolled ? 'text-white/80 hover:text-white' : 'text-f-muted hover:text-f-text'

  const handleMobileLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <>
      <nav className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-f-black/95 backdrop-blur-xl shadow-2xl shadow-black/40 border-b border-white/[0.04]'
          : isHome
            ? 'bg-transparent border-b border-transparent'
            : 'bg-f-dark border-b border-white/[0.04]'
      }`}>
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center h-16 lg:h-[72px]">
            {/* Mobile menu button / Left nav */}
            <div className="flex items-center">
              <button onClick={() => setOpen(!open)} className="lg:hidden text-f-text p-1.5 hover:text-f-green-light transition-colors" aria-label="Menü">
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
              <div className="hidden lg:flex items-center gap-9">
                {links.slice(0, 2).map((l) => (
                  <Link key={l.to} to={l.to}
                    className={`relative text-[12px] uppercase tracking-[0.2em] transition-colors duration-300 group py-2 ${
                      location.pathname === l.to ? 'text-f-green-light' : isHome && !scrolled ? 'text-white/80 hover:text-white' : 'text-f-muted hover:text-f-text'
                    }`}>
                    {l.label}
                    <span className={`absolute bottom-0 left-0 h-[2px] bg-f-green transition-all duration-400 ${
                      location.pathname === l.to ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Center Logo */}
            <Link to="/" className="flex justify-center px-6">
              <img src={LOGO} alt="Fauna Athletics" className="h-9 md:h-11 invert brightness-200" />
            </Link>

            {/* Right nav + icons */}
            <div className="flex items-center justify-end gap-9">
              <div className="hidden lg:flex items-center gap-9">
                {links.slice(2).map((l) => (
                  <Link key={l.to} to={l.to}
                    className={`relative text-[12px] uppercase tracking-[0.2em] transition-colors duration-300 group py-2 ${
                      location.pathname === l.to ? 'text-f-green-light' : isHome && !scrolled ? 'text-white/80 hover:text-white' : 'text-f-muted hover:text-f-text'
                    }`}>
                    {l.label}
                    <span className={`absolute bottom-0 left-0 h-[2px] bg-f-green transition-all duration-400 ${
                      location.pathname === l.to ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                  </Link>
                ))}
              </div>

              {/* Icon bar - all icons visible on desktop AND mobile */}
              <div className="flex items-center gap-0.5 sm:gap-1.5">
                {/* Search */}
                <button
                  onClick={onSearchOpen}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/[0.03] rounded-sm transition-all ${iconColor}`}
                  aria-label="Suchen"
                >
                  <Search size={16} className="sm:w-[17px] sm:h-[17px]" />
                </button>

                {/* Wishlist */}
                <button
                  onClick={onWishlistOpen}
                  className={`relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/[0.03] rounded-sm transition-all ${iconColor}`}
                  aria-label="Favoriten"
                >
                  <Heart size={16} className="sm:w-[17px] sm:h-[17px]" />
                  {wishlistCount > 0 && (
                    <AnimatedBadge count={wishlistCount} color="bg-red-500" />
                  )}
                </button>

                {/* Account */}
                <div className="relative">
                  {isAuthenticated ? (
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-sm transition-all ${dropdownOpen ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`}
                      aria-label="Konto"
                    >
                      <UserAvatar firstName={customer?.first_name} lastName={customer?.last_name} size="sm" />
                    </button>
                  ) : (
                    <Link
                      to="/account"
                      className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/[0.03] rounded-sm transition-all ${iconColor}`}
                      aria-label="Anmelden"
                    >
                      <User size={16} className="sm:w-[17px] sm:h-[17px]" />
                    </Link>
                  )}

                  {/* Desktop dropdown */}
                  <AnimatePresence>
                    {dropdownOpen && isAuthenticated && (
                      <AccountDropdown onClose={() => setDropdownOpen(false)} />
                    )}
                  </AnimatePresence>
                </div>

                {/* Cart */}
                <button
                  onClick={() => setCartOpen(true)}
                  className={`relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-white/[0.03] rounded-sm transition-all ${iconColor}`}
                  aria-label="Warenkorb"
                >
                  <ShoppingBag size={16} className="sm:w-[17px] sm:h-[17px]" />
                  <AnimatedBadge count={itemCount} color="bg-f-green" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-30 w-[300px] max-w-[85vw] bg-f-black/[0.98] backdrop-blur-xl border-r border-white/[0.04] flex flex-col"
            >
              {/* Authenticated user header in mobile menu */}
              {isAuthenticated && customer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="pt-20 px-8 pb-4 border-b border-f-light/10"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar firstName={customer.first_name} lastName={customer.last_name} />
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium truncate">
                        {customer.first_name} {customer.last_name}
                      </p>
                      <p className="text-[11px] text-f-muted truncate">{customer.email}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className={`${isAuthenticated ? 'pt-4' : 'pt-24'} px-8 flex flex-col gap-2 flex-1 overflow-y-auto`}>
                {/* Navigation links */}
                {links.map((l, i) => (
                  <motion.div key={l.to} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.06 }}>
                    <Link to={l.to} className={`font-heading text-4xl tracking-[0.1em] py-3 block border-b border-f-light/10 transition-colors ${
                      location.pathname === l.to ? 'text-f-green-light' : 'text-f-text hover:text-f-green-light'
                    }`}>
                      {l.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile menu: auth-dependent section */}
                {isAuthenticated ? (
                  <>
                    {/* Wishlist link */}
                    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                      <button
                        onClick={() => { setOpen(false); onWishlistOpen?.() }}
                        className="flex items-center justify-between font-heading text-3xl tracking-[0.1em] py-3 border-b border-f-light/10 text-f-text hover:text-f-green-light transition-colors w-full text-left"
                      >
                        <span className="flex items-center gap-3">
                          <Heart size={18} />
                          Favoriten
                        </span>
                        {wishlistCount > 0 && (
                          <span className="text-[12px] font-body bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </button>
                    </motion.div>

                    {/* Account links */}
                    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 }}>
                      <Link to="/account" className="flex items-center gap-3 font-heading text-3xl tracking-[0.1em] py-3 border-b border-f-light/10 text-f-text hover:text-f-green-light transition-colors">
                        <Package size={18} />
                        Bestellungen
                      </Link>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
                      <Link to="/account" className="flex items-center gap-3 font-heading text-3xl tracking-[0.1em] py-3 border-b border-f-light/10 text-f-text hover:text-f-green-light transition-colors">
                        <Settings size={18} />
                        Profil
                      </Link>
                    </motion.div>

                    {/* Logout */}
                    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.48 }}>
                      <button
                        onClick={handleMobileLogout}
                        className="flex items-center gap-3 font-heading text-3xl tracking-[0.1em] py-3 border-b border-f-light/10 text-f-muted hover:text-red-400 transition-colors w-full text-left"
                      >
                        <LogOut size={18} />
                        Abmelden
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    {/* Guest: Konto link */}
                    <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                      <Link to="/account" className="flex items-center gap-3 font-heading text-4xl tracking-[0.1em] py-3 border-b border-f-light/10 text-f-text hover:text-f-green-light transition-colors">
                        <User size={20} />
                        Anmelden
                      </Link>
                    </motion.div>
                    {/* Guest: Wishlist link */}
                    {wishlistCount > 0 && (
                      <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.36 }}>
                        <button
                          onClick={() => { setOpen(false); onWishlistOpen?.() }}
                          className="flex items-center justify-between font-heading text-3xl tracking-[0.1em] py-3 border-b border-f-light/10 text-f-text hover:text-f-green-light transition-colors w-full text-left"
                        >
                          <span className="flex items-center gap-3">
                            <Heart size={18} />
                            Favoriten
                          </span>
                          <span className="text-[12px] font-body bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              <div className="px-8 pb-8 pt-4 border-t border-f-light/10">
                <p className="text-f-muted/40 text-[10px] uppercase tracking-[0.2em]">Fauna Athletics</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
