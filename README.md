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
categorie: Poulet          # Poulet | Poisson | Végé | Dessert | Soupers 30 min
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
illustration: poulet       # optionnel : poulet, poisson, vege, casserole, dessert, pates
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

- La `categorie` doit être l'une des cinq valeurs listées (sinon le build
  s'arrête avec un message clair). Les couleurs et l'illustration s'appliquent
  automatiquement selon la catégorie.
- Mets un **chiffre au début** de chaque ingrédient (`2 carottes`, `1,5 tasse`,
  `1/2 c. à thé`) : le site ajuste les quantités quand on change les portions.
- Le **visuel est généré** (illustration SVG maison), jamais de photo. Deux cas :
  - **Rien à faire** : sans visuel dédié, le site affiche automatiquement
    l'illustration de la catégorie (couleur de fond + dessin). C'est le défaut.
  - **Visuel dédié** : dépose un SVG au nom de la recette dans `src/visuels/`
    (ex. `mon-souper.md` → `src/visuels/mon-souper.svg`) et il remplace le
    défaut. C'est là que le skill *generateur-visuel-recette* dépose ses
    fichiers, en réutilisant la banque d'icônes `src/visuels/icones/`.
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

## 3. Déployer gratuitement sur Cloudflare Pages

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

## 4. Où se trouve quoi

| Tu veux…                         | Va dans…                              |
|----------------------------------|---------------------------------------|
| Ajouter / éditer une recette     | `src/content/recettes/*.md`           |
| Ajouter / éditer un article      | `src/content/blog/*.md`               |
| Déposer le visuel d'une recette  | `src/visuels/<slug>.svg`              |
| Enrichir la banque d'icônes      | `src/visuels/icones/*.svg`            |
| Changer les couleurs/illustrations | `src/lib/categories.ts`             |
| Changer le style global          | `src/styles/global.css`               |
| Modifier une page                | `src/pages/…`                         |
| Voir les idées futures           | `BACKLOG.md`                          |

Le design (couleurs, badges, illustrations, polices Fraunces + DM Mono) provient
du composant importé depuis Claude Design et vit dans les composants
`src/components/`.
