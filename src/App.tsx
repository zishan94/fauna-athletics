import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { RegionProvider } from './context/RegionContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import About from './pages/About'
import ProductDetail from './pages/ProductDetail'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Account from './pages/Account'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderDetail from './pages/OrderDetail'
import AGB from './pages/AGB'
import Datenschutz from './pages/Datenschutz'
import Impressum from './pages/Impressum'
import Widerruf from './pages/Widerruf'
import TrackOrder from './pages/TrackOrder'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <RegionProvider>
        <CartProvider>
          <AuthProvider>
          <WishlistProvider>
            <div className="noise min-h-screen bg-f-black">
              <Toaster
                theme="dark"
                position="top-right"
                offset={20}
                toastOptions={{
                  style: {
                    background: '#0b0b0b',
                    border: '1px solid rgba(45, 106, 79, 0.3)',
                    color: '#f0f0f0',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '13px',
                    backdropFilter: 'blur(16px)',
                  },
                  classNames: {
                    success: 'fauna-toast-success',
                    error: 'fauna-toast-error',
                  },
                }}
              />
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="account" element={<Account />} />
                  <Route path="account/orders/:id" element={<OrderDetail />} />
                  <Route path="order/:orderId/confirmed" element={<OrderConfirmation />} />
                  <Route path="track-order" element={<TrackOrder />} />
                  {/* Legacy route kept as fallback */}
                  <Route path="order/confirmed" element={<OrderConfirmation />} />
                  <Route path="agb" element={<AGB />} />
                  <Route path="datenschutz" element={<Datenschutz />} />
                  <Route path="impressum" element={<Impressum />} />
                  <Route path="widerruf" element={<Widerruf />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </div>
          </WishlistProvider>
          </AuthProvider>
        </CartProvider>
      </RegionProvider>
    </BrowserRouter>
  )
}
