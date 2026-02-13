import { useState, useEffect } from 'react'

export interface InstagramPost {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

interface UseInstagramResult {
  posts: InstagramPost[]
  loading: boolean
  error: string | null
}

// Module-level cache so we only fetch once per session
let cachedPosts: InstagramPost[] | null = null

/**
 * Fetches real Instagram posts from the backend proxy endpoint.
 * The backend fetches from the Instagram Graph API and caches for 15 min.
 */
export function useInstagram(limit: number = 6): UseInstagramResult {
  const [posts, setPosts] = useState<InstagramPost[]>(cachedPosts ?? [])
  const [loading, setLoading] = useState(!cachedPosts)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cachedPosts) {
      setPosts(cachedPosts)
      setLoading(false)
      return
    }

    let cancelled = false

    const fetchPosts = async () => {
      try {
        const publishableKey = import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || ''
        const res = await fetch('/store/instagram', {
          headers: {
            'x-publishable-api-key': publishableKey,
          },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        const fetched: InstagramPost[] = data.posts ?? []

        if (!cancelled) {
          cachedPosts = fetched
          setPosts(fetched)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Instagram-Beiträge konnten nicht geladen werden.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPosts()
    return () => { cancelled = true }
  }, [])

  // Apply the limit at render time (cache stores all)
  return { posts: posts.slice(0, limit), loading, error }
}
