import { motion } from 'framer-motion'

export default function Datenschutz() {
  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Rechtliches</span>
          <h1 className="font-heading text-5xl md:text-6xl tracking-[0.02em] mb-10">DATENSCHUTZERKLÄRUNG</h1>
        </motion.div>

        <div className="accent-line mb-10" />

        <div className="space-y-8 text-f-muted text-[15px] leading-relaxed">
          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">1. Verantwortliche Stelle</h2>
            <p>Verantwortlich für die Datenbearbeitung ist Fauna Athletics mit Sitz in der Schweiz. Kontakt: info@fauna-athletics.ch</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">2. Erhobene Daten</h2>
            <p>Wir erheben folgende personenbezogene Daten im Rahmen der Nutzung unseres Online-Shops:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-f-muted/80">
              <li>Name, Vorname und Adresse bei Bestellungen</li>
              <li>E-Mail-Adresse für Bestellbestätigungen und Newsletter</li>
              <li>Telefonnummer für Lieferungsrückfragen</li>
              <li>Zahlungsdaten (werden direkt von unserem Zahlungsanbieter verarbeitet)</li>
              <li>Technische Daten wie IP-Adresse und Browserinformationen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">3. Zweck der Datenbearbeitung</h2>
            <p>Die erhobenen Daten werden für folgende Zwecke verwendet:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-f-muted/80">
              <li>Abwicklung von Bestellungen und Lieferungen</li>
              <li>Kundenkommunikation und Support</li>
              <li>Newsletter-Versand (nur mit ausdrücklicher Einwilligung)</li>
              <li>Verbesserung unserer Website und Dienstleistungen</li>
              <li>Erfüllung gesetzlicher Pflichten</li>
            </ul>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">4. Cookies</h2>
            <p>Unsere Website verwendet technisch notwendige Cookies für den Warenkorb und die Benutzersitzung. Analyse-Cookies werden nur mit Ihrer Einwilligung gesetzt. Sie können Cookies in Ihrem Browser jederzeit deaktivieren.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">5. Datenweitergabe</h2>
            <p>Personenbezogene Daten werden nur an Dritte weitergegeben, soweit dies zur Vertragserfüllung notwendig ist (z.B. Versanddienstleister, Zahlungsanbieter). Eine Weitergabe zu Werbezwecken findet nicht statt.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">6. Datensicherheit</h2>
            <p>Wir setzen technische und organisatorische Sicherheitsmassnahmen ein, um Ihre Daten gegen Manipulation, Verlust und unberechtigten Zugriff zu schützen. Die Datenübertragung erfolgt SSL-verschlüsselt.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">7. Ihre Rechte</h2>
            <p>Sie haben gemäss dem Schweizer Datenschutzgesetz (DSG) das Recht auf:</p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 text-f-muted/80">
              <li>Auskunft über Ihre gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung Ihrer Daten</li>
              <li>Einschränkung der Datenbearbeitung</li>
              <li>Widerruf erteilter Einwilligungen</li>
            </ul>
            <p className="mt-3">Bitte kontaktieren Sie uns unter info@fauna-athletics.ch für die Ausübung Ihrer Rechte.</p>
          </section>

          <p className="text-f-muted/60 text-[13px] pt-6 border-t border-f-border/20">
            Stand: Februar 2026
          </p>
        </div>
      </div>
    </div>
  )
}
