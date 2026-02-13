import { useState, useEffect } from 'react'
import { sdk } from '../lib/sdk'
import { products as staticProducts, type Product } from '../data/products'
import { adaptMedusaProduct, PRODUCT_FIELDS } from './useProducts'
import { useRegion } from '../context/RegionContext'

export function useProduct(idOrHandle: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { region } = useRegion()

  useEffect(() => {
    if (!idOrHandle) {
      setProduct(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const queryParams: any = {
      fields: PRODUCT_FIELDS,
    }
    if (region?.id && region.id !== 'reg_fallback') {
      queryParams.region_id = region.id
    }

    // Medusa v2: retrieve() expects a product ID (prod_xxx), not a handle.
    // Our routes use handles (e.g. /product/boxhandschuhe), so we must use
    // list({ handle }) and take the first result.
    const isMedusaId = idOrHandle.startsWith('prod_')

    const fetchProduct = isMedusaId
      ? sdk.store.product.retrieve(idOrHandle, queryParams)
          .then((res: any) => {
            if (res.product) return adaptMedusaProduct(res.product)
            throw new Error('Not found')
          })
      : sdk.store.product.list({ ...queryParams, handle: idOrHandle, limit: 1 })
          .then((res: any) => {
            const products = res.products || []
            if (products.length > 0) return adaptMedusaProduct(products[0])
            throw new Error('Not found')
          })

    fetchProduct
      .then((adapted) => setProduct(adapted))
      .catch(() => {
        // Fallback to static product data
        const found = staticProducts.find(p => p.id === idOrHandle)
        setProduct(found || null)
      })
      .finally(() => setLoading(false))
  }, [idOrHandle, region?.id])

  return { product, loading }
}
