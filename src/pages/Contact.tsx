import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Instagram, Send, Clock, CheckCircle } from 'lucide-react'
import { notifyContactSent } from '../lib/notifications'

export default function Contact() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [contactError, setContactError] = useState('')

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactError('Bitte fülle alle Pflichtfelder aus.')
      return
    }
    setContactSubmitting(true)
    setContactError('')
    try {
      // Simulate sending - replace with actual API call when backend endpoint is available
      await new Promise(resolve => setTimeout(resolve, 1000))
      setContactSuccess(true)
      setContactForm({ name: '', email: '', subject: '', message: '' })
      notifyContactSent()
    } catch {
      setContactError('Nachricht konnte nicht gesendet werden. Bitte versuche es erneut.')
    } finally {
      setContactSubmitting(false)
    }
  }

  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="mb-16">
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Kontakt</span>
          <h1 className="font-heading text-5xl md:text-7xl tracking-[0.02em] mb-3">SCHREIB UNS.</h1>
          <p className="text-f-muted text-[15px] max-w-lg">Hast du Fragen zu unseren Produkten oder Bestellungen? Wir helfen dir gerne weiter.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-14">
          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
            className="lg:col-span-3">
            {contactSuccess ? (
              <div className="bg-f-green/10 border border-f-green/30 p-8 text-center rounded-sm">
                <CheckCircle size={40} className="text-f-green-light mx-auto mb-4" />
                <h3 className="font-heading text-2xl tracking-[0.05em] mb-2">NACHRICHT GESENDET</h3>
                <p className="text-f-muted text-[15px] mb-6">Danke für deine Nachricht! Wir melden uns innerhalb von 24 Stunden bei dir.</p>
                <button onClick={() => setContactSuccess(false)} className="text-f-green-light text-[12px] uppercase tracking-[0.2em] hover:underline">
                  Weitere Nachricht senden
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2.5 block font-medium">Name *</label>
                    <input type="text" name="name" value={contactForm.name} onChange={handleContactChange} className="w-full bg-f-gray border border-f-border/40 px-5 py-4 text-[15px] text-f-text placeholder:text-f-muted/40 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/80 transition-all duration-300 rounded-sm" placeholder="Dein Name" required />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2.5 block font-medium">E-Mail *</label>
                    <input type="email" name="email" value={contactForm.email} onChange={handleContactChange} className="w-full bg-f-gray border border-f-border/40 px-5 py-4 text-[15px] text-f-text placeholder:text-f-muted/40 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/80 transition-all duration-300 rounded-sm" placeholder="deine@email.ch" required />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2.5 block font-medium">Betreff</label>
                  <input type="text" name="subject" value={contactForm.subject} onChange={handleContactChange} className="w-full bg-f-gray border border-f-border/40 px-5 py-4 text-[15px] text-f-text placeholder:text-f-muted/40 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/80 transition-all duration-300 rounded-sm" placeholder="Worum geht's?" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-2.5 block font-medium">Nachricht *</label>
                  <textarea rows={7} name="message" value={contactForm.message} onChange={handleContactChange} className="w-full bg-f-gray border border-f-border/40 px-5 py-4 text-[15px] text-f-text placeholder:text-f-muted/40 focus:outline-none focus:border-f-green/60 focus:bg-f-gray/80 transition-all duration-300 resize-none rounded-sm" placeholder="Deine Nachricht..." required />
                </div>
                {contactError && <p className="text-red-400 text-[13px]">{contactError}</p>}
                <button type="submit" disabled={contactSubmitting} className="btn-shimmer group relative overflow-hidden bg-f-green text-white px-12 py-4.5 text-[11px] uppercase tracking-[0.25em] font-medium flex items-center gap-2.5 hover:shadow-lg hover:shadow-f-green/20 transition-shadow duration-500 rounded-sm disabled:opacity-50">
                  <span className="relative z-10 flex items-center gap-2.5"><Send size={15}/>{contactSubmitting ? 'Wird gesendet...' : 'Absenden'}</span>
                  <span className="absolute inset-0 bg-f-green-dark translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </form>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
            className="lg:col-span-2">
            <div className="bg-f-gray/50 border border-f-border/20 p-8 lg:p-10 space-y-8 hover:border-f-border/30 transition-colors duration-500 rounded-sm">
              <div>
                <h3 className="font-heading text-2xl tracking-[0.08em] mb-5">KONTAKT INFO</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 flex items-center justify-center bg-f-green/10 flex-shrink-0 rounded-sm mt-0.5">
                      <Mail size={16} className="text-f-green-light" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium">info@fauna-athletics.ch</p>
                      <p className="text-f-muted text-[13px] mt-0.5">Antwort innerhalb von 24h</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 flex items-center justify-center bg-f-green/10 flex-shrink-0 rounded-sm mt-0.5">
                      <MapPin size={16} className="text-f-green-light" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium">Schweiz</p>
                      <p className="text-f-muted text-[13px] mt-0.5">Hergestellt in Portugal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 flex items-center justify-center bg-f-green/10 flex-shrink-0 rounded-sm mt-0.5">
                      <Instagram size={16} className="text-f-green-light" />
                    </div>
                    <div>
                      <a href="https://www.instagram.com/fauna_athletics/" target="_blank" rel="noopener noreferrer" className="text-[15px] font-medium hover:text-f-green-light transition-colors">@fauna_athletics</a>
                      <p className="text-f-muted text-[13px] mt-0.5">Folge uns für Updates</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-7 border-t border-f-border/20">
                <div className="flex items-center gap-2.5 mb-4">
                  <Clock size={14} className="text-f-green-light" />
                  <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-muted font-medium">Support Zeiten</h4>
                </div>
                <div className="space-y-2 text-[15px]">
                  <div className="flex justify-between"><span className="text-f-muted">Mo - Fr</span><span>09:00 - 17:00</span></div>
                  <div className="flex justify-between"><span className="text-f-muted">Sa - So</span><span>Geschlossen</span></div>
                </div>
              </div>

              <div className="pt-7 border-t border-f-border/20">
                <h4 className="text-[11px] uppercase tracking-[0.2em] text-f-muted mb-4 font-medium">Häufige Fragen</h4>
                <div className="space-y-3 text-[14px] text-f-muted">
                  <p className="flex items-center gap-2"><span className="text-f-green-light">→</span> Kostenloser Versand ab CHF 69.-</p>
                  <p className="flex items-center gap-2"><span className="text-f-green-light">→</span> 14 Tage Rückgaberecht</p>
                  <p className="flex items-center gap-2"><span className="text-f-green-light">→</span> Sichere Zahlung via Karte, Twint, PayPal</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
