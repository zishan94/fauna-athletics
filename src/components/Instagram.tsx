import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { Instagram as IgIcon } from 'lucide-react'
import { useInstagram } from '../hooks/useInstagram'
import { useProducts } from '../hooks/useProducts'

export default function Instagram() {
  const { ref, inView } = useInView(0.1)
  const { posts, loading } = useInstagram(6)
  const { products } = useProducts({ limit: 6 })

  // Use real Instagram posts when available, otherwise fall back to product images
  const hasRealPosts = posts.length > 0

  const igImages = hasRealPosts
    ? posts.map(p => ({
        src: p.media_url,
        label: p.caption?.slice(0, 60) || '',
        href: p.permalink,
      }))
    : products.slice(0, 6).map(p => ({
        src: p.image,
        label: p.name,
        href: 'https://www.instagram.com/fauna_athletics/',
      }))

  if (igImages.length === 0 && !loading) return null

  return (
    <section id="community" ref={ref} className="relative pt-20 pb-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 px-6"
      >
        <a href="https://www.instagram.com/fauna_athletics/" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-fauna-muted hover:text-fauna-accent transition-colors group">
          <IgIcon size={18} />
          <span className="text-[12px] uppercase tracking-[0.3em]">Folge @fauna_athletics auf Instagram</span>
        </a>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-fauna-gray animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6">
          {igImages.map((img, i) => (
            <motion.a
              key={i}
              href={img.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              className="group relative aspect-square overflow-hidden cursor-pointer block"
            >
              <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-fauna-accent/0 group-hover:bg-fauna-accent/30 flex items-center justify-center transition-all duration-500">
                <IgIcon size={28} className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-400" />
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </section>
  )
}
