import { useState, useEffect } from 'react'
import { sdk } from '../lib/sdk'

interface Category {
  id: string
  name: string
  handle: string
  description?: string
  parent_category_id?: string | null
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat_gloves', name: 'Handschuhe', handle: 'gloves' },
  { id: 'cat_shorts', name: 'Shorts', handle: 'shorts' },
  { id: 'cat_tops', name: 'Tops', handle: 'tops' },
  { id: 'cat_bundles', name: 'Bundles', handle: 'bundles' },
]

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.store.productCategory.list({ limit: 50 })
      .then((res: any) => {
        const cats = res.product_categories || []
        setCategories(cats.length > 0 ? cats : FALLBACK_CATEGORIES)
      })
      .catch(() => {
        setCategories(FALLBACK_CATEGORIES)
      })
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading }
}
