import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * DELETE /store/wishlist/:productId
 * Removes a product ID from the customer's wishlist.
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const customerId = (req as any).auth_context?.actor_id
  if (!customerId) {
    return res.status(401).json({ message: "Nicht authentifiziert." })
  }

  const productId = req.params.productId
  if (!productId) {
    return res.status(400).json({ message: "productId ist erforderlich." })
  }

  try {
    const customerModule = req.scope.resolve(Modules.CUSTOMER)
    const customer = await customerModule.retrieveCustomer(customerId)
    const currentWishlist: string[] = (customer.metadata as any)?.wishlist || []
    const newWishlist = currentWishlist.filter((id) => id !== productId)

    await customerModule.updateCustomers(customerId, {
      metadata: { ...(customer.metadata || {}), wishlist: newWishlist },
    })

    return res.json({ wishlist: newWishlist })
  } catch (err: any) {
    console.error("Wishlist DELETE error:", err)
    return res.status(500).json({ message: "Fehler beim Entfernen aus der Wunschliste." })
  }
}
