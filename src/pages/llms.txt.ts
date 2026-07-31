// /llms.txt — plan en texte pour les assistants IA (spec llmstxt.org).
// Généré depuis le contenu : reste toujours à jour quand on ajoute une recette.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = (site ?? new URL('https://carnet-de-recettes.pages.dev')).origin;

  const recettes = (await getCollection('recettes')).sort(
    (a, b) => a.data.temps_total - b.data.temps_total
  );
  const articles = (await getCollection('blog')).sort(
    (a, b) => b.data.date_publication.valueOf() - a.data.date_publication.valueOf()
  );

  const ligneRecette = (r: (typeof recettes)[number]) =>
    `- [${r.data.titre}](${base}/recettes/${r.id}/) : ${r.data.categorie}, ` +
    `${r.data.temps_total} min, ${r.data.portions} portions` +
    `${r.data.aime_des_enfants ? ', aimé des enfants' : ''}` +
    `${r.data.se_congele ? ', se congèle' : ''}.`;

  const contenu = `# Le carnet de recettes

> Site de recettes pour familles occupées (français, Québec). Le menu de la
> semaine, sain et sans prise de tête : recettes rapides, budget maîtrisé,
> approuvées par les enfants. Chaque recette indique temps total, portions,
> coût par portion et si elle se congèle.

## Recettes
${recettes.map(ligneRecette).join('\n')}

## Blogue
${articles
  .map((a) => `- [${a.data.titre}](${base}/blog/${a.id}/) : ${a.data.description}`)
  .join('\n')}

## Pages clés
- [Accueil](${base}/)
- [Toutes les recettes](${base}/recettes/)
- [Blogue](${base}/blog/)
`;

  return new Response(contenu, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
