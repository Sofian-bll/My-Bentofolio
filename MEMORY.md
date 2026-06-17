---
schemaVersion: 1
scope: workspace
updatedAt: "2026-06-16"
workspaceName: "My-Bentofolio"
---

# Project Memory

## Project Overview
- Bentofolio v5: React/Vite portfolio with 2-column admin dashboard, bento-style frontend, A4 printable CV, contact page.
- Target: GitHub Pages deployment via `dist/`.
- `DESIGN.md` is the authoritative design-system reference.

## Current State (v5)
- Stack: React 18 + Vite 6, ESM modules, bun for dev/build.
- Entry point: `App.jsx` → `app/app.jsx` (hash router).
- **Data source**: `config.json` (canonical on disk) → `app/config-runtime.js` resolves it per context (public or iframe preview).
- **Persistence**: Admin saves to disk via Vite plugin (`POST /api/admin/save` → writes `config.json`). Config bundled in build.
- Admin dashboard: 2-column layout (left: controls, right: live iframe preview). No more floating sidebar.
- Deleted legacy: `app/admin-sidebar.jsx`, `app/data-bridge.js`, `projects/`.
- CV selection: purely from `project.featured` flag in config, no localStorage picker.

## Artifacts
- `App.jsx` — source entry point
- `index.html` — Vite HTML template
- `vite.config.ts` — Vite config + admin plugin
- `vite-admin-plugin.ts` — save endpoint (JSON validation, strict route, size limit) + upload endpoint
- `config.json` — canonical data (projects, appearance, cv, contact, socialLinks, photo)
- `app/data.js` — loads config, exports DATA + APP_CONFIG
- `app/config-runtime.js` — resolveAppConfig, getBrowserStorage, markFeaturedProjects, getRuntimeConfigFromMessage
- `app/cv-selection.js` — getFeaturedCvProjects helper (featured flag only)
- `app/admin-save.js` — saveConfigToDisk, clearAdminSaveOverrides
- `app/app.jsx` — app shell: router, theme, nav, footer, tweaks from config
- `app/admin.jsx` — dashboard v5: 2 columns (controls + iframe preview)
- `app/home.jsx`, `app/projects.jsx`, `app/cv.jsx`, `app/contact.jsx` — pages
- `app/ui.jsx` — shared UI components
- `app/project-gallery.js` — project gallery without duplicates
- `DESIGN.md`, `SKILL.md` — design system + conventions
- Tests: `app/config-runtime.test.js`, `app/cv-selection.test.js`, `app/admin-save.test.js`, `vite-admin-plugin.test.js`, `app/project-gallery.test.js`

## Design Direction
- Zinc/surface bento aesthetic from `DESIGN.md`.
- Admin preview always visible alongside controls.
- Safe incremental edits.

## User Feedback
- Explain before editing.
- Use French for communication.
- Use bun instead of npm.

## Decisions
- ESM modules everywhere.
- `config.json` is the single source of truth; bundled in build.
- Vite plugin handles dev persistence (`POST /api/admin/save`) with JSON validation, body size limit, and stream error handling.
- `localStorage` used only for iframe preview (`bentofolio.preview`), cleared on save.
- Admin route: `/#/admin` (password: `bento`).
- Routes: `/#/`, `/#/projets`, `/#/projet/:id`, `/#/cv`, `/#/contact`, `/#/admin`.

## Next Steps
- `bun dev` → http://localhost:5173/
- `bun run build` → `dist/`
- Test admin dashboard: login, edit project, save, verify preview updates
- Deploy `dist/` to GitHub Pages
