---
name: generateur-visuel-recette
description: Crée ou ajuste une icône SVG de la banque « Le carnet de recettes » (style trait, currentColor, 100x100). Utilise ce skill quand Vanessa demande le visuel, l'icône ou l'illustration d'une recette ou d'une catégorie, ou quand une nouvelle recette a besoin d'une icône absente de la banque. Ne produit JAMAIS de photo, d'image IA ni de grande scène illustrée.
---

# Générateur de visuel de recette

Tu produis les **icônes** du site « Le carnet de recettes » (projet Astro,
dossier `CarnetRecette`).

## Ce que le site affiche vraiment

Un seul visuel existe : un **emblème rond** à la couleur de la catégorie,
contenant une icône au trait. Le même emblème apparaît sur la carte-recette et
sur la page-recette.

**Décision du 2026-08-03** : les grandes scènes autonomes
`src/visuels/<slug>.svg` (400 × 300 avec fond de catégorie) ont été
**supprimées** — le rendu n'était pas au niveau du site, et le code ne les
affichait pas. N'en produis plus. Si Vanessa demande « le visuel » d'une
recette, elle parle de son **icône**.

## Où ça vit

- `src/visuels/icones/*.svg` — la banque. Un fichier = une icône.
- `src/lib/categories.ts` — chaque catégorie déclare son
  `illustrationParDefaut` (nom de fichier sans `.svg`) et sa `couleur` de fond.
- Une recette peut choisir une autre icône avec `illustration: <nom>` dans son
  frontmatter.

## Style maison (à respecter à la lettre)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"
     stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <title>Nom lisible de l'objet</title>
  <!-- quelques tracés -->
</svg>
```

- **`currentColor` uniquement.** L'icône se teinte selon la catégorie (encre
  claire sur fond foncé, charbon sur fond pâle). Coder une couleur en dur
  casserait le contraste sur la moitié des catégories.
- Formes arrondies, quelques traits, beaucoup d'air. L'icône est rendue à
  ~30 px : si un détail disparaît à cette taille, enlève-le.
- Aplats avec parcimonie : `fill="currentColor" stroke="none"`.
- `<title>` obligatoire (accessibilité).
- **Zéro** dégradé, ombre portée, texture, photo ou image générée.

## Ajouter une icône

1. Choisis un nom simple et générique (`poulet`, `pates`, `collation`) :
   l'icône doit servir à plusieurs recettes, pas à une seule.
2. Dépose le fichier dans `src/visuels/icones/`.
3. Réfère-la : `illustration: mon-icone` dans une recette, ou
   `illustrationParDefaut` dans `src/lib/categories.ts` pour une catégorie
   entière.

Rien d'autre : le site la charge au prochain build (`import.meta.glob`).

## Nouvelle catégorie

La catégorie elle-même se déclare à deux endroits — `CATEGORIES` dans
`src/lib/categories.ts` et l'énumération `categorie` de
`src/content.config.ts` — et sa `couleur` doit offrir un **contraste d'au moins
4.5:1** avec `texteSur` (calcule-le, ne l'estime pas à l'œil).

Il n'existe **pas** de fichier `src/data/categories.json`.

## Checklist avant de livrer

- [ ] `viewBox="0 0 100 100"`, `stroke="currentColor"`, `stroke-width="3"`.
- [ ] Aucune couleur en dur.
- [ ] `<title>` présent et descriptif.
- [ ] Lisible à 30 px.
- [ ] Nom de fichier générique et réutilisable.
- [ ] Aucune photo, aucun dégradé, aucun effet réaliste.

## Comportement

- N'interviens après `generateur-recette` **que si** l'icône voulue manque à la
  banque. Dans le cas normal, l'icône de la catégorie suffit : il n'y a rien à
  faire.
- Si une icône proche existe déjà, dis-le et propose `illustration: <nom>`
  plutôt que d'en dessiner une quasi identique.
