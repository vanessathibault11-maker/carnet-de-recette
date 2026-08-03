# Backlog — Le carnet de recettes

Idées volontairement laissées de côté, à reprendre plus tard.

## SEO et découvrabilité (décidé le 2026-08-03)
Rien n'est branché côté SEO pour l'instant — c'est un choix, pas un oubli.
Quand on voudra s'y mettre :

- **Image de partage (Open Graph)** : générer une image par recette à partir du
  visuel illustré, pour de plus belles vignettes quand on partage un lien.
  Ajouterait aussi le champ `image` au balisage Schema.org.
- **Pages de catégorie vides** : une catégorie sans recette publie quand même sa
  page. Sans SEO, c'est sans conséquence. Le jour où on indexe, il faudra
  exclure du plan du site les catégories de moins de 3 recettes — une page
  quasi vide dessert le référencement.
- **Fil des nouveautés (RSS)** : peu coûteux avec Astro, utile pour les lecteurs
  fidèles et pour la reprise par d'autres sites.

## Infolettre
- **Décision (2026-07-22)** : rien pour l'instant, pas d'encart sur le site.
- Quand on voudra la brancher : service gratuit type **Buttondown** ou
  **Mailchimp** (formule gratuite). Ça demande un compte et une petite
  configuration. Penser à la conformité **Loi 25** (consentement clair,
  désabonnement facile) puisqu'on collecterait des courriels.

## Statistiques de visite
- **Cloudflare Web Analytics** : s'active après le déploiement, depuis le
  tableau de bord Cloudflare, sans ajouter de code. Respectueux de la vie privée
  (pas de témoins).

## Améliorations possibles
- **Synchronisation entre appareils** : favoris, notes et panier vivent dans le
  navigateur. Les partager entre le téléphone et l'ordi demanderait un compte et
  un serveur — donc des coûts et des obligations Loi 25. L'export/import JSON de
  la page *Mon carnet* est le compromis actuel.
- **Prix réels par ingrédient** : le coût par portion est saisi à la main dans le
  frontmatter. Un fichier `prix-ingredients.json` permettrait de le calculer et
  d'afficher le coût d'une liste d'épicerie avec plus de justesse.
- **Rayons d'épicerie affinés** : le classement se fait par mots-clés dans
  `src/lib/epicerie.ts`. Ajouter un mot-clé quand un ingrédient tombe dans
  « À vérifier ».
- **Substitutions** : proposer un remplacement courant (beurre d'arachide →
  beurre de graines de tournesol) directement dans la liste d'épicerie.

## Fait
- ~~Recherche~~ — barre de recherche sur titre, tags **et ingrédients**.
- ~~Liste d'épicerie~~ — page `/panier/`, quantités additionnées par rayon.
- ~~Impression~~ — feuille de style d'impression globale.
- ~~Plus de catégories~~ — Déjeuners et Collations ajoutés le 2026-08-03.
