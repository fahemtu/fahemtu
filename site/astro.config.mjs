// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Mode hybride : output 'static' par défaut → toutes les pages restent
// prerendues (statiques, bon pour le SEO). Seules les routes qui déclarent
// `export const prerender = false` (ex. l'endpoint webhook Stripe) sont rendues
// à la demande, via l'adaptateur Vercel.
// `site` : URL canonique (sitemap, canonicals, Open Graph). Placeholder.
// https://astro.build/config
export default defineConfig({
  site: 'https://fahemtu.com',
  integrations: [sitemap()],
  adapter: vercel(),
});
