# Bentofolio — Setup Guide

Quick start guide for running the portfolio locally and deploying to production.

## Prerequisites

- **[Bun](https://bun.sh)** (recommended runtime, test runner, and package manager)
- **Node.js 18+** (alternative if Bun is unavailable)
- **Git**

## Clone & Install

```bash
git clone https://github.com/Sofian-bll/My-Bentofolio.git
cd My-Bentofolio
bun install
```

## Development Server

```bash
bun dev
```

Opens Vite dev server at **http://localhost:5173**.

## Routes

| URL hash | Page | Description |
|----------|------|-------------|
| `/#/` | Accueil | Home page with bento grid |
| `/#/projets` | Projets | Project gallery with filtering |
| `/#/experiences` | Experiences | Professional experience page |
| `/#/cv` | CV | A4 printable CV |
| `/#/contact` | Contact | Contact form + info card |
| `/#/admin` | Admin | Dashboard CMS |

## Admin Access

Navigate to `http://localhost:5173/#/admin`. The admin password is **`bento`**.

The admin dashboard allows editing projects, appearance, CV settings, contact info, social links, profile details, experiences, and backup/import. Changes are persisted to disk during development via the Vite dev server plugin.

**Note:** The admin dashboard is only available in dev mode (`bun dev`). It is lazy-loaded and completely tree-shaken from production builds.

## Build

```bash
bun run build
```

Outputs a static site to the `dist/` directory. The admin panel is automatically excluded from the production bundle.

## Preview Production Build

```bash
bun run preview
```

Serves the `dist/` directory locally for testing before deployment.

## Deploy to GitHub Pages

### Option 1: GitHub Actions (recommended)

Push to the `main` branch. The workflow at `.github/workflows/deploy.yml` will:

1. Checkout the repo
2. Install Bun dependencies
3. Run unit tests (`bun test`)
4. Build (`bun run build`)
5. Deploy `dist/` to GitHub Pages

The Vite `base` is configured as `/My-Bentofolio/` in `vite.config.ts` to match the GitHub Pages URL.

### Option 2: Manual `gh-pages` Branch

```bash
bun run build
npx gh-pages -d dist
```

### Required GitHub Settings

Ensure GitHub Pages is enabled in your repository settings, pointed at the `gh-pages` branch or GitHub Actions deployment source.

## Environment Variables

**None required.** This is a fully static site. All configuration lives in `config.json`, which is bundled into the production build.

## Troubleshooting

### Port 5173 already in use

Vite will auto-increment to the next available port (5174, 5175...). Check the terminal output for the actual URL, or explicitly set a port:

```bash
bun dev --port 3000
```

### `bun install` fails

Delete `node_modules` and `bun.lock`, then retry:

```bash
rm -rf node_modules bun.lock
bun install
```

### Blank page on GitHub Pages

The site uses hash-based routing (`/#/...`). Make sure the `base` in `vite.config.ts` matches your repository name. For `https://<user>.github.io/My-Bentofolio/`, the base must be `/My-Bentofolio/`.

### Admin dashboard not visible

The admin panel is only available in dev mode (`bun dev`). It is intentionally excluded from production builds.

### Config not saving in dev

The admin saves data through Vite's dev server middleware (`POST /api/admin/save`). Make sure you're running `bun dev` (not `bun run preview`) for persistence to work.
