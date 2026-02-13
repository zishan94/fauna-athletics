import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { sdk } from '../lib/sdk'
import { useRegion } from './RegionContext'
import { notifyCartAdd, notifyCartRemove } from '../lib/notifications'
import type { Product } from '../data/products'

interface LineItem {
  id: string
  title: string
  subtitle?: string
  thumbnail?: string | null
  quantity: number
  unit_price: number
  total: number
  variant?: {
    id: string
    title: string
    product?: {
      handle: string
      thumbnail: string | null
    }
  }
}

interface Cart {
  id: string
  items: LineItem[]
  total: number
  subtotal: number
  tax_total: number
  shipping_total: number
  discount_total: number
  item_total: number
  region_id?: string
  shipping_address?: any
  billing_address?: any
  email?: string
  shipping_methods?: any[]
  payment_collection?: any
  promotions?: Array<{ code: string; id?: string; [key: string]: any }>
}

export interface ShippingOption {
  id: string
  name: string
  amount: number
  is_tax_inclusive?: boolean
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
}

interface CartContextType {
  cart: Cart | null
  loading: boolean
  itemCount: number
  isCartOpen: boolean
  isMedusaConnected: boolean
  setCartOpen: (open: boolean) => void
  addItem: (variantId: string, quantity?: number) => Promise<void>
  addLocalItem: (product: Product, quantity?: number) => void
  updateItem: (lineItemId: string, quantity: number) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  refreshCart: () => Promise<void>
  updateCart: (data: any) => Promise<void>
  addShippingMethod: (optionId: string) => Promise<void>
  listShippingOptions: () => Promise<ShippingOption[]>
  initializePaymentSession: (providerId?: string) => Promise<string | null>
  completeCart: () => Promise<any>
  setCartEmail: (email: string) => Promise<void>
  setShippingAddress: (address: any) => Promise<void>
  applyPromoCode: (code: string) => Promise<{ success: boolean; error?: string }>
  removePromoCode: (code: string) => Promise<void>
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: true,
  itemCount: 0,
  isCartOpen: false,
  isMedusaConnected: false,
  setCartOpen: () => {},
  addItem: async () => {},
  addLocalItem: () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  refreshCart: async () => {},
  updateCart: async () => {},
  addShippingMethod: async () => {},
  listShippingOptions: async () => [],
  initializePaymentSession: async () => null,
  completeCart: async () => null,
  setCartEmail: async () => {},
  setShippingAddress: async () => {},
  applyPromoCode: async () => ({ success: false }),
  removePromoCode: async () => {},
})

const CART_KEY = 'fauna_cart_id'
const LOCAL_CART_KEY = 'fauna_local_cart'

// Request these relationship fields on every cart retrieve / create so that
// line-item thumbnails, variant info, product handles, etc. are always present.
const CART_FIELDS =
  '+items,+items.variant,+items.variant.product,+shipping_methods,+payment_collection'

function loadLocalCart(): Cart {
  try {
    const saved = localStorage.getItem(LOCAL_CART_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return {
    id: 'local',
    items: [],
    total: 0,
    subtotal: 0,
    tax_total: 0,
    shipping_total: 0,
    discount_total: 0,
    item_total: 0,
  }
}

function saveLocalCart(cart: Cart) {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart))
  } catch {}
}

function recalcLocalCart(cart: Cart): Cart {
  // Swiss prices are MWST-inclusive – the displayed price IS the final price.
  const subtotal = cart.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  // Extract the MWST portion already included in the prices (informational only).
  const tax = Math.round((subtotal * 0.081 / 1.081) * 100) / 100
  return {
    ...cart,
    subtotal,
    tax_total: tax,
    item_total: subtotal,
    total: subtotal + (cart.shipping_total || 0), // Do NOT add tax – it's already in subtotal
  }
}

/** Check if a Medusa error is caused by stale / locked payment sessions */
function isStalePaymentError(err: any): boolean {
  const msg = err?.message || err?.toString() || ''
  return msg.includes('delete all payment sessions') || msg.includes('payment_sessions')
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setCartOpen] = useState(false)
  const [isMedusaConnected, setMedusaConnected] = useState(false)
  const { region } = useRegion()

  const getOrCreateCart = useCallback(async () => {
    // Only attempt Medusa operations when we have a real region
    const hasRealRegion = region?.id && region.id !== 'reg_fallback'

    if (hasRealRegion) {
      try {
        const savedId = localStorage.getItem(CART_KEY)

        // 1. Try to recover an existing cart
        if (savedId) {
          try {
            const { cart: existing } = await sdk.store.cart.retrieve(savedId, {
              fields: CART_FIELDS,
            }) as any
            if (existing && existing.completed_at == null) {
              setCart(existing)
              setMedusaConnected(true)
              return existing
            }
            // Cart was completed or invalid – discard it
            localStorage.removeItem(CART_KEY)
          } catch {
            // Cart no longer exists on backend – discard stale ID
            localStorage.removeItem(CART_KEY)
          }
        }

        // 2. Create a fresh cart
        const { cart: newCart } = await sdk.store.cart.create({
          region_id: region!.id,
        }) as any
        localStorage.setItem(CART_KEY, newCart.id)
        setCart(newCart)
        setMedusaConnected(true)
        return newCart
      } catch (err) {
        console.error('Medusa backend not available:', err)
      }
    }

    // Fallback: use local cart
    const local = loadLocalCart()
    setCart(local)
    setMedusaConnected(false)
    return local
  }, [region])

  useEffect(() => {
    if (region) {
      getOrCreateCart().finally(() => setLoading(false))
    }
  }, [region, getOrCreateCart])

  // --- LOCAL CART (fallback when Medusa is unavailable) ---

  const addLocalItem = useCallback((product: Product, quantity = 1) => {
    setCart(prev => {
      const current = prev || loadLocalCart()
      const existingIndex = current.items.findIndex(
        item => item.id === `local_${product.id}`
      )

      let newItems: LineItem[]
      if (existingIndex >= 0) {
        newItems = current.items.map((item, i) =>
          i === existingIndex
            ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.unit_price }
            : item
        )
      } else {
        const newItem: LineItem = {
          id: `local_${product.id}`,
          title: product.name,
          subtitle: product.subtitle,
          thumbnail: product.image,
          quantity,
          unit_price: product.price,
          total: product.price * quantity,
          variant: {
            id: `local_variant_${product.id}`,
            title: product.sizes?.[0] || 'Standard',
            product: {
              handle: product.id,
              thumbnail: product.image,
            },
          },
        }
        newItems = [...current.items, newItem]
      }

      const updated = recalcLocalCart({ ...current, items: newItems })
      saveLocalCart(updated)
      return updated
    })
    notifyCartAdd(product.name)
    setCartOpen(true)
  }, [])

  // --- MEDUSA CART METHODS ---

  const refreshCart = useCallback(async () => {
    if (!isMedusaConnected) return
    const id = localStorage.getItem(CART_KEY)
    if (!id) return
    try {
      const { cart: updated } = await sdk.store.cart.retrieve(id, {
        fields: CART_FIELDS,
      }) as any
      setCart(updated)
    } catch {}
  }, [isMedusaConnected])

  /**
   * Creates a brand-new Medusa cart and copies line items from the old
   * one. Used to recover from "Could not delete all payment sessions"
   * errors when the existing cart has stale / broken payment state.
   */
  const replaceWithFreshCart = useCallback(async (oldCart: any): Promise<any> => {
    console.info('[Cart] Replacing cart with fresh copy (stale payment recovery)...')
    const { cart: fresh } = await sdk.store.cart.create({
      region_id: oldCart.region_id,
    }) as any
    localStorage.setItem(CART_KEY, fresh.id)

    // Re-add each line item from the old cart
    for (const item of (oldCart.items || [])) {
      const vid = (item as any).variant_id || item.variant?.id
      if (vid) {
        try {
          await sdk.store.cart.createLineItem(fresh.id, {
            variant_id: vid,
            quantity: item.quantity,
          })
        } catch (e) {
          console.warn('[Cart] Could not re-add item during recovery:', item.title, e)
        }
      }
    }

    // Retrieve the fully populated new cart
    const { cart: populated } = await sdk.store.cart.retrieve(fresh.id, {
      fields: CART_FIELDS,
    }) as any
    setCart(populated)
    return populated
  }, [])

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    if (!isMedusaConnected) return
    let currentCart = cart
    if (!currentCart || currentCart.id === 'local') {
      currentCart = await getOrCreateCart()
    }
    if (!currentCart || currentCart.id === 'local') return
    try {
      const { cart: updated } = await sdk.store.cart.createLineItem(currentCart.id, {
        variant_id: variantId,
        quantity,
      }) as any
      setCart(updated)
      // Find the newly added item to show its name in toast
      const addedItem = updated.items?.find((item: any) => item.variant?.id === variantId)
      notifyCartAdd(addedItem?.title || 'Artikel')
      setCartOpen(true)
    } catch (err: any) {
      console.error('Failed to add item:', err)
      // Recovery: stale payment sessions lock the cart — replace with a fresh cart and retry
      if (isStalePaymentError(err)) {
        try {
          const freshCart = await replaceWithFreshCart(currentCart)
          const { cart: updated } = await sdk.store.cart.createLineItem(freshCart.id, {
            variant_id: variantId,
            quantity,
          }) as any
          setCart(updated)
          const addedItem = updated.items?.find((item: any) => item.variant?.id === variantId)
          notifyCartAdd(addedItem?.title || 'Artikel')
          setCartOpen(true)
        } catch (retryErr) {
          console.error('Failed to add item after cart recovery:', retryErr)
        }
      }
    }
  }, [cart, isMedusaConnected, getOrCreateCart, replaceWithFreshCart])

  const updateItem = useCallback(async (lineItemId: string, quantity: number) => {
    // Handle local cart
    if (!isMedusaConnected || cart?.id === 'local') {
      setCart(prev => {
        if (!prev) return prev
        const newItems = prev.items.map(item =>
          item.id === lineItemId
            ? { ...item, quantity, total: item.unit_price * quantity }
            : item
        )
        const updated = recalcLocalCart({ ...prev, items: newItems })
        saveLocalCart(updated)
        return updated
      })
      return
    }
    if (!cart) return
    try {
      const { cart: updated } = await sdk.store.cart.updateLineItem(cart.id, lineItemId, {
        quantity,
      }) as any
      setCart(updated)
    } catch (err: any) {
      console.error('Failed to update item:', err)
      // Recovery: stale payment sessions lock the cart — replace with fresh cart with updated quantity
      if (isStalePaymentError(err)) {
        try {
          console.info('[Cart] Recovering from stale payment to update item...')
          const { cart: fresh } = await sdk.store.cart.create({
            region_id: (cart as any).region_id,
          }) as any
          localStorage.setItem(CART_KEY, fresh.id)

          for (const item of (cart.items || [])) {
            const vid = (item as any).variant_id || item.variant?.id
            if (!vid) continue
            const qty = item.id === lineItemId ? quantity : item.quantity
            try {
              await sdk.store.cart.createLineItem(fresh.id, {
                variant_id: vid,
                quantity: qty,
              })
            } catch (e) {
              console.warn('[Cart] Could not re-add item during recovery:', item.title, e)
            }
          }

          const { cart: populated } = await sdk.store.cart.retrieve(fresh.id, {
            fields: CART_FIELDS,
          }) as any
          setCart(populated)
        } catch (retryErr) {
          console.error('Failed to update item after cart recovery:', retryErr)
        }
      }
    }
  }, [cart, isMedusaConnected])

  const removeItem = useCallback(async (lineItemId: string) => {
    // Handle local cart
    if (!isMedusaConnected || cart?.id === 'local') {
      const removedItem = cart?.items.find(item => item.id === lineItemId)
      setCart(prev => {
        if (!prev) return prev
        const newItems = prev.items.filter(item => item.id !== lineItemId)
        const updated = recalcLocalCart({ ...prev, items: newItems })
        saveLocalCart(updated)
        return updated
      })
      notifyCartRemove(removedItem?.title || 'Artikel')
      return
    }
    if (!cart) return
    const removedItem = cart.items.find(item => item.id === lineItemId)
    try {
      await sdk.store.cart.deleteLineItem(cart.id, lineItemId)
      // Refresh cart with expanded fields – deleteLineItem does NOT return { cart }
      const { cart: updated } = await sdk.store.cart.retrieve(cart.id, {
        fields: CART_FIELDS,
      }) as any
      setCart(updated)
      notifyCartRemove(removedItem?.title || 'Artikel')
    } catch (err: any) {
      console.error('Failed to remove item:', err)
      // Recovery: stale payment sessions lock the cart — replace with fresh cart minus this item
      if (isStalePaymentError(err)) {
        try {
          // Create fresh cart, re-add all items EXCEPT the one being removed
          console.info('[Cart] Recovering from stale payment to remove item...')
          const { cart: fresh } = await sdk.store.cart.create({
            region_id: (cart as any).region_id,
          }) as any
          localStorage.setItem(CART_KEY, fresh.id)

          for (const item of (cart.items || [])) {
            if (item.id === lineItemId) continue // Skip the item being removed
            const vid = (item as any).variant_id || item.variant?.id
            if (vid) {
              try {
                await sdk.store.cart.createLineItem(fresh.id, {
                  variant_id: vid,
                  quantity: item.quantity,
                })
              } catch (e) {
                console.warn('[Cart] Could not re-add item during recovery:', item.title, e)
              }
            }
          }

          const { cart: populated } = await sdk.store.cart.retrieve(fresh.id, {
            fields: CART_FIELDS,
          }) as any
          setCart(populated)
          notifyCartRemove(removedItem?.title || 'Artikel')
        } catch (retryErr) {
          console.error('Failed to remove item after cart recovery:', retryErr)
        }
      }
    }
  }, [cart, isMedusaConnected])

  const updateCart = useCallback(async (data: any) => {
    if (!cart) return
    // If all items are local, update the local cart state directly
    const allItemsLocal = cart.items.length > 0 && cart.items.every(item => item.id.startsWith('local_'))
    if (!isMedusaConnected || cart.id === 'local' || allItemsLocal) {
      setCart(prev => {
        if (!prev) return prev
        const updated = { ...prev, ...data }
        saveLocalCart(updated)
        return updated
      })
      return
    }
    try {
      const { cart: updated } = await sdk.store.cart.update(cart.id, data) as any
      setCart(updated)
    } catch (err) {
      console.error('Failed to update cart:', err)
    }
  }, [cart, isMedusaConnected])

  const setCartEmail = useCallback(async (email: string) => {
    await updateCart({ email })
  }, [updateCart])

  const setShippingAddress = useCallback(async (address: any) => {
    await updateCart({ shipping_address: address, billing_address: address })
  }, [updateCart])

  // --- SHIPPING OPTIONS (fetch real options from Medusa) ---

  const listShippingOptions = useCallback(async (): Promise<ShippingOption[]> => {
    const allItemsLocal = cart?.items?.length ? cart.items.every(item => item.id.startsWith('local_')) : false
    if (!cart || !isMedusaConnected || cart.id === 'local' || allItemsLocal) {
      // Return hardcoded fallback shipping options for local cart
      return [
        { id: 'local_standard', name: 'Swiss Post Standard (3-5 Werktage)', amount: 7.90 },
        { id: 'local_express', name: 'Swiss Post Express (1-2 Werktage)', amount: 14.90 },
      ]
    }
    try {
      const result = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id }) as any
      const options: ShippingOption[] = (result.shipping_options || []).map((opt: any) => ({
        id: opt.id,
        name: opt.name,
        amount: opt.calculated_price?.calculated_amount ?? opt.amount ?? 0,
        is_tax_inclusive: opt.is_tax_inclusive,
        calculated_price: opt.calculated_price,
      }))
      return options
    } catch (err) {
      console.error('Failed to fetch shipping options:', err)
      return [
        { id: 'local_standard', name: 'Swiss Post Standard (3-5 Werktage)', amount: 7.90 },
        { id: 'local_express', name: 'Swiss Post Express (1-2 Werktage)', amount: 14.90 },
      ]
    }
  }, [cart, isMedusaConnected])

  const addShippingMethod = useCallback(async (optionId: string) => {
    if (!cart) return
    // If all items are local, handle shipping locally
    const allItemsLocal = cart.items.length > 0 && cart.items.every(item => item.id.startsWith('local_'))
    if (!isMedusaConnected || cart.id === 'local' || allItemsLocal) {
      // Update shipping_total based on local option selection
      // Free shipping threshold: default 69 CHF (configurable via store settings)
      const FREE_SHIPPING_THRESHOLD = 69
      const isStandard = optionId !== 'local_express'
      const subtotal = cart.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
      const baseAmount = optionId === 'local_express' ? 14.90 : 7.90
      const shippingAmount = (isStandard && subtotal >= FREE_SHIPPING_THRESHOLD) ? 0 : baseAmount
      setCart(prev => {
        if (!prev) return prev
        const updated = recalcLocalCart({
          ...prev,
          shipping_total: shippingAmount,
          shipping_methods: [{ id: optionId, name: optionId === 'local_express' ? 'Express' : 'Standard', amount: shippingAmount }],
        })
        saveLocalCart(updated)
        return updated
      })
      return
    }
    try {
      const { cart: updated } = await sdk.store.cart.addShippingMethod(cart.id, {
        option_id: optionId,
      }) as any
      setCart(updated)
    } catch (err) {
      console.error('Failed to add shipping method:', err)
    }
  }, [cart, isMedusaConnected])

  // --- PROMO CODES ---

  const applyPromoCode = useCallback(async (code: string): Promise<{ success: boolean; error?: string }> => {
    if (!cart || !isMedusaConnected || cart.id === 'local') {
      return { success: false, error: 'Gutscheincode kann nur mit aktivem Backend eingelöst werden.' }
    }
    try {
      const res = await fetch(`/store/carts/${cart.id}/promotions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer ${localStorage.getItem('fauna_auth_token') || ''}`,
        },
        body: JSON.stringify({ promo_codes: [code] }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        return { success: false, error: data?.message || 'Ungültiger Gutscheincode.' }
      }
      const data = await res.json()
      if (data.cart) {
        setCart(data.cart)
      } else {
        await refreshCart()
      }
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Gutscheincode konnte nicht angewendet werden.' }
    }
  }, [cart, isMedusaConnected, refreshCart])

  const removePromoCode = useCallback(async (code: string) => {
    if (!cart || !isMedusaConnected || cart.id === 'local') return
    try {
      const res = await fetch(`/store/carts/${cart.id}/promotions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '',
          'Authorization': `Bearer ${localStorage.getItem('fauna_auth_token') || ''}`,
        },
        body: JSON.stringify({ promo_codes: [code] }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.cart) {
          setCart(data.cart)
        } else {
          await refreshCart()
        }
      }
    } catch {
      await refreshCart()
    }
  }, [cart, isMedusaConnected, refreshCart])

  // --- PAYMENT SESSION (required before cart.complete in Medusa v2) ---

  const initializePaymentSession = useCallback(async (providerId?: string): Promise<string | null> => {
    if (!cart) throw new Error('Kein Warenkorb vorhanden.')

    // Block payment init when Medusa is not the source of truth
    const allItemsLocal = cart.items.length > 0 && cart.items.every(item => item.id.startsWith('local_'))
    if (!isMedusaConnected || cart.id === 'local' || allItemsLocal) {
      throw new Error(
        'Zahlung kann nicht vorbereitet werden – keine Verbindung zum Backend.'
      )
    }

    // Determine which payment provider to use
    const provider = providerId || (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'pp_stripe_stripe' : 'pp_system_default')

    /** Helper: extract a client_secret from a cart's payment collection */
    const extractClientSecret = (c: any): string | null => {
      const sessions = c?.payment_collection?.payment_sessions || []
      const session = sessions.find((s: any) => s.provider_id === provider) || sessions[0]
      return session?.data?.client_secret || null
    }

    try {
      // Refresh the cart so we have the latest state (including payment_collection if any)
      const { cart: freshCart } = await sdk.store.cart.retrieve(cart.id, {
        fields: CART_FIELDS,
      }) as any
      setCart(freshCart)

      // Medusa JS SDK's initiatePaymentSession accepts a **cart object**
      // (with { id, payment_collection? }). It will automatically create
      // the payment collection if one doesn't exist yet, then initialize
      // a payment session for the chosen provider.
      let sessionResult: any
      try {
        sessionResult = await sdk.store.payment.initiatePaymentSession(freshCart, {
          provider_id: provider,
        })
      } catch (initErr: any) {
        const errMsg = initErr?.message || initErr?.toString() || ''

        // "Could not delete all payment sessions" happens when the cart
        // already has a payment session from a previous attempt (e.g. a
        // redirect-based method like TWINT/Klarna that was cancelled or
        // failed). In this case, check if the existing session already
        // has a valid client_secret we can reuse.
        if (errMsg.includes('delete all payment sessions') || errMsg.includes('payment_sessions')) {
          console.warn('Could not reinitialize payment session, checking for existing session...')
          const existingSecret = extractClientSecret(freshCart)
          if (existingSecret) {
            console.info('Reusing existing payment session client_secret')
            return existingSecret
          }

          // Existing sessions are broken — create a brand-new cart with
          // the same items, address, shipping, and email so the user can
          // retry with a clean payment collection.
          console.info('Creating fresh cart to recover from stale payment sessions...')
          const { cart: newCart } = await sdk.store.cart.create({
            region_id: freshCart.region_id,
          }) as any
          localStorage.setItem(CART_KEY, newCart.id)

          // Copy email
          if (freshCart.email) {
            await sdk.store.cart.update(newCart.id, { email: freshCart.email })
          }

          // Copy shipping + billing address
          const updates: any = {}
          if (freshCart.shipping_address) updates.shipping_address = freshCart.shipping_address
          if (freshCart.billing_address) updates.billing_address = freshCart.billing_address
          if (Object.keys(updates).length) {
            await sdk.store.cart.update(newCart.id, updates)
          }

          // Re-add line items
          for (const item of (freshCart.items || [])) {
            if (item.variant_id || item.variant?.id) {
              await sdk.store.cart.createLineItem(newCart.id, {
                variant_id: item.variant_id || item.variant?.id,
                quantity: item.quantity,
              })
            }
          }

          // Re-add shipping method
          const shippingMethods = freshCart.shipping_methods || []
          if (shippingMethods.length > 0) {
            const shippingOptionId = shippingMethods[0].shipping_option_id
            if (shippingOptionId) {
              await sdk.store.cart.addShippingMethod(newCart.id, {
                option_id: shippingOptionId,
              })
            }
          }

          // Retrieve fully populated new cart
          const { cart: populatedNew } = await sdk.store.cart.retrieve(newCart.id, {
            fields: CART_FIELDS,
          }) as any
          setCart(populatedNew)

          // Initialize payment on the fresh cart
          sessionResult = await sdk.store.payment.initiatePaymentSession(populatedNew, {
            provider_id: provider,
          })

          // Retrieve final state
          const { cart: finalCart } = await sdk.store.cart.retrieve(newCart.id, {
            fields: CART_FIELDS,
          }) as any
          setCart(finalCart)

          const newSecret = extractClientSecret(finalCart)
              || (sessionResult as any)?.payment_session?.data?.client_secret
              || null
          return newSecret
        }

        // Some other error — rethrow
        throw initErr
      }

      // Refresh cart again to get updated payment state
      const { cart: updatedCart } = await sdk.store.cart.retrieve(cart.id, {
        fields: CART_FIELDS,
      }) as any
      setCart(updatedCart)

      // Extract client_secret for Stripe
      const clientSecret = extractClientSecret(updatedCart)
          || (sessionResult as any)?.payment_session?.data?.client_secret
          || null

      return clientSecret
    } catch (err) {
      console.error('Failed to initialize payment session:', err)
      throw err
    }
  }, [cart, isMedusaConnected])

  // --- COMPLETE CART ---

  const completeCart = useCallback(async () => {
    if (!cart) throw new Error('Kein Warenkorb vorhanden.')

    // Block checkout when Medusa is not the source of truth
    const allItemsLocal = cart.items.length > 0 && cart.items.every(item => item.id.startsWith('local_'))

    if (!isMedusaConnected || cart.id === 'local' || allItemsLocal) {
      throw new Error(
        'Bestellung kann nicht abgeschlossen werden – keine Verbindung zum Backend. ' +
        'Bitte stelle sicher, dass das Medusa-Backend erreichbar ist und versuche es erneut.'
      )
    }

    try {
      const result = await sdk.store.cart.complete(cart.id) as any

      // Medusa v2: type === "cart" means completion failed
      if (result?.type === 'cart') {
        const errorMsg = result?.error || 'Die Bestellung konnte nicht abgeschlossen werden. Bitte prüfe deine Angaben.'
        throw new Error(errorMsg)
      }

      // Success: type === "order"
      if (result?.type === 'order' && result?.order) {
        localStorage.removeItem(CART_KEY)
        localStorage.removeItem(LOCAL_CART_KEY)
        setCart(null)
        return result
      }

      // Unexpected shape – treat as success if order data exists
      if (result?.order) {
        localStorage.removeItem(CART_KEY)
        localStorage.removeItem(LOCAL_CART_KEY)
        setCart(null)
        return { type: 'order', order: result.order }
      }

      throw new Error('Unerwartete Antwort vom Server beim Abschliessen der Bestellung.')
    } catch (err) {
      console.error('Failed to complete cart:', err)
      throw err
    }
  }, [cart, isMedusaConnected])

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <CartContext.Provider value={{
      cart, loading, itemCount, isCartOpen, isMedusaConnected, setCartOpen,
      addItem, addLocalItem, updateItem, removeItem, refreshCart, updateCart,
      addShippingMethod, listShippingOptions, initializePaymentSession,
      completeCart, setCartEmail, setShippingAddress,
      applyPromoCode, removePromoCode,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
