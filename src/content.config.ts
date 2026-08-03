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
    categorie: z.enum([
      'Poulet',
      'Bœuf & porc',
      'Poisson',
      'Végé',
      'Déjeuners',
      'Collations',
      'Dessert',
    ]),
    temps_total: z.number().int().positive(), // minutes — critère nº1
    temps_prep: z.number().int().nonnegative(),
    temps_cuisson: z.number().int().nonnegative(),
    portions: z.number().int().positive(),
    cout_par_portion: z.number().nonnegative(), // affiché « approximatif »
    aime_des_enfants: z.boolean(),
    se_congele: z.boolean(),
    tags: z.array(z.string()).default([]),
    // Icône de la banque src/visuels/icones/ à afficher dans l'emblème.
    // Optionnel : par défaut, celle de la catégorie (`illustrationParDefaut`).
    illustration: z.string().optional(),
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
