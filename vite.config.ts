import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const root = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// Routage de prod : au BUILD, l'app est servie sous /app par le déploiement
// Astro (sortie déposée dans site/public/app). En DEV, rien ne change : base '/'
// et proxy /api → site (4321).
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // Base /app/ uniquement au build de prod ; '/' en dev (command === 'serve').
  base: command === 'build' ? '/app/' : '/',
  build: {
    // Sortie déposée dans le site Astro → servie en statique sous /app.
    outDir: 'site/public/app',
    emptyOutDir: true, // requis : le dossier est hors de la racine de l'app
    // Multi-page : entrée payante (index.html) + avant-goût gratuit (demo/),
    // bundles séparés. La démo n'importe aucun code payant.
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        demo: resolve(root, 'demo/index.html'),
      },
    },
  },
  server: {
    // En dev, /api/* est proxifié vers le site Astro (port 4321) → l'app appelle
    // /api/asset-urls sans cross-origin. En prod, l'app et l'API partagent
    // l'origine (rien à proxifier).
    proxy: {
      '/api': {
        target: 'http://localhost:4321',
        changeOrigin: true,
      },
    },
  },
}))
