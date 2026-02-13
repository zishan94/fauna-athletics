import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /admin/settings
 * Returns the store metadata including configurable settings like free_shipping_threshold.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const storeModule = req.scope.resolve(Modules.STORE)
    const [store] = await storeModule.listStores()

    if (!store) {
      return res.status(404).json({ message: "Store not found." })
    }

    const metadata = (store.metadata ?? {}) as Record<string, unknown>

    return res.json({
      free_shipping_threshold: metadata.free_shipping_threshold ?? 6900,
      announcement_text: metadata.announcement_text ?? "",
      instagram_url: metadata.instagram_url ?? "",
      contact_email: metadata.contact_email ?? "",
      store_name: store.name,
      store_id: store.id,
      metadata,
    })
  } catch (err: any) {
    console.error("Admin settings GET error:", err)
    return res.status(500).json({ message: "Failed to load settings." })
  }
}

/**
 * POST /admin/settings
 * Updates store metadata with configurable settings.
 * Body: { free_shipping_threshold?: number, ... }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const storeModule = req.scope.resolve(Modules.STORE)
    const [store] = await storeModule.listStores()

    if (!store) {
      return res.status(404).json({ message: "Store not found." })
    }

    const body = req.body as Record<string, unknown>
    const currentMetadata = (store.metadata ?? {}) as Record<string, unknown>

    const updatedMetadata: Record<string, unknown> = { ...currentMetadata }

    // Update free_shipping_threshold if provided
    if (typeof body.free_shipping_threshold === "number") {
      updatedMetadata.free_shipping_threshold = body.free_shipping_threshold
    }

    // Announcement bar text
    if (typeof body.announcement_text === "string") {
      updatedMetadata.announcement_text = body.announcement_text
    }

    // Social media & contact
    if (typeof body.instagram_url === "string") {
      updatedMetadata.instagram_url = body.instagram_url
    }
    if (typeof body.contact_email === "string") {
      updatedMetadata.contact_email = body.contact_email
    }

    // Allow updating arbitrary metadata keys
    if (body.metadata && typeof body.metadata === "object") {
      Object.assign(updatedMetadata, body.metadata)
    }

    await storeModule.updateStores(store.id, {
      metadata: updatedMetadata,
    })

    return res.json({
      success: true,
      free_shipping_threshold: updatedMetadata.free_shipping_threshold,
      metadata: updatedMetadata,
    })
  } catch (err: any) {
    console.error("Admin settings POST error:", err)
    return res.status(500).json({ message: "Failed to update settings." })
  }
}
