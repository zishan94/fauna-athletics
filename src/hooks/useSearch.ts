import { useState, useCallback, useRef } from 'react'
import { sdk } from '../lib/sdk'
import { products as staticProducts, type Product } from '../data/products'
import { adaptMedusaProduct, PRODUCT_FIELDS } from './useProducts'
import { useRegion } from '../context/RegionContext'

export function useSearch() {
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const { region } = useRegion()

  const search = useCallback((q: string) => {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!q.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(() => {
      const params: any = { q, limit: 12, fields: PRODUCT_FIELDS }
      // Pass region_id so calculated_price is returned correctly
      if (region?.id && region.id !== 'reg_fallback') {
        params.region_id = region.id
      }
      sdk.store.product.list(params)
        .then((res: any) => {
          setResults((res.products || []).map(adaptMedusaProduct))
        })
        .catch(() => {
          const lower = q.toLowerCase()
          const filtered = staticProducts.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.description.toLowerCase().includes(lower) ||
            p.subtitle.toLowerCase().includes(lower)
          )
          setResults(filtered)
        })
        .finally(() => setLoading(false))
    }, 300)
  }, [region?.id])

  const clear = useCallback(() => {
    setQuery('')
    setResults([])
    setLoading(false)
  }, [])

  return { results, loading, query, search, clear }
}
