import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    // Use empty backendUrl so the admin UI makes relative API calls (same origin).
    // This way, when accessed through an external proxy (e.g. testapi.bbnx.eu),
    // API calls go through the proxy instead of trying to reach localhost directly.
    backendUrl: process.env.MEDUSA_ADMIN_BACKEND_URL || "",
    vite: () => ({
      server: {
        allowedHosts: ['.bbnx.eu'],
      },
      css: {
        // Inject Fauna Athletics branding CSS into the admin UI
        preprocessorOptions: {},
      },
    }),
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              // Store uploads in the static/ directory (default)
              upload_dir: "static",
              // Use the machine's network IP so image URLs work from any device.
              // The frontend normalizeImageUrl strips the host prefix for relative paths.
              backend_url: `${process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'}/static`,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY || "",
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
              // Enable automatic_payment_methods so Stripe's Payment Element
              // automatically shows all payment methods enabled in the Stripe
              // Dashboard: Cards, TWINT, Klarna, Apple Pay, Google Pay, SEPA, etc.
              automatic_payment_methods: true,
              // Capture payments immediately (no manual capture needed)
              capture: true,
            },
          },
        ],
      },
    },
  ],
})
