---
version: alpha
name: Bentofolio Design System
description: Portfolio multi-écrans avec CV A4, navigation bento et surfaces zinc sobres.
colors:
  background: "#f0f0f3"
  surface: "#ffffff"
  inset: "#f4f4f6"
  text: "#111113"
  muted: "#6b6b76"
  border: "#dcdce0"
  accent: "#6366f1"
  darkBackground: "#0a0a0c"
  darkSurface: "#16161a"
typography:
  display:
    fontFamily: "Syne, sans-serif"
    fontWeight: 800
    lineHeight: 1.1
  body:
    fontFamily: "SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: 15px
    lineHeight: 1.55
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
rounded:
  xs: 4px
  sm: 6px
  md: 10px
  lg: 14px
  xl: 20px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 16px
  tag:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.text}"
    rounded: "999px"
    padding: 6px
  cv-skill-grid:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: 0px
---

## Overview

Bentofolio est un portfolio personnel sobre et dense, construit autour de surfaces zinc, d’une typographie display expressive et d’un CV A4 imprimable. Les écrans doivent préserver une sensation premium, technique et éditoriale sans ajouter d’ornement générique.

## Colors

Utiliser la gamme zinc comme base : fond clair `#f0f0f3`, cartes blanches, texte quasi-noir `#111113`, bordures légères et accent violet `#6366f1` pour les états actifs et catégories techniques.

## Typography

Syne sert aux titres et libellés forts. La police système SF Pro Display garde les contenus denses lisibles, notamment dans le CV. JetBrains Mono est réservé aux détails techniques ou signatures code.

## Layout

Les pages portfolio favorisent des grilles bento responsives. Le CV est un format A4 fixe : toute correction doit protéger la lisibilité imprimable et éviter les retours de ligne inattendus dans les sections compactes.

## Components

- Cartes : fond blanc, bordure zinc, rayon moyen à large.
- Tags : pills compacts, couleurs techniques uniquement quand elles aident au scan.
- CV skills : cinq catégories en une rangée, libellés non cassants, tags densifiés.
- Focus : outline visible teinté par l’accent.

## Data Architecture

Les donnees projet sont centralisees dans `config.json` :

```
config.json            # Source unique : projets, liens, apparence, CV, contact
app/
├── data.js            # Runtime config via config-runtime.js
├── config-runtime.js  # Resolution preview/iframe, validation postMessage
├── cv-selection.js    # Selection projets CV (featured flag uniquement)
└── admin-save.js      # Sauvegarde disque + cleanup overrides
```

### Categories

| ID | Label | Icône | Couleur |
|----|-------|-------|---------|
| dev | Développement | code | #6366f1 |
| webdesign | Web Design | palette | #ec4899 |
| 3d | 3D & Motion | cube | #f59e0b |
| ai | IA & Data | brain | #10b981 |
| tools | Outils | wrench | #8b5cf6 |
| devops | DevOps | server | #06b6d4 |

### Ajout d'un projet

1. Ouvrir le dashboard admin (`/#/admin`) avec le mot de passe `bento`
2. Aller dans la section **Projets** et cliquer **Nouveau projet**
3. Remplir les champs et sauvegarder (ecriture dans `config.json`)
4. Lancer `bun run build` pour regenerer le site statique

Le dashboard admin gere aussi les images projet, l'apparence, le CV et les liens sociaux.

### Tokens CSS categories

Toutes les catégories doivent avoir une variable `--cat-{id}` définie dans `styles.css` :

| Variable | Valeur | Utilisée par |
|----------|--------|-------------|
| --cat-dev | #6366f1 | data.js, bridge |
| --cat-webdesign | #0055ff | data.js |
| --cat-3d | #14b8a6 | data.js |
| --cat-animation | #ea4b71 | data.js |
| --cat-logo | #f59e0b | data.js |
| --cat-tooling | #7c3aed | data.js (legacy) |
| --cat-tools | #8b5cf6 | bridge, index.ts |
| --cat-devops | #06b6d4 | bridge, index.ts |
| --cat-ai | #10b981 | bridge, index.ts |

### Coherence des donnees

**Source de verite unique** : `config.json`
Le dashboard admin ecrit directement dans `config.json` et `bun run build` l'embarque dans le build de production. Aucune autre source de donnees projet n'est acceptee.

Champs obligatoires par projet pour compatibilite CV : `id`, `name`, `categories[]`, `techs[{label, tech}]`, `role`, `period`, `duration`, `highlights[]`, `image`.

## Do's and Don'ts

Do preserver le systeme de tokens CSS existant. Do garder les corrections CV ciblees et imprimables. Do utiliser `config.json` comme source unique de verite pour les donnees projet. Don't introduire de palette externe, de police non prevue ou de composants decoratifs sans role.