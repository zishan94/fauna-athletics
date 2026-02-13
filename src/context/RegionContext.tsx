import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { sdk } from '../lib/sdk'

interface Region {
  id: string
  name: string
  currency_code: string
  countries?: { iso_2: string; display_name: string }[]
  tax_rate?: number
}

interface RegionContextType {
  region: Region | null
  regions: Region[]
  loading: boolean
  setRegion: (region: Region) => void
  formatPrice: (amount: number) => string
}

const RegionContext = createContext<RegionContextType>({
  region: null,
  regions: [],
  loading: true,
  setRegion: () => {},
  formatPrice: (amount) => `CHF ${amount.toFixed(2)}`,
})

const FALLBACK_REGION: Region = {
  id: 'reg_fallback',
  name: 'Schweiz',
  currency_code: 'chf',
  tax_rate: 8.1,
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<Region | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.store.region.list()
      .then(({ regions: fetchedRegions }: any) => {
        setRegions(fetchedRegions || [])
        const saved = localStorage.getItem('fauna_region_id')
        const found = saved
          ? fetchedRegions.find((r: Region) => r.id === saved)
          : fetchedRegions.find((r: Region) => r.currency_code === 'chf') || fetchedRegions[0]
        if (found) setRegionState(found)
        else setRegionState(FALLBACK_REGION)
      })
      .catch(() => {
        setRegionState(FALLBACK_REGION)
      })
      .finally(() => setLoading(false))
  }, [])

  const setRegion = (r: Region) => {
    setRegionState(r)
    localStorage.setItem('fauna_region_id', r.id)
  }

  const formatPrice = (amount: number) => {
    const code = region?.currency_code?.toUpperCase() || 'CHF'
    return `${code} ${amount.toFixed(2)}`
  }

  return (
    <RegionContext.Provider value={{ region, regions, loading, setRegion, formatPrice }}>
      {children}
    </RegionContext.Provider>
  )
}

export const useRegion = () => useContext(RegionContext)
