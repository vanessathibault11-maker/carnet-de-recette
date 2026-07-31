# Backlog — Le carnet de recettes

Idées volontairement laissées de côté pour le premier build, à reprendre plus tard.

## Infolettre
- **Décision (2026-07-22)** : rien pour l'instant, pas d'encart sur le site.
- Quand on voudra la brancher : service gratuit type **Buttondown** ou
  **Mailchimp** (formule gratuite). Ça demande un compte et une petite
  configuration. Penser à la conformité **Loi 25** (consentement clair,
  désabonnement facile) puisqu'on collecterait des courriels.

## Statistiques de visite
- **Cloudflare Web Analytics** : s'active après le déploiement, depuis le
  tableau de bord Cloudflare, sans ajouter de code. Respectueux de la vie privée
  (pas de cookies).

## Améliorations possibles
- **Image de partage (réseaux sociaux)** : générer une image Open Graph par
  recette (à partir du visuel illustré) pour de plus belles vignettes quand on
  partage un lien. Ajouterait aussi le champ `image` au Schema.org.
- **Recherche** : une barre de recherche côté client (le site est petit, un
  simple filtre par titre/tag suffirait).
- **Plus de catégories / d'illustrations** : le système est prêt, il suffit
  d'ajouter une entrée dans `src/lib/categories.ts`.
- **Liste d'épicerie** : cocher des recettes et générer une liste d'ingrédients
  combinée.
- **Impression** : une feuille de style d'impression propre pour la page-recette.
