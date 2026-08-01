// @ts-check
import { defineConfig } from 'astro/config';

// Site 100 % statique. Remplace `site` par ton domaine final une fois déployé
// sur Cloudflare Pages (utile pour les URL absolues du SEO et du JSON-LD).
export default defineConfig({
  site: 'https://carnet-de-recette.pages.dev',
  build: {
    format: 'directory',
  },
});
