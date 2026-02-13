import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Text } from "@medusajs/ui"
import { useState, useEffect } from "react"

/**
 * Store Settings Quick View Widget
 *
 * Zeigt eine kompakte Übersicht der wichtigsten Shop-Einstellungen
 * auf der Bestellungsseite. Für die vollständige Konfiguration
 * siehe die dedizierte "Shop Konfiguration" Seite im Menü.
 */
const StoreSettingsWidget = () => {
  const [threshold, setThreshold] = useState("69")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/admin/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const raw = data.free_shipping_threshold
        const chf = typeof raw === "number" ? (raw >= 1000 ? raw / 100 : raw) : 69
        setThreshold(chf.toString())
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <Text size="small" weight="plus" className="block">
            Gratis Versand ab CHF {parseFloat(threshold).toFixed(0)}.-
          </Text>
          <Text size="xsmall" className="text-ui-fg-subtle mt-0.5 block">
            Weitere Einstellungen unter &quot;Shop Konfiguration&quot; im Menü.
          </Text>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.after",
})

export default StoreSettingsWidget
