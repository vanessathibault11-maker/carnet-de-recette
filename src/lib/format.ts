// Formatage localisé (français Québec). Réutilisé partout — une seule source.

const devise = new Intl.NumberFormat('fr-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 2,
});

/** 3.25 -> "3,25 $" */
export function formaterCout(montant: number): string {
  return devise.format(montant);
}

/** 45 -> "45 min" ; 90 -> "1 h 30" */
export function formaterTemps(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m}`;
}

/**
 * Découpe le temps pour l'affichage « chiffre héros » des cartes-recettes :
 * le nombre en gros, l'unité en petit dessous.
 * 40 -> { valeur: "40", unite: "min" } ; 120 -> { valeur: "2", unite: "h" } ;
 * 90 -> { valeur: "1h30", unite: "" } (déjà lisible seul, pas d'unité à part).
 */
export function formaterTempsHero(minutes: number): {
  valeur: string;
  unite: string;
} {
  if (minutes < 60) return { valeur: String(minutes), unite: 'min' };
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0
    ? { valeur: String(h), unite: 'h' }
    : { valeur: `${h}h${m}`, unite: '' };
}

/**
 * Formatage minimal de texte de confiance : échappe le HTML puis applique le
 * gras Markdown (**texte**). Suffit pour nos « Notes ».
 */
export function inlineGras(texte: string): string {
  const echappe = texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return echappe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Minutes -> durée ISO 8601 pour Schema.org (45 -> "PT45M", 90 -> "PT1H30M"). */
export function dureeISO(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h > 0 ? `${h}H` : ''}${m > 0 || h === 0 ? `${m}M` : ''}`;
}
