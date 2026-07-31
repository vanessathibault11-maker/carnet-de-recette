// -----------------------------------------------------------------------------
// Le « moule » d'une recette et d'un article de blogue.
// Chaque .md est validé à la construction : un fichier mal formé fait échouer
// le build avec un message clair (garde-fou : ne jamais faire confiance à
// une entrée). Le contenu vit dans src/content/, séparé du design.
// -----------------------------------------------------------------------------

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const recettes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recettes' }),
  schema: z.object({
    titre: z.string(),
    // Doit correspondre à un libellé de src/lib/categories.ts
    categorie: z.enum(['Poulet', 'Poisson', 'Végé', 'Dessert', 'Soupers 30 min']),
    temps_total: z.number().int().positive(), // minutes — critère nº1
    temps_prep: z.number().int().nonnegative(),
    temps_cuisson: z.number().int().nonnegative(),
    portions: z.number().int().positive(),
    cout_par_portion: z.number().nonnegative(), // affiché « approximatif »
    aime_des_enfants: z.boolean(),
    se_congele: z.boolean(),
    tags: z.array(z.string()).default([]),
    // Id d'illustration de la banque (repli) ; défaut = illustration de la catégorie.
    illustration: z.string().optional(),
    // Chemin/nom d'un SVG autonome dans src/visuels/ (ex. "mon-plat" ou
    // "mon-plat.svg"). Optionnel : par défaut, le site cherche déjà
    // src/visuels/<slug>.svg (slug = nom du fichier .md). À NE remplir que pour
    // pointer vers un fichier au nom différent du slug.
    visuel: z.string().optional(),
    macros: z.object({
      calories: z.number().nonnegative(),
      proteines: z.number().nonnegative(),
      glucides: z.number().nonnegative(),
      lipides: z.number().nonnegative(),
    }),
    date_publication: z.coerce.date(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    titre: z.string(),
    description: z.string(),
    auteur: z.string().default('Le carnet de recettes'),
    date_publication: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { recettes, blog };
