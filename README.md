# Le carnet de recettes

Site de recettes pour **familles occupées** (français, Québec). Recettes
rapides, budget maîtrisé, approuvées par les enfants. Site **statique** bâti
avec [Astro](https://astro.build) — aucune base de données, aucun service payant.

Le contenu (recettes) est en Markdown, **séparé du design**, pour être facile à
générer et à éditer.

---

## 1. Lancer le site en local

> Node.js est déjà installé sur cette machine via **nvm**. Si tu ouvres un
> nouveau terminal et que `npm` est introuvable, tape d'abord :
> ```bash
> export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
> ```

```bash
npm install     # la première fois seulement (installe les dépendances)
npm run dev      # démarre le site en local
```

Ouvre ensuite **http://localhost:4321** dans ton navigateur. Le site se
rafraîchit tout seul quand tu modifies un fichier.

Autres commandes :

```bash
npm run build    # construit le site final dans dist/ (ce que Cloudflare publie)
npm run preview  # prévisualise le résultat du build
```

---

## 2. Ajouter une recette

Une recette = **un fichier Markdown** dans `src/content/recettes/`.
Le nom du fichier devient l'adresse : `poulet-legumes-au-four.md` →
`/recettes/poulet-legumes-au-four/`.

Copie une recette existante et modifie l'entête (le « moule ») :

```yaml
---
titre: Mon nouveau souper
categorie: Poulet          # Poulet | Bœuf & porc | Poisson | Végé | Déjeuners | Collations | Dessert
temps_total: 40            # minutes — affiché en gros
temps_prep: 15
temps_cuisson: 25
portions: 4
cout_par_portion: 2.50     # affiché « approximatif »
aime_des_enfants: true
se_congele: false
tags:
  - rapide
  - une seule plaque
illustration: poulet       # optionnel : poulet, poisson, vege, casserole, dessert, pates, dejeuner, collation
macros:
  calories: 400
  proteines: 30
  glucides: 25
  lipides: 18
date_publication: 2026-07-22
---

## Ingrédients

- 2 poitrines de poulet
- 1 oignon
- ...

## Préparation

1. Première étape...
2. Deuxième étape...

## Notes

- **Se congèle** jusqu'à 3 mois.
- Astuce...
```

**Points importants :**

- La `categorie` doit être l'une des sept valeurs listées (sinon le build
  s'arrête avec un message clair). Les couleurs et l'illustration s'appliquent
  automatiquement selon la catégorie.
- **Ajouter une catégorie** se fait à deux endroits, et seulement deux :
  1. une entrée dans `CATEGORIES` de `src/lib/categories.ts` (libellé, slug,
     couleur, illustration par défaut) ;
  2. le même libellé dans l'énumération `categorie` de `src/content.config.ts`.

  La page de catégorie, la couleur, la puce de filtre et le plan du site
  suivent tout seuls au prochain build. Pense à déposer l'icône correspondante
  dans `src/visuels/icones/`.
- Mets un **chiffre au début** de chaque ingrédient (`2 carottes`, `1,5 tasse`,
  `1/2 c. à thé`) : le site ajuste les quantités quand on change les portions.
- Le **visuel se génère tout seul**, jamais de photo : un emblème rond à la
  couleur de la catégorie, avec son icône. **Rien à faire** dans le cas normal.
  Pour changer l'icône d'une recette en particulier, mets le champ
  `illustration:` (un nom de fichier de `src/visuels/icones/`).
  Voir [`src/visuels/README.md`](src/visuels/README.md).
- Le balisage Schema.org, le plan `llms.txt` et le plan du site se mettent à
  jour **tout seuls** à partir de tes fichiers.

Pour vérifier : lance `npm run dev` et va voir ta recette. Si quelque chose
cloche dans l'entête, le terminal te dira exactement quelle ligne corriger.

### Ajouter un article de blogue

Même principe, dans `src/content/blog/`. Entête plus simple :

```yaml
---
titre: Mon article
description: Résumé en une phrase.
date_publication: 2026-07-22
tags:
  - organisation
---
```

---

## 3. Les fonctions « perso » du site

Trois choses vivent **dans le navigateur de la visiteuse**, jamais sur un
serveur : aucun compte, aucune donnée personnelle collectée, rien à déclarer
au titre de la Loi 25. La contrepartie assumée : vider le cache efface tout,
d'où le bouton d'export.

| Fonction | Où | Ce que ça fait |
|----------|-----|----------------|
| **Favoris** | cœur sur chaque carte et page-recette | épingle la recette dans `/mon-carnet/` |
| **Ma note** | bas de chaque page-recette | note privée (« doubler la sauce ») |
| **Ma liste** | icône panier + page `/panier/` | additionne les ingrédients des recettes choisies |

La page `/panier/` fait le vrai travail : elle ajuste les quantités au nombre de
portions voulu, **additionne les ingrédients identiques** entre les recettes et
classe le tout par rayon d'épicerie. La liste se coche, se copie et s'imprime.

Deux garde-fous à connaître :

- La fusion n'a lieu que si le **nom ET l'unité** concordent. Dans le doute, on
  garde deux lignes — une liste un peu longue est bénigne, une quantité fusionnée
  à tort ne l'est pas.
- Un ingrédient dont le rayon est inconnu tombe dans **« À vérifier »** plutôt que
  d'être rangé au hasard. Pour le classer, ajoute un mot-clé dans `RAYONS`
  (`src/lib/epicerie.ts`).

Pour que la mise à l'échelle fonctionne, chaque ingrédient doit **commencer par
un chiffre** (`2 carottes`, `1,5 tasse`, `1/2 c. à thé`).

---

## 4. Déployer gratuitement sur Cloudflare Pages

Le site est prêt pour un déploiement automatique **gratuit**.

1. **Mets le code sur GitHub** (une fois) :
   ```bash
   git add -A
   git commit -m "Première version du carnet de recettes"
   # crée un dépôt vide sur github.com, puis :
   git remote add origin https://github.com/<ton-compte>/carnet-de-recettes.git
   git push -u origin main
   ```
2. Va sur **[Cloudflare Pages](https://pages.cloudflare.com)** → *Create a
   project* → *Connect to Git* → choisis ton dépôt.
3. Configuration de build :
   - **Framework preset** : `Astro`
   - **Build command** : `npm run build`
   - **Output directory** : `dist`
4. *Save and Deploy*. Chaque `git push` sur `main` redéploie le site tout seul.

Une fois en ligne, tu peux remplacer l'adresse dans `astro.config.mjs`
(`site: ...`) par ton vrai domaine, pour des liens SEO et un plan de site exacts.

> **Statistiques (optionnel)** : Cloudflare Web Analytics s'active en 2 minutes
> depuis le tableau de bord Cloudflare, sans toucher au code.

---

## 5. Où se trouve quoi

| Tu veux…                         | Va dans…                              |
|----------------------------------|---------------------------------------|
| Ajouter / éditer une recette     | `src/content/recettes/*.md`           |
| Ajouter / éditer un article      | `src/content/blog/*.md`               |
| Enrichir la banque d'icônes      | `src/visuels/icones/*.svg`            |
| Ajouter une catégorie / une couleur | `src/lib/categories.ts` + `src/content.config.ts` |
| Corriger un rayon d'épicerie     | `src/lib/epicerie.ts`                 |
| Changer le style global / l'impression | `src/styles/global.css`         |
| Modifier une page                | `src/pages/…`                         |
| Voir les idées futures           | `BACKLOG.md`                          |

Le design (couleurs, badges, illustrations, polices Fraunces + DM Mono) provient
du composant importé depuis Claude Design et vit dans les composants
`src/components/`.
