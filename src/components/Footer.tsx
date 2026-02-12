import { Link } from 'react-router-dom'
import { Instagram, Mail, MapPin, Truck, RotateCcw, Shield, CreditCard } from 'lucide-react'

const LOGO = 'https://fauna-athletics.ch/wp-content/uploads/2025/05/cropped-Logo-Webseite-transparent-500-x-180-px.png'

export default function Footer() {
  return (
    <footer className="bg-f-dark">
      {/* Trust bar */}
      <div className="border-y border-f-border/40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-7 grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: Truck, title: 'Gratis Versand', desc: 'Ab CHF 69.- Bestellwert' },
            { icon: RotateCcw, title: '30 Tage Rückgabe', desc: 'Kostenlose Retoure' },
            { icon: Shield, title: 'Sichere Zahlung', desc: 'SSL-verschlüsselt' },
            { icon: CreditCard, title: 'Flexible Zahlung', desc: 'Karte, Twint, PayPal' },
          ].map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-f-green/10 flex-shrink-0 mt-0.5">
                <t.icon size={15} className="text-f-green-light" />
              </div>
              <div>
                <p className="text-[13px] font-medium">{t.title}</p>
                <p className="text-f-muted text-[11px]">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pt-14 pb-10">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <img src={LOGO} alt="Fauna Athletics" className="h-8 invert brightness-200 mb-5" />
            <p className="text-f-muted text-sm leading-relaxed max-w-xs mb-5">
              Premium Kampfsportbekleidung — von Athleten entwickelt, nachhaltig in Portugal produziert.
            </p>
            <div className="flex gap-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center border border-f-border hover:border-f-green/40 hover:bg-f-green/5 text-f-muted hover:text-f-green-light transition-all duration-300">
                <Instagram size={15} />
              </a>
              <a href="mailto:info@fauna-athletics.ch"
                className="w-9 h-9 flex items-center justify-center border border-f-border hover:border-f-green/40 hover:bg-f-green/5 text-f-muted hover:text-f-green-light transition-all duration-300">
                <Mail size={15} />
              </a>
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-text mb-4 font-medium">Shop</h4>
            <ul className="space-y-2">
              {['Boxhandschuhe', 'MMA Handschuhe', 'MMA Shorts', 'Rashguard', 'T-Shirts', 'Bundles'].map((l) => (
                <li key={l}><Link to="/shop" className="text-f-muted text-sm hover:text-f-text transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-text mb-4 font-medium">Info</h4>
            <ul className="space-y-2">
              {[
                { label: 'Über uns', to: '/about' },
                { label: 'Kontakt', to: '/contact' },
                { label: 'FAQ', to: '/contact' },
              ].map((l) => (
                <li key={l.label}><Link to={l.to} className="text-f-muted text-sm hover:text-f-text transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-text mb-4 font-medium">Rechtliches</h4>
            <ul className="space-y-2">
              {['Impressum', 'Datenschutz', 'AGB'].map((l) => (
                <li key={l}><a href="#" className="text-f-muted text-sm hover:text-f-text transition-colors">{l}</a></li>
              ))}
            </ul>
            <div className="flex items-center gap-1.5 text-f-muted/40 text-[10px] mt-5">
              <MapPin size={10} />
              <span>Schweiz</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-f-border/20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-f-muted/30 text-[10px]">© {new Date().getFullYear()} Fauna Athletics. Alle Rechte vorbehalten.</p>
          <p className="text-f-muted/20 text-[10px] uppercase tracking-[0.2em]">Made in Portugal · Designed in Switzerland</p>
        </div>
      </div>
    </footer>
  )
}
