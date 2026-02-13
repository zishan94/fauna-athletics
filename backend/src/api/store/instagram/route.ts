import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /store/instagram
 * Fetches the latest Instagram posts via the Instagram Graph API.
 * Keeps an in-memory cache so we don't hammer the API on every page load.
 *
 * Requires INSTAGRAM_ACCESS_TOKEN in the backend .env
 * (long-lived token from Instagram Basic Display / Graph API).
 */

interface InstagramPost {
  id: string
  caption?: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  media_url: string
  thumbnail_url?: string
  permalink: string
  timestamp: string
}

interface CachedData {
  posts: InstagramPost[]
  fetchedAt: number
}

// ── In-memory cache (15 min TTL) ──
const CACHE_TTL_MS = 15 * 60 * 1000
let cache: CachedData | null = null

async function fetchInstagramPosts(
  token: string,
  limit: number = 12
): Promise<InstagramPost[]> {
  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
  const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${token}`

  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Instagram API ${res.status}: ${body}`)
  }

  const json = await res.json()
  return (json.data ?? []) as InstagramPost[]
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN
    if (!token) {
      return res.status(200).json({ posts: [], error: "INSTAGRAM_ACCESS_TOKEN not configured" })
    }

    const now = Date.now()

    // Serve from cache when fresh
    if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
      return res.json({ posts: cache.posts })
    }

    // Fetch fresh data
    const posts = await fetchInstagramPosts(token, 12)

    // Only keep IMAGE and CAROUSEL_ALBUM for the grid (videos don't show as thumbnails)
    const imagePosts = posts.filter(
      (p) => p.media_type === "IMAGE" || p.media_type === "CAROUSEL_ALBUM"
    )

    cache = { posts: imagePosts, fetchedAt: now }
    return res.json({ posts: imagePosts })
  } catch (err: any) {
    console.error("Instagram feed error:", err?.message || err)

    // Return stale cache if available, otherwise empty
    if (cache) {
      return res.json({ posts: cache.posts, stale: true })
    }
    return res.status(200).json({ posts: [] })
  }
}
