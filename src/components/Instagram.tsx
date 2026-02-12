import { motion } from 'framer-motion'
import { useInView } from './useInView'
import { Instagram as IgIcon } from 'lucide-react'

const igImages = [
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&q=80&auto=format',
  'https://images.unsplash.com/photo-1517438322307-e67111335449?w=400&q=80&auto=format',
  'https://images.unsplash.com/photo-1509255502683-2c2bffc4b231?w=400&q=80&auto=format',
  'https://images.unsplash.com/photo-1583473848882-f9a5a4c8e532?w=400&q=80&auto=format',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80&auto=format',
  'https://images.unsplash.com/photo-1615117950532-b25ec586f594?w=400&q=80&auto=format',
]

export default function Instagram() {
  const { ref, inView } = useInView(0.1)

  return (
    <section id="community" ref={ref} className="relative pt-20 pb-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 px-6"
      >
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-fauna-muted hover:text-fauna-accent transition-colors group">
          <IgIcon size={18} />
          <span className="text-[12px] uppercase tracking-[0.3em]">Folge @fauna.athletics auf Instagram</span>
        </a>
      </motion.div>

      <div className="grid grid-cols-3 md:grid-cols-6">
        {igImages.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.05 * i }}
            className="group relative aspect-square overflow-hidden cursor-pointer"
          >
            <img src={img} alt={`Instagram post ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-fauna-accent/0 group-hover:bg-fauna-accent/30 flex items-center justify-center transition-all duration-500">
              <IgIcon size={28} className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-400" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
