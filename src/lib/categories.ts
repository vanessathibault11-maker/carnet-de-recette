// -----------------------------------------------------------------------------
// Source UNIQUE de vérité pour les catégories : couleurs, libellés, illustrations.
// Portée fidèlement du design importé (RecipeCard.dc.html).
// Tout le site lit d'ici — ne dupliquez pas ces valeurs ailleurs.
// -----------------------------------------------------------------------------

export type CategorieKey = 'poulet' | 'poisson' | 'vege' | 'dessert' | 'boeuf';

export interface Categorie {
  key: CategorieKey;
  /** Libellé affiché ET valeur attendue dans le frontmatter `categorie`. */
  label: string;
  /** Segment d'URL : /categories/<slug> */
  slug: string;
  /** Couleur de fond du visuel (du design). */
  couleur: string;
  /** Couleur de texte lisible SUR `couleur` (contraste accessible). */
  texteSur: string;
  /** Id d'illustration/icône par défaut pour cette catégorie. */
  illustrationParDefaut: string;
}

// Ordre d'affichage dans la bande catégories.
// Note : les catégories sont des TYPES DE PLAT (par protéine), pas des durées.
// Le temps de préparation est un FILTRE, pas une catégorie.
export const CATEGORIES: Categorie[] = [
  {
    key: 'poulet',
    label: 'Poulet',
    slug: 'poulet',
    couleur: '#C8674B',
    texteSur: '#FFFFFF',
    illustrationParDefaut: 'poulet',
  },
  {
    key: 'boeuf',
    label: 'Bœuf & porc',
    slug: 'boeuf',
    couleur: '#8A4B3C',
    texteSur: '#FFFFFF',
    illustrationParDefaut: 'casserole',
  },
  {
    key: 'poisson',
    label: 'Poisson',
    slug: 'poisson',
    couleur: '#3E7C7B',
    texteSur: '#FFFFFF',
    illustrationParDefaut: 'poisson',
  },
  {
    key: 'vege',
    label: 'Végé',
    slug: 'vege',
    couleur: '#2E5E3A',
    texteSur: '#FFFFFF',
    illustrationParDefaut: 'vege',
  },
  {
    key: 'dessert',
    label: 'Dessert',
    slug: 'dessert',
    couleur: '#E0A93B',
    texteSur: '#2B2B2B',
    illustrationParDefaut: 'dessert',
  },
];

// Recherche par libellé (valeur du frontmatter) — insensible aux accents/casse
// pour tolérer les petites variations d'écriture dans les .md.
const normaliser = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const PAR_LABEL = new Map(CATEGORIES.map((c) => [normaliser(c.label), c]));
const PAR_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

/** Catégorie depuis le libellé du frontmatter. Retombe sur la 1re catégorie si inconnu. */
export function getCategorie(label: string): Categorie {
  return PAR_LABEL.get(normaliser(label)) ?? CATEGORIES[0];
}

/** Catégorie depuis un slug d'URL, ou undefined si inconnu. */
export function getCategorieBySlug(slug: string): Categorie | undefined {
  return PAR_SLUG.get(slug);
}

// -----------------------------------------------------------------------------
// Illustrations SVG (contenu interne d'un <svg viewBox="0 0 240 240">).
// Style « doodle de livre de cuisine » : formes PLEINES en ENCRE (currentColor),
// posées sur une assiette. L'encre suit `texteSur` de la catégorie (crème/blanc
// sur fond foncé, charbon sur fond pâle) → lisibles sur N'IMPORTE quel fond,
// y compris les catégories claires (Soupers 30 min, Dessert). Aucune couleur
// imposée : seulement `currentColor` + un voile noir translucide pour l'ombre.
// L'id d'illustration est découplé de la catégorie : une recette peut choisir
// une autre illustration via le champ `illustration` de son frontmatter.
// -----------------------------------------------------------------------------

// Assiette + ombre douce communes à toutes les illustrations.
const PLATE =
  '<ellipse cx="120" cy="196" rx="72" ry="13" fill="#000000" fill-opacity="0.06"/>' +
  '<ellipse cx="120" cy="192" rx="66" ry="11" fill="currentColor" fill-opacity="0.18"/>';

export const ILLUSTRATIONS: Record<string, string> = {
  // Cuisse de poulet dorée.
  poulet:
    PLATE +
    '<g stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M62 168 l30 -30" stroke="currentColor" stroke-width="13"/>' +
    '<circle cx="58" cy="172" r="10" fill="currentColor"/><circle cx="66" cy="180" r="10" fill="currentColor"/>' +
    '<path d="M104 152 a48 48 0 1 1 46 -20 a30 30 0 0 1 -46 20 z" fill="currentColor" fill-opacity="0.94"/>' +
    '<path d="M96 96 a30 30 0 0 1 24 -14" stroke="#000000" stroke-opacity="0.1" stroke-width="6" fill="none"/>' +
    '<circle cx="150" cy="132" r="4" fill="#000000" fill-opacity="0.1"/>' +
    '</g>',
  // Poisson entier sur l'assiette.
  poisson:
    PLATE +
    '<g stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M60 130 q40 -40 96 -18 q22 9 30 18 q-8 9 -30 18 q-56 22 -96 -18 z" fill="currentColor" fill-opacity="0.94"/>' +
    '<path d="M186 130 l22 -16 v32 z" fill="currentColor" fill-opacity="0.94"/>' +
    '<circle cx="92" cy="122" r="5" fill="#000000" fill-opacity="0.35"/>' +
    '<path d="M120 116 q6 14 0 28 M140 114 q7 16 0 32" stroke="#000000" stroke-opacity="0.1" stroke-width="4" fill="none"/>' +
    '</g>',
  // Bol de verdure fraîche.
  vege:
    PLATE +
    '<g stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M64 128 h112 a56 40 0 0 1 -112 0 z" fill="currentColor" fill-opacity="0.94"/>' +
    '<path d="M60 128 h120" stroke="currentColor" stroke-width="7"/>' +
    '<circle cx="92" cy="112" r="17" fill="currentColor" fill-opacity="0.85"/>' +
    '<circle cx="126" cy="104" r="20" fill="currentColor" fill-opacity="0.94"/>' +
    '<circle cx="158" cy="114" r="15" fill="currentColor" fill-opacity="0.8"/>' +
    '<path d="M126 84 v-20 M118 74 l-12 -12 M134 74 l12 -12" stroke="#000000" stroke-opacity="0.12" stroke-width="4" fill="none"/>' +
    '</g>',
  // Marmite fumante avec couvercle.
  casserole:
    PLATE +
    '<g stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M104 74 q-9 -11 0 -22 M136 74 q-9 -11 0 -22" stroke="currentColor" stroke-width="5" fill="none" stroke-opacity="0.85"/>' +
    '<path d="M56 128 h-12 a9 9 0 0 0 0 18 h12 M184 128 h12 a9 9 0 0 1 0 18 h-12" stroke="currentColor" stroke-width="7" fill="none"/>' +
    '<path d="M60 122 h120 v26 a22 22 0 0 1 -22 22 H82 a22 22 0 0 1 -22 -22 z" fill="currentColor" fill-opacity="0.94"/>' +
    '<rect x="54" y="104" width="132" height="16" rx="8" fill="currentColor" fill-opacity="0.94"/>' +
    '<circle cx="120" cy="96" r="6" fill="currentColor"/>' +
    '<path d="M84 150 h72" stroke="#000000" stroke-opacity="0.09" stroke-width="5" fill="none"/>' +
    '</g>',
  // Part de gâteau avec bougie.
  dessert:
    PLATE +
    '<g stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M80 168 v-40 l40 -22 l40 22 v40 z" fill="currentColor" fill-opacity="0.94"/>' +
    '<path d="M80 128 l40 22 l40 -22" fill="none" stroke="#000000" stroke-opacity="0.1" stroke-width="4"/>' +
    '<path d="M80 142 q40 20 80 0" fill="none" stroke="#000000" stroke-opacity="0.08" stroke-width="4"/>' +
    '<line x1="120" y1="106" x2="120" y2="86" stroke="currentColor" stroke-width="5"/>' +
    '<circle cx="120" cy="78" r="6" fill="currentColor"/>' +
    '</g>',
  // Bol de pâtes avec fourchette.
  pates:
    PLATE +
    '<g stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M62 132 h116 a58 42 0 0 1 -116 0 z" fill="currentColor" fill-opacity="0.94"/>' +
    '<path d="M58 132 h124" stroke="currentColor" stroke-width="7"/>' +
    '<path d="M78 122 q10 -16 22 0 M104 118 q10 -18 22 0 M130 120 q10 -16 22 0" fill="none" stroke="currentColor" stroke-width="6"/>' +
    '<circle cx="150" cy="150" r="9" fill="#000000" fill-opacity="0.12"/>' +
    '</g>',
};

/** SVG interne d'une illustration par id, avec repli sûr. */
export function getIllustration(id: string | undefined, repli = 'casserole'): string {
  if (id && ILLUSTRATIONS[id]) return ILLUSTRATIONS[id];
  return ILLUSTRATIONS[repli] ?? ILLUSTRATIONS.casserole;
}
