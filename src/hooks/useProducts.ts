import { useState, useEffect } from 'react'
import { sdk } from '../lib/sdk'
import { products as staticProducts, type Product } from '../data/products'
import { useRegion } from '../context/RegionContext'

/**
 * Shared fields string for product list and retrieve calls.
 * +variants.calculated_price  – pricing with region
 * +metadata                   – custom metadata (features, tag, etc.)
 * *categories                 – relation: product categories (needed for shop filters)
 * *options                    – relation: product options (size / color)
 * *options.values             – option values
 * *images                     – product images
 * *tags                       – product tags
 */
export const PRODUCT_FIELDS =
  '+variants.calculated_price,+metadata,*categories,*options,*options.values,*images,*tags'

/** Safely extract the string value from an option value entry (handles both string and { value } shapes). */
function extractOptionValue(v: any): string {
  if (typeof v === 'string') return v
  if (v && typeof v.value === 'string') return v.value
  return String(v ?? '')
}

/**
 * Normalise an image URL coming from the Medusa API.
 * - Strips any absolute http(s)://host:port prefix so the URL becomes origin-relative.
 * - Leaves /static/... and other relative paths as-is (handled by Vite proxy).
 */
function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return ''
  // Strip any absolute origin (localhost, network IPs, etc.) keeping only the path
  return url.replace(/^https?:\/\/[^/]+(\/|$)/, '/')
}

function adaptMedusaProduct(mp: any): Product {
  const variant = mp.variants?.[0]
  const calcPrice = variant?.calculated_price
  const price = calcPrice?.calculated_amount != null
    ? calcPrice.calculated_amount
    : variant?.prices?.[0]?.amount ?? 0
  const originalAmount = calcPrice?.original_amount
  const originalPrice = originalAmount && originalAmount !== price ? originalAmount : undefined

  const sizeOption = mp.options?.find((o: any) =>
    ['grösse', 'groesse', 'size', 'größe'].includes(o.title?.toLowerCase())
  )
  const colorOption = mp.options?.find((o: any) =>
    ['farbe', 'color', 'colour'].includes(o.title?.toLowerCase())
  )

  const tagValue = mp.tags?.[0]?.value || mp.metadata?.tag || undefined
  const categoryHandle = mp.categories?.[0]?.handle || 'all'

  const rawThumb = mp.thumbnail || mp.images?.[0]?.url || ''
  const rawImages = mp.images?.map((i: any) => i.url) || [mp.thumbnail].filter(Boolean)

  // Extract size guide from metadata if present
  const rawSizeGuide = mp.metadata?.size_guide
  const sizeGuide = rawSizeGuide && rawSizeGuide.columns && Array.isArray(rawSizeGuide.rows)
    ? { columns: rawSizeGuide.columns as string[], rows: rawSizeGuide.rows as string[][] }
    : undefined

  return {
    id: mp.handle || mp.id,
    name: mp.title || '',
    subtitle: mp.subtitle || '',
    price,
    originalPrice,
    tag: tagValue,
    category: categoryHandle as Product['category'],
    image: normalizeImageUrl(rawThumb),
    images: rawImages.map(normalizeImageUrl).filter(Boolean),
    colors: colorOption?.values?.map(extractOptionValue) || [],
    sizes: sizeOption?.values?.map(extractOptionValue) || [],
    features: (mp.metadata?.features as string[]) || [],
    description: mp.description || '',
    medusaId: mp.id,
    variants: mp.variants || [],
    sizeGuide,
  }
}

interface UseProductsParams {
  category_id?: string[]
  collection_id?: string[]
  limit?: number
  offset?: number
  order?: string
  q?: string
}

export function useProducts(params?: UseProductsParams) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const { region } = useRegion()

  useEffect(() => {
    // Wait for region to load before fetching — calculated_price requires region_id
    if (!region?.id || region.id === 'reg_fallback') {
      let filtered = [...staticProducts]
      if (params?.q) {
        const q = params.q.toLowerCase()
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        )
      }
      setProducts(filtered)
      setCount(filtered.length)
      setLoading(false)
      return
    }

    setLoading(true)
    const queryParams: any = {
      limit: params?.limit || 50,
      offset: params?.offset || 0,
      fields: PRODUCT_FIELDS,
      region_id: region.id,
    }
    if (params?.category_id?.length) queryParams.category_id = params.category_id
    if (params?.collection_id?.length) queryParams.collection_id = params.collection_id
    if (params?.order) queryParams.order = params.order
    if (params?.q) queryParams.q = params.q

    sdk.store.product.list(queryParams)
      .then((res: any) => {
        const adapted = (res.products || []).map(adaptMedusaProduct)
        setProducts(adapted)
        setCount(res.count || adapted.length)
      })
      .catch(() => {
        // Fallback to static data
        let filtered = [...staticProducts]
        if (params?.q) {
          const q = params.q.toLowerCase()
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
          )
        }
        setProducts(filtered)
        setCount(filtered.length)
      })
      .finally(() => setLoading(false))
  }, [
    region?.id,
    params?.category_id?.join(','),
    params?.collection_id?.join(','),
    params?.limit,
    params?.offset,
    params?.order,
    params?.q,
  ])

  return { products, loading, count }
}

export { adaptMedusaProduct }
