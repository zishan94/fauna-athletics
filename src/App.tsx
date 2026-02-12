import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import About from './pages/About'
import ProductDetail from './pages/ProductDetail'
import Contact from './pages/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <div className="noise min-h-screen bg-f-black">
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}
