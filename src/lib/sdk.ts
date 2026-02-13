import Medusa from "@medusajs/js-sdk"

// In dev, use empty baseUrl so requests go through the Vite proxy (avoids CORS).
// In production, VITE_MEDUSA_BACKEND_URL must be set to the actual backend URL.
const BACKEND_URL = import.meta.env.DEV
  ? ""
  : (import.meta.env.VITE_MEDUSA_BACKEND_URL || "")

export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  debug: import.meta.env.DEV,
  publishableKey: import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY || undefined,
  auth: {
    type: "jwt",
    jwtTokenStorageKey: "fauna_auth_token",
    jwtTokenStorageMethod: "local",
  },
})

export const MEDUSA_BACKEND_URL = BACKEND_URL
