// -----------------------------------------------------------------------------
// Mémoire locale du carnet : favoris, notes perso et panier d'épicerie.
// TOUT reste dans le navigateur (localStorage) — aucun compte, aucun serveur,
// aucune donnée personnelle qui sort de l'appareil (rien à déclarer côté Loi 25).
// Corollaire assumé : vider le cache efface tout, d'où l'export/import JSON.
//
// Toute écriture émet l'événement `carnet:maj` sur window : les compteurs de
// l'entête et les boutons se resynchronisent sans rechargement.
// -----------------------------------------------------------------------------

const CLE_FAVORIS = 'carnet:favoris';
const CLE_NOTES = 'carnet:notes';
const CLE_PANIER = 'carnet:panier';

/** slug -> nombre de portions voulues pour cette recette dans le panier. */
export type Panier = Record<string, number>;
export type Notes = Record<string, string>;

export const EVENEMENT_MAJ = 'carnet:maj';

// -- Accès bas niveau, tolérants ---------------------------------------------
// localStorage peut lever (navigation privée, stockage plein, réglages stricts).
// Dans ce cas le site reste utilisable : on perd juste la mémoire.

function lireJson<T>(cle: string, defaut: T): T {
  try {
    const brut = localStorage.getItem(cle);
    if (!brut) return defaut;
    const valeur = JSON.parse(brut);
    return valeur ?? defaut;
  } catch {
    return defaut;
  }
}

function ecrireJson(cle: string, valeur: unknown): void {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    /* stockage indisponible : on ignore silencieusement */
  }
  signaler();
}

function signaler(): void {
  try {
    window.dispatchEvent(new CustomEvent(EVENEMENT_MAJ));
  } catch {
    /* hors navigateur */
  }
}

// -- Favoris ------------------------------------------------------------------

export function lireFavoris(): string[] {
  const v = lireJson<string[]>(CLE_FAVORIS, []);
  return Array.isArray(v) ? v.filter((s) => typeof s === 'string') : [];
}

export function estFavori(slug: string): boolean {
  return lireFavoris().includes(slug);
}

/** Ajoute ou retire le favori. Retourne l'état APRÈS bascule. */
export function basculerFavori(slug: string): boolean {
  const actuels = lireFavoris();
  const dedans = actuels.includes(slug);
  const suivants = dedans ? actuels.filter((s) => s !== slug) : [...actuels, slug];
  ecrireJson(CLE_FAVORIS, suivants);
  return !dedans;
}

// -- Notes perso --------------------------------------------------------------

export function lireNotes(): Notes {
  const v = lireJson<Notes>(CLE_NOTES, {});
  return v && typeof v === 'object' ? v : {};
}

export function lireNote(slug: string): string {
  return lireNotes()[slug] ?? '';
}

export function ecrireNote(slug: string, texte: string): void {
  const notes = lireNotes();
  const propre = texte.trim();
  if (propre) notes[slug] = propre;
  else delete notes[slug];
  ecrireJson(CLE_NOTES, notes);
}

// -- Panier -------------------------------------------------------------------

export function lirePanier(): Panier {
  const v = lireJson<Panier>(CLE_PANIER, {});
  if (!v || typeof v !== 'object') return {};
  const propre: Panier = {};
  for (const [slug, portions] of Object.entries(v)) {
    const n = Number(portions);
    if (Number.isFinite(n) && n > 0) propre[slug] = Math.round(n);
  }
  return propre;
}

export function dansPanier(slug: string): boolean {
  return slug in lirePanier();
}

export function nombreAuPanier(): number {
  return Object.keys(lirePanier()).length;
}

/** Ajoute (avec ses portions de base) ou retire. Retourne l'état APRÈS bascule. */
export function basculerPanier(slug: string, portionsParDefaut: number): boolean {
  const panier = lirePanier();
  if (slug in panier) {
    delete panier[slug];
    ecrireJson(CLE_PANIER, panier);
    return false;
  }
  panier[slug] = Math.max(1, Math.round(portionsParDefaut) || 1);
  ecrireJson(CLE_PANIER, panier);
  return true;
}

export function reglerPortions(slug: string, portions: number): void {
  const panier = lirePanier();
  if (!(slug in panier)) return;
  panier[slug] = Math.max(1, Math.round(portions) || 1);
  ecrireJson(CLE_PANIER, panier);
}

export function viderPanier(): void {
  ecrireJson(CLE_PANIER, {});
}

// -- Export / import ----------------------------------------------------------
// Filet de sécurité : le stockage local se perd (nouveau téléphone, cache vidé).

export interface CarnetExporte {
  version: 1;
  exporte_le: string;
  favoris: string[];
  notes: Notes;
  panier: Panier;
}

export function exporterCarnet(): CarnetExporte {
  return {
    version: 1,
    exporte_le: new Date().toISOString(),
    favoris: lireFavoris(),
    notes: lireNotes(),
    panier: lirePanier(),
  };
}

/**
 * Remplace le contenu local par celui du fichier. Ne fait rien et retourne
 * false si le fichier n'a pas la forme attendue — on ne détruit jamais des
 * données sur la foi d'une entrée douteuse.
 */
export function importerCarnet(brut: string): boolean {
  let donnees: Partial<CarnetExporte>;
  try {
    donnees = JSON.parse(brut);
  } catch {
    return false;
  }
  if (!donnees || typeof donnees !== 'object') return false;

  const favoris = Array.isArray(donnees.favoris)
    ? donnees.favoris.filter((s): s is string => typeof s === 'string')
    : null;
  const notes =
    donnees.notes && typeof donnees.notes === 'object' ? (donnees.notes as Notes) : null;
  const panier =
    donnees.panier && typeof donnees.panier === 'object' ? (donnees.panier as Panier) : null;

  if (!favoris && !notes && !panier) return false;

  if (favoris) ecrireJson(CLE_FAVORIS, favoris);
  if (notes) ecrireJson(CLE_NOTES, notes);
  if (panier) ecrireJson(CLE_PANIER, panier);
  return true;
}
