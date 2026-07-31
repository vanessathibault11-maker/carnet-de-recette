// -----------------------------------------------------------------------------
// Extraction du corps Markdown + génération du balisage Schema.org `Recipe`
// (JSON-LD) À PARTIR du frontmatter et du corps. Aucune saisie manuelle en
// double : la découvrabilité IA/SEO découle directement du contenu.
// -----------------------------------------------------------------------------

import { dureeISO } from './format';

export interface SectionsRecette {
  intro: string;
  ingredients: string[];
  etapes: string[];
  notes: string[];
}

/**
 * Découpe le corps Markdown en intro / Ingrédients / Préparation.
 * Tolérant : accepte les accents et une casse variable dans les titres `##`.
 */
export function extraireSections(corps: string): SectionsRecette {
  const lignes = corps.split(/\r?\n/);
  let section: 'intro' | 'ingredients' | 'etapes' | 'notes' | 'autre' = 'intro';
  const intro: string[] = [];
  const ingredients: string[] = [];
  const etapes: string[] = [];
  const notes: string[] = [];

  const sansAccent = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  for (const ligne of lignes) {
    const titre = ligne.match(/^##\s+(.*)/);
    if (titre) {
      const t = sansAccent(titre[1]);
      if (t.startsWith('ingredient')) section = 'ingredients';
      else if (t.startsWith('preparation')) section = 'etapes';
      else if (t.startsWith('note')) section = 'notes';
      else section = 'autre';
      continue;
    }

    const t = ligne.trim();
    if (!t) continue;

    if (section === 'intro') {
      intro.push(t);
    } else if (section === 'ingredients') {
      const m = t.match(/^[-*]\s+(.*)/);
      if (m) ingredients.push(m[1].trim());
    } else if (section === 'etapes') {
      const m = t.match(/^\d+\.\s+(.*)/);
      if (m) etapes.push(m[1].trim());
      else if (etapes.length) etapes[etapes.length - 1] += ' ' + t; // suite d'étape sur plusieurs lignes
    } else if (section === 'notes') {
      const m = t.match(/^[-*]\s+(.*)/);
      if (m) notes.push(m[1].trim());
      else if (notes.length) notes[notes.length - 1] += ' ' + t;
    }
  }

  return {
    intro: intro.join(' ').trim(),
    ingredients,
    etapes,
    notes,
  };
}

interface DonneesRecette {
  titre: string;
  categorie: string;
  temps_total: number;
  temps_prep: number;
  temps_cuisson: number;
  portions: number;
  tags: string[];
  aime_des_enfants: boolean;
  macros: { calories: number; proteines: number; glucides: number; lipides: number };
  date_publication: Date;
}

/**
 * Construit le JSON-LD `Recipe` sérialisé, prêt à injecter dans le <head>.
 * `url` : URL absolue de la page-recette.
 */
export function construireRecipeJsonLd(
  data: DonneesRecette,
  sections: SectionsRecette,
  url: string
): string {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: data.titre,
    url,
    inLanguage: 'fr-CA',
    description:
      sections.intro ||
      `${data.titre} — recette familiale rapide, prête en ${data.temps_total} minutes.`,
    datePublished: data.date_publication.toISOString().slice(0, 10),
    author: { '@type': 'Organization', name: 'Le carnet de recettes' },
    recipeCategory: data.categorie,
    recipeCuisine: 'Familiale québécoise',
    keywords: data.tags.join(', '),
    recipeYield: `${data.portions} portions`,
    prepTime: dureeISO(data.temps_prep),
    cookTime: dureeISO(data.temps_cuisson),
    totalTime: dureeISO(data.temps_total),
    recipeIngredient: sections.ingredients,
    recipeInstructions: sections.etapes.map((texte, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: texte,
    })),
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${data.macros.calories} kcal`,
      proteinContent: `${data.macros.proteines} g`,
      carbohydrateContent: `${data.macros.glucides} g`,
      fatContent: `${data.macros.lipides} g`,
      servingSize: '1 portion',
    },
  };

  // Régimes valides Schema.org, déduits de la catégorie et des tags.
  const tagsNorm = data.tags.map((t) =>
    t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  );
  const regimes: string[] = [];
  if (data.categorie === 'Végé' || tagsNorm.some((t) => t.startsWith('vege'))) {
    regimes.push('https://schema.org/VegetarianDiet');
  }
  if (tagsNorm.some((t) => t.includes('sans gluten'))) {
    regimes.push('https://schema.org/GlutenFreeDiet');
  }
  if (regimes.length) {
    jsonLd.suitableForDiet = regimes.length === 1 ? regimes[0] : regimes;
  }

  return JSON.stringify(jsonLd);
}
