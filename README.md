# Bentofolio

Portfolio personnel React/Vite avec navigation hash, CV A4, projets bento et dashboard admin.

## Démarrage local

```bash
bun install
bun dev
```

Ouvrir http://localhost:5173/

Routes principales :

- `/#/` — accueil
- `/#/projets` — projets
- `/#/cv` — CV
- `/#/contact` — contact
- `/#/admin` — dashboard admin

Mot de passe admin : `bento`.

## Build production

```bash
bun run build
```

Le dossier `dist/` est prêt à être déployé sur GitHub Pages.

## Design system

- `DESIGN.md` — Tokens couleurs, typographie, composants
- `SKILL.md` — Conventions pour agents IA (Open CoDesign)
- `app/styles.css` — Variables CSS et thème
- `app/components.css` — Styles des composants
- `app/pages.css` — Styles des pages
- `app/dashboard.css` — Styles admin
