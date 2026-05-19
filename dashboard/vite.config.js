import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Pinned so this app is always the origin listed as FRONTEND_URL_TWO in
    // backend/config/config.env.
    port: 5174,
    strictPort: true,
  },
})
