# Bentofolio — Development Guide

Architecture, conventions, and how to extend the codebase.

## Project Structure

```
.
├── index.html              # Vite HTML entry point (loads App.jsx)
├── App.jsx                 # Source entry (imports app/app.jsx)
├── vite.config.ts          # Vite config: React plugin, admin plugin, base path
├── vite-admin-plugin.ts    # Dev server middleware: save/upload/delete endpoints
├── config.json             # Single source of truth: portfolio data
├── package.json            # Dependencies: React 18, Vite 6, Playwright
├── DESIGN.md               # Design system reference (colors, typography, tokens)
├── SKILL.md                # AI agent conventions
├── MEMORY.md               # Project state snapshot
├── playwright.config.js    # E2E test configuration
│
├── app/                    # Application source (React components + logic)
│   ├── app.jsx             # App shell: router, nav, theme, footer, tweaks
│   ├── data.js             # Loads config.json, exports DATA + APP_CONFIG
│   ├── config-runtime.js   # Config resolution: preview iframe, postMessage, storage
│   ├── cv-selection.js     # Filters projects for CV (featured flag only)
│   ├── admin-save.js       # Save config to disk via /api/admin/save
│   ├── admin-project-save.js   # Save/delete projects via admin plugin endpoints
│   ├── project-content-loader.js  # Builds project list from content/ directory
│   ├── project-gallery.js  # Gallery state: filtering, sorting by category
│   ├── markdown-renderer.jsx   # Markdown → HTML component
│   ├── case-study-renderer.js  # Renders case study blocks
│   ├── home.jsx            # Home page: bento grid with hero, skills, projects
│   ├── projects.jsx        # Project gallery + detail views
│   ├── experiences.jsx     # Professional experiences page
│   ├── cv.jsx              # A4 CV page
│   ├── contact.jsx         # Contact form page
│   ├── admin.jsx           # Admin dashboard (lazy-loaded, tree-shaken in prod)
│   ├── ui.jsx              # Shared UI components: Icon, Badge, Chip, TechTag, etc.
│   ├── tweaks-panel.jsx    # Runtime theme/display tweaks hook
│   ├── styles.css          # CSS design system: variables, reset, components, utilities
│   ├── components.css      # Shared component styles
│   ├── pages.css           # Page-specific styles
│   ├── dashboard.css       # Admin dashboard styles
│   └── assets/             # Static assets (mockups, etc.)
│
├── content/                # File-based content (project definitions)
│   └── projects/
│       ├── index.json      # Auto-generated project index (from build step)
│       ├── order.json      # Project display order (array of IDs)
│       └── <project-id>/   # One directory per project
│           ├── project.json    # Project metadata
│           └── case-study.md   # Markdown case study
│
├── public/                 # Static public assets
│   ├── favicon.svg
│   └── photo.jpg
│
├── e2e/                    # End-to-end tests (Playwright)
│   ├── tests.js            # Main test suites
│   └── screenshots/        # Reference screenshots
│
├── docs/                   # Documentation (SETUP.md, DEVELOPMENT.md, TESTING.md)
├── dist/                   # Production build output (gitignored)
└── .github/workflows/      # CI/CD: GitHub Pages deploy
    └── deploy.yml
```

## Code Conventions

### JSX Components

- All components use **React 18** with functional components and hooks
- Components are exported as **named exports** (not default), e.g. `export function HomeView({ navigate })`
- Pages receive `navigate` and `openProject` as props for routing
- Shared UI primitives live in `app/ui.jsx`: `Icon`, `Badge`, `Chip`, `TechTag`, `SectionTitle`, `CatGlyph`, `CatPill`, `CatPills`
- Admin dashboard components are colocated in `app/admin.jsx`

### CSS Variables

- **Never hardcode colors.** Always reference CSS custom properties from `app/styles.css`.
- Semantic tokens: `--bg-page`, `--bg-card`, `--text`, `--text-2`, `--border`, `--accent`, `--brand`
- Brand category tokens: `--cat-dev`, `--cat-webdesign`, `--cat-3d`, `--cat-animation`, `--cat-logo`, `--cat-tooling`, `--cat-tools`, `--cat-devops`, `--cat-ai`
- Tech-specific colors: `.t-laravel`, `.t-vue`, `.t-java`, `.t-docker`, etc.
- Dark theme: all variables are overridden under `[data-theme='dark']` in `styles.css`
- Radius and spacing scales are also tokenized (`--radius-lg`, `--s4`, etc.)

### config.json as Single Source of Truth

All portfolio data lives in `config.json`. The admin dashboard writes directly to it during dev. At build time, it's bundled into the static output. Runtime resolution handles preview (iframe `postMessage`), localStorage overrides, and featured project marking via `app/config-runtime.js`.

## How to Add a New Page

1. **Create the component** — Add a new file in `app/`, e.g. `app/blog.jsx`:
   ```jsx
   import React from 'react'
   import { Icon } from './ui.jsx'

   export function BlogView({ navigate }) {
     return (
       <main className="page-wrap">
         <button className="back-link" onClick={() => navigate('/')}>
           <Icon name="arrowLeft" size={16} /> Retour
         </button>
         <h1 className="page-title">Blog</h1>
       </main>
     )
   }
   ```

2. **Register the route** — Import and wire it in `app/app.jsx`:
   ```jsx
   import { BlogView } from './blog.jsx'
   // Inside the route dispatch in App():
   else if (route === '/blog') view = <BlogView navigate={navigate} />
   ```

3. **Add to navigation** — Optionally add a link in the `NAV` array in `app/app.jsx`.

4. **Add page styles** — Add any new styles in `app/pages.css`.

## How to Add a Project

### Via Admin Dashboard (recommended during dev)

1. Run `bun dev`
2. Navigate to `http://localhost:5173/#/admin`
3. Login with password `bento`
4. Go to the **Projets** section and click **Ajouter**
5. Fill in the form and click **Enregistrer**

This creates:
- `content/projects/<id>/project.json` — project metadata
- `content/projects/<id>/case-study.md` — markdown case study
- Updates `content/projects/order.json` — display order
- Regenerates `content/projects/index.json` — project index

### Manually

1. Create `content/projects/<id>/project.json`:
   ```json
   {
     "id": "my-project",
     "name": "My Project",
     "categories": ["dev"],
     "featured": true,
     "role": "Solo",
     "period": "2025",
     "duration": "3 sem.",
     "description": "**Brief** description in markdown.",
     "caseStudyBlocks": [],
     "demoUrl": "https://...",
     "repoUrl": "https://github.com/...",
     "techs": [
       { "label": "React", "tech": "react" },
       { "label": "Vite", "tech": "vite" }
     ],
     "highlights": ["Point 1", "Point 2", "Point 3"],
     "image": "media/projects/my-project/cover.jpg"
   }
   ```

2. Create `content/projects/<id>/case-study.md` with the full case study in markdown.

3. Add the project ID to `content/projects/order.json`.

## How to Add a Skill

Skills are defined in `config.json` → `profile.skillGroups`. Each group has:
- `category`: label for the skill group (e.g. "Dev Web")
- `skills[]`: array of `{ label, tech }` objects

Use the admin dashboard (**Profil** → **Competences**) to add/edit skill groups and skills, or edit `config.json` directly.

The `tech` key maps to a CSS class `.t-{tech}` for colored tags. Available tech keys: `laravel`, `vue`, `java`, `go`, `tailwind`, `shadcn`, `mysql`, `docker`, `git`, `linux`, `bash`, `nvim`, `figma`, `framer`, `python`, `rag`, `n8n`, `blender`, `three`, `js`, `ts`, `shopify`, `ae`, `illustrator`, `default`, `soft`, `node`, `sops`.

## How to Add a Category

1. **Add to `app/data.js`** — Add a new entry to the `categories` object:
   ```js
   const categories = {
     // ...
     datascience: { label: 'Data Science', color: 'var(--cat-datascience)', glyph: 'barChart' },
   }
   ```

2. **Add CSS variable** — In `app/styles.css`, add `--cat-datascience: #yourColor;`.

Categories are used for project filtering and CV badges. The glyph name maps to an icon in the `Icon` component's SVG set.

## Design System

Follow the design tokens defined in `DESIGN.md` and `app/styles.css`:

- **Colors**: Zinc-based palette (`--color-zinc-*`), brand accent (`--brand` → defaults to `--cat-dev`)
- **Typography**: `Syne` (display), `SF Pro Display` (body), `JetBrains Mono` (code)
- **Spacing**: `--s1` to `--s12` scale based on 4px increments
- **Radius**: `--radius-xs` through `--radius-xl`, affected by `[data-radius]` attribute
- **Shadows**: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- **Theme**: Light/dark via `[data-theme='dark']`
- **Layout**: Bento grid using CSS Grid with `auto-fill` / `minmax`

**Rules:**
- Never introduce external icon libraries — use the `Icon` component for all icons
- Never add new font families — stick to Syne, SF Pro Display, JetBrains Mono
- Never change the zinc palette without updating `DESIGN.md`
- Never break the A4 CV print layout

## Admin Development

### Vite Plugin (`vite-admin-plugin.ts`)

The admin plugin runs only during `bun dev`. It provides four endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/save` | POST | Write `config.json` to disk |
| `/api/admin/upload` | POST | Upload image to `public/media/` |
| `/api/admin/project/save` | POST | Write `project.json` + `case-study.md` to `content/projects/<id>/` |
| `/api/admin/project/delete` | POST | Remove project directory and update order/index |

All endpoints validate JSON payloads and enforce size limits (5 MB for config, 10 MB for uploads).

### Admin Component (`app/admin.jsx`)

The admin is lazy-loaded via `React.lazy()` and wrapped in a dev-only guard (`import.meta.env.DEV`). In production, the entire admin module is tree-shaken.

Sections: Projets, Experiences, Apparence, Profil, CV, Contact, Liens, Backup.

### Admin Runtime Flow

1. Admin saves data via POST requests to the Vite plugin
2. Live preview updates are pushed via `applyLiveConfig()` to the in-page `DATA` object
3. The preview panel renders all pages inline (no iframe) for instant feedback
4. Admin state resets cleanly: `bentofolio.admin.auth` in localStorage

## Build Considerations

### Admin Tree-shaking

The admin component is conditionally imported:
```jsx
const AdminView = import.meta.env.DEV
  ? React.lazy(() => import('./admin.jsx'))
  : null;
```

In production builds, `import.meta.env.DEV` is `false`, so the admin code is completely dead-code-eliminated by Vite/Rollup.

### Base Path

The `base` in `vite.config.ts` is set to `/My-Bentofolio/` for GitHub Pages. Change this if deploying to a different path or custom domain.

### Output

Build output goes to `dist/`:
- `dist/index.html` — entry HTML
- `dist/assets/` — hashed JS and CSS bundles
- `dist/photo.jpg`, `dist/favicon.svg` — copied from `public/`
- `dist/media/projects/` — project images copied from `public/media/projects/`

## Git Workflow

### Commit Conventions

Use conventional commit prefixes:

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature or page |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring without behavior change |
| `test:` | Adding or updating tests |
| `docs:` | Documentation changes |
| `style:` | CSS/visual changes only |
| `chore:` | Build, CI, or config changes |

### Example

```
feat: add experiences page with detail modal
fix: correct photo position on CV after save
test: add unit tests for admin project save
```

### Branch Strategy

- `main` — production branch, deploys to GitHub Pages
- Feature branches — create from `main`, merge via PR
