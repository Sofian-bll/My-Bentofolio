# Experiences Section — Design Spec

> **Status:** Approved  
> **Date:** 2026-06-17  
> **Goal:** Add a dedicated "Experiences" section (separate from "Formation") with its own page, CV integration, admin CRUD, and updated navigation.

## Architecture

```
config.json
├── experiences     (NEW — professional experience entries)
├── profile         (existing)
├── projects        (existing)
└── ...

app/experiences.jsx  (NEW — gallery page + detail, modeled on projects.jsx)
app/cv.jsx           (MODIFY — add Experiences section)
app/app.jsx          (MODIFY — route + nav)
app/admin.jsx        (MODIFY — ExperiencesSection CRUD)
app/data.js          (MODIFY — read experiences from config)
```

## Data Model

```json
{
  "experiences": [
    {
      "id": "freelance-dev",
      "title": "Developpeur Full Stack Freelance",
      "company": "Independant",
      "location": "Ile-de-France",
      "period": "2025-2026",
      "description": "...",
      "highlights": ["..."],
      "techs": [{ "label": "Laravel", "tech": "laravel" }],
      "featured": true
    }
  ]
}
```

Fields: `id`, `title`, `company`, `location`, `period`, `description`, `highlights[]`, `techs[]`, `featured`

## Pages

### /#/experiences
- Gallery of cards (same card pattern as projects)
- Each card: title, company, period, techs, description
- Click opens detail modal (same pattern as ProjectDetailView)
- Simple layout, no category filter

### CV — Experiences section
- Inserted between Formation and Projets sections
- Only shows `featured: true` experiences
- Same visual style as CV project cards

### Navigation
- Menu: Accueil | Projets | Experiences | CV | Contact

## Admin

- New "Experiences" sidebar section
- CRUD list + form (same pattern as ProjectsSection)
- Fields: title, company, location, period, description, highlights, techs, featured toggle
- Live preview via existing syncToIframe

## Files

| File | Change |
|------|--------|
| `config.json` | Add `experiences` array |
| `app/data.js` | Read `appConfig.experiences`, export in DATA |
| `app/experiences.jsx` | New — gallery page + detail modal |
| `app/cv.jsx` | New Experiences section on CV |
| `app/app.jsx` | Route `/#/experiences`, updated nav |
| `app/admin.jsx` | `ExperiencesSection` CRUD + sidebar entry |

## Out of Scope
- Home bento cell for experiences (can be added later)
- Markdown descriptions (separate feature)
