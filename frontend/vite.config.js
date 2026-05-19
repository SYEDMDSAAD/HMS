import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Pinned so this app is always the origin listed as FRONTEND_URL_ONE in
    // backend/config/config.env. Without strictPort, Vite silently moves to the
    // next free port and which app owns 5173 depends on start order.
    port: 5173,
    strictPort: true,
  },
})
