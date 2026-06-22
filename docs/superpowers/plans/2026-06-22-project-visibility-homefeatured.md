# Project Visibility + Homepage Featured + Sort Default Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-project visibility toggle, homepage featured project selection (max 4), optional cover images on homepage cards, and default sort by date.

**Architecture:** Visibility and homeFeatured are applied at the rendering layer (not in data.js) to keep the admin panel seeing all projects for management. homeFeatured is stored in `config.json` as a top-level array of project IDs, persisted via the existing admin save API. Cover image toggle is an appearance setting in `config.json → appearance.homeShowProjectImages`.

**Tech Stack:** React, Vite, CSS custom properties, existing admin API endpoints.

---

## File Map

| File | Role | Changes |
|---|---|---|
| `config.json` | Global config | Add `homeFeatured` array + `appearance.homeShowProjectImages` boolean |
| `app/data.js` | Data layer | Add `homeFeatured` computed flag to projects. **Keep ALL projects unfiltered.** |
| `app/admin.jsx` | Admin panel | Visibility toggle + homeFeatured toggle in ProjectsSection; image toggle in AppearanceSection; state wiring |
| `app/projects.jsx` | Public gallery | Filter `visible === false` in ProjectsView |
| `app/home.jsx` | Public homepage | Filter visible, use homeFeatured, conditionally render ProjectThumb |
| `app/app.jsx` | App shell | Change default sort to `recent` |
| `app/components.css` | Styles | `.proj-mini .thumb` styles for homepage card images |

---

### Task 1: Default sort by date

**Files:**
- Modify: `app/app.jsx:160`

- [ ] **Step 1: Change default sort state**

Replace:
```jsx
const [sort, setSort] = useState('default');
```
With:
```jsx
const [sort, setSort] = useState('recent');
```

- [ ] **Step 2: Build and verify**

```bash
npm run build
```
Expected: builds without errors.

- [ ] **Step 3: Commit**

```bash
git add app/app.jsx
git commit -m "feat: default projects sort by date (most recent first)"
```

---

### Task 2: config.json — homeFeatured + homeShowProjectImages

**Files:**
- Modify: `config.json`

- [ ] **Step 1: Add homeFeatured to config.json**

Insert after the `"cv"` block, before `"contact"`:
```json
"homeFeatured": [
  "connect-in",
  "my-cinema",
  "rage-ui",
  "jeuvideops"
],
```

- [ ] **Step 2: Add homeShowProjectImages to appearance**

In the `"appearance"` object, add after `"focal"`:
```json
"homeShowProjectImages": false,
```

Example placement (the exact line doesn't matter — just anywhere inside `"appearance"`).

- [ ] **Step 3: Commit**

```bash
git add config.json
git commit -m "feat: add homeFeatured IDs and homeShowProjectImages to config"
```

---

### Task 3: data.js — pass homeFeatured flag to projects

**Files:**
- Modify: `app/data.js:69-71`

- [ ] **Step 1: Add homeFeatured computed flag**

Replace:
```js
const projects = markFeaturedProjects(appConfig.projects || [], appConfig.cv?.featured)
  .map(computeProjectDates)
appConfig.projects = projects
```
With:
```js
const homeFeaturedIds = new Set(appConfig.homeFeatured || [])
const projects = markFeaturedProjects(appConfig.projects || [], appConfig.cv?.featured)
  .map(p => ({ ...p, homeFeatured: homeFeaturedIds.has(p.id) }))
  .map(computeProjectDates)
appConfig.projects = projects
```

- [ ] **Step 2: Commit**

```bash
git add app/data.js
git commit -m "feat: add homeFeatured computed flag to projects in data layer"
```

---

### Task 4: admin.jsx — state wiring for homeFeatured

**Files:**
- Modify: `app/admin.jsx` (several blocks)

- [ ] **Step 1: Add homeFeatured to useConfigState**

In `useConfigState()` (around line 43-57), add the state initializer:
```jsx
const [homeFeatured, setHomeFeatured] = useState(() => [...(APP_CONFIG.homeFeatured || [])])
```

Add `homeFeatured, setHomeFeatured` to the destructured return:
```jsx
return { projects, setProjects, ..., homeFeatured, setHomeFeatured, config }
```

- [ ] **Step 2: Add homeFeatured to buildConfig**

In `buildConfig()` (around line 26-40), add `homeFeatured` parameter:
```jsx
function buildConfig(projects, socialLinks, photo, appearance, cv, contact, experiences, profile, skillPalette, homeFeatured) {
```

Add `homeFeatured` to the return object:
```jsx
return {
  projects: projWithFeatured,
  socialLinks,
  photo,
  appearance: appearance || {},
  cv: cv || {},
  contact: contact || {},
  experiences: experiences || [],
  profile: profile || {},
  skillPalette: skillPalette || [],
  homeFeatured: homeFeatured || [],
}
```

- [ ] **Step 3: Update buildConfig calls**

In line 228, change:
```jsx
const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact, experiences, profile, skillPalette)
```
To:
```jsx
const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact, experiences, profile, skillPalette, homeFeatured)
```

In line 243, same change:
```jsx
const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact, experiences, profile, skillPalette, homeFeatured)
```

- [ ] **Step 4: Destructure homeFeatured in DashboardView**

In `DashboardView()` (around line 172), add to destructuring:
```jsx
const { projects, setProjects, ..., homeFeatured, setHomeFeatured, config } = useConfigState()
```

- [ ] **Step 5: Pass homeFeatured to ProjectsSection**

At line 320, change:
```jsx
{section === 'projets'   && <ProjectsSection   projects={projects} setProjects={setProjects} skillPalette={skillPalette} showToast={showToast} onDraftChange={setDraftProject} setPreviewPage={setPreviewPage}/>}
```
To:
```jsx
{section === 'projets'   && <ProjectsSection   projects={projects} setProjects={setProjects} skillPalette={skillPalette} showToast={showToast} onDraftChange={setDraftProject} setPreviewPage={setPreviewPage} homeFeatured={homeFeatured} setHomeFeatured={setHomeFeatured}/>}
```

- [ ] **Step 6: Add homeFeatured to debounce useEffect dependencies**

In the debounce `useEffect` (line 218-232), the dependency array already includes all relevant state. Add `homeFeatured`:
```jsx
}, [projects, socialLinks, photo, appearance, cv, contact, experiences, profile, skillPalette, draftProject, homeFeatured])
```

- [ ] **Step 7: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: wire homeFeatured state through admin (useConfigState, buildConfig, DashboardView)"
```

---

### Task 5: admin.jsx — visibility + homeFeatured toggles in ProjectsSection

**Files:**
- Modify: `app/admin.jsx` — `ProjectsSection` function (line 897-957)

- [ ] **Step 1: Add props to ProjectsSection**

Change function signature (line 897):
```jsx
function ProjectsSection({ projects, setProjects, skillPalette, showToast, onDraftChange, setPreviewPage, homeFeatured, setHomeFeatured }) {
```

- [ ] **Step 2: Add toggle handlers**

Add these two handlers inside `ProjectsSection`, before the `if (editing !== null)` guard:
```jsx
const toggleVisibility = (id) => {
  setProjects(prev => prev.map(p => p.id === id ? { ...p, visible: p.visible === false ? true : false } : p))
}
const toggleHomeFeatured = (id) => {
  const isSelected = homeFeatured.includes(id)
  if (!isSelected && homeFeatured.length >= 4) {
    showToast('Maximum 4 projets sur l\'accueil')
    return
  }
  setHomeFeatured(isSelected ? homeFeatured.filter(x => x !== id) : [...homeFeatured, id])
}
```

- [ ] **Step 3: Add toggle buttons to project row**

Replace the projects list rendering (lines 943-954):
```jsx
{projects.map(pr => (
  <div key={pr.id} className="ds-proj-row">
    <div className="ds-proj-info">
      <div className="ds-proj-name"><CatGlyph cat={(pr.categories || ['dev'])[0]} size={14}/> {pr.name}</div>
      <div className="ds-proj-meta">{pr.role} · {pr.period}{pr.duration ? ' · ' + pr.duration : ''}</div>
    </div>
    <div className="ds-proj-acts">
      <button className={'ds-vis-btn' + (pr.visible !== false ? ' on' : '')} onClick={() => toggleVisibility(pr.id)}>{pr.visible !== false ? 'Visible' : 'Masqué'}</button>
      <button className={'ds-vis-btn' + (homeFeatured.includes(pr.id) ? ' on' : '')} onClick={() => toggleHomeFeatured(pr.id)} style={{ marginLeft: 6 }}>Accueil</button>
      <button className="icon-btn" onClick={() => startEdit(pr)} title="Modifier"><Icon name="pen" size={15}/></button>
      <button className="icon-btn" onClick={() => del(pr.id)} title="Supprimer"><Icon name="trash" size={15}/></button>
    </div>
  </div>
))}
```

Note: existing `.ds-proj-acts` class uses flexbox with gap, so the added buttons will align naturally.

- [ ] **Step 4: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: add visibility and homeFeatured toggles in ProjectsSection"
```

---

### Task 6: admin.jsx — homeShowProjectImages toggle in AppearanceSection

**Files:**
- Modify: `app/admin.jsx` — `AppearanceSection` function (around line 370-415)

- [ ] **Step 1: Add toggle in AppearanceSection**

Add a toggle row after the existing appearance fields (the `ds-card` containing `ds-form-grid`), as a new card:
```jsx
<div className="ds-card">
  <div className="ds-toggle-row" onClick={() => set('homeShowProjectImages', !appearance.homeShowProjectImages)}>
    <div>
      <div className="ds-toggle-label">Images couverture sur l'accueil</div>
      <div className="ds-toggle-sub">Affiche la miniature de chaque projet dans la section Projets de l'accueil</div>
    </div>
    <div className={'ds-switch' + (appearance.homeShowProjectImages ? ' on' : '')}/>
  </div>
</div>
```

Insert this right before the `FocalPointControl` card (the one with `ds-card-title` "Cadrage photo").

- [ ] **Step 2: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: add homeShowProjectImages toggle in AppearanceSection"
```

---

### Task 7: projects.jsx — filter hidden projects in public gallery

**Files:**
- Modify: `app/projects.jsx` — `ProjectsView` function (line 105-107)

- [ ] **Step 1: Filter visible projects**

Replace lines 106-107:
```jsx
const { projects, categories } = DATA;
const { counts, catKeys, activeFilter, shown } = getProjectGalleryState({ projects, categories, filter, sort });
```
With:
```jsx
const { projects, categories } = DATA;
const visibleProjects = projects.filter(p => p.visible !== false);
const { counts, catKeys, activeFilter, shown } = getProjectGalleryState({ projects: visibleProjects, categories, filter, sort });
```

- [ ] **Step 2: Update "Tous" count**

At line 144, replace:
```jsx
<span className="count">{projects.length}</span>
```
With:
```jsx
<span className="count">{visibleProjects.length}</span>
```

- [ ] **Step 3: Commit**

```bash
git add app/projects.jsx
git commit -m "feat: filter hidden projects from public gallery"
```

---

### Task 8: home.jsx — visible projects, homeFeatured, cover images

**Files:**
- Modify: `app/home.jsx` (lines 10-11, 41, 140-154)
- Import: `ProjectThumb` needs to be added

- [ ] **Step 1: Update imports (ProjectThumb + APP_CONFIG)**

At line 5, change:
```jsx
import { Icon, Cell, Chip, SectionTitle, TechTag, CatGlyph, Badge } from './ui.jsx';
import { DATA, primaryCat } from './data.js';
```
To:
```jsx
import { Icon, Cell, Chip, SectionTitle, TechTag, CatGlyph, Badge, ProjectThumb } from './ui.jsx';
import { DATA, APP_CONFIG, primaryCat } from './data.js';
```

- [ ] **Step 2: Filter visible and use homeFeatured for preview**

Replace line 11:
```jsx
const preview = projects.slice(0, 3);
```
With:
```jsx
const visibleProjects = projects.filter(p => p.visible !== false);
const homeFeaturedProjects = visibleProjects.filter(p => p.homeFeatured);
const preview = (homeFeaturedProjects.length > 0 ? homeFeaturedProjects : visibleProjects).slice(0, 4);
```

- [ ] **Step 3: Update hero stats count**

Replace line 41:
```jsx
{DATA.projects.length > 0 && <span><Icon name="grid" size={14} /> <strong>{DATA.projects.length}</strong> projets</span>}
```
With:
```jsx
{visibleProjects.length > 0 && <span><Icon name="grid" size={14} /> <strong>{visibleProjects.length}</strong> projets</span>}
```

- [ ] **Step 4: Conditionally add ProjectThumb to proj-mini cards**

Replace the preview map (lines 141-152):
```jsx
{preview.map((pr) => (
  <button className="proj-mini" key={pr.id} onClick={() => openProject(pr.id)}>
    <div className="proj-mini-top">
      <span className="proj-mini-name"><CatGlyph cat={primaryCat(pr)} size={15} /> {pr.name}</span>
    </div>
    <p className="proj-mini-meta">{pr.role} · {pr.period}{pr.duration ? ' · ' + pr.duration : ''}</p>
    <p className="proj-mini-desc">{pr.description}</p>
    <div className="proj-mini-techs">
      {pr.techs.slice(0, 3).map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} color={t.color} />)}
    </div>
  </button>
))}
```
With:
```jsx
{preview.map((pr) => (
  <button className="proj-mini" key={pr.id} onClick={() => openProject(pr.id)}>
    {APP_CONFIG.appearance?.homeShowProjectImages && <ProjectThumb project={pr} ratio="16 / 7" />}
    <div className="proj-mini-top">
      <span className="proj-mini-name"><CatGlyph cat={primaryCat(pr)} size={15} /> {pr.name}</span>
    </div>
    <p className="proj-mini-meta">{pr.role} · {pr.period}{pr.duration ? ' · ' + pr.duration : ''}</p>
    <p className="proj-mini-desc">{pr.description}</p>
    <div className="proj-mini-techs">
      {pr.techs.slice(0, 3).map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} color={t.color} />)}
    </div>
  </button>
))}
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
```
Expected: builds cleanly.

- [ ] **Step 6: Commit**

```bash
git add app/home.jsx
git commit -m "feat: visible filter, homeFeatured, and optional cover images on homepage"
```

---

### Task 9: components.css — proj-mini thumb styles

**Files:**
- Modify: `app/components.css` (after line 178)

- [ ] **Step 1: Add proj-mini thumb styles**

After `.proj-mini` block (line 178), add:
```css
.proj-mini .thumb { margin: calc(var(--s4) * -1) calc(var(--s4) * -1) 0; border-radius: var(--radius-md) var(--radius-md) 0 0; overflow: hidden; }
```

This makes the thumb span the full width of the card and sit at the top with matching border-radius.

- [ ] **Step 2: Commit**

```bash
git add app/components.css
git commit -m "style: proj-mini thumb styles for homepage card images"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run full test suite**

```bash
bun test
```
Expected: all tests pass.

- [ ] **Step 2: Run build**

```bash
npm run build
```
Expected: builds without errors.

- [ ] **Step 3: Review git log**

```bash
git log --oneline -12
```
Confirm all 9 commits are present and well-formed.

---

## Self-Review

### 1. Spec coverage
- [x] Visibility toggle per project (Tasks 5, 7, 8)
- [x] Homepage featured 4 projects (Tasks 2, 3, 4, 5, 8)
- [x] Default sort by date (Task 1)
- [x] Cover image toggle on homepage (Tasks 2, 6, 8, 9)

### 2. Placeholder scan
No TODOs, no placeholders. All code is exact.

### 3. Type consistency
- `homeFeatured` is `string[]` throughout (project IDs)
- `visible` is `boolean | undefined` (treated as `visible !== false`)
- `homeShowProjectImages` is `boolean`
- `homeFeatured` on project object is `boolean` (computed flag)
- `ProjectThumb` import matches `ui.jsx` export
- `DATA/APP_CONFIG` import matches `data.js` exports

### 4. Edge cases verified
- Hidden project accessed by direct URL still renders (ProjectDetailView doesn't filter)
- Admin preview respects visibility (ProjectsView filters, used by both public and admin preview)
- If zero homeFeatured projects selected, falls back to all visible projects
- Toggling a 5th homeFeatured shows toast and blocks
- Visible toggle doesn't delete the project — just hides it
- Admin project count shows ALL projects (for management visibility)
- `homeShowProjectImages` defaults to `false` (existing behavior preserved)
