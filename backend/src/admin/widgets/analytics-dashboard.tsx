import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"

interface AnalyticsData {
  // Realized revenue (paid/captured orders only)
  total_revenue: number
  revenue_30d: number
  revenue_7d: number
  average_order_value: number

  // Pending order values (not yet paid)
  pending_revenue: number
  pending_revenue_30d: number
  pending_revenue_7d: number

  // Total order value
  total_order_value: number

  // Order counts
  total_orders: number
  completed_orders: number // orders with captured payment
  pending_orders: number // orders with no payment
  canceled_orders: number
  orders_30d: number
  pending_orders_30d: number
  orders_7d: number
  pending_orders_7d: number

  // Conversion
  conversion_rate: number

  // Breakdowns
  top_products: { title: string; quantity: number; revenue: number }[]
  revenue_by_day: Record<string, number>
  status_breakdown: Record<string, number>
  payment_breakdown: { paid: number; unpaid: number; canceled: number }
  currency_code: string
}

function formatCHF(amount: number): string {
  return `CHF ${(amount / 100).toFixed(2)}`
}

function MiniBarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
  const values = entries.map(([, v]) => v)
  const max = Math.max(...values, 1)
  const hasAnyRevenue = values.some((v) => v > 0)

  if (!hasAnyRevenue) {
    return (
      <div className="flex items-center justify-center h-[60px] py-1">
        <Text size="small" className="text-ui-fg-muted">
          Noch kein Umsatz in den letzten 30 Tagen
        </Text>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-[2px] h-[60px] py-1">
      {entries.map(([date, val], i) => {
        const formattedDate = new Date(date).toLocaleDateString("de-CH", {
          day: "2-digit",
          month: "2-digit",
        })
        return (
          <div
            key={i}
            className={`flex-1 rounded-t-sm min-h-[2px] transition-all duration-300 ${
              val > 0 ? "bg-ui-tag-green-icon" : "bg-ui-border-base"
            }`}
            style={{ height: `${Math.max((val / max) * 100, 2)}%` }}
            title={`${formattedDate}: ${formatCHF(val)}`}
          />
        )
      })}
    </div>
  )
}

function MetricCard({
  label,
  value,
  subValue,
  trend,
  muted,
  highlight,
}: {
  label: string
  value: string
  subValue?: string
  trend?: "up" | "down" | "neutral"
  muted?: boolean
  highlight?: "green" | "orange" | "red"
}) {
  const borderColor =
    highlight === "green"
      ? "border-ui-tag-green-border"
      : highlight === "orange"
        ? "border-ui-tag-orange-border"
        : highlight === "red"
          ? "border-ui-tag-red-border"
          : "border-ui-border-base"

  return (
    <div
      className={`p-4 rounded-lg border ${borderColor} bg-ui-bg-subtle`}
    >
      <Text size="small" className="text-ui-fg-subtle mb-1 block">
        {label}
      </Text>
      <div className="flex items-baseline gap-2">
        <span
          className={`text-[22px] font-semibold leading-tight ${
            muted ? "text-ui-fg-muted" : "text-ui-fg-base"
          }`}
        >
          {value}
        </span>
        {trend && trend !== "neutral" && (
          <span
            className={
              trend === "up"
                ? "text-ui-tag-green-text text-sm"
                : "text-ui-tag-red-text text-sm"
            }
          >
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
      {subValue && (
        <Text size="small" className="text-ui-fg-muted mt-1 block">
          {subValue}
        </Text>
      )}
    </div>
  )
}

function StatusBar({
  completed,
  pending,
  canceled,
  total,
}: {
  completed: number
  pending: number
  canceled: number
  total: number
}) {
  if (total === 0) return null

  const completedPct = (completed / total) * 100
  const pendingPct = (pending / total) * 100
  const canceledPct = (canceled / total) * 100

  return (
    <div className="w-full h-2 rounded-full bg-ui-bg-subtle-hover flex overflow-hidden">
      {completedPct > 0 && (
        <div
          className="h-full bg-ui-tag-green-icon transition-all duration-500"
          style={{ width: `${completedPct}%` }}
          title={`Abgeschlossen: ${completed}`}
        />
      )}
      {pendingPct > 0 && (
        <div
          className="h-full bg-ui-tag-orange-icon transition-all duration-500"
          style={{ width: `${pendingPct}%` }}
          title={`Ausstehend: ${pending}`}
        />
      )}
      {canceledPct > 0 && (
        <div
          className="h-full bg-ui-tag-red-icon transition-all duration-500"
          style={{ width: `${canceledPct}%` }}
          title={`Storniert: ${canceled}`}
        />
      )}
    </div>
  )
}

const AnalyticsDashboardWidget = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/admin/analytics", {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
      setError(null)
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err)
      setError(err?.message || "Fehler beim Laden der Statistiken")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading && !data) {
    return (
      <Container className="p-0">
        <div className="p-6">
          <Heading level="h2">Statistik-Übersicht</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1 block">
            Lade Statistiken...
          </Text>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[90px] rounded-lg bg-ui-bg-subtle-hover animate-pulse"
              />
            ))}
          </div>
        </div>
      </Container>
    )
  }

  if (error && !data) {
    return (
      <Container className="p-0">
        <div className="p-6">
          <Heading level="h2">Statistik-Übersicht</Heading>
          <Text size="small" className="text-ui-fg-error mt-2 block">
            {error}
          </Text>
          <button
            onClick={fetchAnalytics}
            className="mt-3 text-sm text-ui-fg-interactive underline hover:no-underline"
          >
            Erneut versuchen
          </button>
        </div>
      </Container>
    )
  }

  if (!data) return null

  const statusLabels: Record<string, string> = {
    pending: "Ausstehend",
    completed: "Abgeschlossen",
    canceled: "Storniert",
    archived: "Archiviert",
    requires_action: "Aktion nötig",
  }

  const statusColors: Record<string, "green" | "red" | "orange" | "grey" | "blue" | "purple"> = {
    completed: "green",
    canceled: "red",
    pending: "orange",
    requires_action: "blue",
    archived: "grey",
  }

  const hasCompletedOrders = data.completed_orders > 0
  const hasPendingOrders = data.pending_orders > 0

  return (
    <Container className="p-0">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <Heading level="h2">Statistik-Übersicht</Heading>
            <Text size="small" className="text-ui-fg-subtle mt-1 block">
              Überblick über Umsätze, Bestellungen und Top-Produkte
            </Text>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <Text size="xsmall" className="text-ui-fg-muted">
                {lastUpdated.toLocaleTimeString("de-CH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors disabled:opacity-50"
              title="Aktualisieren"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <Badge color="green" size="small">
              Live
            </Badge>
          </div>
        </div>

        {/* Info banner when no paid orders exist */}
        {!hasCompletedOrders && hasPendingOrders && (
          <div className="mb-5 p-3 rounded-lg border border-ui-tag-orange-border bg-ui-tag-orange-bg">
            <Text size="small" className="text-ui-tag-orange-text">
              <strong>Hinweis:</strong> Es gibt {data.pending_orders}{" "}
              unbezahlte Bestellung{data.pending_orders !== 1 ? "en" : ""} mit einem
              Gesamtwert von {formatCHF(data.pending_revenue)}. Umsatz wird erst
              gezählt, wenn eine Zahlung erfolgreich eingegangen ist.
            </Text>
          </div>
        )}

        {/* Key Metrics - Row 1: Revenue */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <MetricCard
            label="Bezahlter Umsatz"
            value={formatCHF(data.total_revenue)}
            subValue={
              hasCompletedOrders
                ? `${data.completed_orders} bezahlte Bestellung${data.completed_orders !== 1 ? "en" : ""}`
                : "Noch keine Zahlungen eingegangen"
            }
            highlight={hasCompletedOrders ? "green" : undefined}
          />
          <MetricCard
            label="Umsatz (30 Tage)"
            value={formatCHF(data.revenue_30d)}
            subValue={`${data.orders_30d} bezahlt`}
            trend={data.revenue_30d > 0 ? "up" : "neutral"}
          />
          <MetricCard
            label="Umsatz (7 Tage)"
            value={formatCHF(data.revenue_7d)}
            subValue={`${data.orders_7d} bezahlt`}
            trend={data.revenue_7d > 0 ? "up" : "neutral"}
          />
          <MetricCard
            label="Ø Bestellwert"
            value={
              hasCompletedOrders ? formatCHF(data.average_order_value) : "–"
            }
            subValue={
              hasCompletedOrders ? "pro bezahlter Bestellung" : "Keine Daten"
            }
          />
        </div>

        {/* Key Metrics - Row 2: Orders & Pending */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <MetricCard
            label="Unbezahlte Bestellungen"
            value={String(data.pending_orders)}
            subValue={
              hasPendingOrders
                ? `Wert: ${formatCHF(data.pending_revenue)}`
                : "Keine unbezahlten Bestellungen"
            }
            muted={!hasPendingOrders}
            highlight={hasPendingOrders ? "orange" : undefined}
          />
          <MetricCard
            label="Unbezahlt (30 Tage)"
            value={String(data.pending_orders_30d)}
            subValue={
              data.pending_orders_30d > 0
                ? `Wert: ${formatCHF(data.pending_revenue_30d)}`
                : "–"
            }
            muted={data.pending_orders_30d === 0}
          />
          <MetricCard
            label="Storniert"
            value={String(data.canceled_orders)}
            subValue={`von ${data.total_orders} gesamt`}
            muted={data.canceled_orders === 0}
            highlight={data.canceled_orders > 0 ? "red" : undefined}
          />
          <MetricCard
            label="Bezahlrate"
            value={`${data.conversion_rate}%`}
            subValue={`${data.completed_orders} von ${data.total_orders - data.canceled_orders} bezahlt`}
            trend={
              data.conversion_rate >= 80
                ? "up"
                : data.conversion_rate > 0
                  ? "down"
                  : "neutral"
            }
          />
        </div>

        {/* Order Status Progress Bar */}
        {data.total_orders > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
            <div className="flex items-center justify-between mb-2">
              <Text size="small" weight="plus" className="block">
                Bestellungsübersicht
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                {data.total_orders} Bestellungen gesamt
              </Text>
            </div>
            <StatusBar
              completed={data.completed_orders}
              pending={data.pending_orders}
              canceled={data.canceled_orders}
              total={data.total_orders}
            />
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-ui-tag-green-icon" />
                <Text size="xsmall" className="text-ui-fg-muted">
                  Bezahlt ({data.completed_orders})
                </Text>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-ui-tag-orange-icon" />
                <Text size="xsmall" className="text-ui-fg-muted">
                  Unbezahlt ({data.pending_orders})
                </Text>
              </div>
              {data.canceled_orders > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-ui-tag-red-icon" />
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Storniert ({data.canceled_orders})
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revenue Chart */}
        <div className="mb-6 p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
          <Text size="small" weight="plus" className="mb-2 block">
            Bezahlter Umsatz – letzte 30 Tage
          </Text>
          <MiniBarChart data={data.revenue_by_day} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Top Products */}
          <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
            <Text size="small" weight="plus" className="mb-3 block">
              Top Produkte (bezahlte Bestellungen)
            </Text>
            {data.top_products.length === 0 ? (
              <div className="py-4 text-center">
                <Text size="small" className="text-ui-fg-muted block">
                  Noch keine bezahlten Verkäufe
                </Text>
                <Text size="xsmall" className="text-ui-fg-disabled mt-1 block">
                  Produkte erscheinen hier, sobald Zahlungen eingegangen sind
                </Text>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {data.top_products.map((product, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2 ${
                      i < data.top_products.length - 1
                        ? "border-b border-ui-border-base"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-ui-bg-subtle-hover flex items-center justify-center text-[11px] font-semibold text-ui-fg-subtle">
                        {i + 1}
                      </div>
                      <div>
                        <Text size="small" weight="plus">
                          {product.title}
                        </Text>
                        <Text
                          size="xsmall"
                          className="text-ui-fg-muted block"
                        >
                          {product.quantity}x verkauft
                        </Text>
                      </div>
                    </div>
                    <Text size="small" weight="plus">
                      {formatCHF(product.revenue)}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className="p-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle">
            <Text size="small" weight="plus" className="mb-3 block">
              Bestellstatus
            </Text>
            {Object.keys(data.status_breakdown).length === 0 ? (
              <div className="py-4 text-center">
                <Text size="small" className="text-ui-fg-muted block">
                  Noch keine Bestellungen
                </Text>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Object.entries(data.status_breakdown)
                  .sort(([a], [b]) => {
                    const order = [
                      "pending",
                      "requires_action",
                      "completed",
                      "canceled",
                      "archived",
                    ]
                    return order.indexOf(a) - order.indexOf(b)
                  })
                  .map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between py-2"
                    >
                      <Badge
                        color={statusColors[status] || "grey"}
                        size="small"
                      >
                        {statusLabels[status] || status}
                      </Badge>
                      <Text size="small" weight="plus">
                        {count}
                      </Text>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default AnalyticsDashboardWidget
