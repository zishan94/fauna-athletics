import { motion } from 'framer-motion'
import { RotateCcw, Clock, Package, Mail } from 'lucide-react'

export default function Widerruf() {
  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Rechtliches</span>
          <h1 className="font-heading text-5xl md:text-6xl tracking-[0.02em] mb-10">WIDERRUFSBELEHRUNG</h1>
        </motion.div>

        <div className="accent-line mb-10" />

        {/* Quick summary */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: Clock, title: '14 Tage', desc: 'Widerrufsfrist' },
            { icon: Package, title: 'Kostenlos', desc: 'Rücksendung' },
            { icon: RotateCcw, title: 'Erstattung', desc: 'Innerhalb 14 Tagen' },
          ].map(item => (
            <div key={item.title} className="bg-f-gray/30 border border-f-border/20 p-5 text-center">
              <item.icon size={24} className="text-f-green-light mx-auto mb-3" />
              <p className="text-f-text font-medium text-[15px]">{item.title}</p>
              <p className="text-f-muted text-[13px]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8 text-f-muted text-[15px] leading-relaxed">
          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">Widerrufsrecht</h2>
            <p>Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt 14 Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">Ausübung des Widerrufsrechts</h2>
            <p>Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung (z.B. per E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können das nachfolgende Widerrufsformular verwenden, was jedoch nicht vorgeschrieben ist.</p>

            <div className="bg-f-gray/30 border border-f-border/20 p-6 mt-4 flex items-start gap-3">
              <Mail size={18} className="text-f-green-light flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-f-text font-medium">Kontakt für Widerruf</p>
                <a href="mailto:info@fauna-athletics.ch" className="text-f-green-light hover:underline">info@fauna-athletics.ch</a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">Folgen des Widerrufs</h2>
            <p>Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschliesslich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen 14 Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">Rücksendung</h2>
            <p>Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen 14 Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden.</p>
            <p className="mt-3">Die Ware muss sich im Originalzustand befinden:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-f-muted/80">
              <li>Ungetragen und ungewaschen</li>
              <li>Mit allen Originaletiketten versehen</li>
              <li>In der Originalverpackung (wenn möglich)</li>
            </ul>
            <p className="mt-3">Die Kosten der Rücksendung übernehmen wir. Ein Retourenlabel wird Ihnen per E-Mail zugestellt.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">Ausschluss des Widerrufsrechts</h2>
            <p>Das Widerrufsrecht besteht nicht bei Waren, die nach Kundenspezifikation angefertigt wurden oder die eindeutig auf persönliche Bedürfnisse zugeschnitten sind.</p>
          </section>

          <p className="text-f-muted/60 text-[13px] pt-6 border-t border-f-border/20">
            Stand: Februar 2026 &middot; Gemäss Schweizer Verbandsempfehlung für Onlinehandel
          </p>
        </div>
      </div>
    </div>
  )
}
