# Profile CMS — Design Spec

> **Status:** Approved  
> **Date:** 2026-06-16  
> **Goal:** Make every visible text/value on the portfolio editable through the admin dashboard via a new "Profil" panel. Migrate hard-coded user data from `app/data.js` into `config.json`.

## Architecture

```
config.json  (single source of truth)
├── profile        (NEW — user identity, bio, skills, formation, etc.)
├── projects       (existing)
├── socialLinks    (existing)
├── appearance     (existing)
├── cv             (existing — style only: pills, photo, bullets, density)
├── contact        (existing — Formspree, optional fields)
└── photo          (existing — profile photo)

app/data.js        → reads ALL fields from profile, no hard-coded data
app/admin.jsx      → new "Profil" section in sidebar, CRUD panels per data type
app/home.jsx       → uses DATA.profile for hero chips, section labels
app/cv.jsx         → uses DATA.profile for cvSubtitle + cvSubtitleSize
```

## Data Model

The `"profile"` key is added to `config.json`:

```json
{
  "profile": {
    "firstName": "Sofian",
    "lastName": "BELLOUL",
    "role": "Developpeur Web Full Stack",
    "bio": "...",
    "alternance": { "start": "sept. 2026", "duration": "14 mois", "rythme": "6/2 sem." },
    "contactInfos": [
      { "key": "Age", "value": "22 ans", "visible": true },
      { "key": "Localisation", "value": "Ile-de-France", "visible": true },
      { "key": "Telephone", "value": "07 67 54 62 09", "visible": true },
      { "key": "Email", "value": "sofian.belloul@epitech.eu", "visible": true }
    ],
    "skillGroups": [
      {
        "category": "Dev Web",
        "skills": [
          { "label": "PHP / Laravel", "tech": "laravel" },
          { "label": "Vue 3 / Vite", "tech": "vue" }
        ]
      }
    ],
    "formations": [
      {
        "title": "Developpeur-Integrateur Web",
        "badge": "BAC+2 RNCP",
        "where": "Web@cademie by EPITECH — Paris · Depuis 2024",
        "description": "Java, PHP Laravel, Vue 3..."
      }
    ],
    "interests": [
      { "emoji": "🎧", "title": "DJ & Producteur", "detail": "+100k ecoutes..." }
    ],
    "sectionLabels": {
      "skills": "Competences",
      "formation": "Formation",
      "contact": "Contact",
      "interests": "Centres d'interet",
      "projects": "Projets"
    },
    "cvSubtitle": "CV Dev Full Stack",
    "cvSubtitleSize": 18,
    "heroChips": [
      { "text": "Hello", "variant": "outline" },
      { "text": "Recherche Contrat Alternance", "variant": "solid" }
    ]
  }
}
```

## Controls Mapping

| Data Block | Fields | Admin Control |
|-----------|--------|---------------|
| Identity | firstName, lastName, role | `<input>` text |
| Bio | bio | `<textarea>` + live preview |
| Alternance | start, duration, rythme | 3 `<input>` text |
| Contact info | rows (key, value, visible) | CRUD table + toggle per row |
| CV subtitle | cvSubtitle | `<input>` text |
| CV subtitle size | cvSubtitleSize | `<input type="range">` slider (12–32px) |
| Hero chips | heroChips | CRUD (text + variant select) |
| Skills | skillGroups | CRUD groups + skills |
| Formation | formations | CRUD (title, badge, where, desc) |
| Interests | interests | CRUD (emoji, title, detail) |
| Section labels | sectionLabels | 5 `<input>` text |

## Admin Panel

- New "Profil" sidebar entry (between "Liens" and "Backup")
- Each data block gets its own card in the panel
- Live preview: every field change triggers `syncToIframe()` (600ms debounce) via existing postMessage mechanism
- Global "Sauvegarder" button writes full `config.json` via `POST /api/admin/save`

## Migration

1. Copy current hard-coded values from `app/data.js` into `config.json` under `"profile"`
2. Rewrite `app/data.js` to read fields from `appConfig.profile` instead of literals
3. Add `DATA.sectionLabels` for use in pages
4. Add fallback defaults in `data.js` for any missing profile fields (backward compat)
5. Remove hard-coded arrays/objects from `data.js`

## Files Affected

| File | Change |
|------|--------|
| `config.json` | Add `profile` block with current values |
| `app/data.js` | Read identity/contact/skills/formation/interests from `appConfig.profile` |
| `app/admin.jsx` | New `ProfileSection` component + sidebar entry |
| `app/home.jsx` | Hero chips from `DATA.profile`, section labels from `DATA.sectionLabels` |
| `app/cv.jsx` | CV subtitle + size from `DATA.profile` |
| `app/dashboard.css` | Styles for profile CRUD cards, slider, toggles |

## Out of Scope

- Inline editing on public pages (stays admin-centralized)
- Navigation labels (nav items stay hard-coded for now)
- Profile photo upload (already handled in CV section)
