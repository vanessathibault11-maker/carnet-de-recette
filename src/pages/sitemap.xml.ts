// /sitemap.xml — généré depuis le contenu (pages statiques + recettes + blog).
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { CATEGORIES } from '../lib/categories';

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://carnet-de-recettes.pages.dev')).origin;

  const recettes = await getCollection('recettes');
  const articles = await getCollection('blog');

  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${base}/` },
    { loc: `${base}/recettes/` },
    { loc: `${base}/blog/` },
    ...CATEGORIES.map((c) => ({ loc: `${base}/categories/${c.slug}/` })),
    ...recettes.map((r) => ({
      loc: `${base}/recettes/${r.id}/`,
      lastmod: r.data.date_publication.toISOString().slice(0, 10),
    })),
    ...articles.map((a) => ({
      loc: `${base}/blog/${a.id}/`,
      lastmod: a.data.date_publication.toISOString().slice(0, 10),
    })),
  ];

  const corps = urls
    .map(
      (u) =>
        `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${corps}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
