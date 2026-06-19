# Code-First Project Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Admin project create/edit/delete persist to the same `content/projects/*.js` source files used by the code-first project system.

**Architecture:** Projects become single-source code content under `content/projects/`. The global config save keeps profile, appearance, CV, contact, links, and experiences in `config.json`, but no longer writes project data there. The Vite admin plugin gets dev-only project save/delete endpoints that serialize project objects into JS files and regenerate `content/projects.js`.

**Tech Stack:** React admin UI, Vite dev middleware, Bun tests, Playwright E2E, ES module project content files.

---

## File Structure

- Modify: `vite-admin-plugin.ts`
  - Add pure project serialization helpers.
  - Add filesystem helpers for `content/projects/*.js` and `content/projects.js`.
  - Add `/api/admin/project/save` and `/api/admin/project/delete` dev endpoints.
- Modify: `vite-admin-plugin.test.js`
  - Test serialization, index regeneration, save/delete filesystem behavior, and request body validation.
- Add: `app/admin-project-save.js`
  - Browser wrapper functions for project save/delete API calls.
- Add: `app/admin-project-save.test.js`
  - Test request payloads and error handling for the project API wrappers.
- Modify: `app/admin.jsx`
  - Remove projects from global config payload.
  - Make project add/edit/delete call the code-first API.
  - Update dashboard save copy to clarify it saves non-project config.
- Modify: `app/data.js`
  - Treat `content/projects.js` as the only project source.
  - Keep `config.json` for all non-project runtime config.
- Modify: `app/data.test.js`
  - Assert project data comes from code content and not from `config.json.projects`.
- Modify: `e2e/tests.js`
  - Add regression coverage that the project editor exposes code-first persistence and does not crash.
- Modify: `package.json`
  - Include `app/admin-project-save.test.js` in `bun test`.

---

### Task 1: Project Serialization Helpers

**Files:**
- Modify: `vite-admin-plugin.ts`
- Modify: `vite-admin-plugin.test.js`

- [ ] **Step 1: Write failing serialization tests**

Add these imports to `vite-admin-plugin.test.js`:

```js
import {
  getConfigFilePath,
  parseConfigBody,
  serializeProjectModule,
  projectIdToVariableName,
  buildProjectsIndex,
} from './vite-admin-plugin.ts'
```

Add these tests:

```js
describe('project content serialization', () => {
  test('serializes a project as an editable default-export module', () => {
    const project = {
      id: 'connect-in',
      name: "Connect'IN",
      categories: ['dev'],
      featured: true,
      techs: [{ label: 'Laravel', tech: 'laravel' }],
      role: 'Binôme',
      period: '2025',
      duration: '3 sem.',
      description: 'API REST Laravel',
      highlights: ['Auth Sanctum'],
      caseStudy: '## Contexte\n\n![Dashboard](media/projects/connect-in/dashboard.jpg)',
      demoUrl: '',
      repoUrl: 'https://github.com/Sofian-bll',
      image: 'media/projects/connect-in/cover.jpg',
    }

    const source = serializeProjectModule(project)

    expect(source).toContain('export default {')
    expect(source).toContain("id: 'connect-in'")
    expect(source).toContain('caseStudy: `## Contexte')
    expect(source).toContain('media/projects/connect-in/cover.jpg')
    expect(source).toContain('}\n')
  })

  test('escapes template markers inside markdown case studies', () => {
    const source = serializeProjectModule({
      id: 'template-test',
      name: 'Template Test',
      caseStudy: 'Use `code` and ${danger}',
    })

    expect(source).toContain('Use \\`code\\` and \\${danger}')
  })

  test('creates safe import variable names from project ids', () => {
    expect(projectIdToVariableName('connect-in')).toBe('connect_in')
    expect(projectIdToVariableName('3d-seahorse')).toBe('_3d_seahorse')
  })

  test('builds the project index in portfolio order', () => {
    const source = buildProjectsIndex(['connect-in', 'my-cinema'])

    expect(source).toContain("import connect_in from './projects/connect-in.js'")
    expect(source).toContain("import my_cinema from './projects/my-cinema.js'")
    expect(source).toContain('export const projects = [')
    expect(source.indexOf('connect_in')).toBeLessThan(source.indexOf('my_cinema'))
  })
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
bun test vite-admin-plugin.test.js
```

Expected: fail with missing exports `serializeProjectModule`, `projectIdToVariableName`, and `buildProjectsIndex`.

- [ ] **Step 3: Implement serialization helpers**

Add these exports near the top of `vite-admin-plugin.ts`:

```ts
export function getProjectsDirPath(root: string) {
  return resolve(root, 'content', 'projects')
}

export function getProjectsIndexPath(root: string) {
  return resolve(root, 'content', 'projects.js')
}

export function sanitizeProjectId(raw: unknown) {
  if (typeof raw !== 'string') return ''
  return raw.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function projectIdToVariableName(id: string) {
  const variable = sanitizeProjectId(id).replace(/-/g, '_')
  return /^[0-9]/.test(variable) ? `_${variable}` : variable
}

function escapeTemplateLiteral(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

function formatString(value: unknown) {
  return typeof value === 'string' && value.includes('\n')
    ? `\`${escapeTemplateLiteral(value)}\``
    : JSON.stringify(typeof value === 'string' ? value : '')
}

function formatValue(value: unknown, indent = 2): string {
  if (typeof value === 'string') return formatString(value)
  if (typeof value === 'number' || typeof value === 'boolean') return JSON.stringify(value)
  if (Array.isArray(value)) return JSON.stringify(value, null, indent)
  if (value && typeof value === 'object') return JSON.stringify(value, null, indent)
  return 'null'
}

export function serializeProjectModule(project: Record<string, unknown>) {
  const orderedKeys = [
    'id', 'name', 'categories', 'featured', 'techs', 'role', 'period', 'duration',
    'description', 'highlights', 'caseStudy', 'demoUrl', 'repoUrl', 'image',
  ]
  const allKeys = [...orderedKeys, ...Object.keys(project).filter((key) => !orderedKeys.includes(key))]
  const lines = ['export default {']
  for (const key of allKeys) {
    if (!(key in project)) continue
    lines.push(`  ${key}: ${formatValue(project[key])},`)
  }
  lines.push('}')
  return `${lines.join('\n')}\n`
}

export function buildProjectsIndex(projectIds: string[]) {
  const ids = projectIds.map(sanitizeProjectId).filter(Boolean)
  const imports = ids.map((id) => `import ${projectIdToVariableName(id)} from './projects/${id}.js'`)
  const entries = ids.map((id) => `  ${projectIdToVariableName(id)},`)
  return `${imports.join('\n')}\n\nexport const projects = [\n${entries.join('\n')}\n]\n`
}
```

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
bun test vite-admin-plugin.test.js
```

Expected: pass for serialization helper tests, with any unrelated existing tests still green.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add vite-admin-plugin.ts vite-admin-plugin.test.js
git commit -m "feat(projects): serialize code-first project files"
```

---

### Task 2: Dev API Saves Projects To `content/projects`

**Files:**
- Modify: `vite-admin-plugin.ts`
- Modify: `vite-admin-plugin.test.js`

- [ ] **Step 1: Write failing filesystem tests**

Add imports in `vite-admin-plugin.test.js`:

```js
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  saveProjectToContent,
  deleteProjectFromContent,
  parseProjectSaveBody,
  parseProjectDeleteBody,
} from './vite-admin-plugin.ts'
```

Add tests:

```js
describe('project content persistence', () => {
  test('validates project save request bodies', () => {
    expect(parseProjectSaveBody('{')).toEqual({ ok: false, status: 400, error: 'Invalid JSON' })
    expect(parseProjectSaveBody('{}')).toEqual({ ok: false, status: 400, error: 'Missing project' })
    expect(parseProjectSaveBody(JSON.stringify({ project: { name: 'No id' } }))).toEqual({ ok: false, status: 400, error: 'Missing project id' })
    expect(parseProjectSaveBody(JSON.stringify({ project: { id: 'my-project', name: 'My Project' } })).ok).toBe(true)
  })

  test('writes project module and regenerates index', () => {
    const root = mkdtempSync(join(tmpdir(), 'bento-project-save-'))
    try {
      mkdirSync(join(root, 'content', 'projects'), { recursive: true })
      writeFileSync(join(root, 'content', 'projects', 'existing.js'), "export default { id: 'existing' }\n")
      writeFileSync(join(root, 'content', 'projects.js'), "import existing from './projects/existing.js'\n\nexport const projects = [\n  existing,\n]\n")

      const result = saveProjectToContent(root, { id: 'new-project', name: 'New Project', image: 'media/projects/new-project/cover.jpg' })

      expect(result.ok).toBe(true)
      expect(readFileSync(join(root, 'content', 'projects', 'new-project.js'), 'utf8')).toContain("image: 'media/projects/new-project/cover.jpg'")
      const index = readFileSync(join(root, 'content', 'projects.js'), 'utf8')
      expect(index).toContain("import existing from './projects/existing.js'")
      expect(index).toContain("import new_project from './projects/new-project.js'")
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('deletes project module and regenerates index', () => {
    const root = mkdtempSync(join(tmpdir(), 'bento-project-delete-'))
    try {
      mkdirSync(join(root, 'content', 'projects'), { recursive: true })
      writeFileSync(join(root, 'content', 'projects', 'old-project.js'), "export default { id: 'old-project' }\n")
      writeFileSync(join(root, 'content', 'projects', 'kept-project.js'), "export default { id: 'kept-project' }\n")

      const result = deleteProjectFromContent(root, 'old-project')

      expect(result.ok).toBe(true)
      expect(existsSync(join(root, 'content', 'projects', 'old-project.js'))).toBe(false)
      expect(readFileSync(join(root, 'content', 'projects.js'), 'utf8')).not.toContain('old_project')
      expect(readFileSync(join(root, 'content', 'projects.js'), 'utf8')).toContain('kept_project')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
bun test vite-admin-plugin.test.js
```

Expected: fail with missing exports `saveProjectToContent`, `deleteProjectFromContent`, `parseProjectSaveBody`, and `parseProjectDeleteBody`.

- [ ] **Step 3: Implement filesystem helpers**

Add these exports to `vite-admin-plugin.ts`:

```ts
import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs'
```

Replace the existing `fs` import with the one above.

Add helper functions:

```ts
function listProjectIds(root: string) {
  const dir = getProjectsDirPath(root)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith('.js'))
    .map((file) => file.replace(/\.js$/, ''))
    .filter(Boolean)
}

function writeProjectsIndex(root: string) {
  const ids = listProjectIds(root)
  writeFileSync(getProjectsIndexPath(root), buildProjectsIndex(ids), 'utf-8')
}

export function parseProjectSaveBody(body: string) {
  try {
    const parsed = JSON.parse(body)
    if (!parsed || typeof parsed !== 'object' || !('project' in parsed)) {
      return { ok: false, status: 400, error: 'Missing project' }
    }
    const project = parsed.project
    if (!project || typeof project !== 'object' || Array.isArray(project)) {
      return { ok: false, status: 400, error: 'Invalid project' }
    }
    const id = sanitizeProjectId((project as Record<string, unknown>).id)
    if (!id) return { ok: false, status: 400, error: 'Missing project id' }
    return { ok: true, project: { ...(project as Record<string, unknown>), id } }
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON' }
  }
}

export function parseProjectDeleteBody(body: string) {
  try {
    const parsed = JSON.parse(body)
    const id = sanitizeProjectId(parsed?.id)
    if (!id) return { ok: false, status: 400, error: 'Missing project id' }
    return { ok: true, id }
  } catch {
    return { ok: false, status: 400, error: 'Invalid JSON' }
  }
}

export function saveProjectToContent(root: string, project: Record<string, unknown>) {
  const id = sanitizeProjectId(project.id)
  if (!id) return { ok: false, error: 'Missing project id' }
  const dir = getProjectsDirPath(root)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const filePath = join(dir, `${id}.js`)
  writeFileSync(filePath, serializeProjectModule({ ...project, id }), 'utf-8')
  writeProjectsIndex(root)
  return { ok: true, id, path: filePath }
}

export function deleteProjectFromContent(root: string, rawId: string) {
  const id = sanitizeProjectId(rawId)
  if (!id) return { ok: false, error: 'Missing project id' }
  const filePath = join(getProjectsDirPath(root), `${id}.js`)
  if (existsSync(filePath)) unlinkSync(filePath)
  writeProjectsIndex(root)
  return { ok: true, id, path: filePath }
}
```

- [ ] **Step 4: Add Vite middleware endpoints**

Inside `configureServer(server)`, after the upload endpoint, add:

```ts
      server.middlewares.use('/api/admin/project/save', (req, res, next) => {
        if (req.method !== 'POST') return next()
        if (req.url !== '/') return next()
        let body = ''
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString()
          if (body.length > MAX_BODY_SIZE) {
            req.destroy()
            sendJson(res, 413, { ok: false, error: 'Payload too large' })
          }
        })
        req.on('error', () => sendJson(res, 400, { ok: false, error: 'Request stream error' }))
        req.on('end', () => {
          if (res.writableEnded) return
          const parsed = parseProjectSaveBody(body)
          if (!parsed.ok) return sendJson(res, parsed.status, { ok: false, error: parsed.error })
          try {
            sendJson(res, 200, saveProjectToContent(server.config.root, parsed.project))
          } catch (err) {
            sendJson(res, 500, { ok: false, error: String(err) })
          }
        })
      })

      server.middlewares.use('/api/admin/project/delete', (req, res, next) => {
        if (req.method !== 'POST') return next()
        if (req.url !== '/') return next()
        let body = ''
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString()
          if (body.length > MAX_BODY_SIZE) {
            req.destroy()
            sendJson(res, 413, { ok: false, error: 'Payload too large' })
          }
        })
        req.on('error', () => sendJson(res, 400, { ok: false, error: 'Request stream error' }))
        req.on('end', () => {
          if (res.writableEnded) return
          const parsed = parseProjectDeleteBody(body)
          if (!parsed.ok) return sendJson(res, parsed.status, { ok: false, error: parsed.error })
          try {
            sendJson(res, 200, deleteProjectFromContent(server.config.root, parsed.id))
          } catch (err) {
            sendJson(res, 500, { ok: false, error: String(err) })
          }
        })
      })
```

- [ ] **Step 5: Run tests to verify GREEN**

Run:

```bash
bun test vite-admin-plugin.test.js
```

Expected: all Vite admin plugin tests pass.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add vite-admin-plugin.ts vite-admin-plugin.test.js
git commit -m "feat(projects): persist admin projects to content"
```

---

### Task 3: Browser API Client For Project Persistence

**Files:**
- Add: `app/admin-project-save.js`
- Add: `app/admin-project-save.test.js`
- Modify: `package.json`

- [ ] **Step 1: Write failing browser client tests**

Create `app/admin-project-save.test.js`:

```js
import { describe, expect, test } from 'bun:test'
import { deleteProjectFromCode, saveProjectToCode } from './admin-project-save.js'

describe('saveProjectToCode', () => {
  test('posts project payload to the code-first save endpoint', async () => {
    const calls = []
    const fetchImpl = async (url, options) => {
      calls.push({ url, options })
      return { ok: true, json: async () => ({ ok: true, id: 'connect-in' }) }
    }

    await expect(saveProjectToCode({ id: 'connect-in', image: 'media/projects/connect-in/cover.jpg' }, fetchImpl)).resolves.toEqual({ ok: true, id: 'connect-in' })
    expect(calls[0].url).toBe('/api/admin/project/save')
    expect(calls[0].options.method).toBe('POST')
    expect(JSON.parse(calls[0].options.body)).toEqual({ project: { id: 'connect-in', image: 'media/projects/connect-in/cover.jpg' } })
  })

  test('returns endpoint errors without throwing', async () => {
    const fetchImpl = async () => ({ ok: false, json: async () => ({ ok: false, error: 'dev only' }) })

    await expect(saveProjectToCode({ id: 'x' }, fetchImpl)).resolves.toEqual({ ok: false, error: 'dev only' })
  })
})

describe('deleteProjectFromCode', () => {
  test('posts project id to the code-first delete endpoint', async () => {
    const calls = []
    const fetchImpl = async (url, options) => {
      calls.push({ url, options })
      return { ok: true, json: async () => ({ ok: true, id: 'connect-in' }) }
    }

    await expect(deleteProjectFromCode('connect-in', fetchImpl)).resolves.toEqual({ ok: true, id: 'connect-in' })
    expect(calls[0].url).toBe('/api/admin/project/delete')
    expect(JSON.parse(calls[0].options.body)).toEqual({ id: 'connect-in' })
  })
})
```

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
bun test app/admin-project-save.test.js
```

Expected: fail because `app/admin-project-save.js` does not exist.

- [ ] **Step 3: Implement browser API client**

Create `app/admin-project-save.js`:

```js
async function parseResponse(resp) {
  try {
    return await resp.json()
  } catch {
    return { ok: false, error: 'Invalid server response' }
  }
}

export async function saveProjectToCode(project, fetchImpl = fetch) {
  try {
    const resp = await fetchImpl('/api/admin/project/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project }),
    })
    const data = await parseResponse(resp)
    return resp.ok ? data : { ok: false, error: data.error || 'Project save failed' }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

export async function deleteProjectFromCode(id, fetchImpl = fetch) {
  try {
    const resp = await fetchImpl('/api/admin/project/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await parseResponse(resp)
    return resp.ok ? data : { ok: false, error: data.error || 'Project delete failed' }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
```

- [ ] **Step 4: Add test script entry**

Modify `package.json` so the `test` script includes `app/admin-project-save.test.js`:

```json
"test": "bun test app/config-runtime.test.js app/cv-selection.test.js admin-upload-utils.test.js app/project-gallery.test.js app/admin-save.test.js app/admin-project-save.test.js vite-admin-plugin.test.js app/data.test.js app/markdown-renderer.test.jsx content/projects.test.js"
```

- [ ] **Step 5: Run tests to verify GREEN**

Run:

```bash
bun test app/admin-project-save.test.js
```

Expected: all admin project save client tests pass.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add app/admin-project-save.js app/admin-project-save.test.js package.json
git commit -m "feat(projects): add admin project API client"
```

---

### Task 4: Admin Uses Code-First Project Persistence

**Files:**
- Modify: `app/admin.jsx`
- Modify: `app/data.js`
- Modify: `app/data.test.js`

- [ ] **Step 1: Write failing data-source test**

Add this test to `app/data.test.js`:

```js
describe('DATA.projects', () => {
  test('exports projects from code content files', () => {
    expect(DATA.projects.length).toBeGreaterThan(10)
    expect(DATA.projects.some((project) => project.id === 'connect-in')).toBe(true)
    expect(DATA.projects.every((project) => project.caseStudy && project.caseStudy.includes('##'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify current behavior**

Run:

```bash
bun test app/data.test.js
```

Expected: pass if code content is already loaded, but this test locks the desired source behavior before removing project writes from config.

- [ ] **Step 3: Remove project writes from global config**

Modify `app/admin.jsx` imports:

```js
import { saveProjectToCode, deleteProjectFromCode } from './admin-project-save.js'
```

Replace `buildConfig(projects, socialLinks, photo, appearance, cv, contact, experiences, profile)` with:

```js
function buildConfig(socialLinks, photo, appearance, cv, contact, experiences, profile) {
  return {
    socialLinks,
    photo: photo || '',
    appearance: appearance || {},
    cv: cv || {},
    contact: contact || {},
    experiences: experiences || [],
    profile: profile || {},
  }
}
```

Update each call site:

```js
const config = buildConfig(socialLinks, photo, appearance, cv, contact, experiences, profile)
```

In live preview and global save, keep the projects in preview-only payload by merging at the call site:

```js
const cfg = {
  ...buildConfig(socialLinks, photo, appearance, cv, contact, experiences, profile),
  projects: merged,
}
syncLivePreview(cfg)
```

For disk config save, do not include projects:

```js
const cfg = buildConfig(socialLinks, photo, appearance, cv, contact, experiences, profile)
const result = await saveConfigToDisk(cfg)
```

Update the global save toast:

```js
showToast('Configuration sauvegardée — projets sauvegardés séparément')
```

- [ ] **Step 4: Make project add/edit call the new API**

Inside `ProjectsSection`, change `handleSave` to async:

```js
const handleSave = async (proj) => {
  const project = { ...proj, id: proj.id || slugify(proj.name || 'nouveau-projet') }
  const result = await saveProjectToCode(project)
  if (!result.ok) {
    showToast(`Projet non sauvegardé — ${result.error || 'dev uniquement'}`)
    return
  }
  const next = editing === 'new' ? [...projects, project] : projects.map(p => p.id === project.id ? project : p)
  setProjects(next)
  setEditing(null)
  onDraftChange(null)
  showToast(editing === 'new' ? 'Projet ajouté au code' : 'Projet sauvegardé dans le code')
}
```

Change `del` to async:

```js
const del = async (id) => {
  if (!window.confirm('Supprimer ce projet ?')) return
  const result = await deleteProjectFromCode(id)
  if (!result.ok) {
    showToast(`Suppression échouée — ${result.error || 'dev uniquement'}`)
    return
  }
  setProjects(projects.filter(p => p.id !== id))
  showToast('Projet supprimé du code')
}
```

- [ ] **Step 5: Make `app/data.js` code-first only for projects**

Replace:

```js
const sourceConfig = {
  ...baseConfig,
  projects: codeProjects.length ? codeProjects : baseConfig.projects,
}
```

With:

```js
const sourceConfig = {
  ...baseConfig,
  projects: codeProjects,
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
bun test app/data.test.js app/admin-project-save.test.js
```

Expected: all selected tests pass.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add app/admin.jsx app/data.js app/data.test.js
git commit -m "fix(projects): save admin edits to code source"
```

---

### Task 5: Regression Coverage For Project Image Persistence

**Files:**
- Modify: `e2e/tests.js`
- Modify: `vite-admin-plugin.test.js`

- [ ] **Step 1: Add plugin-level regression test for image persistence**

Add this test to `vite-admin-plugin.test.js` under `project content persistence`:

```js
test('overwrites project image in the code source file', () => {
  const root = mkdtempSync(join(tmpdir(), 'bento-project-image-'))
  try {
    mkdirSync(join(root, 'content', 'projects'), { recursive: true })
    saveProjectToContent(root, { id: 'image-test', name: 'Image Test', image: '' })
    saveProjectToContent(root, { id: 'image-test', name: 'Image Test', image: 'media/projects/image-test/cover.jpg' })

    const source = readFileSync(join(root, 'content', 'projects', 'image-test.js'), 'utf8')
    expect(source).toContain("image: 'media/projects/image-test/cover.jpg'")
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
```

- [ ] **Step 2: Add E2E smoke test for code-first project editor copy**

Add this test to `e2e/tests.js`:

```js
test('Admin project editor saves projects separately from global config', async ({ page }) => {
  await page.goto(BASE + '/index.html#/admin')
  await page.fill('input[type="password"]', 'bento')
  await page.click('button[type="submit"]')
  await page.waitForSelector('.dashboard-v5', { timeout: 5000 })

  await page.locator('.ds-proj-row').first().locator('[title="Modifier"]').click()
  await expect(page.locator('.ds-title')).toContainText('Modifier')
  await expect(page.getByText('Étude de cas complète (Markdown)')).toBeVisible()
  await page.getByRole('button', { name: /Enregistrer|Sauvegarder/ }).last().click()
  await expect(page.getByText(/Projet sauvegardé dans le code|Projet mis à jour|Projet ajouté au code/)).toBeVisible({ timeout: 5000 })
})
```

If this E2E mutates an existing project file during implementation, replace it with a non-mutating assertion that verifies the editor exposes code-first save copy. Do not leave an E2E that permanently rewrites repository content on every test run.

- [ ] **Step 3: Run targeted tests**

Run:

```bash
bun test vite-admin-plugin.test.js
bunx playwright test e2e/tests.js --grep "project editor saves projects separately"
```

Expected: all targeted tests pass, and `git status --short` does not show unexpected project file rewrites after E2E cleanup.

- [ ] **Step 4: Commit Task 5**

Run:

```bash
git add vite-admin-plugin.test.js e2e/tests.js
git commit -m "test(projects): cover code-first admin persistence"
```

---

### Task 6: Full Verification And Cleanup

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run full unit suite**

Run:

```bash
bun test
```

Expected: all tests pass, including `app/admin-project-save.test.js`, `content/projects.test.js`, `app/markdown-renderer.test.jsx`, and `vite-admin-plugin.test.js`.

- [ ] **Step 2: Run production build**

Run:

```bash
bun run build
```

Expected: Vite build succeeds. Admin remains dev-only and tree-shaken from production routes.

- [ ] **Step 3: Run E2E suite**

Run:

```bash
bun run test:e2e
```

Expected: all Playwright tests pass.

- [ ] **Step 4: Inspect final diff**

Run:

```bash
git status --short
git diff --stat
git diff
```

Expected: only intended code-first project admin files changed. No `test-results/` directory remains.

- [ ] **Step 5: Commit final cleanup if needed**

If Task 6 required cleanup changes, commit them:

```bash
git add <changed-files>
git commit -m "chore(projects): clean code-first admin persistence"
```

If no cleanup changes are needed, do not create an empty commit.

---

## Self-Review

**Spec coverage:** This plan resolves the reported bug by making Admin project edits write to `content/projects/*.js`, the same source the site reads. It removes project writes from global `config.json`, adds project save/delete APIs, updates the admin UI flow, and adds tests for serialization, persistence, client API wrappers, and E2E editor behavior.

**Placeholder scan:** No `TBD`, `TODO`, or unspecified implementation steps remain. Each task names exact files and includes concrete code or commands.

**Type consistency:** The plan consistently uses `saveProjectToContent`, `deleteProjectFromContent`, `saveProjectToCode`, `deleteProjectFromCode`, `serializeProjectModule`, and `buildProjectsIndex` across tests and implementation steps.

**Scope check:** The plan is focused on one architectural fix: project persistence becomes code-first. It does not redesign the project article UI, markdown renderer, or media upload system beyond the required persistence changes.
