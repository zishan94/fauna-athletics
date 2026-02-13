import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/analytics
 * Returns analytics data: revenue, order counts, averages, top products.
 *
 * Revenue is derived from order_summary.totals (the single source of truth):
 * - paid_total: amount actually captured/paid
 * - current_order_total: the full order value
 * - pending_difference: amount still owed
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // Fetch all orders with their summary (contains real totals)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "status",
        "created_at",
        "currency_code",
        "summary.*",
        "items.id",
        "items.item_id",
        "items.quantity",
        "items.unit_price",
      ],
    })

    // Also fetch line items for product details (title, product_id)
    const { data: lineItems } = await query.graph({
      entity: "order_line_item",
      fields: [
        "id",
        "title",
        "product_id",
        "variant_id",
        "unit_price",
        "quantity",
      ],
    })

    // Build a lookup map: line item id -> line item details
    const lineItemMap: Record<string, any> = {}
    for (const li of lineItems) {
      lineItemMap[li.id] = li
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // --- Extract totals from summary ---
    interface OrderWithTotals {
      id: string
      status: string
      created_at: string
      currency_code: string
      order_total: number // current_order_total
      paid_total: number // what has been captured
      pending_amount: number // what is still owed
      items: any[]
    }

    const enrichedOrders: OrderWithTotals[] = orders.map((o: any) => {
      const totals = o.summary?.totals || o.summary || {}
      return {
        id: o.id,
        status: o.status || "unknown",
        created_at: o.created_at,
        currency_code: o.currency_code,
        order_total: Number(totals.current_order_total) || 0,
        paid_total: Number(totals.paid_total) || 0,
        pending_amount: Number(totals.pending_difference) || 0,
        items: o.items || [],
      }
    })

    // --- Exclude canceled orders from financial metrics ---
    const activeOrders = enrichedOrders.filter((o) => o.status !== "canceled")
    const canceledOrders = enrichedOrders.filter(
      (o) => o.status === "canceled"
    )

    // --- Orders with actual payments captured ---
    const paidOrders = activeOrders.filter((o) => o.paid_total > 0)
    // --- Orders with nothing paid ---
    const unpaidOrders = activeOrders.filter((o) => o.paid_total === 0)

    // --- Helper: sum a numeric field ---
    const sumField = (list: OrderWithTotals[], field: keyof OrderWithTotals) =>
      list.reduce((sum, o) => sum + (Number(o[field]) || 0), 0)

    // --- Convert CHF amounts to smallest unit (Rappen) for frontend ---
    // The frontend formatCHF divides by 100, so we multiply by 100 here
    const toSmallestUnit = (amount: number) => Math.round(amount * 100)

    // --- All-time stats ---
    const totalPaidRevenue = sumField(paidOrders, "paid_total")
    const totalOrderValue = sumField(activeOrders, "order_total")
    const totalPendingValue = sumField(unpaidOrders, "order_total")
    const completedCount = paidOrders.length
    const pendingCount = unpaidOrders.length
    const canceledCount = canceledOrders.length
    const totalOrders = enrichedOrders.length

    const averageOrderValue =
      completedCount > 0 ? totalPaidRevenue / completedCount : 0

    // --- Last 30 days ---
    const active30d = activeOrders.filter(
      (o) => new Date(o.created_at) >= thirtyDaysAgo
    )
    const paid30d = active30d.filter((o) => o.paid_total > 0)
    const unpaid30d = active30d.filter((o) => o.paid_total === 0)

    const revenue30d = sumField(paid30d, "paid_total")
    const pendingValue30d = sumField(unpaid30d, "order_total")

    // --- Last 7 days ---
    const active7d = activeOrders.filter(
      (o) => new Date(o.created_at) >= sevenDaysAgo
    )
    const paid7d = active7d.filter((o) => o.paid_total > 0)
    const unpaid7d = active7d.filter((o) => o.paid_total === 0)

    const revenue7d = sumField(paid7d, "paid_total")
    const pendingValue7d = sumField(unpaid7d, "order_total")

    // --- Top products (only from paid orders) ---
    const productSales: Record<
      string,
      { title: string; quantity: number; revenue: number }
    > = {}

    for (const order of paidOrders) {
      for (const item of order.items) {
        // Resolve title and product_id from line_item via item_id
        const lineItem = lineItemMap[item.item_id] || {}
        const key = lineItem.product_id || lineItem.title || item.item_id
        const title = lineItem.title || "Unbekanntes Produkt"
        const qty = Number(item.quantity) || 0
        const price = Number(item.unit_price || lineItem.unit_price) || 0

        if (!productSales[key]) {
          productSales[key] = { title, quantity: 0, revenue: 0 }
        }
        productSales[key].quantity += qty
        productSales[key].revenue += price * qty
      }
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((p) => ({
        ...p,
        revenue: toSmallestUnit(p.revenue),
      }))

    // --- Revenue by day (last 30 days, only paid orders) ---
    const revenueByDay: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split("T")[0]
      revenueByDay[key] = 0
    }
    for (const order of paid30d) {
      const key = new Date(order.created_at).toISOString().split("T")[0]
      if (revenueByDay[key] !== undefined) {
        revenueByDay[key] += toSmallestUnit(order.paid_total)
      }
    }

    // --- Order status breakdown ---
    const statusCounts: Record<string, number> = {}
    for (const order of enrichedOrders) {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    }

    // --- Payment status breakdown ---
    const paymentBreakdown = {
      paid: completedCount,
      unpaid: pendingCount,
      canceled: canceledCount,
    }

    // --- Conversion rate ---
    const nonCanceledCount = totalOrders - canceledCount
    const conversionRate =
      nonCanceledCount > 0
        ? Math.round((completedCount / nonCanceledCount) * 100)
        : 0

    return res.json({
      // Realized revenue (actually paid/captured)
      total_revenue: toSmallestUnit(totalPaidRevenue),
      revenue_30d: toSmallestUnit(revenue30d),
      revenue_7d: toSmallestUnit(revenue7d),
      average_order_value: toSmallestUnit(averageOrderValue),

      // Pending order values (not yet paid)
      pending_revenue: toSmallestUnit(totalPendingValue),
      pending_revenue_30d: toSmallestUnit(pendingValue30d),
      pending_revenue_7d: toSmallestUnit(pendingValue7d),

      // Total order value (all active orders)
      total_order_value: toSmallestUnit(totalOrderValue),

      // Order counts
      total_orders: totalOrders,
      completed_orders: completedCount,
      pending_orders: pendingCount,
      canceled_orders: canceledCount,
      orders_30d: paid30d.length,
      pending_orders_30d: unpaid30d.length,
      orders_7d: paid7d.length,
      pending_orders_7d: unpaid7d.length,

      // Conversion
      conversion_rate: conversionRate,

      // Breakdowns
      top_products: topProducts,
      revenue_by_day: revenueByDay,
      status_breakdown: statusCounts,
      payment_breakdown: paymentBreakdown,
      currency_code: "chf",
    })
  } catch (err: any) {
    console.error("Analytics GET error:", err)
    return res.status(500).json({
      message: "Failed to load analytics data.",
      error: err?.message,
    })
  }
}
