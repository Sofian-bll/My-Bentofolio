# Configuration Reference — `config.json`

## Overview

`config.json` is the **single source of truth** for all site-level settings: appearance, profile, CV layout, contact form, social links, and work experiences. Projects are **not** stored here anymore — they live in `content/projects/` (see [PROJECTS.md](./PROJECTS.md)).

The file lives at the project root and is imported directly by `app/data.js` at build time.

## How config is loaded

```
config.json
  │
  ├── app/data.js          → imports baseConfig via `import baseConfig from '../config.json'`
  │                           merges in projects from content/projects/index.json
  │
  ├── app/config-runtime.js → resolveAppConfig() applies preview overrides when running
  │                           inside the admin iframe (via localStorage key bentofolio.preview)
  │
  └── app/admin-save.js    → saveConfigToDisk() POSTs the full config to /api/admin/save
```

In production, `config.json` is bundled by Vite as a static import. In dev mode, the admin dashboard saves changes directly to disk via the Vite admin plugin.

---

## Top-level keys

### `socialLinks` — `array`

Array of social link objects displayed in the sidebar and contact section.

| Field  | Type     | Description                                   |
|--------|----------|-----------------------------------------------|
| icon   | `string` | Icon identifier (e.g. `"linkedin"`, `"github"`, `"x"`) |
| label  | `string` | Display label (e.g. `"in/sofianbll"`)         |
| href   | `string` | Full URL                                      |

```json
"socialLinks": [
  { "icon": "linkedin", "label": "in/sofianbll", "href": "https://www.linkedin.com/in/sofianbll/" },
  { "icon": "github", "label": "Sofian-bll", "href": "https://github.com/Sofian-bll" }
]
```

---

### `photo` — `string`

Path to the profile photo. Empty string means no photo. Supported values:

- **Relative path**: `"media/photo.jpg"` (resolved with `VITE_BASE_URL`)
- **Absolute URL**: `"https://example.com/photo.jpg"`
- **Data URL**: `"data:image/png;base64,..."`
- **Empty**: `""` (no photo)

```json
"photo": "media/photo.jpg"
```

---

### `appearance` — `object`

Controls the visual appearance of the portfolio.

| Key                | Type     | Description                                                | Example         |
|--------------------|----------|------------------------------------------------------------|-----------------|
| `accent`           | `string` | CSS color value for brand accent                          | `"#6366f1"`     |
| `displayFont`      | `string` | Font family for headings (falls back to `'Syne', sans-serif`) | `"Sora"`     |
| `density`          | `string` | Global spacing density: `"compact"`, `"cozy"`, `"large"`  | `"compact"`     |
| `radius`           | `string` | Border radius style (maps to CSS vars)                    | `"doux"`        |
| `photo`            | `string` | Photo display size: `"compact"`, `"medium"`, `"large"`   | `"compact"`     |
| `photoPosition`    | `string` | CSS `object-position` for photo (fallback if page-specific not set) | `"center 16%"` |
| `photoPositionHome`| `string` | CSS `object-position` for photo on the home page          | `"50% 61%"`     |
| `photoPositionCv`  | `string` | CSS `object-position` for photo on the CV page            | `"50% 61%"`     |

```json
"appearance": {
  "accent": "#6366f1",
  "displayFont": "Sora",
  "density": "compact",
  "radius": "doux",
  "photo": "compact",
  "photoPosition": "center 16%",
  "photoPositionHome": "50% 61%",
  "photoPositionCv": "50% 61%"
}
```

**Density gap values** (set via CSS `--bento-gap`):
- `compact` → `12px`
- `cozy` → `16px`
- `large` → `24px`

---

### `cv` — `object`

Controls the CV/Resume page layout.

| Key             | Type       | Description                                                    |
|-----------------|------------|----------------------------------------------------------------|
| `featured`      | `string[]` | Array of project IDs to highlight on the CV page               |
| `cvPills`       | `string`   | Tech pill style: `"mono"` or `"color"`                         |
| `cvPhoto`       | `string`   | Photo size on CV: `"petite"`, `"moyenne"`, `"grande"`          |
| `cvMaxBullets`  | `number`   | Maximum bullet points shown per project card on CV             |
| `cvCardDensity` | `string`   | Card spacing on CV: `"compact"`, `"cozy"`, `"large"`           |

```json
"cv": {
  "featured": ["connect-in", "connect-in-java", "sshk", "rage-ui"],
  "cvPills": "mono",
  "cvPhoto": "moyenne",
  "cvMaxBullets": 2,
  "cvCardDensity": "compact"
}
```

---

### `contact` — `object`

Controls the contact section and form.

| Key                | Type      | Description                                         | Default |
|--------------------|-----------|----------------------------------------------------|---------|
| `formspreeUrl`     | `string`  | Formspree form endpoint URL (empty = no form)      | `""`    |
| `contactShowStatus`| `boolean` | Show availability status badge                     | `true`  |
| `contactShowPhone` | `boolean` | Show phone number in contact section               | `true`  |
| `contactShowType`  | `boolean` | Show contract type (alternance) info               | `true`  |

```json
"contact": {
  "formspreeUrl": "https://formspree.io/f/xxxxxxx",
  "contactShowStatus": true,
  "contactShowPhone": true,
  "contactShowType": true
}
```

---

### `experiences` — `array`

Work experience entries displayed in the experience section.

| Field         | Type       | Description                                            |
|---------------|------------|--------------------------------------------------------|
| `id`          | `string`   | Unique identifier (slug-style)                         |
| `title`       | `string`   | Job title                                              |
| `company`     | `string`   | Company name                                           |
| `location`    | `string`   | Geographic location                                    |
| `period`      | `string`   | Time period (e.g. `"2025-2026"`)                       |
| `description` | `string`   | Short paragraph describing the role                    |
| `highlights`  | `string[]` | Bullet points of achievements                          |
| `techs`       | `array`    | Array of `{ label: string, tech: string }` objects     |
| `featured`    | `boolean`  | Whether to showcase prominently                        |

```json
"experiences": [
  {
    "id": "freelance-dev",
    "title": "Developpeur Full Stack Freelance",
    "company": "Independant",
    "location": "Ile-de-France",
    "period": "2025-2026",
    "description": "Conception et developpement d'applications web full-stack sur mesure...",
    "highlights": [
      "5 projets livres en production",
      "Architecture REST API avec Sanctum",
      "Integrations Docker et deploiement continu"
    ],
    "techs": [
      { "label": "Laravel", "tech": "laravel" },
      { "label": "Vue 3", "tech": "vue" },
      { "label": "Docker", "tech": "docker" }
    ],
    "featured": true
  }
]
```

---

### `profile` — `object`

All personal identity and content configuration.

#### Identity fields

| Key                  | Type     | Description                              |
|----------------------|----------|------------------------------------------|
| `firstName`          | `string` | First name                                |
| `lastName`           | `string` | Last name                                 |
| `role`               | `string` | Professional title                        |
| `bio`                | `string` | Short biography (markdown-compatible)     |
| `cvSubtitle`         | `string` | Subtitle text on the CV page              |
| `cvSubtitleSize`     | `number` | Font size in pixels for CV subtitle       |
| `webExperienceSince` | `number` | Starting year of web dev experience       |

#### `alternance` — `object`

| Key      | Type     | Example          |
|----------|----------|------------------|
| `start`  | `string` | `"sept. 2026"`   |
| `duration`| `string`| `"14 mois"`      |
| `rythme` | `string` | `"6/2 sem."`     |

#### `contactInfos` — `array`

Array of contact detail entries. Each entry:

| Key     | Type      | Description                       |
|---------|-----------|-----------------------------------|
| `key`   | `string`  | Label (e.g. `"Email"`, `"Âge"`)   |
| `value` | `string`  | Value                             |
| `visible`| `boolean`| Whether to show publicly          |

Entries with `visible: false` are filtered out at runtime.

#### `skillGroups` — `array`

Skill categories, each containing:

| Key       | Type     | Description                                    |
|-----------|----------|------------------------------------------------|
| `category`| `string` | Group label (e.g. `"Dev Web"`, `"DevOps"`)     |
| `skills`  | `array`  | Array of `{ label: string, tech: string }`     |

The `tech` value maps to a tech key (see [Tech tags in PROJECTS.md](./PROJECTS.md)).

#### `formations` — `array`

Education/training entries:

| Key           | Type     | Description                    |
|---------------|----------|--------------------------------|
| `title`       | `string` | Qualification title            |
| `badge`       | `string` | Badge text (e.g. `"BAC+2 RNCP"`) |
| `where`       | `string` | Institution and date           |
| `description` | `string` | Short description              |

#### `interests` — `array`

Personal interests:

| Key     | Type     | Description            |
|---------|----------|------------------------|
| `emoji`  | `string` | Emoji icon             |
| `title`  | `string` | Interest title         |
| `detail` | `string` | Descriptive detail     |

#### `sectionLabels` — `object`

Customizable section heading labels:

| Key            | Type     | Default                 |
|----------------|----------|-------------------------|
| `skills`       | `string` | `"Compétences"`         |
| `formation`    | `string` | `"Formation"`           |
| `contact`      | `string` | `"Contact"`             |
| `interests`    | `string` | `"Centres d'intérêt"`  |
| `projects`     | `string` | `"Projets"`             |

#### `heroChips` — `array`

Chips displayed in the hero section header:

| Key     | Type     | Description                          |
|---------|----------|--------------------------------------|
| `text`  | `string` | Display text                         |
| `variant`| `string`| `"outline"` or `"solid"`             |

```json
"profile": {
  "firstName": "Sofian",
  "lastName": "BELLOUL",
  "role": "Développeur Web Full Stack",
  "bio": "Designer Framer reconverti dev...",
  "alternance": {
    "start": "sept. 2026",
    "duration": "14 mois",
    "rythme": "6/2 sem."
  },
  "contactInfos": [
    { "key": "Âge", "value": "22 ans", "visible": false },
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
      "title": "Développeur-Intégrateur Web",
      "badge": "BAC+2 RNCP",
      "where": "Web@cademie by EPITECH — Paris · Depuis 2024",
      "description": "Java, PHP Laravel, Vue 3..."
    }
  ],
  "interests": [
    { "emoji": "🎧", "title": "DJ & Producteur", "detail": "+100k écoutes" }
  ],
  "sectionLabels": {
    "skills": "Compétences",
    "projects": "Projets"
  },
  "cvSubtitle": "CV synthétique pour recruteurs...",
  "cvSubtitleSize": 14,
  "webExperienceSince": 2024,
  "heroChips": [
    { "text": "Hello", "variant": "outline" },
    { "text": "Recherche Contrat Alternance", "variant": "solid" }
  ]
}
```

---

## Admin save behavior

When the admin dashboard saves configuration (`POST /api/admin/save`), it writes these top-level keys to `config.json`:

- `appearance`
- `profile`
- `cv`
- `contact`
- `socialLinks`
- `experiences`
- `photo`

Projects are **not** saved to `config.json` — they are handled separately via the project endpoints (`/api/admin/project/save` and `/api/admin/project/delete`).

---

## Common patterns

**Adding a social link:**
```json
{ "icon": "x", "label": "@handle", "href": "https://x.com/handle" }
```

**Hiding a contact info from the public site:**
```json
{ "key": "Téléphone", "value": "07 67 54 62 09", "visible": false }
```

**Setting a formspree contact form:**
```json
"contact": {
  "formspreeUrl": "https://formspree.io/f/xabcdefg",
  "contactShowStatus": true,
  "contactShowPhone": false,
  "contactShowType": true
}
```

**Changing the accent color:**
```json
"appearance": {
  "accent": "#10b981"
}
```

**Adding a hero chip:**
```json
"heroChips": [
  { "text": "Hello", "variant": "outline" },
  { "text": "Disponible", "variant": "solid" }
]
```
