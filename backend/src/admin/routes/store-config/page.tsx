import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Button, Text, Badge } from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"

/**
 * Store Configuration Page
 *
 * Dedicated admin page for all Fauna Athletics store settings:
 * - Versand (free shipping threshold)
 * - Ankündigungsleiste (announcement bar)
 * - Social Media & Kontakt
 * - Zahlungsanbieter (payment providers)
 */
const StoreConfigPage = () => {
  // ── Settings State ──
  const [threshold, setThreshold] = useState("")
  const [announcementText, setAnnouncementText] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [error, setError] = useState("")

  // ── Payment Providers State ──
  const [paymentProviders, setPaymentProviders] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [loadingPayment, setLoadingPayment] = useState(true)

  // ── Load Settings ──
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/admin/settings", { credentials: "include" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const raw = data.free_shipping_threshold
        const chfValue = typeof raw === "number" ? (raw >= 1000 ? raw / 100 : raw) : 69
        setThreshold(chfValue.toString())
        setAnnouncementText(data.announcement_text || "")
        setInstagramUrl(data.instagram_url || "https://instagram.com/fauna_athletics")
        setContactEmail(data.contact_email || "info@fauna-athletics.ch")
      } catch {
        setThreshold("69")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // ── Load Payment Providers & Regions ──
  const fetchPaymentInfo = useCallback(async () => {
    setLoadingPayment(true)
    try {
      // Fetch payment providers — try multiple Medusa v2 endpoint formats
      let providers: any[] = []
      for (const endpoint of [
        "/admin/payment-providers",
        "/admin/payment-providers?limit=50",
      ]) {
        try {
          const ppRes = await fetch(endpoint, { credentials: "include" })
          if (ppRes.ok) {
            const ppData = await ppRes.json()
            providers = ppData.payment_providers || []
            if (providers.length > 0) break
          }
        } catch {
          // Try next endpoint
        }
      }
      setPaymentProviders(providers)

      // Fetch regions with payment_providers relation expanded
      let regionsList: any[] = []
      for (const endpoint of [
        "/admin/regions?fields=*payment_providers,id,name,currency_code,countries.iso_2",
        "/admin/regions?expand=payment_providers",
        "/admin/regions",
      ]) {
        try {
          const regRes = await fetch(endpoint, { credentials: "include" })
          if (regRes.ok) {
            const regData = await regRes.json()
            regionsList = regData.regions || []
            break
          }
        } catch {
          // Try next endpoint
        }
      }
      setRegions(regionsList)
    } catch (err) {
      console.error("Failed to load payment info:", err)
    } finally {
      setLoadingPayment(false)
    }
  }, [])

  useEffect(() => {
    fetchPaymentInfo()
  }, [fetchPaymentInfo])

  // ── Save Settings ──
  const handleSave = async () => {
    setSaving(true)
    setStatus("idle")
    setError("")
    try {
      const chfValue = parseFloat(threshold)
      if (isNaN(chfValue) || chfValue < 0) {
        setError("Bitte gib einen gültigen Betrag ein.")
        setStatus("error")
        setSaving(false)
        return
      }
      const centsValue = Math.round(chfValue * 100)
      const res = await fetch("/admin/settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          free_shipping_threshold: centsValue,
          announcement_text: announcementText.trim(),
          instagram_url: instagramUrl.trim(),
          contact_email: contactEmail.trim(),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 3000)
    } catch (err: any) {
      setError(err?.message || "Fehler beim Speichern")
      setStatus("error")
    } finally {
      setSaving(false)
    }
  }

  // Helper to format provider IDs nicely
  const formatProviderId = (id: string) => {
    if (id.includes("stripe")) return "Stripe"
    if (id.includes("system_default")) return "System Standard"
    if (id.includes("manual")) return "Manuell"
    return id.replace(/^pp_/, "").replace(/_/g, " ")
  }

  const getProviderMethods = (id: string) => {
    if (id.includes("stripe")) {
      return ["Visa", "Mastercard", "TWINT", "Klarna", "Apple Pay", "Google Pay", "SEPA"]
    }
    if (id.includes("system_default")) return ["Manuell / Vorkasse"]
    return []
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Container className="p-6">
          <Heading level="h1">Shop Konfiguration</Heading>
          <Text className="text-ui-fg-subtle mt-1">Lade Einstellungen...</Text>
        </Container>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <Container className="p-0">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <Heading level="h1">Shop Konfiguration</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Zentrale Einstellungen für deinen Fauna Athletics Onlineshop.
            </Text>
          </div>
          <div className="flex items-center gap-2">
            {status === "saved" && (
              <Text size="small" className="text-ui-fg-interactive">
                ✓ Gespeichert
              </Text>
            )}
            {status === "error" && (
              <Text size="small" className="text-ui-fg-error">
                {error || "Fehler"}
              </Text>
            )}
            <Button onClick={handleSave} isLoading={saving}>
              Alle Einstellungen speichern
            </Button>
          </div>
        </div>
      </Container>

      {/* Versand */}
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Versand</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            Konfiguriere die Versandkosten und den Schwellenwert für Gratisversand.
          </Text>
        </div>
        <div className="px-6 py-4">
          <Text size="small" weight="plus" className="mb-1 block">
            Gratis-Versand Schwellenwert (CHF)
          </Text>
          <Text size="small" className="text-ui-fg-subtle mb-2 block">
            Bestellungen ab diesem Betrag erhalten kostenlosen Standardversand.
          </Text>
          <div className="flex items-center gap-2">
            <Text size="small" className="text-ui-fg-subtle shrink-0">CHF</Text>
            <Input
              type="number"
              size="small"
              min="0"
              step="1"
              placeholder="69"
              value={threshold}
              onChange={(e) => { setThreshold(e.target.value); setStatus("idle") }}
              style={{ maxWidth: "120px" }}
            />
          </div>
          <div className="mt-3 p-3 rounded-md border border-ui-border-base bg-ui-bg-subtle">
            <Text size="small">
              🚚 Vorschau: Gratis Versand ab CHF {threshold ? parseFloat(threshold).toFixed(0) : "69"}.-
            </Text>
          </div>
        </div>
      </Container>

      {/* Ankündigungsleiste */}
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Ankündigungsleiste</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            Text für die grüne Leiste oben auf der Seite. Leer lassen für Standardtexte.
          </Text>
        </div>
        <div className="px-6 py-4">
          <Input
            size="small"
            placeholder="z.B. NEUE KOLLEKTION JETZT VERFÜGBAR — 10% RABATT"
            value={announcementText}
            onChange={(e) => { setAnnouncementText(e.target.value); setStatus("idle") }}
          />
          {announcementText && (
            <div className="mt-2 p-3 rounded-md border border-ui-tag-green-border bg-ui-tag-green-bg">
              <Text size="small" className="text-ui-tag-green-text">
                Vorschau: {announcementText}
              </Text>
            </div>
          )}
        </div>
      </Container>

      {/* Social Media & Kontakt */}
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Social Media & Kontakt</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-0.5">
            Links und Kontaktdaten für Footer und Kontaktseite.
          </Text>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <Text size="xsmall" className="text-ui-fg-subtle mb-1 block">Instagram URL</Text>
            <Input
              size="small"
              placeholder="https://instagram.com/fauna_athletics"
              value={instagramUrl}
              onChange={(e) => { setInstagramUrl(e.target.value); setStatus("idle") }}
            />
          </div>
          <div>
            <Text size="xsmall" className="text-ui-fg-subtle mb-1 block">Kontakt E-Mail</Text>
            <Input
              size="small"
              type="email"
              placeholder="info@fauna-athletics.ch"
              value={contactEmail}
              onChange={(e) => { setContactEmail(e.target.value); setStatus("idle") }}
            />
          </div>
        </div>
      </Container>

      {/* Zahlungsanbieter */}
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h2">Zahlungsanbieter</Heading>
              <Text size="small" className="text-ui-fg-subtle mt-0.5">
                Übersicht der konfigurierten Zahlungsanbieter und ihre Zahlungsmethoden.
              </Text>
            </div>
            <Button
              size="small"
              variant="secondary"
              onClick={fetchPaymentInfo}
              disabled={loadingPayment}
            >
              Aktualisieren
            </Button>
          </div>
        </div>

        {loadingPayment ? (
          <div className="px-6 py-8 text-center">
            <Text size="small" className="text-ui-fg-muted">
              Lade Zahlungsanbieter...
            </Text>
          </div>
        ) : (
          <>
            {/* Provider List */}
            <div className="px-6 py-4">
              <Text size="small" weight="plus" className="mb-3 block">
                Konfigurierte Anbieter
              </Text>

              {/* Always show Stripe as configured (from medusa-config.ts) */}
              <div className="space-y-3">
                {/* Stripe — always configured via medusa-config.ts */}
                <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Text size="small" weight="plus">Stripe</Text>
                      <Badge color="green" size="small">Konfiguriert</Badge>
                      <Badge color="blue" size="small">automatic_payment_methods</Badge>
                    </div>
                    <Text size="xsmall" className="text-ui-fg-muted font-mono">pp_stripe_stripe</Text>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Visa", "Mastercard", "TWINT", "Klarna", "Apple Pay", "Google Pay", "SEPA"].map((m) => (
                      <Badge key={m} color="grey" size="small">{m}</Badge>
                    ))}
                  </div>
                  <Text size="xsmall" className="text-ui-fg-muted mt-2 block">
                    Zahlungsmethoden werden automatisch aus dem Stripe Dashboard geladen.
                  </Text>
                </div>

                {/* Show additional providers from API (if any beyond Stripe) */}
                {paymentProviders
                  .filter((pp: any) => !pp.id?.includes("stripe"))
                  .map((pp: any) => {
                    const methods = getProviderMethods(pp.id)
                    return (
                      <div key={pp.id} className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Text size="small" weight="plus">{formatProviderId(pp.id)}</Text>
                            <Badge color="green" size="small">Aktiv</Badge>
                          </div>
                          <Text size="xsmall" className="text-ui-fg-muted font-mono">{pp.id}</Text>
                        </div>
                        {methods.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {methods.map((m) => (
                              <Badge key={m} color="grey" size="small">{m}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Region Payment Config */}
            <div className="px-6 py-4">
              <Text size="small" weight="plus" className="mb-3 block">
                Regionen & Zahlungsmethoden
              </Text>
              <Text size="small" className="text-ui-fg-subtle mb-3 block">
                Zahlungsanbieter können pro Region unter Einstellungen → Regionen zugewiesen werden.
              </Text>
              {regions.length === 0 ? (
                <Text size="small" className="text-ui-fg-muted">Keine Regionen gefunden.</Text>
              ) : (
                <div className="space-y-2">
                  {regions.map((region: any) => {
                    const regionProviders = region.payment_providers || []
                    const hasProviders = regionProviders.length > 0
                    return (
                      <div key={region.id} className="p-3 rounded-md border border-ui-border-base bg-ui-bg-subtle flex items-center justify-between">
                        <div>
                          <Text size="small" weight="plus">{region.name}</Text>
                          <Text size="xsmall" className="text-ui-fg-muted block">
                            {region.currency_code?.toUpperCase()} · {region.countries?.map((c: any) => c.iso_2?.toUpperCase()).join(", ") || "—"}
                          </Text>
                        </div>
                        <div className="flex gap-1">
                          {hasProviders ? (
                            regionProviders.map((pp: any) => (
                              <Badge key={pp.id} color="green" size="small">
                                {formatProviderId(pp.id)}
                              </Badge>
                            ))
                          ) : (
                            <Badge color="orange" size="small">
                              Noch nicht zugewiesen
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {regions.some((r: any) => !r.payment_providers || r.payment_providers.length === 0) && (
                <div className="mt-3 p-3 rounded-md border border-ui-tag-orange-border bg-ui-tag-orange-bg">
                  <Text size="small" className="text-ui-tag-orange-text">
                    Tipp: Weise Stripe deinen Regionen zu unter <strong>Einstellungen → Regionen → [Region] → Bearbeiten</strong>, damit Zahlungen im Checkout funktionieren.
                  </Text>
                </div>
              )}
            </div>

            {/* Setup Instructions */}
            <div className="px-6 py-4">
              <div className="p-4 rounded-md border border-ui-border-base bg-ui-bg-subtle">
                <Text size="small" weight="plus" className="mb-2 block">
                  Zahlungsmethoden einrichten
                </Text>
                <Text size="xsmall" className="text-ui-fg-subtle block leading-relaxed">
                  1. Stripe ist als Hauptzahlungsanbieter in der <code>medusa-config.ts</code> konfiguriert mit <code>automatic_payment_methods</code>.<br/>
                  2. Aktiviere gewünschte Zahlungsmethoden im <strong>Stripe Dashboard</strong> → Settings → Payment Methods:<br/>
                  &nbsp;&nbsp;• TWINT (CHF, automatisch für Schweizer Händler)<br/>
                  &nbsp;&nbsp;• Klarna (Kauf auf Rechnung, Ratenzahlung)<br/>
                  &nbsp;&nbsp;• Apple Pay / Google Pay (automatisch aktiv)<br/>
                  &nbsp;&nbsp;• SEPA Lastschrift (optional)<br/>
                  3. Weise den Stripe-Anbieter deinen Regionen zu unter <strong>Einstellungen → Regionen</strong>.<br/>
                  4. Das Stripe Payment Element im Checkout zeigt automatisch alle aktivierten Methoden an.
                </Text>
              </div>
            </div>
          </>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Shop Konfiguration",
  icon: undefined,
})

export default StoreConfigPage
