# Project Content System Reference

## Overview

Projects are stored in the `content/projects/` directory as individual folders. They are **not** part of `config.json`. The migration from config-stored projects to content-stored projects is complete — all 16 current projects live in `content/projects/`.

At build time, `app/data.js` imports `content/projects/index.json` (a build artifact) and merges it into the runtime config under the `projects` key.

---

## Directory structure

```
content/projects/
├── order.json              # Array of project IDs in display order
├── index.json              # Build artifact: all project JSONs merged + case study content
├── connect-in/
│   ├── project.json        # Project metadata
│   └── case-study.md       # Long-form case study (Markdown)
├── sshk/
│   ├── project.json
│   └── case-study.md
├── rage-ui/
│   ├── project.json
│   └── case-study.md
└── ...
```

---

## File formats

### `project.json`

Every project folder contains a `project.json` with the following fields:

| Field           | Type       | Required | Description                                              |
|-----------------|------------|----------|----------------------------------------------------------|
| `id`            | `string`   | Yes      | Unique slug identifier (matches folder name)              |
| `name`          | `string`   | Yes      | Display name                                              |
| `categories`    | `string[]` | Yes      | Array of category IDs (see Categories below)              |
| `featured`      | `boolean`  | No       | Whether the project appears on the CV page                |
| `techs`         | `array`    | Yes      | Array of `{ label: string, tech: string }`               |
| `role`          | `string`   | No       | Role on the project (e.g. `"Solo"`, `"Binôme"`)           |
| `startDate`     | `string`   | No       | Start date ISO (e.g. `"2025-03-15"`)                       |
| `endDate`       | `string`   | No       | End date ISO or `null` if ongoing                         |
| `description`   | `string`   | No       | Short markdown description                                |
| `highlights`    | `string[]` | No       | Bullet points of key achievements                         |
| `demoUrl`       | `string`   | No       | URL to live demo (empty if none)                          |
| `repoUrl`       | `string`   | No       | URL to source repository (empty if none)                  |
| `image`         | `string`   | No       | Path to project image (see Image handling below)          |
| `caseStudyBlocks`| `array`   | No       | Structured case study blocks (alternative to case-study.md)|

Full example:

```json
{
  "id": "sshk",
  "name": "sshk",
  "categories": ["tooling"],
  "featured": true,
  "techs": [
    { "label": "Bash", "tech": "bash" },
    { "label": "OpenSSH", "tech": "linux" }
  ],
  "role": "Solo",
  "startDate": "2026-01-01",
  "endDate": null,
  "description": "CLI Bash zéro dépendance pour créer, organiser et révoquer des clés SSH.",
  "highlights": [
    "CLI Bash zéro dépendance — create, list, grant, revoke en une commande",
    "Arborescence prévisible par projet/serveur, rotation de clés simplifiée"
  ],
  "demoUrl": "",
  "repoUrl": "https://github.com/Sofian-bll/sshk",
  "image": "sshk-mockup.svg"
}
```

---

### `case-study.md`

Plain Markdown file with the project's detailed case study. Standard Markdown features are supported:

```markdown
## Contexte

Description du contexte du projet. Pourquoi il existe, quel problème il résout.

## Points clés

- Point fort 1
- Point fort 2
- Point fort 3

## Architecture

Diagramme ou description de l'architecture technique.

## Leçons apprises

Ce que le projet m'a appris, les difficultés rencontrées.
```

**Supported Markdown syntax:**
- Headings: `##`, `###`, `####`
- Unordered lists: `- item`
- Ordered lists: `1. item`
- Code blocks: triple backticks with optional language
- Inline code: `` `code` ``
- Blockquotes: `> quote`
- Images: `![alt text](media/projects/project-id/filename.png)`
- Links: `[link text](https://example.com)`
- Bold: `**text**`
- Italic: `*text*`

The case study content is merged into `index.json` under the `caseStudy` field as a raw string. The renderer in `app/case-study-renderer.js` checks for `caseStudyBlocks` first (structured blocks), then falls back to `caseStudy` (the raw markdown string).

---

### `order.json`

A simple JSON array of project IDs in the order they should appear:

```json
[
  "connect-in",
  "connect-in-java",
  "my-cinema",
  "piscine-java",
  "freelance-web",
  "klivio",
  "sshk",
  "rage-ui",
  "epitalk",
  "jeuvideops",
  "appstore-scraper",
  "soundcloud-downloader",
  "sidecar-patcher",
  "seahorse-3d",
  "nojs-ui",
  "media-pipeline"
]
```

The order determines:
- Gallery grid order on the home page
- CV project card order
- Navigation order in the project detail view

Projects not listed in `order.json` are excluded from the build, even if their folder exists.

---

### `index.json` (build artifact)

Auto-generated by `buildProjectIndex()` in `vite-admin-plugin.ts`. This file:
- Reads `order.json` for the project list
- Reads each `project.json` for metadata
- Reads each `case-study.md` and merges it as the `caseStudy` field
- Writes the merged array to `index.json`

**Do not edit `index.json` manually** — it is regenerated on every project save or delete.

---

## How to add a project

### Method 1: Via the admin dashboard
1. Open `/#/admin` and enter password `bento`
2. Go to **Projets** section
3. Click **"Ajouter"**
4. Fill in all fields (name, categories, techs, description, etc.)
5. Write the case study in the Markdown editor
6. Upload an image if desired
7. Click **"Sauvegarder"**

The admin handles creating the folder, writing `project.json` and `case-study.md`, updating `order.json`, and rebuilding `index.json`.

### Method 2: Manually (without the admin)
1. Create a folder: `content/projects/<project-id>/`
2. Create `project.json` inside it with all required fields
3. Create `case-study.md` with the case study content
4. Add the project ID to `content/projects/order.json`
5. Run `bun run build` to regenerate `index.json`

The folder name must match the `id` field in `project.json`. IDs are slugified: lowercase, no accents, hyphens instead of spaces, no special characters.

---

## Image handling

### Storage
Uploaded project images go to `public/media/projects/<project-id>/<timestamp>.<ext>`.

Example: `public/media/projects/connect-in/1718798340123.png`

The `public/` directory is served as static assets by Vite. The path used in `project.json` is relative to `public/`:
```json
"image": "media/projects/connect-in/1718798340123.png"
```

### Resolution
At runtime, `resolveImageSrc()` in `config-runtime.js` prepends the Vite base URL:
- Input: `"media/projects/connect-in/screenshot.png"`
- Output (dev): `"/media/projects/connect-in/screenshot.png"`
- Output (prod): `"/My-Bentofolio/media/projects/connect-in/screenshot.png"`

Absolute URLs (`https://...`) and data URLs (`data:...`) are passed through unchanged.

### Images in case studies
Use standard Markdown image syntax with paths relative to `public/`:
```markdown
![Architecture diagram](media/projects/sshk/diagram.png)
![Screenshot](media/projects/sshk/screenshot.png)
```

Upload images for case studies via the admin project editor's image upload button.

### Direct file placement
You can also place images directly in `public/media/projects/<project-id>/`:
```bash
cp screenshot.png public/media/projects/my-project/screenshot.png
```
Then reference them in `project.json`:
```json
"image": "media/projects/my-project/screenshot.png"
```
Or in `case-study.md`:
```markdown
![Screenshot](media/projects/my-project/screenshot.png)
```

---

## Categories

9 category IDs are defined in `app/data.js`:

| ID          | Label          | CSS Variable       | Glyph   |
|-------------|----------------|--------------------|---------|
| `dev`       | Dev            | `--cat-dev`        | code    |
| `webdesign` | Webdesign      | `--cat-webdesign`  | layout  |
| `3d`        | 3D             | `--cat-3d`         | cube    |
| `animation` | Animation      | `--cat-animation`  | play    |
| `logo`      | Logo & Charte  | `--cat-logo`       | pen     |
| `tooling`   | Outils         | `--cat-tooling`    | tool    |
| `devops`    | DevOps         | `--cat-devops`     | server  |
| `ai`        | IA & Data      | `--cat-ai`         | brain   |
| `tools`     | Outils         | `--cat-tools`      | wrench  |

A project can belong to multiple categories. Example:
```json
"categories": ["tooling", "devops"]
```

---

## Tech tags

Tech keys used in `project.json` techs and `config.json` skill groups. The `tech` field maps to a visual tag with color coding:

| Tech Key      | Label Example              |
|---------------|----------------------------|
| `laravel`     | PHP / Laravel              |
| `vue`         | Vue 3 / Vite               |
| `react`       | React                      |
| `node`        | Node.js                    |
| `java`        | Java SE                    |
| `go`          | Go                         |
| `python`      | Python                     |
| `js`          | JavaScript                 |
| `bash`        | Bash / Shell               |
| `docker`      | Docker / Sail              |
| `git`         | Git / GitHub               |
| `linux`       | Linux (Arch) / OpenSSH     |
| `tailwind`    | Tailwind                   |
| `shadcn`      | shadcn-vue                 |
| `mysql`       | MySQL                      |
| `sops`        | SOPS / Age                 |
| `figma`       | Figma                      |
| `framer`      | Framer                     |
| `blender`     | Blender                    |
| `three`       | Three.js                   |
| `rag`         | RAG / LLMs                 |
| `nvim`        | Neovim / tmux              |
| `soft`        | Soft Skills                |

The `tech` field determines tag color styling. Multiple entries can share the same tech key with different labels (e.g. `{ "label": "Sanctum", "tech": "laravel" }` and `{ "label": "Laravel", "tech": "laravel" }`).

---

## Project display flow

1. `order.json` defines the display order
2. `buildProjectIndex()` (in the Vite admin plugin) merges all `project.json` + `case-study.md` into `index.json`
3. `app/data.js` imports `index.json` and sets `appConfig.projects`
4. `markFeaturedProjects()` stamps `featured: true/false` on each project based on `cv.featured[]`
5. The gallery filters projects by category using `getProjectGalleryState()` from `app/project-gallery.js`
6. The CV page shows only projects with `featured: true`
7. Individual project detail pages render `caseStudy` as Markdown

### Filtering
The gallery supports category-based filtering. Projects can match any of their `categories[]`. The `all` filter shows every project. If a filter has no matching projects, it defaults back to `all`.

### CV selection
Projects marked `featured: true` (by being listed in `cv.featured[]`) appear on the CV page. The `getFeaturedCvProjects()` function in `app/cv-selection.js` filters them. The number of bullets shown per project is controlled by `cv.cvMaxBullets`.
