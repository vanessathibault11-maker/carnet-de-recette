// -----------------------------------------------------------------------------
// Liste d'épicerie : analyse des lignes d'ingrédients, mise à l'échelle selon
// les portions choisies, fusion des doublons et classement par rayon.
//
// Principe de prudence : on ne fusionne QUE si le nom normalisé ET l'unité
// concordent. Dans le doute, on garde deux lignes séparées — une liste un peu
// longue est bénigne, une quantité fusionnée à tort ne l'est pas.
// -----------------------------------------------------------------------------

import { parseQuantite, formatQuantite } from './quantites';

export interface RecetteEpicerie {
  slug: string;
  titre: string;
  /** Portions écrites dans la recette (base de la mise à l'échelle). */
  portions: number;
  ingredients: string[];
}

export interface LigneEpicerie {
  cle: string;
  /** Quantité totale, ou null si la ligne n'en portait aucune. */
  qte: number | null;
  unite: string;
  nom: string;
  /** Précisions après la virgule (« en dés », « râpé »…), dédoublonnées. */
  precisions: string[];
  /** Titres des recettes qui demandent cet ingrédient. */
  recettes: string[];
  texte: string;
}

export interface RayonEpicerie {
  rayon: string;
  lignes: LigneEpicerie[];
}

// -- Unités reconnues ---------------------------------------------------------
// Testées dans l'ordre : les formes longues d'abord, sinon « c. à soupe »
// serait coupé par une règle plus courte.
const UNITES: Array<[RegExp, string]> = [
  // Attention : `\b` ne fonctionne pas après une lettre accentuée (« thé »),
  // les accents n'étant pas des caractères de mot en JavaScript. On borne donc
  // avec une anticipation d'espace ou de fin de chaîne.
  [/^c\.?\s*[àa]\s*(?:soupe|table)s?\.?(?=\s|$)/i, 'c. à soupe'],
  [/^c\.?\s*[àa]\s*th[ée]s?\.?(?=\s|$)/i, 'c. à thé'],
  [/^cuill[èe]res?\s+[àa]\s+(?:soupe|table)s?(?=\s|$)/i, 'c. à soupe'],
  [/^cuill[èe]res?\s+[àa]\s+th[ée]s?(?=\s|$)/i, 'c. à thé'],
  [/^tasses?\b/i, 'tasse'],
  [/^kg\b\.?/i, 'kg'],
  [/^g\b\.?/i, 'g'],
  [/^ml\b\.?/i, 'ml'],
  [/^(?:l|litres?)\b\.?/i, 'L'],
  [/^bo[îi]tes?\b/i, 'boîte'],
  [/^conserves?\b/i, 'conserve'],
  [/^pinc[ée]es?\b/i, 'pincée'],
  [/^gousses?\b/i, 'gousse'],
  [/^tranches?\b/i, 'tranche'],
  [/^paquets?\b/i, 'paquet'],
  [/^sachets?\b/i, 'sachet'],
  [/^branches?\b/i, 'branche'],
  [/^filets?\b/i, 'filet'],
];

// Unités dont le pluriel s'écrit avec un « s ». Les symboles (g, kg, ml, L) et
// « c. à soupe » restent invariables.
const UNITES_ACCORDABLES = new Set([
  'tasse',
  'boîte',
  'conserve',
  'pincée',
  'gousse',
  'tranche',
  'paquet',
  'sachet',
  'branche',
  'filet',
]);

// -- Rayons -------------------------------------------------------------------
// Le mot-clé le PLUS LONG qui correspond gagne : « beurre d'arachide » va à
// l'épicerie même si « beurre » pointe vers les produits laitiers.
const RAYONS: Array<[string, string[]]> = [
  [
    'Fruits et légumes',
    [
      'pomme', 'poire', 'banane', 'citron', 'lime', 'orange', 'bleuet', 'fraise',
      'framboise', 'raisin', 'avocat', 'oignon', 'échalote', 'ail', 'poivron',
      'carotte', 'céleri', 'brocoli', 'chou', 'courgette', 'concombre', 'tomate',
      'patate', 'pomme de terre', 'champignon', 'épinard', 'laitue', 'salade',
      'gingembre', 'persil', 'coriandre', 'basilic', 'ciboulette', 'maïs',
      'haricot vert', 'aubergine', 'courge', 'navet', 'poireau', 'radis',
      'aneth', 'menthe', 'romarin', 'sauge', 'estragon', 'thym frais',
    ],
  ],
  [
    'Viandes et poissons',
    [
      'poulet', 'poitrine', 'cuisse', 'bœuf', 'boeuf', 'porc',
      'côtelette', 'saucisse', 'dinde', 'jambon', 'bacon', 'saumon', 'tilapia',
      'morue', 'poisson', 'crevette', 'thon frais', 'veau', 'agneau',
    ],
  ],
  [
    'Produits laitiers et œufs',
    [
      'lait', 'beurre', 'crème', 'fromage', 'cheddar', 'mozzarella', 'parmesan',
      'feta', 'ricotta', 'yogourt', 'œuf', 'oeuf', 'margarine',
    ],
  ],
  ['Boulangerie', ['pain', 'tortilla', 'pita', 'bagel', 'baguette', 'brioche', 'croûton']],
  [
    'Épicerie et garde-manger',
    [
      'farine', 'sucre', 'cassonade', 'sirop', 'miel', 'avoine', 'flocon', 'riz',
      'quinoa', 'couscous', 'pâtes', 'macaroni', 'spaghetti', 'nouille', 'huile',
      'vinaigre', 'sauce', 'moutarde', 'ketchup', 'mayonnaise', 'bouillon',
      'haricot', 'haricot noir', 'haricot rouge', 'pois chiche', 'lentille',
      'conserve', 'lait de coco',
      'tomates en conserve', 'tomates broyées', 'pâte de tomate', 'chapelure',
      'poudre à pâte', 'bicarbonate', 'vanille', 'chocolat', 'pépite', 'noix',
      'amande', 'arachide', 'beurre d\'arachide', 'beurre de graines', 'graine',
      'coco', 'lin', 'sel', 'poivre', 'paprika', 'cannelle', 'cumin', 'origan',
      'thym', 'basilic séché', 'poudre d\'ail', 'poudre d\'oignon', 'curcuma',
      'cari', 'chili', 'muscade', 'levure', 'fécule', 'soya', 'teriyaki',
      'sésame', 'salsa', 'bicarbonate de soude',
    ],
  ],
  ['Surgelés', ['surgelé', 'congelé', 'petits pois surgelés', 'crème glacée']],
];

const RAYON_DEFAUT = 'À vérifier';

/** Ordre d'affichage : celui d'un vrai parcours d'épicerie. */
export const ORDRE_RAYONS = [
  'Fruits et légumes',
  'Viandes et poissons',
  'Produits laitiers et œufs',
  'Boulangerie',
  'Épicerie et garde-manger',
  'Surgelés',
  RAYON_DEFAUT,
];

export function sansAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function rayonDe(nom: string): string {
  const n = sansAccents(nom);
  let meilleur = RAYON_DEFAUT;
  let longueur = 0;
  for (const [rayon, motsCles] of RAYONS) {
    for (const mot of motsCles) {
      const m = sansAccents(mot);
      if (n.includes(m) && m.length > longueur) {
        meilleur = rayon;
        longueur = m.length;
      }
    }
  }
  return meilleur;
}

export interface IngredientAnalyse {
  qte: number | null;
  unite: string;
  nom: string;
  precision: string;
}

/** « 1.5 tasse de farine tout usage, tamisée » -> {1.5, tasse, farine tout usage, tamisée} */
export function analyserIngredient(brut: string): IngredientAnalyse {
  let reste = brut.trim();
  let qte: number | null = null;

  const mQte = reste.match(/^(\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?)\s*/);
  if (mQte) {
    qte = parseQuantite(mQte[1]);
    reste = reste.slice(mQte[0].length);
  }

  let unite = '';
  for (const [regex, libelle] of UNITES) {
    const m = reste.match(regex);
    if (m) {
      unite = libelle;
      reste = reste.slice(m[0].length).trim();
      break;
    }
  }

  // « de farine », « d'huile », « du beurre » -> on retire l'article.
  reste = reste.replace(/^(?:de\s+la\s+|de\s+l'|des\s+|du\s+|de\s+|d')/i, '').trim();

  const virgule = reste.indexOf(',');
  const nom = (virgule >= 0 ? reste.slice(0, virgule) : reste).trim();
  const precision = virgule >= 0 ? reste.slice(virgule + 1).trim() : '';

  return { qte, unite, nom, precision };
}

/** Clé de fusion : nom normalisé (1er mot dé-pluralisé) + unité. */
function cleDe(nom: string, unite: string): string {
  const mots = sansAccents(nom).split(/\s+/);
  if (mots[0] && mots[0].length > 4 && mots[0].endsWith('s')) {
    mots[0] = mots[0].slice(0, -1);
  }
  return `${mots.join(' ')}|${unite}`;
}

// Noms qui ne bougent pas au pluriel (ou dont le singulier n'existe pas).
const NOMS_INVARIABLES = new Set([
  'pois', 'ananas', 'riz', 'mais', 'couscous', 'jus', 'anis', 'quinoa', 'lait',
]);

// Mots qui terminent le groupe à accorder : après eux commence un complément,
// qui, lui, ne s'accorde pas (« oignons verts » mais « filets de saumon »).
const MOTS_ARRET = new Set(['de', "d'", 'du', 'des', 'à', 'au', 'aux', 'en', 'ou', 'et', 'avec', 'pour', 'sans']);

/**
 * Accorde le nom avec la quantité additionnée : la recette dit « 2 pommes »,
 * mais après mise à l'échelle on peut se retrouver à 1. Sans ça, la liste
 * afficherait « 1 pommes ». On accorde le nom ET ses adjectifs, jusqu'au
 * premier complément.
 */
function accorderNom(nom: string, qte: number | null): string {
  if (qte === null) return nom;
  const mots = nom.split(/\s+/);
  const pluriel = qte >= 2;

  for (let i = 0; i < mots.length; i++) {
    const mot = mots[i];
    const base = sansAccents(mot);
    // On s'arrête au premier complément ou à tout ce qui n'est pas un mot
    // simple (parenthèse, unité entre parenthèses, chiffre…).
    if (MOTS_ARRET.has(base) || !/^[a-zà-ÿœ]/i.test(mot)) break;
    if (NOMS_INVARIABLES.has(base)) continue;

    if (pluriel) {
      if (!/[sxz]$/i.test(mot)) mots[i] = `${mot}s`;
    } else if (/s$/i.test(mot) && mot.length > 4) {
      mots[i] = mot.slice(0, -1);
    }
  }
  return mots.join(' ');
}

// « de » ou « d' » ? Devant une voyelle, on élide — sauf devant un h aspiré
// (« de haricots », mais « d'huile »).
const H_MUET = new Set(['huile', 'huitre', 'herbe', 'herbes', 'huiles']);

function avecDe(nom: string): string {
  const premier = nom.split(/\s+/)[0] ?? '';
  const base = sansAccents(premier);
  const voyelle = /^[aeiouyœ]/.test(base);
  const hMuet = base.startsWith('h') && H_MUET.has(base);
  return voyelle || hMuet ? `d'${nom}` : `de ${nom}`;
}

function uniteAffichee(unite: string, qte: number | null): string {
  if (!unite) return '';
  if (qte !== null && qte > 1 && UNITES_ACCORDABLES.has(unite)) return `${unite}s`;
  return unite;
}

function texteDe(ligne: Omit<LigneEpicerie, 'texte'>): string {
  if (ligne.qte === null) return ligne.nom;
  const q = formatQuantite(ligne.qte);
  const u = uniteAffichee(ligne.unite, ligne.qte);
  // Sans unité, la quantité porte directement sur le nom : c'est lui qu'on
  // accorde. Avec une unité, le nom reste tel quel (« 2 tasses de farine »).
  if (!u) return `${q} ${accorderNom(ligne.nom, ligne.qte)}`;
  return `${q} ${u} ${avecDe(ligne.nom)}`;
}

/**
 * Construit la liste d'épicerie à partir des recettes retenues et du nombre de
 * portions voulu pour chacune (clé = slug). Les quantités sont mises à
 * l'échelle avant fusion.
 */
export function construireListe(
  recettes: RecetteEpicerie[],
  portionsVoulues: Record<string, number>
): RayonEpicerie[] {
  const parCle = new Map<string, Omit<LigneEpicerie, 'texte'>>();

  for (const recette of recettes) {
    const base = recette.portions > 0 ? recette.portions : 1;
    const voulu = portionsVoulues[recette.slug] ?? base;
    const ratio = voulu / base;

    for (const brut of recette.ingredients) {
      const { qte, unite, nom, precision } = analyserIngredient(brut);
      if (!nom) continue;
      const cle = cleDe(nom, unite);
      const existante = parCle.get(cle);
      const echelle = qte === null ? null : qte * ratio;

      if (!existante) {
        parCle.set(cle, {
          cle,
          qte: echelle,
          unite,
          nom,
          precisions: precision ? [precision] : [],
          recettes: [recette.titre],
        });
        continue;
      }

      if (existante.qte !== null && echelle !== null) existante.qte += echelle;
      else if (echelle !== null) existante.qte = echelle;

      if (precision && !existante.precisions.includes(precision)) {
        existante.precisions.push(precision);
      }
      if (!existante.recettes.includes(recette.titre)) {
        existante.recettes.push(recette.titre);
      }
    }
  }

  const groupes = new Map<string, LigneEpicerie[]>();
  for (const ligne of parCle.values()) {
    const complete: LigneEpicerie = { ...ligne, texte: texteDe(ligne) };
    const rayon = rayonDe(complete.nom);
    const liste = groupes.get(rayon) ?? [];
    liste.push(complete);
    groupes.set(rayon, liste);
  }

  return ORDRE_RAYONS.filter((r) => groupes.has(r)).map((rayon) => ({
    rayon,
    lignes: (groupes.get(rayon) ?? []).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
  }));
}

/** Version texte brut, pour le bouton « copier » (collable dans Notes/SMS). */
export function listeEnTexte(rayons: RayonEpicerie[]): string {
  return rayons
    .map((r) => `${r.rayon.toUpperCase()}\n${r.lignes.map((l) => `- ${l.texte}`).join('\n')}`)
    .join('\n\n');
}
