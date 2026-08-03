# Visuels des recettes

**Un seul niveau** : la banque d'icônes. Jamais de photo, jamais d'image IA,
jamais de dégradé.

> **Décision du 2026-08-03** — les visuels autonomes `<slug>.svg` (grandes
> scènes 400 × 300 avec fond de catégorie) ont été retirés : le rendu n'était
> pas au niveau du reste du site, et le code ne les affichait pas. Le site
> montre l'**emblème de catégorie**, et lui seul. Pour différencier une
> recette, on change son **icône**, pas son fond.

## `src/visuels/icones/` — la banque

Des icônes SVG nommées (`poulet`, `poisson`, `vege`, `dessert`, `casserole`,
`pates`, `riz`, `tomate`, `brocoli`, `oeuf`, `lentilles`, `poele`, `dejeuner`,
`collation`…). Chaque recette en affiche une, dans un disque à la couleur de sa
catégorie — le même emblème sur la carte et sur la page-recette.

**Quelle icône ?** Par défaut celle de la catégorie (`illustrationParDefaut`
dans `src/lib/categories.ts`). Une recette peut en choisir une autre avec le
champ `illustration:` de son frontmatter.

## Style à respecter (identique partout)

- `viewBox="0 0 100 100"`, `fill="none"`, `stroke="currentColor"`,
  `stroke-width="3"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- **`currentColor` uniquement.** L'icône se teinte selon le fond de catégorie
  (encre claire sur fond foncé, charbon sur fond pâle). Coder une couleur en dur
  casserait le contraste sur la moitié des catégories.
- Formes arrondies, quelques traits, beaucoup d'air. **Zéro** dégradé, ombre
  réaliste ou texture.
- `<title>` obligatoire (accessibilité).
- Les aplats se font avec `fill="currentColor" stroke="none"`, avec parcimonie.

Enrichir la banque : **oui**. Changer le style : **jamais**.

## Ajouter une icône

1. Dépose `mon-icone.svg` ici, dans le style ci-dessus.
2. Réfère-la depuis une recette (`illustration: mon-icone`) ou depuis une
   catégorie (`illustrationParDefaut` dans `src/lib/categories.ts`).

Rien d'autre : le site la charge au prochain build.
