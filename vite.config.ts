import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    allowedHosts: ['.bbnx.eu'],
    proxy: {
      '/store': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      // Medusa Admin Dashboard UI — accessible at /app
      '/app': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        ws: true,
      },
      // Health-check – useful for debugging connectivity
      '/health': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
      // Serve backend static files (product images stored in Medusa)
      '/static': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
    },
  },
})
