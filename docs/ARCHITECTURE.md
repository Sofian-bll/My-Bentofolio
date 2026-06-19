# Architecture — Bentofolio

## Overview

Bentofolio est une **Single Page Application** React 18 construite avec Vite 6, utilisant un **routeur hash** (`location.hash`) pour la navigation côté client. Le build produit est **100% statique** (`dist/`) déployable sur GitHub Pages. Un **dashboard admin** est disponible uniquement en développement via un plugin Vite qui expose des endpoints API d'écriture sur disque.

Principes clés :
- **Hash routing** : pas de serveur nécessaire, compatible GitHub Pages
- **Static build** : HTML + JS + CSS, zéro backend en production
- **Dev-only admin** : les composants admin sont tree-shaken en build prod
- **Single source of truth** : `config.json` pour les données site, `content/projects/` pour les projets

---

## File Structure

```
My-Bentofolio/
├── App.jsx                          # Point d'entrée (importe app/app.jsx)
├── index.html                       # Template Vite, charge App.jsx
├── vite.config.ts                   # Config Vite : base path, plugins
├── vite-admin-plugin.ts             # Plugin Vite : 4 endpoints dev-only
├── config.json                      # Données canoniques du site
├── package.json                     # Scripts, dépendances
├── playwright.config.js             # Config Playwright E2E
│
├── content/
│   └── projects/
│       ├── order.json               # Ordre d'affichage des projets
│       ├── index.json               # Index généré (build artifact)
│       └── <project-id>/
│           ├── project.json         # Métadonnées du projet
│           └── case-study.md        # Étude de cas markdown
│
├── app/
│   ├── app.jsx                      # Shell applicatif (router, theme, nav, footer)
│   ├── data.js                      # Module DATA : charge config, exporte DATA + APP_CONFIG
│   ├── config-runtime.js            # Résolution de config (preview iframe, postMessage)
│   ├── admin.jsx                    # Dashboard admin (tree-shaken en prod)
│   ├── admin-save.js                # POST /api/admin/save
│   ├── admin-project-save.js        # POST /api/admin/project/save|delete
│   ├── home.jsx                     # Vue Accueil (bento grid)
│   ├── projects.jsx                 # Vues Projets (galerie + détail)
│   ├── experiences.jsx              # Vue Expériences (timeline)
│   ├── cv.jsx                       # Vue CV A4 imprimable
│   ├── contact.jsx                  # Vue Contact
│   ├── ui.jsx                       # Composants UI partagés (Icon, Cell, TechTag…)
│   ├── markdown-renderer.jsx        # Rendu markdown → React
│   ├── project-content-loader.js    # Chargement projets depuis content/
│   ├── project-gallery.js           # Logique affichage galerie projets
│   ├── cv-selection.js              # Sélection projets CV (flag featured)
│   ├── tweaks-panel.jsx             # Hook de tweaks visuels runtime
│   ├── styles.css                   # Design system : variables CSS, thème, reset
│   ├── components.css               # Styles composants (cards, tags, boutons…)
│   ├── pages.css                    # Styles pages
│   └── dashboard.css                # Styles dashboard admin
│
├── e2e/
│   ├── tests.js                     # Tests E2E Playwright
│   ├── visual-audit.js              # Audit visuel
│   └── css-metrics.js               # Validation tokens CSS
│
├── public/
│   ├── favicon.svg
│   └── media/projects/<id>/         # Images projets uploadées via admin
│
├── DESIGN.md                        # Référence design system
├── SKILL.md                         # Conventions agents IA
├── ENVIRONMENT.md                   # Notes environnement / commands
└── MEMORY.md                        # Mémoire projet (décisions, état)
```

---

## Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      DISK (dev only)                         │
│                                                              │
│  config.json  ──────────────────────────────────────────┐    │
│  content/projects/order.json ───┐                       │    │
│  content/projects/<id>/         │                       │    │
│    project.json ────────────────┤                       │    │
│    case-study.md ───────────────┤                       │    │
│                                 │                       │    │
│  ┌──────────────────────────────┴───────────────────────┤    │
│  │            vite-admin-plugin.ts                       │    │
│  │                                                      │    │
│  │  POST /api/admin/save               → config.json    │    │
│  │  POST /api/admin/upload             → public/media/  │    │
│  │  POST /api/admin/project/save       → content/       │    │
│  │  POST /api/admin/project/delete     → content/       │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    app/data.js                               │
│                                                              │
│  ┌─────────────────┐    ┌──────────────────────┐             │
│  │ config.json      │    │ content/projects/    │             │
│  │ (default import) │    │ index.json           │             │
│  └────────┬─────────┘    │ (default import)     │             │
│           │              └──────────┬───────────┘             │
│           │              ┌──────────▼───────────┐             │
│           │              │ project-content-     │             │
│           │              │ loader.js            │             │
│           │              │ (Vite glob import)   │             │
│           │              └──────────┬───────────┘             │
│           └──────────┬──────────────┘                         │
│                      ▼                                        │
│           ┌──────────────────────┐                            │
│           │ resolveAppConfig()   │                            │
│           │ (merge, preview)     │                            │
│           └──────────┬───────────┘                            │
│                      ▼                                        │
│  ┌─────────────────────────────────────────────┐              │
│  │               DATA object                    │              │
│  │  personalInfo, contactInfos, socialLinks,    │              │
│  │  skillGroups, formations, interests,         │              │
│  │  categories, projects, experiences,          │              │
│  │  profile, sectionLabels                      │              │
│  └─────────────────────────────────────────────┘              │
│                      │                                        │
│  ┌───────────────────▼─────────────────────────┐              │
│  │           APP_CONFIG object                  │              │
│  │  La config brute + preview overrides         │              │
│  └─────────────────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   React Components                            │
│                                                              │
│  Views import { DATA, APP_CONFIG } from './data.js'          │
│  Admin imports DATA + APP_CONFIG for live preview + save     │
└──────────────────────────────────────────────────────────────┘

Live Preview Overrides (admin iframe) :
───────────────────────────────────────
  admin.jsx                preview iframe
  ┌────────────┐           ┌──────────────┐
  │buildConfig()│           │              │
  │syncLive      │──postMessage──▶│config-runtime │
  │Preview()    │  { type:     │.js           │
  │             │   __bento_  │applyLive     │
  │             │   config_   │Config()      │
  │             │   update }  │→ live DOM    │
  └────────────┘           └──────────────┘
```

---

## Component Tree

```
<App>                                    # app/app.jsx
├── <Navbar>                             # Navigation + theme toggle
│   ├── <Icon>                           # SVG inline icons
│   └── Mobile overlay
├── [Routed View]                        # Resolved from location.hash
│   ├── <HomeView>                       # /#/
│   │   ├── <Cell variant="hero">        # Bento hero card
│   │   ├── <Cell variant="photo">       # Photo de profil
│   │   ├── <Cell variant="skills">      # Groupes de compétences
│   │   │   └── <TechTag>                # Tech pill colorée
│   │   ├── <Cell variant="contact">     # Infos contact
│   │   ├── <Cell variant="formation">   # Parcours académique
│   │   ├── <Cell variant="interests">   # Centres d'intérêt
│   │   └── <Cell variant="projects">    # Projets en vedette
│   │       └── <ProjectCard>
│   ├── <ProjectsView>                   # /#/projets
│   │   ├── <CatPills>                   # Filtres par catégorie
│   │   └── <ProjectCard>[]              # Grille de cartes projet
│   ├── <ProjectDetailView>              # /#/projet/:id
│   │   ├── Header (nom, rôle, période)
│   │   ├── <TechTag>[]                  # Stack technique
│   │   ├── <CatGlyph> / <CatPill>       # Catégories
│   │   └── MarkdownRenderer             # Case study rendue
│   ├── <ExperiencesView>                # /#/experiences
│   │   └── Experience cards (timeline)
│   ├── <CvView>                         # /#/cv (format A4)
│   │   ├── Header (nom, rôle, alternance)
│   │   ├── Skills grid (5 colonnes)
│   │   ├── Featured projects
│   │   ├── Experiences
│   │   ├── Formation
│   │   └── Contact strip + interests
│   ├── <ContactView>                    # /#/contact
│   │   ├── Contact form (Formspree)
│   │   └── Info card
│   └── <AdminView>                      # /#/admin (lazy, dev only)
│       ├── Sidebar (nav, save button)
│       ├── Main (8 sections)
│       │   ├── ProjectsSection          # CRUD projets
│       │   ├── ExperiencesSection       # CRUD expériences
│       │   ├── AppearanceSection        # Accent, fonts, density, radius
│       │   ├── CvSection                # CV settings + focal points
│       │   ├── ContactSection           # Contact toggles
│       │   ├── LinksSection             # Social links
│       │   ├── ProfileSection           # Profile fields
│       │   └── BackupSection            # Export/import JSON
│       └── Preview panel                # Live iframe preview
│           └── Tab bar (Accueil, Projets, CV…)
└── <Footer>                             # Copyright, liens
```

---

## Design System

### CSS Variables (`app/styles.css`)

Le design system s'articule autour de **CSS custom properties** sur `:root`, sans préprocesseur.

#### Couleurs (Zinc Scale)

```css
--color-zinc-0: #ffffff;
--color-zinc-50: #f8f8fa;
--color-zinc-100: #f0f0f3;   /* bg-page (light) */
--color-zinc-200: #dcdce0;    /* border (light) */
--color-zinc-400: #8a8a96;
--color-zinc-500: #6b6b76;   /* text-2 (muted) */
--color-zinc-900: #111113;   /* text (light) */
--color-zinc-950: #0a0a0c;   /* bg-page (dark) */
```

#### Tokens Sémantiques

```css
--bg-page, --bg-card, --bg-inset     /* Surfaces */
--text, --text-2                      /* Texte */
--border, --border-sub                /* Bordures */
--accent, --accent-fg                 /* Accent principal */
--brand                               /* Accent brand (violet par défaut) */
```

#### Dark Mode

```css
[data-theme='dark'] {
  --bg-page: var(--color-zinc-950);
  --bg-card: rgba(22, 22, 26, 0.65);
  --text: #ededef;
  --border: rgba(255, 255, 255, 0.08);
  --accent: var(--color-zinc-0);
  --accent-fg: var(--color-zinc-950);
}
```

Le thème est stocké dans `localStorage` (`bentofolio.theme`) et appliqué via `document.documentElement.setAttribute('data-theme', theme)`.

#### Radius Presets

```css
[data-radius='net']   { --radius-xs: 2px; ... --radius-xl: 10px; }
[data-radius='rond']  { --radius-xs: 6px; ... --radius-xl: 28px; }
/* Default (doux) : 4px → 20px */
```

#### Density Presets

Gérés via `--bento-gap` CSS variable :

| Density | Gap |
|---------|-----|
| compact | 12px |
| cozy | 16px |
| large | 24px |

#### Photo Presets

Attributs `data-photo` et `data-cv-photo` sur `<html>` :

| Photo | Effet |
|-------|-------|
| compact | Photo réduite, layout dense |
| moyenne | Photo intermédiaire |
| large | Photo pleine largeur |

#### Typographie

```css
--font-display: 'Syne', sans-serif;           /* Titres, labels forts */
--font-body: 'SF Pro Display', sans-serif;    /* Texte courant */
--font-mono: 'JetBrains Mono', monospace;     /* Code, détails techniques */
```

Polices chargées depuis Google Fonts dans `index.html`.

#### Tech Colors

Chaque techno a une classe `.t-{tech}` avec sa couleur distinctive :

```css
.t-laravel { background: #ff2d20; }
.t-vue     { background: #42b883; }
.t-docker  { background: #2496ed; }
/* ... 25+ techs */
```

Les catégories de projets utilisent les variables `--cat-{id}` (dev, webdesign, 3d, ai, tools, devops, animation, logo).

---

## Admin Architecture

### Layout

Le dashboard admin (`app/admin.jsx`) utilise un layout **3 colonnes** avec redimensionnement :

```
┌──────────┬────────────────────────────────┬──────────────┐
│ Sidebar  │  Main (editable width)    ║    │   Preview    │
│          │                              ║    │   Panel      │
│ Nav:     │  Section Form               ║    │              │
│ Projets  │  ┌──────────────────────┐   ║    │ ┌──────────┐ │
│ Expér.   │  │ Fields              │   ║    │ │ Accueil  │ │
│ Apparence│  │ ...                 │   ║    │ │ Projets  │ │
│ CV       │  └──────────────────────┘   ║    │ │ CV       │ │
│ Contact  │                              ║    │ ├──────────┤ │
│ Liens    │  [Save] [Voir site]         ║    │ │ Preview  │ │
│ Profil   │  [Quitter]                  ║    │ │ (live)   │ │
│ Backup   │                              ║    │ └──────────┘ │
└──────────┴────────────────────────────────┴──────────────┘
         ←────── Resizer handle (drag) ──────→
```

### 8 Sections

| Section | ID | Description |
|---------|-----|-------------|
| Projets | `projets` | CRUD projets, upload images |
| Expériences | `experiences` | CRUD expériences pro |
| Apparence | `apparence` | Accent, display font, density, radius, photo |
| CV | `cv` | Featured projects, CV pills, photo size, max bullets, card density, focal points |
| Contact | `contact` | Formspree URL, toggles visibilité |
| Liens | `liens` | Social links (LinkedIn, GitHub) |
| Profil | `profil` | Nom, bio, alternance, skill groups, formations, interests, contactInfos, hero chips |
| Backup | `backup` | Export/import JSON complet, restore |

### Save Flow

```
User clicks "Sauvegarder"
  → buildConfig() merges draft project into project list
  → saveConfigToDisk() POST /api/admin/save → vite-admin-plugin.ts
    → writeFileSync(config.json)
  → clearAdminSaveOverrides() removes preview localStorage keys
  → Toast notification
```

Pour les projets individuels (nouveau format `content/projects/`) :

```
Save project
  → saveProjectToContent() POST /api/admin/project/save
    → writeFileSync(project.json)
    → writeFileSync(case-study.md)
    → updateProjectOrder()
    → buildProjectIndex() → index.json

Delete project
  → deleteProjectFromContent() POST /api/admin/project/delete
    → rmSync(project.json, case-study.md, project dir)
    → updateProjectOrder()
    → buildProjectIndex() → index.json
```

### Live Preview Sync

Le dashboard utilise `postMessage` pour synchroniser les changements en temps réel dans le panel de preview :

```js
// admin.jsx — à chaque changement de state (debounce 300ms)
syncLivePreview(cfg)
// → applyLiveConfig(cfg, DATA, APP_CONFIG)
//   → met à jour DATA et APP_CONFIG en mémoire
//   → modifie directement les CSS custom properties sur documentElement
```

Le preview panel **n'est pas un iframe** — il rend les composants React directement dans le même document, avec des props de navigation séparées. Cela permet une preview instantanée sans rechargement.

---

## Project Content System

### Structure

```
content/projects/
├── order.json                  # ["connect-in", "connect-in-java", ...]
├── index.json                  # Généré automatiquement
├── connect-in/
│   ├── project.json            # Métadonnées
│   └── case-study.md           # Markdown
├── connect-in-java/
│   ├── project.json
│   └── case-study.md
└── ...
```

### project.json Schema

```json
{
  "id": "connect-in",
  "name": "Connect-In",
  "categories": ["dev"],
  "techs": [
    { "label": "React", "tech": "react" }
  ],
  "role": "Développeur Full Stack",
  "period": "2025",
  "duration": "3 mois",
  "description": "Réseau social professionnel...",
  "highlights": ["Feature 1", "Feature 2"],
  "demoUrl": "https://...",
  "repoUrl": "https://github.com/...",
  "image": "media/projects/connect-in/thumb.png"
}
```

### Index Generation

Le plugin Vite génère `index.json` en lisant `order.json`, puis en chargeant chaque `project.json` et `case-study.md` correspondant. L'index est importé directement par `app/data.js`.

```ts
// vite-admin-plugin.ts
export function buildProjectIndex(root: string) {
  const order = readProjectOrder(root)
  const projects = order.map(id => {
    const project = JSON.parse(readFileSync(project.json))
    project.caseStudy = readFileSync(case-study.md) // Peut être absent
    return project
  }).filter(Boolean)
  writeFileSync('index.json', JSON.stringify(projects))
}
```

### Sanitization

Les IDs de projet sont nettoyés via `sanitizeProjectId()` : normalisation NFD, suppression accents, lowercase, remplacement caractères non-alphanumériques par `-`.

---

## Runtime Config (`app/config-runtime.js`)

### Resolution Chain

```
config.json (default import)
  ↓
resolveAppConfig(baseConfig, storage, options)
  ├── Si isPreviewFrame : lit bentofolio.preview dans localStorage
  │   └── applyPreviewConfig() merge les overrides
  └── Sinon : retourne la config brute (clone)
```

### Preview Mode

Détecté via `window.self !== window.top` (iframe). Les overrides de preview sont stockés dans `localStorage` sous la clé `bentofolio.preview`.

### postMessage Sync

L'admin envoie des mises à jour en temps réel au preview panel :

```js
// Dans l'iframe preview
window.addEventListener('message', (e) => {
  const cfg = getRuntimeConfigFromMessage(e, window)
  // Vérifie: isPreviewFrame + type === '__bento_config_update' + same origin
  if (cfg) applyLiveConfig(cfg, DATA, APP_CONFIG)
})
```

### Image Resolution

```js
export function resolveImageSrc(path) {
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return (import.meta.env.BASE_URL || '/') + path.replace(/^\//, '')
}
```

---

## Vite Plugin (`vite-admin-plugin.ts`)

Plugin Vite custom qui expose 4 endpoints HTTP en **développement uniquement** :

| Method | Endpoint | Description | Body Limit |
|--------|----------|-------------|------------|
| POST | `/api/admin/save` | Écrit `config.json` | 5 MB |
| POST | `/api/admin/upload` | Upload image projet → `public/media/` | 10 MB |
| POST | `/api/admin/project/save` | Écrit `project.json` + `case-study.md` + met à jour `order.json` + regénère `index.json` | 5 MB |
| POST | `/api/admin/project/delete` | Supprime projet (JSON, case study, dossier) + met à jour `order.json` + regénère `index.json` | 5 MB |

### Sécurité

- Validation JSON stricte (`parseConfigBody`)
- Limite de taille de payload HTTP
- Sanitization des IDs projet (pas de `..`, `/`, `\\`)
- Gestion des erreurs de stream
- Les endpoints ne sont **jamais inclus** en build production (plugin Vite dev-only)

---

## Build Pipeline

```
bun run build
  ↓
vite build
  ├── Plugin: @vitejs/plugin-react (JSX transform)
  ├── Plugin: bentofolio-admin (non inclus en build)
  ├── Base path: /My-Bentofolio/
  ├── Entry: index.html → App.jsx → app/app.jsx
  ├── Tree-shaking: AdminView (React.lazy, import.meta.env.DEV gard)
  │   → Composants admin exclus du bundle final
  ├── CSS: styles.css + components.css + pages.css + dashboard.css
  │   → Bundle optimisé avec purge des sélecteurs inutilisés
  └── Output: dist/
      ├── index.html
      ├── assets/index-{hash}.js
      ├── assets/index-{hash}.css
      └── public/ (copié tel quel)
```

### Admin Tree-Shaking

```jsx
// app/app.jsx
const AdminView = import.meta.env.DEV
  ? React.lazy(() => import('./admin.jsx'))
  : null;

// En production, import.meta.env.DEV est false
// → AdminView = null → jamais importé → tree-shaken
```

---

## Key Conventions

### No External Icon Libraries

Toutes les icônes sont des **SVG inline** définies dans le composant `Icon` (`app/ui.jsx`). Le composant expose 40+ icônes (lucide-style). Aucune dépendance externe (pas de `lucide-react`, `react-icons`, etc.).

### CSS Token System

Tous les styles utilisent les **variables CSS** définies dans `styles.css`. Aucune valeur codée en dur dans les composants pour les couleurs, espacements, radius, polices.

```jsx
// Correct : utiliser les variables CSS
<div style={{ color: 'var(--text-2)', padding: 'var(--s4)' }}>

// Incorrect : valeur codée en dur
<div style={{ color: '#6b6b76', padding: '16px' }}>
```

### A4 CV Constraints

Le CV (`app/cv.jsx`) est conçu pour un **format A4 imprimable** (210×297mm). Règles :
- Contenu fixe, pas de scroll interne
- Sections compactes sans retours de ligne inattendus
- 5 colonnes de skills maximum
- Projets sélectionnés via le flag `featured` (pas de picker localStorage)
- `@media print` masque la navbar et les éléments `.no-print`

### Single Source of Truth

`config.json` est la **source unique de vérité**. Le dashboard admin écrit directement dans ce fichier via l'API Vite. `bun run build` l'embarque dans le bundle de production. Aucune autre source de données n'est acceptée.

### ESM Modules

Tous les fichiers sont des **ES modules** (`"type": "module"` dans `package.json`). Utilisation de `import`/`export` natifs, pas de `require()`.

### Bun-First

Le projet utilise **Bun** comme package manager, test runner (`bun test`), et pour l'exécution des scripts. Pas de dépendance à npm/yarn/pnpm pour les opérations courantes.
