# Profile CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every visible text/value on the portfolio editable through the admin dashboard via a new "Profil" panel. Migrate hard-coded user data from `app/data.js` into `config.json`.

**Architecture:** A new `"profile"` key in `config.json` centralizes identity, bio, contact, skills, formation, interests, section labels, hero chips, and CV subtitle. `app/data.js` reads all fields from `appConfig.profile` with fallback defaults. A new `ProfileSection` component in the admin dashboard provides controls tailored to each data type (text, textarea, slider, toggle, CRUD lists). The existing `syncToIframe` and `saveConfigToDisk` mechanisms handle live preview and persistence.

**Tech Stack:** React 18, Vite 6, Bun test/build, JSON config.

---

### Task 1: Profile in config.json + data.js rewrite

**Files:**
- Modify: `config.json:530-569`
- Modify: `app/data.js:19-94`
- Create: `app/data.test.js`

- [ ] **Step 1: Write failing test for profile-driven data**

```js
// app/data.test.js
import { describe, expect, test } from 'bun:test'
import { DATA } from './data.js'
import appConfig from '../config.json'

describe('DATA.profile', () => {
  test('personalInfo comes from config', () => {
    expect(DATA.personalInfo.firstName).toBe(appConfig.profile.firstName)
    expect(DATA.personalInfo.lastName).toBe(appConfig.profile.lastName)
    expect(DATA.personalInfo.role).toBe(appConfig.profile.role)
  })

  test('contactInfos are filtered by visibility', () => {
    const visibleCount = appConfig.profile.contactInfos.filter(c => c.visible).length
    expect(DATA.contactInfos).toHaveLength(visibleCount)
  })

  test('skillGroups come from config', () => {
    expect(DATA.skillGroups).toEqual(appConfig.profile.skillGroups)
  })

  test('falls back to defaults when profile is missing fields', () => {
    // If a field is absent from profile, DATA should still be defined
    expect(DATA.personalInfo.bio).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test app/data.test.js`
Expected: FAIL — because `DATA` currently reads hard-coded values, not from `appConfig.profile`.

- [ ] **Step 3: Add profile block to config.json**

Append after the `"contact"` block (before the final `}`):

```json
  },
  "profile": {
    "firstName": "Sofian",
    "lastName": "BELLOUL",
    "role": "Développeur Web Full Stack",
    "bio": "Designer Framer reconverti dev — Laravel, Vue.js, Java. Mon TDAH me pousse à tout optimiser : workflows, archis complexes, et en ce moment ma transition vers un workflow full terminal. Je suis aussi à l'aise à monter une API REST qu'à mixer devant 1 200 personnes.",
    "alternance": { "start": "sept. 2026", "duration": "14 mois", "rythme": "6/2 sem." },
    "contactInfos": [
      { "key": "Âge", "value": "22 ans", "visible": true },
      { "key": "Localisation", "value": "Île-de-France", "visible": true },
      { "key": "Téléphone", "value": "07 67 54 62 09", "visible": true },
      { "key": "Email", "value": "sofian.belloul@epitech.eu", "visible": true }
    ],
    "skillGroups": [
      { "category": "Dev Web", "skills": [
        { "label": "PHP / Laravel", "tech": "laravel" }, { "label": "Vue 3 / Vite", "tech": "vue" },
        { "label": "Java SE", "tech": "java" }, { "label": "Go", "tech": "go" },
        { "label": "Tailwind", "tech": "tailwind" }, { "label": "shadcn-vue", "tech": "shadcn" },
        { "label": "MySQL", "tech": "mysql" }
      ]},
      { "category": "DevOps", "skills": [
        { "label": "Docker / Sail", "tech": "docker" }, { "label": "Git / GitHub", "tech": "git" },
        { "label": "Linux (Arch)", "tech": "linux" }, { "label": "CI/CD", "tech": "bash" },
        { "label": "SOPS / Age", "tech": "sops" }
      ]},
      { "category": "Design & IA", "skills": [
        { "label": "Figma", "tech": "figma" }, { "label": "Framer", "tech": "framer" },
        { "label": "Blender", "tech": "blender" }, { "label": "Three.js", "tech": "three" },
        { "label": "Python", "tech": "python" }, { "label": "RAG / LLMs", "tech": "rag" },
        { "label": "n8n", "tech": "n8n" }
      ]},
      { "category": "Outils & CLI", "skills": [
        { "label": "Bash / Shell", "tech": "bash" }, { "label": "Neovim / tmux", "tech": "nvim" },
        { "label": "SSH", "tech": "linux" }
      ]},
      { "category": "Soft Skills", "skills": [
        { "label": "Prise de parole", "tech": "soft" }, { "label": "Vulgarisation", "tech": "soft" },
        { "label": "Leadership", "tech": "soft" }
      ]}
    ],
    "formations": [
      {
        "title": "Développeur-Intégrateur Web",
        "badge": "BAC+2 RNCP",
        "where": "Web@cademie by EPITECH — Paris · Depuis 2024",
        "description": "Java, PHP Laravel, Vue 3. Pédagogie par projets. Prise de parole et présentations professionnelles."
      }
    ],
    "interests": [
      { "emoji": "🎧", "title": "DJ & Producteur", "detail": "+100k écoutes · Live devant +1 200 pers." },
      { "emoji": "⌨️", "title": "CLI & Productivité", "detail": "Arch, Neovim, tmux, PKM Obsidian" },
      { "emoji": "🔬", "title": "Science", "detail": "Physique quantique, cybersécurité" }
    ],
    "sectionLabels": {
      "skills": "Compétences",
      "formation": "Formation",
      "contact": "Contact",
      "interests": "Centres d'intérêt",
      "projects": "Projets"
    },
    "cvSubtitle": "CV synthétique pour recruteurs : parcours, compétences, disponibilité et projets clés en une page.",
    "cvSubtitleSize": 14,
    "heroChips": [
      { "text": "Hello", "variant": "outline" },
      { "text": "Recherche Contrat Alternance", "variant": "solid" }
    ]
  },
  "photo": ""
```

- [ ] **Step 4: Rewrite data.js to use appConfig.profile**

Replace the hard-coded blocks (lines 19-77) with profile-driven data:

```js
const profile = appConfig.profile || {}

const personalInfo = {
  firstName: profile.firstName || 'Sofian',
  lastName: profile.lastName || 'BELLOUL',
  role: profile.role || 'Développeur Web Full Stack',
  bio: profile.bio || '',
  photoUrl: appConfig.photo || null,
  alternance: profile.alternance || { start: 'sept. 2026', duration: '14 mois', rythme: '6/2 sem.' },
}

const contactInfos = (profile.contactInfos || []).filter((c) => c.visible !== false)
  .map((c) => ({ key: c.key, value: c.value }))

const socialLinks = appConfig.socialLinks || []

const skillGroups = profile.skillGroups || []

const formations = profile.formations || []

const interests = profile.interests || []

const categories = {
  dev:        { label: 'Dev',        color: 'var(--cat-dev)',        glyph: 'code' },
  webdesign:  { label: 'Webdesign',  color: 'var(--cat-webdesign)',  glyph: 'layout' },
  '3d':       { label: '3D',         color: 'var(--cat-3d)',         glyph: 'cube' },
  animation:  { label: 'Animation',  color: 'var(--cat-animation)',  glyph: 'play' },
  logo:       { label: 'Logo & Charte', color: 'var(--cat-logo)',    glyph: 'pen' },
  tooling:    { label: 'Outils',     color: 'var(--cat-tooling)',    glyph: 'tool' },
  devops:     { label: 'DevOps',     color: 'var(--cat-devops)',     glyph: 'server' },
  ai:         { label: 'IA & Data',  color: 'var(--cat-ai)',         glyph: 'brain' },
  tools:      { label: 'Outils',     color: 'var(--cat-tools)',      glyph: 'wrench' },
}

const sectionLabels = profile.sectionLabels || {}
```

Add `profile` and `sectionLabels` to the `DATA` export:

```js
export const DATA = {
  personalInfo, contactInfos, socialLinks, skillGroups, formations, interests,
  categories, projects, profile, sectionLabels,
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test app/data.test.js`
Expected: 4 pass, 0 fail

- [ ] **Step 6: Run full test suite + build to catch regressions**

Run: `bun test && bun run build`
Expected: all tests pass, build OK

- [ ] **Step 7: Commit**

```bash
git add app/data.test.js app/data.js config.json
git commit -m "feat: profile block in config.json, data.js reads from profile with fallback defaults"
```

---

### Task 2: ProfileSection in admin — identity, bio, alternance

**Files:**
- Modify: `app/admin.jsx`

- [ ] **Step 1: Add "Profil" to SECTIONS**

Insert after `'liens'` entry:

```js
  { id: 'profil',     label: 'Profil',    icon: 'user' },
```

- [ ] **Step 2: Create ProfileSection component with identity fields**

Add at the end of the file, before `PreviewPanel`:

```jsx
function ProfileSection({ profile, setProfile, showToast }) {
  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }))
  const setAlt = (k, v) => setProfile(p => ({ ...p, alternance: { ...(p.alternance || {}), [k]: v } }))

  return (
    <div className="ds-section">
      <h2 className="ds-title">Profil</h2>
      <p className="ds-sub">Identite, bio, alternance et textes affiches.</p>

      {/* Identity */}
      <div className="ds-card">
        <h3 className="ds-card-title">Identite</h3>
        <div className="ds-form-grid">
          <div className="ds-field">
            <label className="ds-label">Prenom</label>
            <input className="input" value={profile.firstName || ''} onChange={e => set('firstName', e.target.value)} placeholder="Sofian" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Nom</label>
            <input className="input" value={profile.lastName || ''} onChange={e => set('lastName', e.target.value)} placeholder="BELLOUL" />
          </div>
          <div className="ds-field" style={{ gridColumn: '1/-1' }}>
            <label className="ds-label">Role / Accroche</label>
            <input className="input" value={profile.role || ''} onChange={e => set('role', e.target.value)} placeholder="Developpeur Web Full Stack" />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="ds-card">
        <h3 className="ds-card-title">Bio</h3>
        <textarea className="textarea" style={{ minHeight: '120px' }} value={profile.bio || ''}
          onChange={e => set('bio', e.target.value)}
          placeholder="Quelques lignes sur toi..."
        />
      </div>

      {/* Alternance */}
      <div className="ds-card">
        <h3 className="ds-card-title">Alternance</h3>
        <div className="ds-form-grid">
          <div className="ds-field">
            <label className="ds-label">Debut</label>
            <input className="input" value={profile.alternance?.start || ''} onChange={e => setAlt('start', e.target.value)} placeholder="sept. 2026" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Duree</label>
            <input className="input" value={profile.alternance?.duration || ''} onChange={e => setAlt('duration', e.target.value)} placeholder="14 mois" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Rythme</label>
            <input className="input" value={profile.alternance?.rythme || ''} onChange={e => setAlt('rythme', e.target.value)} placeholder="6/2 sem." />
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run build to verify compilation**

Run: `bun run build`
Expected: build OK

- [ ] **Step 4: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: ProfileSection with identity, bio, alternance fields"
```

---

### Task 3: ProfileSection — contact infos CRUD + toggle visibility

**Files:**
- Modify: `app/admin.jsx`

- [ ] **Step 1: Add contact infos card to ProfileSection**

Insert after the alternance card's closing `</div>` and before the final `</div>` of `ProfileSection`:

```jsx
      {/* Contact infos */}
      <div className="ds-card">
        <h3 className="ds-card-title">Infos contact <span className="ds-tag-count">· {profile.contactInfos?.length || 0}</span></h3>
        {(profile.contactInfos || []).map((ci, i) => (
          <div key={i} className="ds-block-row" style={{ marginBottom: '10px' }}>
            <input className="input" value={ci.key || ''} onChange={e => {
              const next = [...(profile.contactInfos || [])]
              next[i] = { ...next[i], key: e.target.value }
              set('contactInfos', next)
            }} placeholder="Label (ex: Age)" style={{ width: '130px' }} />
            <input className="input" value={ci.value || ''} onChange={e => {
              const next = [...(profile.contactInfos || [])]
              next[i] = { ...next[i], value: e.target.value }
              set('contactInfos', next)
            }} placeholder="Valeur (ex: 22 ans)" style={{ flex: 1 }} />
            <button className={'ds-vis-btn' + (ci.visible !== false ? ' on' : '')} onClick={() => {
              const next = [...(profile.contactInfos || [])]
              next[i] = { ...next[i], visible: !(ci.visible !== false) }
              set('contactInfos', next)
            }}>
              {ci.visible !== false ? 'Visible' : 'Masque'}
            </button>
            <button className="icon-btn" onClick={() => {
              set('contactInfos', (profile.contactInfos || []).filter((_, j) => j !== i))
            }} title="Supprimer"><Icon name="trash" size={14} /></button>
          </div>
        ))}
        <button className="btn btn--ghost" style={{ marginTop: '8px' }} onClick={() => {
          set('contactInfos', [...(profile.contactInfos || []), { key: '', value: '', visible: true }])
        }}>
          <Icon name="plus" size={14} /> Ajouter une info
        </button>
      </div>
```

- [ ] **Step 2: Run build to verify compilation**

Run: `bun run build`
Expected: build OK

- [ ] **Step 3: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: contact infos CRUD with toggle visibility in ProfileSection"
```

---

### Task 4: ProfileSection — CV subtitle with slider + hero chips

**Files:**
- Modify: `app/admin.jsx`

- [ ] **Step 1: Add CV subtitle card with slider**

Insert before the contact infos card or as a new card at the end of ProfileSection:

```jsx
      {/* CV subtitle */}
      <div className="ds-card">
        <h3 className="ds-card-title">Sous-titre CV</h3>
        <div className="ds-form-grid">
          <div className="ds-field" style={{ gridColumn: '1/-1' }}>
            <label className="ds-label">Texte du sous-titre</label>
            <input className="input" value={profile.cvSubtitle || ''} onChange={e => set('cvSubtitle', e.target.value)}
              placeholder="CV synthétique pour recruteurs..." />
          </div>
          <div className="ds-field">
            <label className="ds-label">Taille du texte <span className="ds-tag-count">· {profile.cvSubtitleSize || 14}px</span></label>
            <input type="range" min="12" max="32" value={profile.cvSubtitleSize || 14}
              onChange={e => set('cvSubtitleSize', Number(e.target.value))}
              style={{ width: '100%', marginTop: '6px' }} />
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Add hero chips card**

```jsx
      {/* Hero chips */}
      <div className="ds-card">
        <h3 className="ds-card-title">Pills de l'accueil</h3>
        {(profile.heroChips || []).map((chip, i) => (
          <div key={i} className="ds-block-row" style={{ marginBottom: '10px' }}>
            <select className="select" value={chip.variant || 'outline'} onChange={e => {
              const next = [...(profile.heroChips || [])]
              next[i] = { ...next[i], variant: e.target.value }
              set('heroChips', next)
            }} style={{ width: '110px' }}>
              <option value="outline">Outline</option>
              <option value="solid">Plein</option>
            </select>
            <input className="input" value={chip.text || ''} onChange={e => {
              const next = [...(profile.heroChips || [])]
              next[i] = { ...next[i], text: e.target.value }
              set('heroChips', next)
            }} placeholder="Texte de la pill" style={{ flex: 1 }} />
            <button className="icon-btn" onClick={() => {
              set('heroChips', (profile.heroChips || []).filter((_, j) => j !== i))
            }} title="Supprimer"><Icon name="trash" size={14} /></button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button className="btn btn--ghost" onClick={() => {
            set('heroChips', [...(profile.heroChips || []), { text: '', variant: 'outline' }])
          }}><Icon name="plus" size={14} /> Ajouter outline</button>
          <button className="btn btn--ghost" onClick={() => {
            set('heroChips', [...(profile.heroChips || []), { text: '', variant: 'solid' }])
          }}><Icon name="plus" size={14} /> Ajouter plein</button>
        </div>
      </div>
```

- [ ] **Step 3: Run build to verify compilation**

Run: `bun run build`
Expected: build OK

- [ ] **Step 4: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: CV subtitle slider + hero chips CRUD in ProfileSection"
```

---

### Task 5: ProfileSection — skill groups, formations, interests CRUD

**Files:**
- Modify: `app/admin.jsx`

- [ ] **Step 1: Add skill groups card**

Insert a new card after the existing cards in ProfileSection:

```jsx
      {/* Skill groups */}
      <div className="ds-card">
        <h3 className="ds-card-title">Competences</h3>
        {(profile.skillGroups || []).map((group, gi) => (
          <div key={gi} style={{ marginBottom: '16px', border: '1px solid var(--admin-line)', borderRadius: '12px', padding: '12px' }}>
            <div className="ds-block-row" style={{ marginBottom: '10px' }}>
              <input className="input" value={group.category || ''} onChange={e => {
                const next = [...(profile.skillGroups || [])]
                next[gi] = { ...next[gi], category: e.target.value }
                set('skillGroups', next)
              }} placeholder="Categorie (ex: Dev Web)" style={{ flex: 1 }} />
              <button className="icon-btn" onClick={() => {
                set('skillGroups', (profile.skillGroups || []).filter((_, j) => j !== gi))
              }} title="Supprimer le groupe"><Icon name="trash" size={14} /></button>
            </div>
            {(group.skills || []).map((sk, si) => (
              <div key={si} className="ds-block-row" style={{ marginBottom: '6px' }}>
                <input className="input" value={sk.label || ''} onChange={e => {
                  const next = [...(profile.skillGroups || [])]
                  const skills = [...(next[gi].skills || [])]
                  skills[si] = { ...skills[si], label: e.target.value }
                  next[gi] = { ...next[gi], skills }
                  set('skillGroups', next)
                }} placeholder="Label (ex: PHP / Laravel)" style={{ flex: 1 }} />
                <select className="select" value={sk.tech || 'default'} onChange={e => {
                  const next = [...(profile.skillGroups || [])]
                  const skills = [...(next[gi].skills || [])]
                  skills[si] = { ...skills[si], tech: e.target.value }
                  next[gi] = { ...next[gi], skills }
                  set('skillGroups', next)
                }} style={{ width: '110px' }}>
                  {['laravel','vue','java','go','tailwind','shadcn','mysql','docker','git','linux','bash','nvim','figma','framer','python','rag','n8n','blender','three','js','ts','shopify','ae','illustrator','default','soft','node','sops'].map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <button className="icon-btn" onClick={() => {
                  const next = [...(profile.skillGroups || [])]
                  next[gi] = { ...next[gi], skills: (next[gi].skills || []).filter((_, j) => j !== si) }
                  set('skillGroups', next)
                }} title="Supprimer"><Icon name="x" size={12} /></button>
              </div>
            ))}
            <button className="btn btn--ghost" onClick={() => {
              const next = [...(profile.skillGroups || [])]
              next[gi] = { ...next[gi], skills: [...(next[gi].skills || []), { label: '', tech: 'default' }] }
              set('skillGroups', next)
            }}><Icon name="plus" size={12} /> Ajouter skill</button>
          </div>
        ))}
        <button className="btn btn--ghost" onClick={() => {
          set('skillGroups', [...(profile.skillGroups || []), { category: '', skills: [] }])
        }}><Icon name="plus" size={14} /> Ajouter groupe</button>
      </div>
```

- [ ] **Step 2: Add formations card**

```jsx
      {/* Formations */}
      <div className="ds-card">
        <h3 className="ds-card-title">Formations</h3>
        {(profile.formations || []).map((f, i) => (
          <div key={i} style={{ marginBottom: '16px', border: '1px solid var(--admin-line)', borderRadius: '12px', padding: '12px' }}>
            <div className="ds-block-row" style={{ marginBottom: '6px', justifyContent: 'space-between' }}>
              <strong>Formation {i + 1}</strong>
              <button className="icon-btn" onClick={() => set('formations', (profile.formations || []).filter((_, j) => j !== i))} title="Supprimer">
                <Icon name="trash" size={14} />
              </button>
            </div>
            <input className="input" value={f.title || ''} onChange={e => {
              const next = [...(profile.formations || [])]
              next[i] = { ...next[i], title: e.target.value }
              set('formations', next)
            }} placeholder="Titre" style={{ marginBottom: '6px' }} />
            <div className="ds-block-row" style={{ gap: '8px', marginBottom: '6px' }}>
              <input className="input" value={f.badge || ''} onChange={e => {
                const next = [...(profile.formations || [])]
                next[i] = { ...next[i], badge: e.target.value }
                set('formations', next)
              }} placeholder="Badge (ex: BAC+2 RNCP)" style={{ width: '150px' }} />
              <input className="input" value={f.where || ''} onChange={e => {
                const next = [...(profile.formations || [])]
                next[i] = { ...next[i], where: e.target.value }
                set('formations', next)
              }} placeholder="Etablissement" style={{ flex: 1 }} />
            </div>
            <textarea className="textarea" value={f.description || ''} onChange={e => {
              const next = [...(profile.formations || [])]
              next[i] = { ...next[i], description: e.target.value }
              set('formations', next)
            }} placeholder="Description" style={{ minHeight: '60px' }} />
          </div>
        ))}
        <button className="btn btn--ghost" onClick={() => {
          set('formations', [...(profile.formations || []), { title: '', badge: '', where: '', description: '' }])
        }}><Icon name="plus" size={14} /> Ajouter formation</button>
      </div>
```

- [ ] **Step 3: Add interests card**

```jsx
      {/* Interests */}
      <div className="ds-card">
        <h3 className="ds-card-title">Centres d'interet</h3>
        {(profile.interests || []).map((it, i) => (
          <div key={i} className="ds-block-row" style={{ marginBottom: '10px' }}>
            <input className="input" value={it.emoji || ''} onChange={e => {
              const next = [...(profile.interests || [])]
              next[i] = { ...next[i], emoji: e.target.value }
              set('interests', next)
            }} placeholder="Emoji" style={{ width: '60px', textAlign: 'center' }} />
            <input className="input" value={it.title || ''} onChange={e => {
              const next = [...(profile.interests || [])]
              next[i] = { ...next[i], title: e.target.value }
              set('interests', next)
            }} placeholder="Titre" style={{ width: '160px' }} />
            <input className="input" value={it.detail || ''} onChange={e => {
              const next = [...(profile.interests || [])]
              next[i] = { ...next[i], detail: e.target.value }
              set('interests', next)
            }} placeholder="Detail" style={{ flex: 1 }} />
            <button className="icon-btn" onClick={() => {
              set('interests', (profile.interests || []).filter((_, j) => j !== i))
            }} title="Supprimer"><Icon name="trash" size={14} /></button>
          </div>
        ))}
        <button className="btn btn--ghost" onClick={() => {
          set('interests', [...(profile.interests || []), { emoji: '', title: '', detail: '' }])
        }}><Icon name="plus" size={14} /> Ajouter interet</button>
      </div>
```

- [ ] **Step 4: Add section labels card**

```jsx
      {/* Section labels */}
      <div className="ds-card">
        <h3 className="ds-card-title">Libelles de sections</h3>
        <div className="ds-form-grid">
          {['skills','formation','contact','interests','projects'].map(key => (
            <div className="ds-field" key={key}>
              <label className="ds-label">{key}</label>
              <input className="input" value={profile.sectionLabels?.[key] || ''}
                onChange={e => set('sectionLabels', { ...(profile.sectionLabels || {}), [key]: e.target.value })}
                placeholder={key} />
            </div>
          ))}
        </div>
      </div>
```

- [ ] **Step 5: Run build to verify compilation**

Run: `bun run build`
Expected: build OK

- [ ] **Step 6: Commit**

```bash
git add app/admin.jsx
git commit -m "feat: skill groups, formations, interests, section labels CRUD in ProfileSection"
```

---

### Task 6: Wire profile data into pages

**Files:**
- Modify: `app/home.jsx:17-22` (hero chips)
- Modify: `app/home.jsx:50-51` (section titles)
- Modify: `app/cv.jsx:50-52` (CV subtitle)

- [ ] **Step 1: Update home.jsx hero chips to use profile data**

Replace lines 17-22:

```jsx
          <div className="hero-pills">
            {(DATA.profile?.heroChips || [{ text: 'Hello', variant: 'outline' }, { text: 'Recherche Contrat Alternance', variant: 'solid' }]).map((chip, i) => (
              <Chip key={i} variant={chip.variant || 'outline'}>
                {i === 0 && <Icon name="sparkle" size={13} />} {chip.text}
              </Chip>
            ))}
          </div>
```

- [ ] **Step 2: Update home.jsx section titles to use sectionLabels**

Replace `SectionTitle title="Compétences"` → `SectionTitle title={DATA.sectionLabels.skills || 'Compétences'}`  
Replace `SectionTitle title="Contact"` → `SectionTitle title={DATA.sectionLabels.contact || 'Contact'}`  
Replace `SectionTitle title="Formation"` → `SectionTitle title={DATA.sectionLabels.formation || 'Formation'}`  
Replace `SectionTitle title="Centres d'intérêt"` → `SectionTitle title={DATA.sectionLabels.interests || "Centres d'intérêt"}`  
Replace `SectionTitle title="Projets"` → `SectionTitle title={DATA.sectionLabels.projects || 'Projets'}`

- [ ] **Step 3: Update cv.jsx subtitle to use profile data**

Replace the hard-coded subtitle on line 51:

```jsx
        <p className="page-sub" style={{ fontSize: (DATA.profile?.cvSubtitleSize || 14) + 'px' }}>{DATA.profile?.cvSubtitle || "CV synthetique pour recruteurs : parcours, competences, disponibilite et projets cles en une page."}</p>
```

- [ ] **Step 4: Run full test suite + build**

Run: `bun test && bun run build`
Expected: all tests pass, build OK

- [ ] **Step 5: Commit**

```bash
git add app/home.jsx app/cv.jsx
git commit -m "feat: pages use profile data for hero chips, section labels, CV subtitle"
```

---

### Task 7: Integration — sidebar entry, profile state, save wiring, CSS

**Files:**
- Modify: `app/admin.jsx`
- Modify: `app/dashboard.css`

- [ ] **Step 1: Add profile to useConfigState**

Add profile state to the `useConfigState` hook (around lines 50-62):

```jsx
  const [profile, setProfile] = useState(() => ({ ...(APP_CONFIG.profile || {}) }))
```

Add `profile` and `setProfile` to the returned object:

```jsx
  return { projects, setProjects, socialLinks, setSocialLinks, photo, setPhoto,
    appearance, setAppearance, cv, setCv, contact, setContact, profile, setProfile, config }
```

Update `config` to include profile:

```jsx
  const config = buildConfig(projects, socialLinks, photo, appearance, cv, contact, profile)
```

- [ ] **Step 2: Update buildConfig to include profile**

```jsx
function buildConfig(projects, socialLinks, photo, appearance, cv, contact, profile) {
  const featuredIds = new Set(cv?.featured || [])
  const projWithFeatured = projects.map(p => ({...p, featured: featuredIds.has(p.id)}))
  return {
    projects: projWithFeatured,
    socialLinks,
    photo: photo || '',
    appearance: appearance || {},
    cv: cv || {},
    contact: contact || {},
    profile: profile || {},
  }
}
```

- [ ] **Step 3: Render ProfileSection in DashboardView**

Add the profile rendering line in the dash-content section (after `liens`):

```jsx
          {section === 'profil'    && <ProfileSection profile={profile} setProfile={setProfile} showToast={showToast} />}
```

- [ ] **Step 4: Update save and sync to include profile**

In `DashboardView`, update all `buildConfig(...)` calls to include `profile`:

```jsx
    const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact, profile)
```

In `syncToIframe`:

```jsx
    const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact, profile)
```

In `handleSave`:

```jsx
    const cfg = buildConfig(merged, socialLinks, photo, appearance, cv, contact, profile)
```

- [ ] **Step 5: Add profile CSS styles**

Add to `app/dashboard.css`:

```css
.dashboard-v5 .ds-block-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dashboard-v5 input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: var(--admin-line);
  border-radius: 3px;
  outline: none;
}

.dashboard-v5 input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,.15);
}
```

- [ ] **Step 6: Run full test suite + build**

Run: `bun test && bun run build`
Expected: all tests pass, build OK

- [ ] **Step 7: Commit**

```bash
git add app/admin.jsx app/dashboard.css
git commit -m "feat: integrate ProfileSection into dashboard with save, preview, and sidebar entry"
```

---

### Task 8: Final verification

**Commands:**
- `bun test app/data.test.js`
- `bun test app/config-runtime.test.js`
- `bun test app/cv-selection.test.js`
- `bun test admin-upload-utils.test.js`
- `bun test app/project-gallery.test.js`
- `bun test app/admin-save.test.js`
- `bun test vite-admin-plugin.test.js`
- `bun run build`
