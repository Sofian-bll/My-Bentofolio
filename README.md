# Bentofolio

Portfolio personnel React/Vite avec bento grid, CV A4 imprimable et dashboard admin intégré. Design zinc sobre, typographie Syne, dark mode natif.

[![React](https://img.shields.io/badge/React-18.3-%236366f1?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-%23646cff?logo=vite)](https://vitejs.dev)
[![Bun](https://img.shields.io/badge/Bun-runtime-%23fbf0df?logo=bun)](https://bun.sh)
[![Playwright](https://img.shields.io/badge/E2E-Playwright-%2345ba4b?logo=playwright)](https://playwright.dev)

## Quick Start

```bash
bun install
bun dev
```

Ouvrir http://localhost:5173/

## Routes

| Hash | Vue | Description |
|------|-----|-------------|
| `/#/` | Accueil | Bento grid hero, skills, contact, projets |
| `/#/projets` | Projets | Galerie projets filtrable par catégorie |
| `/#/projet/:id` | Détail projet | Page complète avec case study markdown |
| `/#/experiences` | Expériences | Timeline des expériences pro |
| `/#/cv` | CV | Format A4 imprimable avec sélection projets |
| `/#/contact` | Contact | Formulaire Formspree + infos |
| `/#/admin` | Admin | Dashboard mini-CMS (dev only) |

Mot de passe admin : `bento` (dev uniquement — tree-shaken en production)

## Build

```bash
bun run build
```

Le dossier `dist/` est prêt à être déployé sur GitHub Pages. Base path configuré dans `vite.config.ts` : `/My-Bentofolio/`.

```bash
bun run preview   # Prévisualiser le build production
```

## Tests

```bash
bun test           # Tests unitaires (bun test runner)
bun run test:e2e   # Tests end-to-end (Playwright)
```

## Project Structure

```
├── App.jsx                    # Entry point → app/app.jsx
├── index.html                 # Vite HTML template
├── vite.config.ts             # Vite config + admin plugin
├── vite-admin-plugin.ts       # Dev API endpoints (save, upload, project CRUD)
├── config.json                # Single source of truth (site settings)
├── content/
│   └── projects/
│       ├── order.json         # Project display order
│       ├── index.json         # Generated project index (build artifact)
│       └── <id>/
│           ├── project.json   # Project metadata
│           └── case-study.md  # Project case study (markdown)
├── app/
│   ├── app.jsx                # App shell: router, theme, nav, footer
│   ├── data.js                # DATA + APP_CONFIG exports
│   ├── config-runtime.js      # Config resolution (preview, postMessage)
│   ├── admin.jsx              # Admin dashboard (2-column layout)
│   ├── admin-save.js          # Save config to disk via Vite plugin
│   ├── admin-project-save.js  # Project CRUD via Vite plugin
│   ├── home.jsx               # Home page (bento grid)
│   ├── projects.jsx           # Projects gallery + detail view
│   ├── experiences.jsx        # Experiences timeline
│   ├── cv.jsx                 # A4 CV view
│   ├── contact.jsx            # Contact form
│   ├── ui.jsx                 # Shared UI primitives (Icon, TechTag, Cell…)
│   ├── markdown-renderer.jsx  # Markdown → React renderer
│   ├── project-content-loader.js  # Vite glob → project list
│   ├── project-gallery.js     # Project display logic
│   ├── cv-selection.js        # CV featured project selection
│   ├── tweaks-panel.jsx       # Visual tweaks hook
│   ├── styles.css             # Design system CSS variables + theme
│   ├── components.css         # Component styles
│   ├── pages.css              # Page layout styles
│   └── dashboard.css          # Admin dashboard styles
├── e2e/
│   ├── tests.js               # Playwright E2E tests
│   ├── visual-audit.js        # Visual regression checks
│   └── css-metrics.js         # CSS design token validation
└── public/
    └── media/projects/        # Project images
```

## Content Management

### config.json

Fichier unique contenant :
- **profile** — nom, bio, alternance, skills, formations, centres d'intérêt
- **projects** — tableau des projets (métadonnées)
- **experiences** — expériences professionnelles
- **socialLinks** — liens sociaux (LinkedIn, GitHub)
- **appearance** — accent, display font, density, radius, photo
- **cv** — featured project IDs, pill style, photo size, max bullets, card density
- **contact** — Formspree URL, visibilité statut/téléphone/type
- **photo** — URL de la photo de profil

### Projets

Chaque projet vit dans `content/projects/<id>/` :

```
content/projects/<id>/
├── project.json    # { id, name, categories[], techs[], role, period, duration,
                    #   description, highlights[], demoUrl, repoUrl, image }
└── case-study.md   # Étude de cas markdown rendue dans la page détail
```

L'ordre d'affichage est géré par `content/projects/order.json`. L'index `content/projects/index.json` est généré automatiquement par le plugin Vite.

### Dashboard Admin

Accessible via `/#/admin` (mot de passe `bento`, dev only). Interface 2 colonnes :
- **Sidebar gauche** : navigation par section + bouton sauvegarde
- **Zone centrale** : formulaires d'édition (8 sections : Projets, Expériences, Apparence, CV, Contact, Liens, Profil, Backup)
- **Preview droite** : rendu live du site avec navigation entre les pages

## Tech Stack

| Technologie | Usage |
|-------------|-------|
| React 18.3 | UI framework |
| Vite 6 | Build tool & dev server |
| Bun | Package manager & test runner |
| Playwright | E2E testing |
| CSS Custom Properties | Design system tokens |
| Markdown | Case studies rendering |

## Design System

- `DESIGN.md` — Tokens couleurs, typographie, composants, conventions
- `SKILL.md` — Conventions pour agents IA
- `app/styles.css` — Variables CSS, thème light/dark, reset, composants de base
- `app/components.css` — Styles des composants réutilisables
- `app/pages.css` — Styles des pages
- `app/dashboard.css` — Styles du dashboard admin

Palette zinc, police display Syne + SF Pro Display, accent violet `#6366f1`. Pas de librairie d'icônes externe — les icônes sont des SVG inline via le composant `Icon`.
