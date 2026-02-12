import { motion } from 'framer-motion'
import { Mail, MapPin, Instagram, Send } from 'lucide-react'

export default function Contact() {
  return (
    <div className="py-16 md:py-24 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="mb-14">
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-2 block">Kontakt</span>
          <h1 className="font-heading text-5xl md:text-7xl tracking-[0.02em]">SCHREIB UNS.</h1>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="lg:col-span-3">
            <form className="space-y-5" onSubmit={e => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2 block">Name</label>
                  <input type="text" className="w-full bg-f-gray border border-f-border/40 px-4 py-3.5 text-sm text-f-text focus:outline-none focus:border-f-green/50 transition-colors" placeholder="Dein Name" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2 block">E-Mail</label>
                  <input type="email" className="w-full bg-f-gray border border-f-border/40 px-4 py-3.5 text-sm text-f-text focus:outline-none focus:border-f-green/50 transition-colors" placeholder="deine@email.ch" />
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2 block">Betreff</label>
                <input type="text" className="w-full bg-f-gray border border-f-border/40 px-4 py-3.5 text-sm text-f-text focus:outline-none focus:border-f-green/50 transition-colors" placeholder="Worum geht's?" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2 block">Nachricht</label>
                <textarea rows={6} className="w-full bg-f-gray border border-f-border/40 px-4 py-3.5 text-sm text-f-text focus:outline-none focus:border-f-green/50 transition-colors resize-none" placeholder="Deine Nachricht..." />
              </div>
              <button type="submit" className="group relative overflow-hidden bg-f-green text-white px-10 py-4 text-[11px] uppercase tracking-[0.25em] font-medium flex items-center gap-2">
                <span className="relative z-10 flex items-center gap-2"><Send size={14}/>Absenden</span>
                <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
            className="lg:col-span-2">
            <div className="bg-f-gray/40 border border-f-border/20 p-8 space-y-8">
              <div>
                <h3 className="font-heading text-xl tracking-[0.08em] mb-4">KONTAKT INFO</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-f-green-light mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm">info@fauna-athletics.ch</p>
                      <p className="text-f-muted text-xs mt-0.5">Antwort innerhalb von 24h</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-f-green-light mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm">Schweiz</p>
                      <p className="text-f-muted text-xs mt-0.5">Made in Portugal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Instagram size={16} className="text-f-green-light mt-0.5 flex-shrink-0" />
                    <div>
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-f-green-light transition-colors">@fauna.athletics</a>
                      <p className="text-f-muted text-xs mt-0.5">Folge uns für Updates</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-f-border/20">
                <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-3">Öffnungszeiten Support</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-f-muted">Mo - Fr</span><span>09:00 - 17:00</span></div>
                  <div className="flex justify-between"><span className="text-f-muted">Sa - So</span><span>Geschlossen</span></div>
                </div>
              </div>

              <div className="pt-6 border-t border-f-border/20">
                <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-3">FAQ</h4>
                <div className="space-y-3 text-sm text-f-muted">
                  <p>→ Kostenloser Versand ab CHF 69.-</p>
                  <p>→ 30 Tage Rückgaberecht</p>
                  <p>→ Sichere Zahlung via Karte, Twint, PayPal</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
