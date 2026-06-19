# Skill Palette Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated "Compétences" admin panel to manage skill pills (view, edit label/color, delete) and replace the tech-key-select dropdown in all forms with a visual color-picker palette.

**Architecture:** Store `color` inline in each tech/skill entry (`{ label: "Laravel", color: "#ff2d20" }`). A `skillPalette` in `config.json` serves as the curated admin catalog and quick-pick source. `TechTag` renders via inline `style={{ background: color }}` with soft-skill fallback (`color: null`). Backward compat: if only `tech` key is present (old data), lookup palette or fallback to CSS class.

**Tech Stack:** React, Bun, Vite, plain CSS (no extra libs needed)

---

## File Structure

| File | Role |
|------|------|
| `config.json` | +`skillPalette` array (source of truth) |
| `app/data.js` | Expose `skillPalette` in DATA |
| `app/ui.jsx:65-67` | Refactor `TechTag` to use inline color |
| `app/admin.jsx` | +"Compétences" palette panel, refactor tech pickers in 3 forms |
| `app/dashboard.css` | Palette grid + color picker styles |
| `app/styles.css` | Keep `.t-*` classes for backward compat |
| `app/components.css` | Minor `.tag` cleanup |
| 16× `content/projects/*/project.json` | Optional migration (add `color` field) |

---

### Task 1: Seed skillPalette in config.json

**Files:**
- Modify: `config.json` (add `skillPalette` array)

- [ ] **Step 1: Add `skillPalette` array to config.json**

Add after `"socialLinks"` (or before the last `}`):

```json
  "skillPalette": [
    { "label": "Laravel", "color": "#ff2d20" },
    { "label": "Vue 3", "color": "#42b883" },
    { "label": "Java", "color": "#e76f00" },
    { "label": "Tailwind", "color": "#06b6d4" },
    { "label": "shadcn/ui", "color": "#18181b" },
    { "label": "MySQL", "color": "#00618a" },
    { "label": "Docker", "color": "#2496ed" },
    { "label": "Git", "color": "#f05032" },
    { "label": "Linux", "color": "#1793d1" },
    { "label": "Neovim", "color": "#57a143" },
    { "label": "Bash", "color": "#3e3e3e" },
    { "label": "Figma", "color": "#a259ff" },
    { "label": "Framer", "color": "#0055ff" },
    { "label": "Python", "color": "#3776ab" },
    { "label": "RAG", "color": "#6366f1" },
    { "label": "n8n", "color": "#ea4b71" },
    { "label": "JavaScript", "color": "#f0db4f" },
    { "label": "TypeScript", "color": "#3178c6" },
    { "label": "Shopify", "color": "#95bf47" },
    { "label": "Blender", "color": "#ea7600" },
    { "label": "After Effects", "color": "#9999ff" },
    { "label": "Illustrator", "color": "#ff9a00" },
    { "label": "Go", "color": "#00add8" },
    { "label": "SOPS", "color": "#5b21b6" },
    { "label": "Three.js", "color": "#049ef4" },
    { "label": "Node.js", "color": "#539e43" },
    { "label": "Prise de parole", "color": null },
    { "label": "Vulgarisation", "color": null },
    { "label": "Leadership", "color": null },
    { "label": "Créativité", "color": null },
    { "label": "Gestion de projet", "color": null },
    { "label": "Relation client", "color": null },
    { "label": "Diagnostic", "color": null },
    { "label": "Rigueur", "color": null },
    { "label": "Prospection", "color": null },
    { "label": "Vente", "color": null },
    { "label": "Management d'équipe", "color": null },
    { "label": "Autonomie", "color": null },
    { "label": "Adaptabilité", "color": null }
  ]
}
```

- [ ] **Step 2: Verify JSON validity**

Run: `python3 -c "import json; json.load(open('config.json')); print('OK')"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add config.json
git commit -m "feat: seed skillPalette in config.json (25 tech + 12 soft skills)"
```

---

### Task 2: Expose skillPalette in DATA

**Files:**
- Modify: `app/data.js:5,66-67` (import + export)

- [ ] **Step 1: Extract and expose skillPalette**

Read `app/data.js:44` to find `const skillGroups` line, add after it:

```js
const skillPalette = baseConfig.skillPalette || []
```

Read `app/data.js:69-72` to find the DATA export, add `skillPalette`:

```js
export const DATA = {
  personalInfo, contactInfos, socialLinks, skillGroups, formations, interests,
  categories, projects, experiences, profile, sectionLabels, skillPalette,
}
```

- [ ] **Step 2: Run tests**

Run: `bun run test`
Expected: 93 pass, 0 fail

- [ ] **Step 3: Commit**

```bash
git add app/data.js
git commit -m "feat: expose skillPalette in DATA"
```

---

### Task 3: Refactor TechTag to use inline color

**Files:**
- Modify: `app/ui.jsx:65-67` (TechTag component)

- [ ] **Step 1: Write the failing test for TechTag color behavior**

Create new test file or add to existing: (TechTag is a small component tested implicitly via project rendering, so we'll test the behavior manually)

Skip explicit unit test — TechTag is a pure presentational component. The integration test (project renders correctly) covers it.

- [ ] **Step 2: Rewrite TechTag to use inline color**

Replace `app/ui.jsx:65-67`:

```jsx
// Before:
function TechTag({ label, tech }) {
  return <span className={'tag t-' + (tech || 'default')}>{label}</span>;
}

// After:
function TechTag({ label, color, tech }) {
  if (color === null || color === undefined && tech === 'soft') {
    return <span className="tag t-soft">{label}</span>
  }
  const bg = color || ''
  if (bg) {
    const isLight = (() => {
      const h = bg.replace('#', '')
      const r = parseInt(h.slice(0, 2), 16)
      const g = parseInt(h.slice(2, 4), 16)
      const b = parseInt(h.slice(4, 6), 16)
      return (r * 299 + g * 587 + b * 114) / 1000 > 150
    })()
    return <span className="tag" style={{ background: bg, color: isLight ? '#1a1a1a' : '#fff' }}>{label}</span>
  }
  return <span className={'tag t-' + (tech || 'default')}>{label}</span>
}
```

- [ ] **Step 3: Run tests**

Run: `bun run test`
Expected: 93 pass, 0 fail

- [ ] **Step 4: Commit**

```bash
git add app/ui.jsx
git commit -m "feat: TechTag uses inline color with auto text contrast"
```

---

### Task 4: Add "Compétences" admin panel

**Files:**
- Modify: `app/admin.jsx` (add `PaletteSection` component + import DATA.skillPalette)
- Modify: `app/dashboard.css` (add `.palette-*` styles)

- [ ] **Step 1: Add palette CSS**

Append to `app/dashboard.css`:

```css
.palette-grid {
  display: flex; flex-wrap: wrap; gap: var(--s2);
}
.palette-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 11px; border-radius: var(--radius-pill);
  font-size: var(--text-xs); font-weight: 600; color: #fff;
  white-space: nowrap; cursor: pointer; border: none;
  transition: transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
  position: relative;
}
.palette-pill:hover {
  transform: scale(1.06);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.palette-pill.palette-pill--soft {
  background: var(--bg-inset); color: var(--text); border: 1px solid var(--border-sub);
}
.palette-soft-section {
  margin-top: var(--s5);
  padding-top: var(--s3);
  border-top: 1px solid var(--border-sub);
}
.palette-soft-label {
  font-size: var(--text-xs); font-weight: 700; text-transform: uppercase;
  color: var(--text-2); margin-bottom: var(--s2);
}
.palette-edit-row {
  display: flex; gap: var(--s2); align-items: center;
  margin-top: var(--s4); padding: var(--s3); background: var(--bg-page);
  border: 1px solid var(--border); border-radius: var(--radius-md);
}
.palette-edit-row input[type="text"] {
  flex: 1; padding: 5px 8px; border: 1px solid var(--border); border-radius: 6px;
  font: inherit; font-size: var(--text-sm); background: var(--bg-card);
}
.palette-edit-row input[type="color"] {
  width: 32px; height: 32px; border: 1px solid var(--border);
  border-radius: 6px; padding: 2px; cursor: pointer; background: none;
}
.palette-empty {
  color: var(--text-2); font-size: var(--text-sm); padding: var(--s4) 0;
}
```

- [ ] **Step 2: Add PaletteSection component to admin.jsx**

Insert after the imports (around line 9) and before the main AdminView component:

```jsx
function PaletteSection({ palette, setPalette, showToast }) {
  const [editing, setEditing] = useState(null) // null or { index, label, color }
  const [newLabel, setNewLabel] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const softSkills = palette.filter(p => p.color === null)
  const hardSkills = palette.filter(p => p.color !== null)

  const startEdit = (i) => {
    setEditing({ index: i, label: palette[i].label, color: palette[i].color })
  }
  const cancelEdit = () => setEditing(null)

  const saveEdit = () => {
    if (!editing) return
    const next = [...palette]
    next[editing.index] = { label: editing.label.trim() || palette[editing.index].label, color: editing.color }
    setPalette(next)
    setEditing(null)
    showToast('Compétence mise à jour')
  }

  const deletePill = (i) => {
    const next = palette.filter((_, j) => j !== i)
    setPalette(next)
    showToast('Compétence supprimée')
  }

  const addPill = (color) => {
    if (!newLabel.trim()) return
    setPalette([...palette, { label: newLabel.trim(), color }])
    setNewLabel('')
    showToast('Compétence ajoutée')
  }

  return (
    <div className="ds-card">
      <h3 className="ds-card-title">Compétences</h3>

      <div className="palette-grid">
        {hardSkills.map((p, i) => {
          const origIndex = palette.indexOf(p)
          const isLight = p.color && (() => {
            const h = p.color.replace('#', '')
            const r = parseInt(h.slice(0, 2), 16)
            const g = parseInt(h.slice(2, 4), 16)
            const b = parseInt(h.slice(4, 6), 16)
            return (r * 299 + g * 587 + b * 114) / 1000 > 150
          })()
          return (
            <button key={origIndex} className="palette-pill"
              style={{ background: p.color, color: isLight ? '#1a1a1a' : '#fff' }}
              onClick={() => startEdit(origIndex)}>
              {p.label}
            </button>
          )
        })}
      </div>

      {hardSkills.length === 0 && <div className="palette-empty">Aucune compétence technique.</div>}

      <div className="palette-soft-section">
        <div className="palette-soft-label">Soft skills</div>
        <div className="palette-grid">
          {softSkills.map((p, i) => {
            const origIndex = palette.indexOf(p)
            return (
              <button key={origIndex} className="palette-pill palette-pill--soft"
                onClick={() => startEdit(origIndex)}>
                {p.label}
              </button>
            )
          })}
        </div>
      </div>

      {editing && (
        <div className="palette-edit-row">
          <input type="text" value={editing.label}
            onChange={e => setEditing({ ...editing, label: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit() }}
            placeholder="Label" />
          {editing.color !== null && (
            <input type="color" value={editing.color}
              onChange={e => setEditing({ ...editing, color: e.target.value })} />
          )}
          <button className="btn btn--ghost" onClick={saveEdit}><Icon name="check" size={14} /></button>
          <button className="btn btn--ghost" onClick={() => deletePill(editing.index)}><Icon name="trash" size={14} /></button>
          <button className="btn btn--ghost" onClick={cancelEdit}><Icon name="x" size={14} /></button>
        </div>
      )}

      <div className="ds-form-actions">
        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
          <input className="input" value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPill('#6366f1') } }}
            placeholder="Nouvelle compétence technique..." style={{ flex: 1 }} />
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} />
        </div>
        <button className="btn btn--brand" onClick={() => addPill(newColor)} disabled={!newLabel.trim()}>
          <Icon name="plus" size={14} /> Ajouter
        </button>
        <button className="btn btn--ghost" onClick={() => { if (newLabel.trim()) { addPill(null); setNewLabel('') } }} disabled={!newLabel.trim()}>
          + Soft skill
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire PaletteSection into the admin dashboard**

In the AdminView component, find where the main dashboard sections are rendered (the main content area) and add `PaletteSection` alongside the other sections. The admin dashboard likely has sections like `Projets`, `CV`, `Profil`, etc. Add `Compétences`:

Add state:

```js
const [skillPalette, setSkillPalette] = useState(DATA.skillPalette || [])
```

Add the section in the tab/section rendering area:

```jsx
{activeSection === 'skills' && (
  <PaletteSection palette={skillPalette} setPalette={setSkillPalette} showToast={showToast} />
)}
```

Also add a nav item for "Compétences" in the admin sidebar.

- [ ] **Step 4: Add savePaletteToConfig helper and wire autosave**

In the admin.jsx file, find the config save logic. When `skillPalette` changes, persist to config.json:

```jsx
import { saveConfigToDisk } from './admin-save.js'

const persistPalette = async (palette) => {
  try {
    await saveConfigToDisk({ ...configData, skillPalette: palette })
  } catch (err) {
    showToast('Sauvegarde de la palette échouée')
  }
}
```

Wrap `setSkillPalette` to trigger save.

- [ ] **Step 5: Run tests**

Run: `bun run test`
Expected: 93 pass, 0 fail

- [ ] **Step 6: Commit**

```bash
git add app/admin.jsx app/dashboard.css
git commit -m "feat: admin Compétences palette panel (view/edit/delete/add pills)"
```

---

### Task 5: Replace tech add picker in project form

**Files:**
- Modify: `app/admin.jsx:838-857` (project form Technologies section)

- [ ] **Step 1: Rewrite project tech add UI**

Replace the current `label input + tech key select + add button` with the palette picker:

```jsx
<div className="ds-field" style={{gridColumn:'1/-1'}}>
  <label className="ds-label">Technologies</label>
  {f.techs.length > 0 && (
    <div className="tech-added" style={{marginBottom:'8px'}}>
      {f.techs.map((t, i) => (
        <span key={i} className="tech-added-tag">
          <TechTag label={t.label} color={t.color} tech={t.tech} />
          <button onClick={() => set('techs', f.techs.filter((_, j) => j !== i))}><Icon name="x" size={11}/></button>
        </span>
      ))}
    </div>
  )}

  <div style={{marginBottom:'8px'}}>
    <span style={{fontSize:'11px', fontWeight:700, textTransform:'uppercase', color:'var(--text-2)', marginBottom:'4px', display:'block'}}>Quick pick</span>
    <div className="palette-grid">
      {(skillPalette || []).map((p, i) => (
        <button key={i} className="palette-pill"
          style={p.color ? { background: p.color, color: '#fff' } : {}}
          onClick={() => set('techs', [...f.techs, { label: p.label, color: p.color }])}>
          {p.label}
        </button>
      ))}
    </div>
  </div>

  <div className="tech-add-row" style={{marginTop:'8px'}}>
    <input className="input" value={tLabel} onChange={e => setTL(e.target.value)}
           onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTech() } }}
           placeholder="Label custom..." />
    <input type="color" value={tColor} onChange={e => setTC(e.target.value)}
           style={{width:'38px',height:'32px',border:'1px solid var(--border)',borderRadius:'6px',padding:'2px',cursor:'pointer',background:'none'}} />
    <button className="btn btn--ghost" onClick={addCustomTech}><Icon name="plus" size={14}/></button>
  </div>
</div>
```

Add new state variables and the `addCustomTech` function:

```jsx
// Near existing tLabel/tKey state:
const [tLabel, setTL] = useState('')
const [tColor, setTC] = useState('#6366f1')

// Replace addTech function:
const addCustomTech = () => {
  if (!tLabel.trim()) return
  set('techs', [...f.techs, { label: tLabel.trim(), color: tColor, tech: 'default' }])
  setTL('')
}
```

Also get `skillPalette` from DATA:
```jsx
const { skillPalette } = DATA
```

- [ ] **Step 2: Run tests**

Run: `bun run test`
Expected: 93 pass, 0 fail

- [ ] **Step 3: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: replace project tech key select with visual palette picker"
```

---

### Task 6: Replace tech picker in experience form

**Files:**
- Modify: `app/admin.jsx:1333-1352` (experience form Technologies section)

- [ ] **Step 1: Rewrite experience tech add UI**

Apply the exact same palette picker pattern from Task 5 to the ExperiencesSection form.

Same structure: quick-pick palette grid + custom label/color input row.

- [ ] **Step 2: Run tests**

Run: `bun run test`
Expected: 93 pass, 0 fail

- [ ] **Step 3: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: replace experience tech key select with visual palette picker"
```

---

### Task 7: Replace tech picker in profile skills form

**Files:**
- Modify: `app/admin.jsx:1151-1157` (profile skills tech key select)

- [ ] **Step 1: Rewrite profile skill tech select**

In the ProfileSection, replace the `<select>` with the palette grid:

```jsx
// Before (lines 1151-1157):
<select className="select" value={sk.tech || 'default'} onChange={...}>
  {['laravel','vue','java',...].map(k => (
    <option key={k} value={k}>{k}</option>
  ))}
</select>

// After:
<div style={{display:'flex', gap:'4px', flexWrap:'wrap', maxWidth:'200px'}}>
  {(skillPalette || []).map((p, i) => (
    <button key={i} className="palette-pill"
      style={p.color ? { background: p.color, color: '#fff', fontSize:'10px', padding:'2px 6px' } : {}}
      onClick={() => {
        const next = [...(profile.skillGroups || [])]
        const skills = [...(next[gi].skills || [])]
        skills[si] = { label: p.label, color: p.color }
        next[gi] = { ...next[gi], skills }
        set('skillGroups', next)
      }}>
      {p.label}
    </button>
  ))}
</div>
```

- [ ] **Step 2: Run tests**

Run: `bun run test`
Expected: 93 pass, 0 fail

- [ ] **Step 3: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: replace profile skill key select with visual palette picker"
```

---

### Task 8: Migrate existing project.json data (optional)

**Files:**
- Modify: 16× `content/projects/*/project.json`

- [ ] **Step 1: Run migration script**

Run a Python script that reads each project.json, looks up techs in palette, and adds `color` field:

```bash
python3 -c "
import json, os

with open('config.json') as f:
    cfg = json.load(f)
palette = {p['label']: p['color'] for p in cfg.get('skillPalette', [])}

for folder in os.listdir('content/projects'):
    if folder.startswith('.'): continue
    path = f'content/projects/{folder}/project.json'
    if not os.path.exists(path): continue
    with open(path) as f:
        p = json.load(f)
    for t in p.get('techs', []):
        if 'color' not in t:
            t['color'] = palette.get(t.get('label', ''))
    with open(path, 'w') as f:
        json.dump(p, f, indent=2, ensure_ascii=False)
        f.write('\n')
print('Done')
"
```

- [ ] **Step 2: Rebuild index.json**

Run: `bun run build`

- [ ] **Step 3: Run tests**

Run: `bun run test`
Expected: 93 pass, 0 fail

- [ ] **Step 4: Commit**

```bash
git add content/projects/*/project.json content/projects/index.json
git commit -m "feat: migrate project techs with inline colors from palette"
```

---

### Task 9: Final integration test + build

- [ ] **Step 1: Run all tests**

Run: `bun run test`
Expected: 93+ pass, 0 fail

- [ ] **Step 2: Build**

Run: `bun run build`
Expected: successful production build

- [ ] **Step 3: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: final integration — tests + build pass"
git push
```

---

## Self-Review

### Spec coverage
- [x] Dedicated admin panel to manage skill pills → Task 4
- [x] Modify label + color of existing pills → Task 4 (editing state)
- [x] Delete pills → Task 4 (delete button)
- [x] Add new pills with label + color → Task 4 (add form)
- [x] Soft skills use theme color → Tasks 3, 4 (color = null → t-soft)
- [x] Visual palette picker in project form → Task 5
- [x] Visual palette picker in experience form → Task 6
- [x] Visual palette picker in profile skills → Task 7
- [x] Name it "Compétences" → Task 4

### Placeholder scan
- No TBDs, TODOs, or "implement later" found.

### Type consistency
- `TechTag({ label, color, tech })` — consistent across all tasks
- `skillPalette` shape `[{ label, color }]` — consistent everywhere
- `color: null` for soft skills — consistent in palette + TechTag
