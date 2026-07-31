// -----------------------------------------------------------------------------
// Mise à l'échelle des quantités d'ingrédients selon le nombre de portions.
// Importé À LA FOIS au build (page-recette) et dans le script client du
// sélecteur ± — une seule logique, pas de dérive entre les deux.
// -----------------------------------------------------------------------------

const FRACTIONS: [number, string][] = [
  [0.125, '⅛'],
  [0.25, '¼'],
  [1 / 3, '⅓'],
  [0.5, '½'],
  [2 / 3, '⅔'],
  [0.75, '¾'],
];

/** "1/2" -> 0.5 ; "1,5" -> 1.5 ; "3" -> 3 */
export function parseQuantite(brut: string): number {
  if (brut.includes('/')) {
    const [a, b] = brut.split('/').map((s) => parseFloat(s.replace(',', '.').trim()));
    return b ? a / b : a;
  }
  return parseFloat(brut.replace(',', '.'));
}

/** Nombre -> affichage lisible Québec, avec fractions unicode courantes. */
export function formatQuantite(n: number): string {
  if (!isFinite(n) || n <= 0) return '0';
  const entier = Math.floor(n + 1e-9);
  const frac = n - entier;
  for (const [val, glyphe] of FRACTIONS) {
    if (Math.abs(frac - val) < 0.03) {
      return entier ? `${entier} ${glyphe}` : glyphe;
    }
  }
  if (frac < 0.03) return String(entier);
  return n
    .toFixed(2)
    .replace(/\.?0+$/, '')
    .replace('.', ',');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Enveloppe la quantité de tête d'un ingrédient dans un <span.qte data-base>
 * pour permettre la mise à l'échelle côté client. Le reste du texte est échappé.
 */
export function baliserIngredient(ingredient: string): string {
  const m = ingredient.match(/^(\d+\s*\/\s*\d+|\d+(?:[.,]\d+)?)(\s*)/);
  if (!m) return escapeHtml(ingredient);
  const val = parseQuantite(m[1]);
  const reste = escapeHtml(ingredient.slice(m[0].length));
  return `<span class="qte" data-base="${val}">${formatQuantite(val)}</span> ${reste}`;
}
