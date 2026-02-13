import { motion } from 'framer-motion'
import { MapPin, Mail, Phone, Globe } from 'lucide-react'

export default function Impressum() {
  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Rechtliches</span>
          <h1 className="font-heading text-5xl md:text-6xl tracking-[0.02em] mb-10">IMPRESSUM</h1>
        </motion.div>

        <div className="accent-line mb-10" />

        <div className="space-y-8">
          {/* Company info */}
          <div className="bg-f-gray/30 border border-f-border/20 p-8">
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-6">Angaben gemäss Art. 3 UWG</h2>

            <div className="space-y-4">
              <div>
                <p className="text-f-text text-lg font-medium">Fauna Athletics</p>
                <p className="text-f-muted text-[14px] mt-1">Premium Kampfsportbekleidung</p>
              </div>

              <div className="flex items-start gap-3 text-[15px]">
                <MapPin size={18} className="text-f-green-light flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-f-text">Fauna Athletics</p>
                  <p className="text-f-muted">Schweiz</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[15px]">
                <Mail size={18} className="text-f-green-light flex-shrink-0" />
                <a href="mailto:info@fauna-athletics.ch" className="text-f-text hover:text-f-green-light transition-colors">
                  info@fauna-athletics.ch
                </a>
              </div>

              <div className="flex items-center gap-3 text-[15px]">
                <Globe size={18} className="text-f-green-light flex-shrink-0" />
                <a href="https://fauna-athletics.ch" target="_blank" rel="noopener noreferrer" className="text-f-text hover:text-f-green-light transition-colors">
                  fauna-athletics.ch
                </a>
              </div>
            </div>
          </div>

          {/* Legal details */}
          <div className="space-y-6 text-f-muted text-[15px] leading-relaxed">
            <section>
              <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">Vertretungsberechtigte Person</h2>
              <p>Geschäftsführer von Fauna Athletics</p>
            </section>

            <section>
              <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">Mehrwertsteuer</h2>
              <p>Mehrwertsteuerpflichtig gemäss schweizerischem Mehrwertsteuergesetz (MWSTG).</p>
              <p className="mt-2">MWST-Satz: 8.1% (Normalsatz)</p>
            </section>

            <section>
              <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">Haftungsausschluss</h2>
              <p>Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen. Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen entstanden sind, werden ausgeschlossen.</p>
            </section>

            <section>
              <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">Urheberrechte</h2>
              <p>Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website gehören ausschliesslich Fauna Athletics oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.</p>
            </section>
          </div>

          <p className="text-f-muted/60 text-[13px] pt-6 border-t border-f-border/20">
            Stand: Februar 2026
          </p>
        </div>
      </div>
    </div>
  )
}
