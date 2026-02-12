export interface Product {
  id: string
  name: string
  subtitle: string
  price: number
  originalPrice?: number
  tag?: string
  category: 'gloves' | 'shorts' | 'tops' | 'bundles'
  image: string
  images: string[]
  colors: string[]
  sizes: string[]
  features: string[]
  description: string
}

export const products: Product[] = [
  {
    id: 'boxhandschuhe',
    name: 'Fauna Pro Boxhandschuhe',
    subtitle: 'Echtes Leder · Multi-Layer Foam',
    price: 129,
    tag: 'BESTSELLER',
    category: 'gloves',
    image: 'https://fauna-athletics.ch/wp-content/uploads/2024/08/boxhanschuhe-fuer-anfaenger-und-sparring.png',
    images: [
      'https://fauna-athletics.ch/wp-content/uploads/2024/08/boxhanschuhe-fuer-anfaenger-und-sparring.png',
      'https://fauna-athletics.ch/wp-content/uploads/2024/08/N3-scaled-e1724327298628.jpg',
    ],
    colors: ['#1a1a1a', '#2d6a4f'],
    sizes: ['10oz', '12oz', '14oz', '16oz'],
    features: ['100% echtes Premium-Rindsleder', 'Multi-Layer Foam Polsterung', 'Atmungsaktives Innenfutter', 'Verstärkte Handgelenkstütze', 'Handgefertigt in Portugal'],
    description: 'Unsere Flaggschiff-Handschuhe aus 100% echtem Leder mit Multi-Layer-Schaumstoff für ultimativen Schutz. Entwickelt für Sparring und Wettkampf.',
  },
  {
    id: 'mma-handschuhe',
    name: 'Fauna MMA Handschuhe',
    subtitle: 'Premium Leder · Open Palm',
    price: 89,
    tag: 'NEU',
    category: 'gloves',
    image: 'https://fauna-athletics.ch/wp-content/uploads/2024/08/grappling-handschuhe-grau-fuer-maenner-seitenansicht-weit.png',
    images: [
      'https://fauna-athletics.ch/wp-content/uploads/2024/08/grappling-handschuhe-grau-fuer-maenner-seitenansicht-weit.png',
    ],
    colors: ['#555555', '#1a1a1a'],
    sizes: ['S', 'M', 'L', 'XL'],
    features: ['Open Palm Design', 'Premium Leder', 'Ergonomic Fit', 'Doppelte Naht'],
    description: 'Entwickelt für Grappling und MMA-Training. Open Palm Design für maximalen Grip bei kompromisslosem Schutz.',
  },
  {
    id: 'mma-shorts',
    name: 'Fauna Fight Shorts 2.0',
    subtitle: '2-teilig · 4-Way Stretch',
    price: 69,
    category: 'shorts',
    image: 'https://fauna-athletics.ch/wp-content/uploads/2024/08/MMA-Fightshorts-scaled.jpg',
    images: [
      'https://fauna-athletics.ch/wp-content/uploads/2024/08/MMA-Fightshorts-scaled.jpg',
    ],
    colors: ['#1a1a1a', '#2d3436'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    features: ['2-teiliges Design', '4-Way Stretch', 'Moisture Wicking', 'Flatlock-Nähte'],
    description: 'Unsere revolutionären 2-teiligen Fight Shorts mit 4-Way Stretch für maximale Bewegungsfreiheit im Ring und auf der Matte.',
  },
  {
    id: 'rashguard',
    name: 'Fauna Rashguard Pro',
    subtitle: 'Kompression · UV-Schutz',
    price: 59,
    category: 'tops',
    image: 'https://fauna-athletics.ch/wp-content/uploads/2024/07/grappling-kleidung-scaled.jpg',
    images: [
      'https://fauna-athletics.ch/wp-content/uploads/2024/07/grappling-kleidung-scaled.jpg',
    ],
    colors: ['#1a1a1a', '#2d6a4f'],
    sizes: ['S', 'M', 'L', 'XL'],
    features: ['UV-Schutz', 'Kompression', 'Quick-Dry', 'Flatlock-Nähte'],
    description: 'Kompressionsshirt mit UV-Schutz und Quick-Dry Technologie. Perfekt für BJJ, MMA und funktionelles Training.',
  },
  {
    id: 'raglan-tshirt',
    name: 'Fauna Raglan Tee',
    subtitle: 'Atmungsaktiv · Perfect Fit',
    price: 49,
    originalPrice: 59,
    category: 'tops',
    image: 'https://fauna-athletics.ch/wp-content/uploads/2024/08/MMA-Trainingstshirt-scaled.jpg',
    images: [
      'https://fauna-athletics.ch/wp-content/uploads/2024/08/MMA-Trainingstshirt-scaled.jpg',
    ],
    colors: ['#1a1a1a', '#2d3436', '#f0f0f0'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    features: ['Atmungsaktiv', 'Perfekte Passform', 'Soft Touch Material', 'Raglan-Schnitt'],
    description: 'Unser vielseitiges Raglan T-Shirt — perfekt für Training und Alltag. Atmungsaktives Material mit perfekter Passform.',
  },
  {
    id: 'training-bundle',
    name: 'Fauna Training Bundle',
    subtitle: 'Shorts + Rashguard Set',
    price: 109,
    originalPrice: 128,
    tag: 'SPARE 15%',
    category: 'bundles',
    image: 'https://fauna-athletics.ch/wp-content/uploads/2024/08/N3-scaled-e1724327298628.jpg',
    images: [
      'https://fauna-athletics.ch/wp-content/uploads/2024/08/N3-scaled-e1724327298628.jpg',
    ],
    colors: ['#1a1a1a'],
    sizes: ['S', 'M', 'L', 'XL'],
    features: ['Fight Shorts 2.0', 'Rashguard Pro', '15% günstiger als Einzelkauf'],
    description: 'Das perfekte Training-Set: Unsere Fight Shorts 2.0 kombiniert mit dem Rashguard Pro — zum Vorteilspreis.',
  },
]
