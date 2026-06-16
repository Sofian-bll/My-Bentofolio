---
schemaVersion: 1
name: bentofolio
description: Portfolio bento grid with A4 CV, zinc surfaces, and Syne display typography
---

## Design Principles

- **Bento grid**: Dense but readable card grid with `cell` variants (hero, photo, skills, contact, formation, interests, projects)
- **CV A4**: Fixed 210×297mm printable format, scales to fit viewport width
- **Zinc palette**: Light background `#f0f0f3`, white cards `#ffffff`, text `#111113`, muted `#6b6b76`, borders `#dcdce0`
- **Accent**: Violet `#6366f1` for interactive states, category badges, and active elements
- **Typography**: `Syne` (display/headings), `SF Pro Display` (body), `JetBrains Mono` (code/technical)

## Components

### Layout
- `Cell({ variant, glow, className, children })` — Bento grid card with optional mouse-follow glow
- Variants: `hero`, `photo`, `skills`, `contact`, `formation`, `interests`, `projects`

### UI Primitives
- `Icon({ name, size })` — Inline SVG icons (lucide-style), 40+ icons
- `Badge({ label, color })` — Colored label
- `Chip({ label, variant })` — Outline/solid pill
- `TechTag({ label, tech })` — Category-colored tech pill using `.t-{tech}` CSS class
- `SectionTitle({ title })` — Section heading
- `CatGlyph({ cat, size })` — Category icon with color
- `CatPill({ cat })` — Category badge with icon + label
- `CatPills({ project, max })` — Multi-category pills for a project

### Pages
- `HomeView` — Bento grid with hero, photo, skills, contact, formation, interests, projects preview
- `ProjectsView` — Filterable project gallery with category chips
- `ProjectDetailView` — Full project detail page with case study
- `CvView` — A4 CV with project selection, download/print
- `ContactView` — Contact form + info card
- `AdminView` — Mini-CMS dashboard (password: `bento`)

## CSS Token System

- Category colors: `--cat-dev`, `--cat-webdesign`, `--cat-3d`, `--cat-animation`, `--cat-logo`, `--cat-tooling`, `--cat-tools`, `--cat-devops`, `--cat-ai`
- Tech tags: `.t-laravel`, `.t-vue`, `.t-react`, `.t-tailwind`, `.t-docker`, etc. — 20+ tech-specific accent classes
- Responsive bento grid: CSS Grid with `auto-fill` / `minmax`
- Dark mode: `[data-theme="dark"]` selector in `app/styles.css`

## Data Conventions

- All project data in `app/data.js` (`export const DATA`)
- Projects have: `id`, `name`, `categories[]`, `featured`, `techs[]`, `role`, `period`, `duration`, `description`, `caseStudy`, `highlights[]`, `demoUrl`, `repoUrl`, `image`
- Migration bridge: `app/data-bridge.js` augments `DATA` with extra categories + migrated projects
- CMS overrides: `localStorage` keys `bentofolio.cms`, `bentofolio.photo`, `bentofolio.cv.featured`

## Don'ts

- Don't introduce external icon libraries — use inline SVG via `Icon` component
- Don't add new fonts — Syne + SF Pro Display + JetBrains Mono only
- Don't change the zinc palette without updating DESIGN.md
- Don't break A4 CV print layout — keep section heights constrained
- Don't use external UI libraries — all components are custom inline
