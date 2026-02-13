import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { sdk } from '../lib/sdk'
import { useCart } from './CartContext'
import { notifyWelcome, notifyWelcomeNew, notifyGoodbye } from '../lib/notifications'

interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  created_at?: string
}

interface AuthContextType {
  customer: Customer | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshCustomer: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  customer: null,
  loading: true,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshCustomer: async () => {},
})

const CART_KEY = 'fauna_cart_id'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const { refreshCart } = useCart()

  const refreshCustomer = useCallback(async () => {
    try {
      const { customer: data } = await sdk.store.customer.retrieve() as any
      setCustomer(data)
    } catch {
      setCustomer(null)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('fauna_auth_token')
    if (token) {
      refreshCustomer().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [refreshCustomer])

  // Transfer guest cart to logged-in customer after authentication
  const transferGuestCart = useCallback(async () => {
    const cartId = localStorage.getItem(CART_KEY)
    if (!cartId) return

    try {
      // Associate the existing guest cart with the customer by updating it
      // Medusa v2 automatically links the cart to the authenticated customer
      // when you make an authenticated API call to update the cart
      await sdk.store.cart.update(cartId, {}) as any
      // Refresh the cart to get the updated state
      await refreshCart()
    } catch (err) {
      console.error('Cart transfer failed:', err)
      // Non-critical - cart can still be used, just not linked
    }
  }, [refreshCart])

  const login = useCallback(async (email: string, password: string) => {
    try {
      await sdk.auth.login('customer', 'emailpass', { email, password })
      await refreshCustomer()
      // Transfer any guest cart to the now-authenticated session
      await transferGuestCart()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Anmeldung fehlgeschlagen' }
    }
  }, [refreshCustomer, transferGuestCart])

  const register = useCallback(async (data: { email: string; password: string; first_name: string; last_name: string }) => {
    try {
      await sdk.auth.register('customer', 'emailpass', {
        email: data.email,
        password: data.password,
      })
      // After registration, log in
      await sdk.auth.login('customer', 'emailpass', {
        email: data.email,
        password: data.password,
      })
      // Medusa v2: after auth.register + auth.login only an auth identity
      // exists. We must call customer.create() to create the actual customer
      // record linked to that identity.
      try {
        await sdk.store.customer.create({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
        })
      } catch {
        // Customer may already exist (e.g. re-registration attempt)
      }
      await refreshCustomer()
      // Transfer any guest cart to the new customer
      await transferGuestCart()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registrierung fehlgeschlagen' }
    }
  }, [refreshCustomer, transferGuestCart])

  const logout = useCallback(async () => {
    const name = customer?.first_name || ''
    try {
      await sdk.auth.logout()
    } catch {
      // Clear local state regardless
    }
    localStorage.removeItem('fauna_auth_token')
    setCustomer(null)
    if (name) notifyGoodbye(name)
  }, [customer])

  return (
    <AuthContext.Provider value={{
      customer,
      loading,
      isAuthenticated: !!customer,
      login,
      register,
      logout,
      refreshCustomer,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
