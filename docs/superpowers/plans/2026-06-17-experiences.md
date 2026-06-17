# Experiences Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated "Experiences" section (separate from "Formation") with its own page at `/#/experiences`, CV integration, admin CRUD, and updated navigation.

**Architecture:** A new `"experiences"` array in `config.json` stores professional experience entries. A new `app/experiences.jsx` renders the gallery page (modeled on `projects.jsx`). The CV page gains a new section between Formation and Projets. The admin dashboard gains an `ExperiencesSection` CRUD component (modeled on `ProjectsSection`). Navigation is updated across all pages.

**Tech Stack:** React 18, Vite 6, Bun test/build, JSON config.

---

### Task 1: Experiences in config.json + data.js export

**Files:**
- Modify: `config.json`
- Modify: `app/data.js`

- [ ] **Step 1: Add experiences array to config.json**

Insert after the `"profile"` block and before `"photo": ""`:

```json
  "experiences": [],
```

This adds an empty experiences array to the config.

- [ ] **Step 2: Read experiences from config in data.js**

In `app/data.js`, after `const socialLinks = appConfig.socialLinks || []`, add:

```js
const experiences = appConfig.experiences || []
```

Then add `experiences` to the `DATA` export:

```js
export const DATA = {
  personalInfo, contactInfos, socialLinks, skillGroups, formations, interests,
  categories, projects, experiences, profile, sectionLabels,
}
```

- [ ] **Step 3: Run build to verify**

Run: `bun run build`
Expected: build OK

- [ ] **Step 4: Commit**

```bash
git add config.json app/data.js
git commit -m "feat: add experiences array to config.json and DATA export"
```

---

### Task 2: Create experiences page (app/experiences.jsx)

**Files:**
- Create: `app/experiences.jsx`

- [ ] **Step 1: Create app/experiences.jsx with gallery and detail**

```jsx
/* =============================================
   BENTOFOLIO — Experiences page (ES module)
   ============================================= */
import React, { useState } from 'react';
import { Icon, TechTag } from './ui.jsx';
import { DATA } from './data.js';

function ExperienceCard({ experience, onOpen }) {
  return (
    <button className="proj-card" onClick={() => onOpen(experience.id)}>
      <div className="proj-card-top">
        <span className="proj-card-name"><Icon name="briefcase" size={14} /> {experience.title}</span>
      </div>
      <div className="proj-card-body">
        <p className="proj-card-meta">{experience.company} · {experience.period}</p>
        <p className="proj-card-desc">{experience.description}</p>
        <div className="proj-card-techs">
          {experience.techs.slice(0, 4).map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} />)}
        </div>
      </div>
    </button>
  );
}

function ExperienceDetail({ experience, onClose }) {
  if (!experience) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer"><Icon name="x" size={18} /></button>
        <div className="modal-body">
          <div className="modal-head">
            <h2 className="modal-title">{experience.title}</h2>
          </div>
          <div className="modal-meta">
            <span>Entreprise <b>{experience.company}</b></span>
            <span>Periode <b>{experience.period}</b></span>
            {experience.location && <span>Lieu <b>{experience.location}</b></span>}
          </div>
          {experience.highlights && experience.highlights.length > 0 && (
            <ul className="modal-list">
              {experience.highlights.map((h, i) => (
                <li key={i}><Icon name="check" size={12} /> {h}</li>
              ))}
            </ul>
          )}
          <p className="modal-case">{experience.description}</p>
          <div className="modal-techs">
            {experience.techs.map((t, i) => <TechTag key={i} label={t.label} tech={t.tech} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperiencesView({ navigate }) {
  const { experiences } = DATA;
  const [detailId, setDetailId] = useState(null);
  const detail = detailId ? experiences.find(e => e.id === detailId) : null;

  return (
    <main className="page-wrap">
      <button className="back-link" onClick={() => navigate('/')}><Icon name="arrowLeft" size={16} /> Retour au portfolio</button>
      <div className="page-head">
        <h1 className="page-title">Experiences</h1>
        <p className="page-sub">Parcours professionnel : missions, postes et realisations.</p>
      </div>
      {experiences.length === 0 ? (
        <div className="empty-state">
          <Icon name="briefcase" size={40} />
          <p>Aucune experience pour le moment.</p>
        </div>
      ) : (
        <div className="proj-gallery">
          {experiences.map(exp => (
            <ExperienceCard key={exp.id} experience={exp} onOpen={setDetailId} />
          ))}
        </div>
      )}
      {detail && <ExperienceDetail experience={detail} onClose={() => setDetailId(null)} />}
    </main>
  );
}

export { ExperiencesView };
```

- [ ] **Step 2: Run build to verify compilation**

Run: `bun run build`
Expected: build OK

- [ ] **Step 3: Commit**

```bash
git add app/experiences.jsx
git commit -m "feat: experiences page with gallery and detail modal"
```

---

### Task 3: Add Experiences section to CV page

**Files:**
- Modify: `app/cv.jsx`

- [ ] **Step 1: Read experiences from DATA in CvView**

In `app/cv.jsx`, update the destructuring of `DATA` to include `experiences`:

Find:
```js
  const { personalInfo: p, contactInfos, socialLinks, skillGroups, formations, interests, projects, categories } = DATA;
```
Replace with:
```js
  const { personalInfo: p, contactInfos, socialLinks, skillGroups, formations, interests, projects, experiences, categories } = DATA;
```

- [ ] **Step 2: Filter featured experiences**

After `const selected = getFeaturedCvProjects(projects);`, add:
```js
  const featuredExperiences = experiences.filter(e => e.featured);
```

- [ ] **Step 3: Insert Experiences section on CV between Formation and Projets**

Find the `{/* Section projets */}` comment. Insert BEFORE it:

```jsx
              {/* Section experiences */}
              <div className="cv-proj-section">
                <hr className="cv-divider" />
                <div className="cv-sec-title">Experiences {featuredExperiences.length > 0 && <span style={{ color: 'var(--color-zinc-400)', fontWeight: 600 }}>· {featuredExperiences.length}</span>}</div>
                {featuredExperiences.length === 0 ? (
                  <p className="cv-empty-note">Aucune experience marquee comme featured dans la configuration.</p>
                ) : (
                  <div className="cv-projects">
                    {featuredExperiences.map(e => (
                      <div className="cv-proj" key={e.id} style={{ '--cv-c': 'var(--cat-dev)' }}>
                        <div className="cv-proj-top">
                          <span className="cv-proj-name">{e.title}</span>
                          <span className="cv-proj-tech">{e.company}</span>
                        </div>
                        <div className="cv-proj-meta">{e.period}{e.location ? ' · ' + e.location : ''}</div>
                        {e.highlights && e.highlights.length ? (
                          <ul className="cv-proj-list">
                            {e.highlights.slice(0, maxBullets).map((h, i) => (
                              <li key={i}><Icon name="check" size={11} /><span>{h}</span></li>
                            ))}
                          </ul>
                        ) : (
                          <div className="cv-proj-desc">{e.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
```

- [ ] **Step 4: Run build to verify**

Run: `bun run build`
Expected: build OK

- [ ] **Step 5: Commit**

```bash
git add app/cv.jsx
git commit -m "feat: add Experiences section to CV between Formation and Projets"
```

---

### Task 4: Add route and navigation

**Files:**
- Modify: `app/app.jsx`

- [ ] **Step 1: Update NAV_ITEMS**

Add the experiences entry between `projets` and `cv`:

Find:
```js
  { path: '/projets', label: 'Projets', icon: 'grid' },
  { path: '/cv', label: 'CV', icon: 'cv' },
```
Replace with:
```js
  { path: '/projets', label: 'Projets', icon: 'grid' },
  { path: '/experiences', label: 'Experiences', icon: 'briefcase' },
  { path: '/cv', label: 'CV', icon: 'cv' },
```

- [ ] **Step 2: Import ExperiencesView**

Add import at top:
```js
import { ExperiencesView } from './experiences.jsx';
```

- [ ] **Step 3: Add route**

In the router, add before the CV route:

Find:
```js
    case 'cv':
      return <CvView navigate={navigate} showToast={showToast} tweaks={T} setTweak={setT} adminMode={adminMode} />;
```
Insert before it:
```js
    case 'experiences':
      return <ExperiencesView navigate={navigate} />;
```

- [ ] **Step 4: Run full test suite + build**

Run: `bun test && bun run build`
Expected: all tests pass, build OK

- [ ] **Step 5: Commit**

```bash
git add app/app.jsx
git commit -m "feat: add /#/experiences route and navigation entry"
```

---

### Task 5: Admin ExperiencesSection CRUD

**Files:**
- Modify: `app/admin.jsx`

- [ ] **Step 1: Add "Experiences" to SECTIONS**

Insert after the `projets` entry:

```js
  { id: 'experiences', label: 'Experiences', icon: 'briefcase' },
```

- [ ] **Step 2: Add experiences to useConfigState**

After `const [profile, setProfile] = useState(...)`, add:

```js
  const [experiences, setExperiences] = useState(() => [...(APP_CONFIG.experiences || [])])
```

Add to return:
```js
  return { projects, setProjects, socialLinks, setSocialLinks, photo, setPhoto,
    appearance, setAppearance, cv, setCv, contact, setContact, experiences, setExperiences, profile, setProfile, config }
```

- [ ] **Step 3: Update buildConfig to include experiences**

Add `experiences` parameter:
```js
function buildConfig(projects, socialLinks, photo, appearance, cv, contact, experiences, profile) {
```
Add to returned object:
```js
    experiences: experiences || [],
```

Update config call in `useConfigState`:
```js
  const config = buildConfig(projects, socialLinks, photo, appearance, cv, contact, experiences, profile)
```

- [ ] **Step 4: Update syncToIframe and handleSave to include experiences**

Replace ALL `buildConfig(merged, socialLinks, photo, appearance, cv, contact, profile)` calls with:
```js
buildConfig(merged, socialLinks, photo, appearance, cv, contact, experiences, profile)
```

Add `experiences` to dependency arrays of `syncToIframe` and `handleSave`.

- [ ] **Step 5: Create ExperiencesSection component**

Add after `ProjectsSection`:

```jsx
function ExperiencesSection({ experiences, setExperiences, showToast }) {
  const [editing, setEditing] = useState(null)
  const EMPTY = { title:'', company:'', location:'', period:'', description:'', highlights:['','',''], techs:[], featured:true }
  const [f, setF] = useState(EMPTY)
  const [tLabel, setTL] = useState('')
  const [tKey, setTK] = useState('default')

  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const setHl = (i, v) => setF(p => { const h = [...(p.highlights || ['','',''])]; h[i] = v; return { ...p, highlights: h } })
  const addTech = () => { if (!tLabel.trim()) return; set('techs', [...f.techs, { label: tLabel.trim(), tech: tKey }]); setTL('') }

  const startEdit = (exp) => { setEditing(exp); setF(exp ? { ...exp } : EMPTY) }
  const handleCancel = () => setEditing(null)
  const handleSave = () => {
    if (!f.title) { showToast('Titre requis'); return }
    const exp = { ...f, id: f.id || f.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') }
    const next = editing && editing.id ? experiences.map(e => e.id === exp.id ? exp : e) : [...experiences, exp]
    setExperiences(next)
    setEditing(null)
    showToast(editing && editing.id ? 'Experience mise a jour' : 'Experience ajoutee')
  }
  const del = (id) => {
    if (!window.confirm('Supprimer cette experience ?')) return
    setExperiences(experiences.filter(e => e.id !== id))
    showToast('Experience supprimee')
  }

  if (editing !== null) return (
    <div className="ds-section">
      <button className="back-link" style={{marginBottom:'var(--s2)'}} onClick={handleCancel}><Icon name="arrowLeft" size={14}/> Retour a la liste</button>
      <h2 className="ds-title">{editing && editing.id ? 'Modifier — ' + editing.title : 'Ajouter une experience'}</h2>
      <div className="ds-card">
        <div className="ds-form-grid" style={{marginTop:'var(--s5)'}}>
          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Titre *</label>
            <input className="input" value={f.title} onChange={e => set('title', e.target.value)} placeholder="Developpeur Full Stack Freelance" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Entreprise</label>
            <input className="input" value={f.company} onChange={e => set('company', e.target.value)} placeholder="Independant" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Lieu</label>
            <input className="input" value={f.location} onChange={e => set('location', e.target.value)} placeholder="Ile-de-France" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Periode</label>
            <input className="input" value={f.period} onChange={e => set('period', e.target.value)} placeholder="2025-2026" />
          </div>
          <div className="ds-field">
            <label className="ds-label">CV</label>
            <button className={'ds-vis-btn' + (f.featured ? ' on' : '')} onClick={() => set('featured', !f.featured)}>
              {f.featured ? 'Featured' : 'Non'}
            </button>
          </div>
          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Description</label>
            <textarea className="textarea" value={f.description} onChange={e => set('description', e.target.value)} placeholder="Description de l'experience..." />
          </div>
          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Highlights (3 max)</label>
            {[0,1,2].map(i => (
              <input key={i} className="input" style={{marginTop:'6px'}} value={f.highlights[i] || ''} onChange={e => setHl(i, e.target.value)} placeholder={'Point '+(i+1)} />
            ))}
          </div>
          <div className="ds-field" style={{gridColumn:'1/-1'}}>
            <label className="ds-label">Technologies</label>
            {f.techs.length > 0 && (
              <div className="tech-added" style={{marginBottom:'8px'}}>
                {f.techs.map((t, i) => (
                  <span key={i} className="tech-added-tag">
                    <TechTag label={t.label} tech={t.tech}/>
                    <button onClick={() => set('techs', f.techs.filter((_, j) => j !== i))}><Icon name="x" size={11}/></button>
                  </span>
                ))}
              </div>
            )}
            <div className="tech-add-row">
              <input className="input" value={tLabel} onChange={e => setTL(e.target.value)} placeholder="Label" />
              <select className="select" value={tKey} onChange={e => setTK(e.target.value)}>
                {['laravel','vue','java','js','ts','tailwind','mysql','docker','git','linux','bash','default'].map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <button className="btn btn--ghost" onClick={addTech}><Icon name="plus" size={14}/></button>
            </div>
          </div>
        </div>
        <div className="ds-form-actions">
          <button className="btn btn--ghost" onClick={handleCancel}>Annuler</button>
          <button className="btn btn--brand" onClick={handleSave} disabled={!f.title}>
            <Icon name="check" size={14}/> Enregistrer
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="ds-section">
      <div className="ds-section-head">
        <div><h2 className="ds-title">Experiences <span className="ds-count">{experiences.length}</span></h2><p className="ds-sub">Parcours professionnel.</p></div>
        <button className="btn btn--brand" onClick={() => { setEditing({}); setF(EMPTY) }}><Icon name="plus" size={14}/> Ajouter</button>
      </div>
      <div className="ds-proj-list">
        {experiences.map(exp => (
          <div key={exp.id} className="ds-proj-row">
            <div className="ds-proj-info">
              <div className="ds-proj-name"><Icon name="briefcase" size={14}/> {exp.title}</div>
              <div className="ds-proj-meta">{exp.company} · {exp.period}</div>
            </div>
            <div className="ds-proj-acts">
              <button className="icon-btn" onClick={() => startEdit(exp)} title="Modifier"><Icon name="pen" size={15}/></button>
              <button className="icon-btn" onClick={() => del(exp.id)} title="Supprimer"><Icon name="trash" size={15}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Render ExperiencesSection in DashboardView**

In the dash-content JSX, add:
```jsx
          {section === 'experiences' && <ExperiencesSection experiences={experiences} setExperiences={setExperiences} showToast={showToast} />}
```

- [ ] **Step 7: Run build to verify compilation**

Run: `bun run build`
Expected: build OK

- [ ] **Step 8: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: ExperiencesSection CRUD in admin with sidebar entry"
```

---

### Task 6: Final verification

**Commands:**
- `bun test`
- `bun run build`

- [ ] **Step 1: Run test suite**

Run: `bun test`
Expected: all tests pass

- [ ] **Step 2: Run build**

Run: `bun run build`
Expected: build OK

- [ ] **Step 3: Commit if any final fixes**

```bash
git add -A && git diff --cached --stat
```
