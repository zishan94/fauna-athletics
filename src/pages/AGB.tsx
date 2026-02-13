import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function AGB() {
  return (
    <div className="py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="text-[11px] uppercase tracking-[0.4em] text-f-green-light mb-3 block">Rechtliches</span>
          <h1 className="font-heading text-5xl md:text-6xl tracking-[0.02em] mb-10">ALLGEMEINE GESCHÄFTSBEDINGUNGEN</h1>
        </motion.div>

        <div className="accent-line mb-10" />

        <div className="prose-custom space-y-8 text-f-muted text-[15px] leading-relaxed">
          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">1. Geltungsbereich</h2>
            <p>Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen, die über den Online-Shop von Fauna Athletics (nachfolgend «wir» oder «Fauna Athletics») getätigt werden. Mit der Bestellung anerkennt der Kunde diese AGB.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">2. Vertragsschluss</h2>
            <p>Die Darstellung der Produkte im Online-Shop stellt kein bindendes Angebot dar, sondern eine unverbindliche Aufforderung an den Kunden, Waren zu bestellen. Mit der Absendung der Bestellung gibt der Kunde ein verbindliches Angebot ab. Der Vertrag kommt zustande, wenn wir die Bestellung durch eine Bestätigungs-E-Mail annehmen.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">3. Preise und Zahlung</h2>
            <p>Alle Preise verstehen sich in Schweizer Franken (CHF) inklusive der gesetzlichen Mehrwertsteuer (MWST) von 8.1%. Die Versandkosten werden separat ausgewiesen und betragen CHF 7.90 für Standardversand innerhalb der Schweiz. Ab einem Bestellwert von CHF 69.- ist der Versand kostenlos.</p>
            <p className="mt-3">Wir akzeptieren folgende Zahlungsmittel: Kreditkarten (Visa, Mastercard), TWINT, PostFinance und weitere elektronische Zahlungsmethoden.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">4. Lieferung</h2>
            <p>Wir liefern innerhalb der Schweiz und nach Liechtenstein. Die Lieferzeit beträgt in der Regel 3-5 Werktage für Standardversand und 1-2 Werktage für Expressversand. Bei Verfügbarkeitsproblemen informieren wir den Kunden umgehend.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">5. Widerrufsrecht und Rückgabe</h2>
            <p>Der Kunde hat das Recht, die Bestellung innerhalb von 14 Tagen nach Erhalt der Ware ohne Angabe von Gründen zu widerrufen. Die Ware muss in originalem Zustand, ungetragen und mit allen Etiketten versehen zurückgesandt werden. Die Kosten der Rücksendung trägt Fauna Athletics.</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">6. Gewährleistung</h2>
            <p>Wir gewährleisten, dass unsere Produkte zum Zeitpunkt der Lieferung frei von Material- und Verarbeitungsfehlern sind. Die Gewährleistungsfrist beträgt 2 Jahre ab Lieferdatum gemäss schweizerischem Obligationenrecht (OR Art. 210).</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">7. Datenschutz</h2>
            <p>Die Erhebung und Verarbeitung personenbezogener Daten erfolgt gemäss unserer <Link to="/datenschutz" className="text-f-green-light hover:underline">Datenschutzerklärung</Link> und dem Schweizer Datenschutzgesetz (DSG).</p>
          </section>

          <section>
            <h2 className="text-f-text font-heading text-2xl tracking-[0.05em] mb-4">8. Anwendbares Recht und Gerichtsstand</h2>
            <p>Es gilt ausschliesslich schweizerisches Recht. Gerichtsstand ist der Sitz von Fauna Athletics in der Schweiz.</p>
          </section>

          <p className="text-f-muted/60 text-[13px] pt-6 border-t border-f-border/20">
            Stand: Februar 2026
          </p>
        </div>
      </div>
    </div>
  )
}
