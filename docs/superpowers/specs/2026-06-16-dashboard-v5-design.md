# Dashboard V5 — Design Spec

## Overview

Refonte du dashboard admin Bentofolio : layout 2 colonnes avec preview live intégrée, persistance disque via `config.json`, suppression de la sidebar flottante, unifié dans le dashboard.

## User Stories

### Visiteur / Recruteur
- V1: Voir aperçu clair du profil en arrivant
- V2: Naviguer entre sections (projets, CV, contact)
- V3: Voir liste projets avec filtres par catégorie
- V4: Consulter détail d'un projet (stack, rôle, étude de cas)
- V5: Télécharger CV en PDF A4
- V6: Voir infos contact et statut dispo alternance
- V7: Dark/light mode

### Admin (Sofian)
- A1: CRUD projets (ajouter, modifier, supprimer)
- A2: Changer apparence (couleur, police, densité, arrondi)
- A3: Aperçu live en temps réel des changements
- A4: Sélectionner projets qui apparaissent sur le CV
- A5: Uploader/changer photo de profil
- A6: Gérer liens sociaux visibles
- A7: Configurer formulaire de contact (Formspree, champs)
- A8: Export/import backup JSON des settings
- A9: Login/logout avec mot de passe

## Architecture

```
bun dev
  │
  ├── Dashboard Admin (React, colonne gauche)
  │     ├── Projets (CRUD)
  │     ├── Apparence (accent, police, densité, arrondi)
  │     ├── CV (sélection projets, style, photo)
  │     ├── Contact (Formspree, champs optionnels)
  │     └── Backup (export/import JSON)
  │
  ├── Preview iframe (colonne droite)
  │     └── Reflète changements en temps réel
  │
  └── Vite Plugin (dev mode)
        └── POST /api/admin/save → écrit config.json sur disque

bun run build
  └── config.json bundlé dans dist/ → prêt pour GitHub Pages
```

## Data Flow

```
┌────────────┐   save    ┌─────────────┐   POST /api/admin/save   ┌──────────────┐
│  Admin UI  │ ────────► │  Dashboard   │ ──────────────────────► │  Vite Plugin  │
│  (React)   │           │  (state)     │                         │  (dev only)   │
└────────────┘           └─────────────┘                         └──────┬───────┘
                                                                       │
                                                              ┌────────▼───────┐
                                                              │  config.json   │
                                                              │  (disque)      │
                                                              └────────┬───────┘
                                                                       │
┌────────────┐   read    ┌─────────────┐   import           ┌────────▼───────┐
│  data.js   │ ◄─────── │  App shell  │ ◄───────────────── │  bundled        │
│  (runtime) │           │             │                     │  in dist/       │
└────────────┘           └─────────────┘                    └────────────────┘
```

## config.json Schema

```json
{
  "projects": [...],
  "socialLinks": [...],
  "photo": "...",
  "cv": { "featured": ["id1","id2"], "pills": "couleur", "cvPhoto": "moyenne", "cvMaxBullets": 2, "cvCardDensity": "normal" },
  "appearance": { "accent": "#6366f1", "displayFont": "Syne", "density": "cozy", "radius": "doux", "photo": "compact" },
  "contact": { "formspreeUrl": "", "contactShowStatus": true, "contactShowPhone": true, "contactShowType": true }
}
```

## Components

### Nouveaux
- `ConfigLoader` — charge config.json au runtime, fallback values hardcodées
- `ViteAdminPlugin` — intercepte POST /api/admin/save, écrit config.json

### Modifiés
- `app/admin.jsx` — refonte complète : layout 2 colonnes, plus de sidebar
- `app/app.jsx` — retirer AdminSidebar, adapter le routing admin
- `app/data.js` — accepter config.json comme source, fallback aux valeurs hardcodées
- `app/cv.jsx` — mise à jour pour lire depuis le nouvel état
- `app/contact.jsx` — idem

### Supprimés
- `app/admin-sidebar.jsx` — sidebar flottante supprimée

## Error Handling
- Si config.json absent → fallback silencieux aux valeurs hardcodées dans data.js
- Si POST échoue (prod/GitHub Pages) → les changements restent dans le state React (session courante)
- Si localStorage corrompu → fallback aux défauts
- Export backup → try/catch avec toast utilisateur

## Testing
- `bun dev` → dashboard charge, preview fonctionne
- Modifier un projet → preview reflète le changement
- Sauvegarder → config.json mis à jour sur disque
- `bun run build` → dist/ contient le bon config.json
- Route admin protégée par mot de passe
- Export/import JSON fonctionnel
