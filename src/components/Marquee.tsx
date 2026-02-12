export default function Marquee() {
  const items = ['ECHTES LEDER', 'NACHHALTIG', 'PREMIUM QUALITÄT', 'FAIR PRODUZIERT', 'PERFEKTE PASSFORM', 'MADE IN PORTUGAL']

  return (
    <section id="marquee" className="py-5 overflow-hidden border-y border-fauna-light/8 bg-fauna-dark">
      <div className="flex whitespace-nowrap animate-marquee-slow">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 flex items-center gap-8">
            <span className="font-heading text-lg tracking-[0.3em] text-fauna-muted/30">{item}</span>
            <span className="text-fauna-accent/30 text-xs">◆</span>
          </span>
        ))}
      </div>
    </section>
  )
}
