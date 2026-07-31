# Visuels des recettes

Deux niveaux, tous en **SVG maison** (jamais de photo, jamais d'image IA,
jamais de dégradé).

## `src/visuels/<slug>.svg` — le visuel d'UNE recette

Un **SVG autonome** (fond de catégorie compris) dont le nom = le slug de la
recette (= nom du fichier `.md`). Exemple : `sauce-a-spaghetti-maison.md` →
`sauce-a-spaghetti-maison.svg`.

- S'il existe, la page-recette l'affiche tel quel (héros + carte).
- S'il n'existe pas, le site retombe automatiquement sur l'illustration de la
  **catégorie** (banque intégrée à `src/lib/categories.ts`). Rien à faire.
- Pour pointer vers un fichier au nom différent du slug : champ `visuel:` dans
  le frontmatter de la recette.

C'est ici que le skill **`generateur-visuel-recette`** dépose ses fichiers.

## `src/visuels/icones/` — la banque de primitives réutilisables

Des icônes SVG nommées (`poulet`, `poisson`, `lentilles`, `tomate`, `brocoli`,
`oeuf`, `casserole`, `poele`, `pates`, `riz`…) que le skill assemble pour
composer un `<slug>.svg` cohérent d'une recette à l'autre.

Style à respecter (identique partout) :

- **Palette** : crème `#FBF7F0`, charbon `#2B2B2B`. Les primitives dessinent en
  `currentColor` → elles se teintent selon le fond (encre claire sur fond foncé,
  charbon sur fond pâle).
- **Trait** ~2 px, `stroke-linecap="round"`, formes arrondies, aplats.
- **Zéro** dégradé, ombre réaliste, texture.
- `<title>` obligatoire (accessibilité).

Fond de catégorie (pour les `<slug>.svg` autonomes) :
Poulet `#C8674B` · Poisson `#3E7C7B` · Végé `#2E5E3A` · Dessert `#E0A93B` ·
Soupers 30 min / Autre `#E5DFD5`.

Enrichir la banque : **oui**. Changer le style : **jamais**.
