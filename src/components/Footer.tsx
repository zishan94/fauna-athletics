import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin, Truck, RotateCcw, Shield, CreditCard } from 'lucide-react'
import { useStoreSettings } from '../hooks/useStoreSettings'

const LOGO = '/images/logo.png'

export default function Footer() {
  const { freeShippingThreshold } = useStoreSettings()

  return (
    <footer className="bg-f-dark">
      {/* Trust bar */}
      <div className="border-y border-f-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'Gratis Versand', desc: `Ab CHF ${freeShippingThreshold}.- Bestellwert` },
            { icon: RotateCcw, title: '14 Tage Rückgabe', desc: 'Kostenlose Retoure' },
            { icon: Shield, title: 'Sichere Zahlung', desc: 'SSL-verschlüsselt' },
            { icon: CreditCard, title: 'Flexible Zahlung', desc: 'Karte, TWINT, PostFinance' },
          ].map((t) => (
            <div key={t.title} className="flex items-start gap-3.5">
              <div className="w-9 h-9 flex items-center justify-center bg-f-green/10 flex-shrink-0 mt-0.5 rounded-sm">
                <t.icon size={16} className="text-f-green-light" />
              </div>
              <div>
                <p className="text-[14px] font-medium">{t.title}</p>
                <p className="text-f-muted text-[12px] mt-0.5">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-16 pb-12">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <img src={LOGO} alt="Fauna Athletics" className="h-9 invert brightness-200 mb-6" />
            <p className="text-f-muted text-[14px] leading-relaxed max-w-xs mb-6">
              Premium Kampfsportbekleidung — von Athleten entwickelt, nachhaltig in Portugal produziert.
            </p>
            <div className="flex gap-2.5">
              <a href="https://instagram.com/fauna_athletics" target="_blank" rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-f-border hover:border-f-green/40 hover:bg-f-green/5 text-f-muted hover:text-f-green-light transition-all duration-300 rounded-sm">
                <Instagram size={16} />
              </a>
              <a href="mailto:info@fauna-athletics.ch"
                className="w-10 h-10 flex items-center justify-center border border-f-border hover:border-f-green/40 hover:bg-f-green/5 text-f-muted hover:text-f-green-light transition-all duration-300 rounded-sm">
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-text mb-5 font-medium">Shop</h4>
            <ul className="space-y-2.5">
              {['Boxhandschuhe', 'MMA Handschuhe', 'MMA Shorts', 'Rashguard', 'T-Shirts', 'Bundles'].map((l) => (
                <li key={l}><Link to="/shop" className="text-f-muted text-[14px] hover:text-f-text transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-text mb-5 font-medium">Info</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Über uns', to: '/about' },
                { label: 'Kontakt', to: '/contact' },
                { label: 'Bestellung verfolgen', to: '/track-order' },
                { label: 'Mein Konto', to: '/account' },
              ].map((l) => (
                <li key={l.label}><Link to={l.to} className="text-f-muted text-[14px] hover:text-f-text transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-text mb-5 font-medium">Rechtliches</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Impressum', to: '/impressum' },
                { label: 'Datenschutz', to: '/datenschutz' },
                { label: 'AGB', to: '/agb' },
                { label: 'Widerrufsrecht', to: '/widerruf' },
              ].map((l) => (
                <li key={l.label}><Link to={l.to} className="text-f-muted text-[14px] hover:text-f-text transition-colors">{l.label}</Link></li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-f-muted/40 text-[11px] mt-6">
              <MapPin size={11} />
              <span>Schweiz &middot; Alle Preise inkl. 8.1% MWST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment icons text */}
      <div className="border-t border-f-border/20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-4 text-f-muted/30 text-[10px] uppercase tracking-[0.15em]">
            {['Visa', 'Mastercard', 'TWINT', 'PostFinance', 'Apple Pay', 'Google Pay'].map(m => (
              <span key={m} className="px-3 py-1 border border-f-border/15 rounded-sm">{m}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-f-border/20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-f-muted/40 text-[11px]">&copy; {new Date().getFullYear()} Fauna Athletics. Alle Rechte vorbehalten.</p>
          <p className="text-f-muted/25 text-[10px] uppercase tracking-[0.2em]">Hergestellt in Portugal &middot; Entworfen in der Schweiz</p>
        </div>
      </div>
    </footer>
  )
}
