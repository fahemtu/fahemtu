// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// `site` : URL canonique du site marketing (nécessaire au sitemap, aux
// canonicals et aux balises Open Graph). Placeholder — à ajuster au déploiement.
// https://astro.build/config
export default defineConfig({
  site: 'https://fahemtu.com',
  integrations: [sitemap()],
});
