# Project Folders Code-First Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make portfolio projects a single code-first source that can be edited manually and through the admin without losing images or case-study markdown.

**Architecture:** Replace generated project JS modules with one folder per project: `content/projects/<id>/project.json` for metadata and `content/projects/<id>/case-study.md` for the article body. Runtime loads folders with Vite `import.meta.glob`; the dev-only Vite admin plugin writes JSON and Markdown directly. No Express backend is needed.

**Tech Stack:** React, Vite, Bun tests, Vite dev middleware, JSON, Markdown, existing admin upload endpoint.

---

## Current Problem

The app currently has two competing project sources:

- Runtime reads `content/projects.js` and `content/projects/*.js` through `app/data.js`.
- Admin project edits still save into `config.json.projects`.

That is why an uploaded project image can be saved by the admin but disappear after reload: the admin writes one source, while the site reads another.

There are also partial commits that added generated-JS serialization helpers in `vite-admin-plugin.ts`. Those helpers should be removed or replaced because generated JS is the wrong abstraction here and creates unnecessary serialization/security risk.

## Non-Negotiables

- Preserve the current modified `config.json` project edits during migration, especially markdown case studies and inline media references such as `media/projects/connect-in/1781873051510.jpeg`.
- Preserve `public/media/`; do not delete uploaded files.
- Do not amend or rewrite existing commits `535bc5e` and `4640e4e`; fix forward.
- Do not keep `config.json.projects` as a runtime fallback after folder loading exists.
- Do not generate JS files from admin input.
- Do not introduce Express unless a real server-side runtime need appears later.

## Target File Structure

```txt
content/projects/
  order.json
  connect-in/
    project.json
    case-study.md
  my-cinema/
    project.json
    case-study.md
  ...
```

`project.json` contains metadata only:

```json
{
  "id": "connect-in",
  "title": "Connect In",
  "category": "Full-stack",
  "description": "...",
  "image": "media/projects/connect-in/example.jpeg",
  "tech": ["React", "Node"],
  "highlights": ["..."],
  "featured": true
}
```

`case-study.md` contains the full markdown article:

```md
# Contexte

Texte long, images markdown, listes, citations, code blocks.

![Décris cette image](media/projects/connect-in/1781873051510.jpeg)
```

`order.json` preserves portfolio ordering:

```json
[
  "connect-in",
  "connect-in-java",
  "my-cinema"
]
```

## Migration Rule

For the one-time migration, use the current working tree data with this precedence:

1. `config.json.projects` wins because it contains the latest admin edits.
2. Existing `content/projects/*.js` fills gaps if a project is missing from config.
3. `caseStudy` moves out of project metadata into `case-study.md`.
4. All other project fields stay in `project.json`.
5. Existing media paths are preserved as strings; no file moving is required.

---

## Task 1: Migrate Project Content To Folders

**Files:**

- Modify: `content/projects.test.js`
- Create: `content/projects/order.json`
- Create: `content/projects/<id>/project.json`
- Create: `content/projects/<id>/case-study.md`
- Delete: `content/projects.js`
- Delete: `content/projects/*.js`
- Modify: `config.json`

- [ ] Write a failing test in `content/projects.test.js` that asserts:
  - `content/projects/order.json` exists and is a non-empty array.
  - Every ordered id has `content/projects/<id>/project.json` and `content/projects/<id>/case-study.md`.
  - No `project.json` contains `caseStudy`.
  - `content/projects.js` no longer exists.
  - There are no project module files directly under `content/projects/*.js`.

- [ ] Run RED verification:

```bash
bun test content/projects.test.js
```

Expected: fails because folders/order do not exist yet.

- [ ] Migrate content from current `config.json.projects` plus existing `content/projects/*.js` into folders.

- [ ] Remove `projects` from `config.json` after migration so it cannot be mistaken as the project source.

- [ ] Run GREEN verification:

```bash
bun test content/projects.test.js
```

Expected: passes.

- [ ] Commit:

```bash
git add content/projects config.json content/projects.test.js
git commit -m "refactor(projects): migrate content to json markdown folders"
```

## Task 2: Load Projects From Folders At Runtime

**Files:**

- Create: `app/project-content-loader.js`
- Create: `app/project-content-loader.test.js`
- Modify: `app/data.js`
- Modify: `package.json` if the test script lists files explicitly

- [ ] Write a failing test for `buildProjectsFromContent({ order, projectModules, caseStudyModules })` that verifies:
  - Projects are returned in `order.json` order.
  - Each `project.json` is unwrapped from Vite module defaults.
  - Matching `case-study.md` raw text is attached as `project.caseStudy`.
  - Orphan project folders not listed in order are ignored.

- [ ] Run RED verification:

```bash
bun test app/project-content-loader.test.js
```

Expected: fails because the loader does not exist.

- [ ] Implement `app/project-content-loader.js` as a pure helper with no DOM dependency.

- [ ] Update `app/data.js` to load folder content with Vite globs:

```js
import projectOrder from '../content/projects/order.json'
import { buildProjectsFromContent } from './project-content-loader.js'

const projectModules = import.meta.glob('../content/projects/*/project.json', { eager: true })
const caseStudyModules = import.meta.glob('../content/projects/*/case-study.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const codeProjects = buildProjectsFromContent({
  order: projectOrder,
  projectModules,
  caseStudyModules,
})

const sourceConfig = {
  ...baseConfig,
  projects: codeProjects,
}
```

- [ ] Ensure there is no fallback to `baseConfig.projects` when folder projects exist. The goal is one source of truth, not hybrid precedence.

- [ ] Run verification:

```bash
bun test app/project-content-loader.test.js content/projects.test.js
bun run build
```

Expected: tests pass and production build succeeds.

- [ ] Commit:

```bash
git add app/data.js app/project-content-loader.js app/project-content-loader.test.js package.json
git commit -m "refactor(projects): load projects from content folders"
```

## Task 3: Replace JS Serialization With JSON/Markdown Admin Endpoints

**Files:**

- Modify: `vite-admin-plugin.ts`
- Modify: `vite-admin-plugin.test.js`

- [ ] Replace old JS-module helper tests with failing tests for JSON/Markdown persistence:
  - `sanitizeProjectId` rejects path traversal and normalizes ids.
  - `serializeProjectJson(project)` omits `caseStudy` and pretty-prints metadata JSON.
  - `readProjectOrder` returns `[]` when `order.json` does not exist.
  - `updateProjectOrder(existing, id, 'save')` appends new ids and preserves existing order.
  - `updateProjectOrder(existing, id, 'delete')` removes ids.

- [ ] Run RED verification:

```bash
bun test vite-admin-plugin.test.js
```

Expected: fails because JSON/Markdown helpers/endpoints are not implemented.

- [ ] Remove generated-JS helpers from `vite-admin-plugin.ts`:
  - `getProjectsIndexPath`
  - `projectIdToVariableName`
  - `formatValue`
  - `formatPropertyKey`
  - `serializeProjectModule`
  - `buildProjectsIndex`

- [ ] Add folder path helpers:
  - `getProjectsOrderPath(root)`
  - `getProjectDirPath(root, id)`
  - `getProjectJsonPath(root, id)`
  - `getProjectCaseStudyPath(root, id)`

- [ ] Add `/api/admin/project/save`:
  - Accept `POST` JSON body `{ "project": { ... } }`.
  - Sanitize and validate `project.id`.
  - Write `content/projects/<id>/project.json` without `caseStudy`.
  - Write `content/projects/<id>/case-study.md` from `project.caseStudy || ''`.
  - Update `content/projects/order.json`, preserving order and appending new ids.
  - Return `{ ok: true, id, files: { project, caseStudy, order } }`.

- [ ] Add `/api/admin/project/delete`:
  - Accept `POST` JSON body `{ "id": "project-id" }`.
  - Sanitize and validate the id.
  - Delete `project.json` and `case-study.md` for that project.
  - Remove the folder if empty.
  - Remove the id from `order.json`.
  - Do not delete `public/media/projects/<id>`.

- [ ] Run GREEN verification:

```bash
bun test vite-admin-plugin.test.js
```

Expected: passes.

- [ ] Commit:

```bash
git add vite-admin-plugin.ts vite-admin-plugin.test.js
git commit -m "feat(projects): add json markdown admin endpoints"
```

## Task 4: Add Browser Client For Project Persistence

**Files:**

- Create: `app/admin-project-save.js`
- Create: `app/admin-project-save.test.js`
- Modify: `package.json` if needed

- [ ] Write failing tests for:
  - `saveProjectToContent(project, fetcher)` posts to `/api/admin/project/save` with `{ project }`.
  - `deleteProjectFromContent(id, fetcher)` posts to `/api/admin/project/delete` with `{ id }`.
  - Both functions throw readable errors when `response.ok` is false.

- [ ] Run RED verification:

```bash
bun test app/admin-project-save.test.js
```

Expected: fails because the client does not exist.

- [ ] Implement the two client functions with injectable `fetcher = fetch`.

- [ ] Run GREEN verification:

```bash
bun test app/admin-project-save.test.js
```

Expected: passes.

- [ ] Commit:

```bash
git add app/admin-project-save.js app/admin-project-save.test.js package.json
git commit -m "feat(admin): add project content save client"
```

## Task 5: Wire Admin Project Save/Delete To Content Folders

**Files:**

- Modify: `app/admin.jsx`
- Modify: `e2e/tests.js`
- Modify: `app/dashboard.css` only if copy/layout needs minor admin styling

- [ ] Write/update an E2E regression that checks the project editor communicates folder persistence:
  - Admin project editor opens.
  - Save UI mentions `content/projects/<id>/project.json` and `case-study.md`.
  - Inline case-study image insertion remains visible.

- [ ] Run RED verification if possible:

```bash
bun run test:e2e
```

Expected: the new assertion fails before admin copy/wiring exists.

- [ ] Import `saveProjectToContent` and `deleteProjectFromContent` into `app/admin.jsx`.

- [ ] Update project save flow:
  - Saving a project calls `saveProjectToContent(draftProject)`.
  - Local React state updates after successful save.
  - Toast says `Projet sauvegardé dans content/projects/<id>/`.

- [ ] Update project delete flow:
  - Deleting a project calls `deleteProjectFromContent(project.id)`.
  - Local React state removes the project after successful delete.
  - Toast says `Projet supprimé de content/projects/<id>/`.

- [ ] Ensure global config save no longer writes projects back into `config.json`.

- [ ] Keep the existing admin image upload flow unchanged. It should still write files to `public/media/projects/<id>/...` and insert markdown/image paths into the current draft.

- [ ] Run verification:

```bash
bun run test:e2e
```

Expected: E2E passes and leaves no tracked project-content diff.

- [ ] Commit:

```bash
git add app/admin.jsx e2e/tests.js app/dashboard.css
git commit -m "feat(admin): save projects to content folders"
```

## Task 6: Add No-Dual-Source Regression Coverage

**Files:**

- Modify: `app/project-content-loader.test.js`
- Modify: `content/projects.test.js`
- Modify: `vite-admin-plugin.test.js` if endpoint behavior needs extra coverage

- [ ] Add a test proving project image persistence through folder source:
  - Given `project.json.image = "media/projects/demo/image.jpeg"`.
  - Given `case-study.md` contains `![Alt](media/projects/demo/detail.jpeg)`.
  - Loader returns one project with both `image` and full `caseStudy` intact.

- [ ] Add a test or assertion proving `config.json.projects` is not used as runtime project fallback once folder content exists.

- [ ] Run verification:

```bash
bun test app/project-content-loader.test.js content/projects.test.js vite-admin-plugin.test.js
```

Expected: passes.

- [ ] Commit:

```bash
git add app/project-content-loader.test.js content/projects.test.js vite-admin-plugin.test.js
git commit -m "test(projects): cover folder persistence source"
```

## Task 7: Full Verification And Cleanup

**Files:**

- No required source files unless verification exposes a bug.

- [ ] Run full test suite:

```bash
bun test
```

Expected: all tests pass.

- [ ] Run production build:

```bash
bun run build
```

Expected: Vite build succeeds.

- [ ] Run E2E suite:

```bash
bun run test:e2e
```

Expected: all E2E tests pass.

- [ ] Inspect final git state:

```bash
git status --short
```

Expected:
  - No accidental generated project JS files remain.
  - No accidental E2E-created content remains.
  - `public/media/` remains untracked unless the user explicitly chooses to commit uploaded media.

- [ ] Final commit only if verification required cleanup changes.

---

## Acceptance Criteria

- Admin-edited project image persists after save and reload.
- Admin-edited case-study markdown persists after save and reload.
- Manual project editing happens in `content/projects/<id>/project.json` and `content/projects/<id>/case-study.md`.
- Runtime project data comes from folder content only.
- `config.json.projects` no longer competes with project folders.
- Generated JS project serialization is removed from the admin write path.
- Existing uploaded media paths continue to resolve.
- `bun test`, `bun run build`, and `bun run test:e2e` pass.

## Recommended Execution Mode

Use subagent-driven execution task-by-task. The tasks are separable enough for fresh subagents, but they should run sequentially because each task changes the data source that later tasks depend on.
