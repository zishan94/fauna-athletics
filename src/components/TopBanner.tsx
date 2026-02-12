export default function TopBanner() {
  const items = ['KOSTENLOSER VERSAND AB CHF 69.-', '·', 'MADE IN PORTUGAL', '·', 'NACHHALTIG & FAIR', '·']
  return (
    <div className="bg-f-green overflow-hidden py-2 relative z-50">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items, ...items].map((item, i) => (
          <span key={i} className={`mx-3 text-[10px] font-medium uppercase tracking-[0.25em] ${
            item === '·' ? 'text-white/40' : 'text-white/90'
          }`}>{item}</span>
        ))}
      </div>
    </div>
  )
}
