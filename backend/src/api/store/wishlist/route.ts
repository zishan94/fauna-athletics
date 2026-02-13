import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/wishlist
 * Returns the current customer's wishlist (array of product IDs).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = (req as any).auth_context?.actor_id
  if (!customerId) {
    return res.status(401).json({ message: "Nicht authentifiziert." })
  }

  try {
    const customerModule = req.scope.resolve(Modules.CUSTOMER)
    const customer = await customerModule.retrieveCustomer(customerId)
    const wishlist: string[] = (customer.metadata as any)?.wishlist || []
    return res.json({ wishlist })
  } catch (err: any) {
    console.error("Wishlist GET error:", err)
    return res.status(500).json({ message: "Fehler beim Laden der Wunschliste." })
  }
}

/**
 * POST /store/wishlist
 * Body: { product_id: string }
 * Adds a product ID to the customer's wishlist.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = (req as any).auth_context?.actor_id
  if (!customerId) {
    return res.status(401).json({ message: "Nicht authentifiziert." })
  }

  const { product_id } = req.body as { product_id?: string }
  if (!product_id) {
    return res.status(400).json({ message: "product_id ist erforderlich." })
  }

  try {
    const customerModule = req.scope.resolve(Modules.CUSTOMER)
    const customer = await customerModule.retrieveCustomer(customerId)
    const currentWishlist: string[] = (customer.metadata as any)?.wishlist || []

    if (currentWishlist.includes(product_id)) {
      return res.json({ wishlist: currentWishlist })
    }

    const newWishlist = [...currentWishlist, product_id]
    await customerModule.updateCustomers(customerId, {
      metadata: { ...(customer.metadata || {}), wishlist: newWishlist },
    })

    return res.json({ wishlist: newWishlist })
  } catch (err: any) {
    console.error("Wishlist POST error:", err)
    return res.status(500).json({ message: "Fehler beim Hinzufügen zur Wunschliste." })
  }
}
