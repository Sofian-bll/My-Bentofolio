# Admin Config & Project Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `config.json` the single source of truth, remove the legacy `projects/` path, fix admin persistence, and support project/case-study images with live admin preview.

**Architecture:** Runtime data comes from `config.json`. Unsaved admin preview data is scoped to the admin iframe only via preview storage and postMessage. The Vite dev plugin owns disk writes for `config.json` and uploaded files under `public/media/projects/` so `bun run build` includes both data and media.

**Tech Stack:** React 18, Vite 6, Bun test/build, JSON config, Vite dev middleware.

---

### Task 1: Config Runtime Source Of Truth

**Files:**
- Create: `app/config-runtime.js`
- Create: `app/config-runtime.test.js`
- Modify: `app/data.js`

- [ ] Write failing tests proving `bentofolio.preview` is ignored outside iframe and used inside iframe only.
- [ ] Run `bun test app/config-runtime.test.js` and verify it fails before implementation.
- [ ] Implement `resolveAppConfig(baseConfig, storage, options)`.
- [ ] Use it in `app/data.js`.
- [ ] Run `bun test app/config-runtime.test.js` and verify it passes.

### Task 2: Clean Public CV

**Files:**
- Create: `app/cv-selection.js`
- Create: `app/cv-selection.test.js`
- Modify: `app/cv.jsx`

- [ ] Test that selected CV projects come from `project.featured` only.
- [ ] Remove `bentofolio.cv.featured` localStorage usage.
- [ ] Remove the public/admin CV project picker sidebar.
- [ ] Keep public actions for print/PDF.

### Task 3: Reliable Admin Save

**Files:**
- Modify: `vite-admin-plugin.ts`
- Modify: `app/admin.jsx`

- [ ] Validate JSON before writing `config.json`.
- [ ] Return a clear JSON payload on success/failure.
- [ ] Clear preview/CV legacy storage after save.
- [ ] Keep admin state as the source for save, not preview storage.

### Task 4: Remove Legacy Projects Path

**Files:**
- Delete: `projects/`
- Modify: `DESIGN.md`
- Modify: `SKILL.md`
- Modify: `README.md`
- Modify: `MEMORY.md`

- [ ] Delete the legacy TypeScript project registry.
- [ ] Document `config.json` as the only project-add path.
- [ ] Replace npm commands with Bun commands.

### Task 5: Project Image Upload

**Files:**
- Create: `admin-upload-utils.js`
- Create: `admin-upload-utils.test.js`
- Modify: `vite-admin-plugin.ts`
- Modify: `app/admin.jsx`

- [ ] Test upload file name sanitization and data URL parsing.
- [ ] Add `POST /api/admin/upload` writing to `public/media/projects/<project-id>/`.
- [ ] Add main project image upload/URL field in admin project form.
- [ ] Save image path in `project.image`.

### Task 6: Case Study Blocks

**Files:**
- Modify: `app/admin.jsx`
- Modify: `app/projects.jsx`
- Modify: `app/pages.css`
- Modify: `config.json`

- [ ] Add `caseStudyBlocks` support with heading, paragraph, and image blocks.
- [ ] Render blocks on project detail pages.
- [ ] Fallback to `project.caseStudy` when blocks are absent.

### Task 7: Live Draft Preview

**Files:**
- Modify: `app/admin.jsx`

- [ ] Lift project draft state from `ProjectForm` to `DashboardView`.
- [ ] Merge draft into preview config only.
- [ ] Auto-route preview to `/projet/<draft-id>` while creating/editing.
- [ ] Clear draft on save/cancel.

### Task 8: Verification

**Commands:**
- `bun test app/config-runtime.test.js`
- `bun test app/cv-selection.test.js`
- `bun test admin-upload-utils.test.js`
- `bun test app/project-gallery.test.js`
- `bun run build`
