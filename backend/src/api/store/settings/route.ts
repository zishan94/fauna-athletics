import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/settings
 * Public endpoint returning configurable store settings for the storefront.
 * Returns free_shipping_threshold and other public settings.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const storeModule = req.scope.resolve(Modules.STORE)
    const [store] = await storeModule.listStores()

    if (!store) {
      return res.json({
        free_shipping_threshold: 6900,
        announcement_text: "",
        instagram_url: "",
        contact_email: "",
      })
    }

    const metadata = (store.metadata ?? {}) as Record<string, unknown>

    return res.json({
      free_shipping_threshold: metadata.free_shipping_threshold ?? 6900,
      announcement_text: metadata.announcement_text ?? "",
      instagram_url: metadata.instagram_url ?? "",
      contact_email: metadata.contact_email ?? "",
    })
  } catch (err: any) {
    console.error("Store settings GET error:", err)
    // Return defaults on error so the storefront always has values
    return res.json({
      free_shipping_threshold: 6900,
      announcement_text: "",
      instagram_url: "",
      contact_email: "",
    })
  }
}
