---
schemaVersion: 1
scope: workspace
updatedAt: "2026-06-16"
workspaceName: "Bentofolio"
---

# Project Memory

## Architecture

- **Stack**: React 18 + Vite 6 (ES modules), build → `dist/` for GitHub Pages
- **Entry point**: `App.jsx` → `app/app.jsx` (hash router)
- **Data**: `app/data.js` (canonical) + `app/data-bridge.js` (migration bridge)
- **Design system**: `DESIGN.md` + CSS tokens (`app/styles.css`, `app/components.css`, `app/pages.css`, `app/dashboard.css`)
- **Open CoDesign**: `App.jsx` as source entry, sandbox provides React 18 vendored

## File Map

| File | Role |
|------|------|
| `App.jsx` | Entry point, imports `app/app.jsx` |
| `index.html` | Vite HTML template |
| `app/app.jsx` | App shell (router, theme, nav, footer) |
| `app/ui.jsx` | Shared UI components (Icon, Cell, Chip, Tag, ...) |
| `app/home.jsx` | Home page (bento grid) |
| `app/projects.jsx` | Projects gallery + detail modal |
| `app/cv.jsx` | CV page (A4 printable) |
| `app/contact.jsx` | Contact page (form + info) |
| `app/admin.jsx` | Admin dashboard (mini-CMS) |
| `app/admin-sidebar.jsx` | Admin floating sidebar |
| `app/tweaks-panel.jsx` | Tweaks UI (reusable controls) |
| `app/data.js` | Canonical project data |
| `app/data-bridge.js` | Migration bridge (projects/ → data.js) |
| `DESIGN.md` | Design system tokens |
| `SKILL.md` | Open CoDesign custom skill |

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server → localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build
```

## Routes

- `/#/` — Home (bento grid)
- `/#/projets` — Projects gallery
- `/#/projet/:id` — Project detail
- `/#/cv` — CV (A4)
- `/#/contact` — Contact form
- `/#/admin` — Admin dashboard (password: `bento`)

## Decisions

- ESM modules everywhere (no CDN, no Babel standalone, no globals)
- Vite handles JSX transpilation + CSS imports
- `dist/` is gitignored; deployable as-is to GitHub Pages
- `chrome/` and `.codesign/` are gitignored (tool artifacts, not project code)
- Open CoDesign sandbox vends React 18 → `App.jsx` works without `package.json` there
- `package.json` + `vite.config.ts` needed only for local dev + build
