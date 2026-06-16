import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // En dev, /api/* est proxifié vers le site Astro (port 4321) → l'app appelle
    // /api/asset-urls en chemin relatif, sans cross-origin. En prod, l'app et
    // l'API partagent l'origine (rien à proxifier).
    proxy: {
      '/api': {
        target: 'http://localhost:4321',
        changeOrigin: true,
      },
    },
  },
})
