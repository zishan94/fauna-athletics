import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import TopBanner from './TopBanner'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import WishlistDrawer from './WishlistDrawer'
import SearchModal from './SearchModal'
import ScrollProgress from './ScrollProgress'
import BackToTop from './BackToTop'
import NewsletterPopup from './NewsletterPopup'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)

  return (
    <>
      <ScrollToTop />
      <ScrollProgress />
      <TopBanner />
      <Navbar
        onSearchOpen={() => setSearchOpen(true)}
        onWishlistOpen={() => setWishlistOpen(true)}
      />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <BackToTop />
      <NewsletterPopup />
    </>
  )
}
