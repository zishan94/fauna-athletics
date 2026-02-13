import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { notifyWishlistAdd, notifyWishlistRemove } from '../lib/notifications'

interface WishlistContextType {
  wishlist: string[]
  loading: boolean
  toggleWishlist: (productId: string, productName?: string) => void
  isInWishlist: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  loading: false,
  toggleWishlist: () => {},
  isInWishlist: () => false,
})

const LOCAL_KEY = 'fauna_wishlist'

function loadLocalWishlist(): string[] {
  try {
    const saved = localStorage.getItem(LOCAL_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveLocalWishlist(ids: string[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids))
  } catch {}
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [wishlist, setWishlist] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load wishlist on mount / auth change
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true)
      fetch('/store/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fauna_auth_token') || ''}`,
          'x-publishable-api-key': import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '',
        },
      })
        .then(r => r.json())
        .then(data => {
          const backendList: string[] = data.wishlist || []
          // Merge any local wishlist items into backend
          const localList = loadLocalWishlist()
          if (localList.length > 0) {
            const toMerge = localList.filter(id => !backendList.includes(id))
            if (toMerge.length > 0) {
              // Add local items to backend
              Promise.all(
                toMerge.map(id =>
                  fetch('/store/wishlist', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('fauna_auth_token') || ''}`,
                      'x-publishable-api-key': import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '',
                    },
                    body: JSON.stringify({ product_id: id }),
                  })
                )
              ).then(() => {
                const merged = [...new Set([...backendList, ...localList])]
                setWishlist(merged)
                localStorage.removeItem(LOCAL_KEY) // Clear local after merge
              })
            } else {
              setWishlist(backendList)
              localStorage.removeItem(LOCAL_KEY)
            }
          } else {
            setWishlist(backendList)
          }
        })
        .catch(() => {
          // Fallback to local
          setWishlist(loadLocalWishlist())
        })
        .finally(() => setLoading(false))
    } else {
      setWishlist(loadLocalWishlist())
    }
  }, [isAuthenticated])

  const toggleWishlist = useCallback((productId: string, productName?: string) => {
    const isIn = wishlist.includes(productId)

    if (isAuthenticated) {
      if (isIn) {
        // Remove from backend
        setWishlist(prev => prev.filter(id => id !== productId))
        notifyWishlistRemove(productName)
        fetch(`/store/wishlist/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fauna_auth_token') || ''}`,
            'x-publishable-api-key': import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '',
          },
        }).catch(() => {
          // Revert on error
          setWishlist(prev => [...prev, productId])
        })
      } else {
        // Add to backend
        setWishlist(prev => [...prev, productId])
        notifyWishlistAdd(productName)
        fetch('/store/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('fauna_auth_token') || ''}`,
            'x-publishable-api-key': import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || '',
          },
          body: JSON.stringify({ product_id: productId }),
        }).catch(() => {
          // Revert on error
          setWishlist(prev => prev.filter(id => id !== productId))
        })
      }
    } else {
      // Guest: localStorage only
      if (isIn) {
        const updated = wishlist.filter(id => id !== productId)
        setWishlist(updated)
        saveLocalWishlist(updated)
        notifyWishlistRemove(productName)
      } else {
        const updated = [...wishlist, productId]
        setWishlist(updated)
        saveLocalWishlist(updated)
        notifyWishlistAdd(productName)
      }
    }
  }, [wishlist, isAuthenticated])

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId)
  }, [wishlist])

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
