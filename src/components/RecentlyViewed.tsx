import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRegion } from '../context/RegionContext'
import { useInView } from './useInView'

const STORAGE_KEY = 'fauna_recently_viewed'
const MAX_ITEMS = 8

interface RecentItem {
  id: string
  name: string
  image: string
  price: number
  subtitle?: string
}

export function addToRecentlyViewed(product: RecentItem) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    let items: RecentItem[] = saved ? JSON.parse(saved) : []
    // Remove duplicate
    items = items.filter(i => i.id !== product.id)
    // Prepend
    items.unshift(product)
    // Limit
    items = items.slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function getRecentlyViewed(excludeId?: string): RecentItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    let items: RecentItem[] = JSON.parse(saved)
    if (excludeId) items = items.filter(i => i.id !== excludeId)
    return items
  } catch {
    return []
  }
}

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [items, setItems] = useState<RecentItem[]>([])
  const { formatPrice } = useRegion()
  const { ref, inView } = useInView(0.1)

  useEffect(() => {
    setItems(getRecentlyViewed(excludeId))
  }, [excludeId])

  if (items.length === 0) return null

  return (
    <section ref={ref} className="mt-20 pt-12 border-t border-f-border/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h3 className="font-heading text-2xl md:text-3xl tracking-[0.02em] mb-8">ZULETZT ANGESEHEN</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex-shrink-0 w-40 sm:w-48 group"
            >
              <Link to={`/product/${item.id}`}>
                <div className="aspect-[3/4] overflow-hidden bg-f-gray mb-3 border border-transparent card-glow">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <p className="text-[13px] font-medium truncate group-hover:text-f-green-light transition-colors">{item.name}</p>
                <p className="text-f-muted text-[12px]">{formatPrice(item.price)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
