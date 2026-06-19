# Portfolio Revamp — Expériences + Projets

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Importer les 15 expériences du CSV dans `config.json` puis enrichir chaque projet (project.json + case-study.md) un par un, en commençant par SSHK et Rage UI.

**Architecture:** Le portfolio stocke les expériences dans `config.json` (tableau `experiences`) et les projets dans `content/projects/<id>/` (dossier avec `project.json` + `case-study.md`). Un `order.json` définit l'ordre d'affichage, un `index.json` (build artifact) fusionne tout. Pas de base de données, tout est fichier.

**Tech Stack:** JSON, Markdown, Bun (tests)

---

## Phase 1 : Expériences professionnelles

### Task 1.1: Supprimer l'expérience "freelance-dev" de config.json

**Files:**
- Modify: `config.json`

- [ ] **Step 1: Supprimer le bloc `freelance-dev`**

Dans `config.json`, retirer l'objet `experiences[0]` (id `"freelance-dev"`). Le tableau `experiences` ne contiendra plus que `dj-producer`.

```json
"experiences": [
  {
    "id": "dj-producer",
    "title": "DJ & Producteur musical",
    "company": "Independant",
    "location": "Paris",
    "period": "2022-2025",
    "description": "Production musicale electronique et performances live. Gestion de projet artistique de A a Z : composition, mixage, mastering, promotion.",
    "highlights": [
      "+100k ecoutes sur les plateformes",
      "Live devant +1 200 personnes",
      "Gestion de projet creatif et technique"
    ],
    "techs": [],
    "featured": true
  }
]
```

- [ ] **Step 2: Vérifier que le JSON est valide**

Run: `bun run test -- config-runtime.test.js`
Expected: PASS (les tests de config doivent toujours passer)

---

### Task 1.2: Ajouter les 15 expériences du CSV dans config.json

**Files:**
- Modify: `config.json`

- [ ] **Step 1: Insérer les 15 expériences formatées**

Remplacer le contenu du tableau `experiences` par la liste complète ci-dessous (dj-producer en premier, puis les 15 du CSV par ordre chronologique inverse — plus récent d'abord).

```json
"experiences": [
  {
    "id": "dj-producer",
    "title": "DJ & Producteur musical",
    "company": "Indépendant",
    "location": "Paris",
    "period": "2022 – 2025",
    "description": "Production musicale électronique et performances live. Gestion de projet artistique de A à Z : composition, mixage, mastering, promotion.",
    "highlights": [
      "+100k écoutes sur les plateformes",
      "Live devant +1 200 personnes",
      "Gestion de projet créatif et technique"
    ],
    "techs": [],
    "featured": true
  },
  {
    "id": "tech-trocmedia-2024",
    "title": "Technicien / Réparateur Informatique",
    "company": "Troc Media 13",
    "location": "Marseille (13010)",
    "period": "Déc. 2024 – Fév. 2025",
    "description": "Maintenance d'équipements récents (PC, Mac, smartphones). Diagnostic hardware & software, remplacement de composants, optimisation système.",
    "highlights": [
      "Diagnostic et réparation hardware & software",
      "Satisfaction utilisateur et suivi client"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "social-media-surboum",
    "title": "Social Media Manager",
    "company": "La Surboum",
    "location": "Bordeaux",
    "period": "2023 – 2024",
    "description": "Stratégie de contenu digital pour un collectif événementiel. Création de visuels, rédaction de posts, suivi des KPIs et croissance des communautés.",
    "highlights": [
      "Stratégie de contenu digital et social media",
      "Création de visuels et posts engageants",
      "Suivi des KPIs et optimisation des campagnes"
    ],
    "techs": [
      { "label": "Figma", "tech": "figma" },
      { "label": "Facebook Ads", "tech": "default" },
      { "label": "TikTok Ads", "tech": "default" }
    ],
    "featured": false
  },
  {
    "id": "social-media-seven",
    "title": "Social Media Manager",
    "company": "Seven Rave",
    "location": "Bordeaux",
    "period": "2023 – 2024",
    "description": "Animation de communautés pour un acteur de la scène électro. Reporting analytics, optimisation des campagnes d'acquisition.",
    "highlights": [
      "Animation et croissance des communautés",
      "Reporting analytics et KPIs",
      "Optimisation des campagnes d'acquisition"
    ],
    "techs": [
      { "label": "Figma", "tech": "figma" },
      { "label": "Facebook Ads", "tech": "default" },
      { "label": "TikTok Ads", "tech": "default" }
    ],
    "featured": false
  },
  {
    "id": "ecommerce-independant",
    "title": "E-commerce (online)",
    "company": "Indépendant",
    "location": "Internet",
    "period": "2023 – 2024",
    "description": "Prospection commerciale en ligne : cold calls, études de marché, adaptation des offres aux besoins clients. Suivi satisfaction et fidélisation.",
    "highlights": [
      "Cold calls et prospection digitale",
      "Études de marché et adaptation des offres",
      "Suivi satisfaction et fidélisation"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "manutentionnaire-techno",
    "title": "Manutentionnaire (scène techno)",
    "company": "Collectif La Surboum",
    "location": "Boîte L'Entrepôt, Bordeaux",
    "period": "14–15 août 2023",
    "description": "Câblage, montage et démontage de scène pour deux soirées techno. Gestion du matériel son et lumière en conditions live.",
    "highlights": [
      "Câblage et montage de scène",
      "Gestion du matériel son et lumière"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "manutentionnaire-gradins",
    "title": "Manutentionnaire (gradins)",
    "company": "HOYA Event",
    "location": "Stade Matmut, Bordeaux",
    "period": "14–15 juil. 2023 / 1–2 août 2022",
    "description": "Préparation et installation des gradins pour concerts au Stade Matmut. Travail en équipe, respect des consignes de sécurité.",
    "highlights": [
      "Préparation des gradins pour concerts",
      "Travail en équipe et respect des délais"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "interim-auchan",
    "title": "Intérim – Mise en rayon",
    "company": "Auchan",
    "location": "Bègles & Bouliac (33130 / 33065)",
    "period": "Mars 2023 – Juin 2023",
    "description": "Réassort, organisation et entretien des rayons. Gestion des stocks et relation client en grande surface.",
    "highlights": [
      "Réassort et organisation des rayons",
      "Gestion des stocks et relation client"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "prospection-floa",
    "title": "Prospection & Commercial (terrain)",
    "company": "Floa Bank",
    "location": "Bordeaux",
    "period": "2021 – 2022",
    "description": "Prospection clients en porte-à-porte. Présentation d'offres bancaires, fidélisation et suivi des performances commerciales.",
    "highlights": [
      "Prospection terrain et présentation d'offres",
      "Fidélisation client et suivi performances"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "serveur-chef-rang",
    "title": "Serveur – Chef de rang",
    "company": "Au Bureau",
    "location": "Mérignac (33700)",
    "period": "Déc. 2021 – Avr. 2022",
    "description": "Accueil, service en salle et management d'équipe. Respect des normes d'hygiène HACCP et satisfaction client.",
    "highlights": [
      "Accueil et service en salle",
      "Management d'équipe et normes d'hygiène"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "vendeur-ange",
    "title": "Vendeur",
    "company": "Boulangerie Ange",
    "location": "Bergerie (91210)",
    "period": "Déc. 2021 – Fév. 2022",
    "description": "Conseil client, gestion de caisse et approvisionnement des rayons. Respect des normes d'hygiène alimentaire.",
    "highlights": [
      "Conseil client et vente",
      "Gestion caisse et approvisionnement"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "facteur-laposte",
    "title": "Facteur",
    "company": "La Poste",
    "location": "Draveil / Savigny-sur-Orge / Évry-Courcouronnes (91)",
    "period": "Août 2021 – Déc. 2021",
    "description": "Préparation et distribution des tournées courrier. Relation client terrain et respect des délais de distribution.",
    "highlights": [
      "Préparation et distribution des tournées",
      "Relation client et respect des délais"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "livreur-dominos",
    "title": "Livreur / Préparation Pizza & Caisse",
    "company": "Domino's Pizza – Évry Clinique",
    "location": "41 Rue Paul Claudel, 91000 Évry",
    "period": "Fév. 2021 – Déc. 2021",
    "description": "Fabrication de pizzas, gestion des commandes et des tournées de livraison. Polyvalence cuisine, caisse et logistique.",
    "highlights": [
      "Fabrication pizzas et gestion des commandes",
      "Polyvalence cuisine, caisse et livraison"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "preparateur-bestworld",
    "title": "Préparateur de commande",
    "company": "Best of the World",
    "location": "Boussy-Saint-Antoine (91800)",
    "period": "Mai 2021 – Juil. 2021",
    "description": "Préparation d'expéditions, gestion des litiges et optimisation des process logistiques en entrepôt.",
    "highlights": [
      "Préparation d'expéditions et logistique",
      "Gestion des litiges et optimisation process"
    ],
    "techs": [],
    "featured": false
  },
  {
    "id": "tech-trocmedia-2010",
    "title": "Technicien / Réparateur Informatique",
    "company": "Troc Media 13",
    "location": "Marseille (13010)",
    "period": "Janv. 2010 – Août 2018",
    "description": "Diagnostic et réparation hardware & software aux côtés de mon beau-père. Gestion de stocks, autonomie et rigueur dès le plus jeune âge. Première immersion dans le monde tech.",
    "highlights": [
      "Diagnostic et réparation hardware & software",
      "Gestion de stocks et autonomie",
      "Première expérience tech — 8 ans de pratique"
    ],
    "techs": [],
    "featured": true
  }
]
```

- [ ] **Step 2: Vérifier que le JSON est valide**

Run: `bun run test`
Expected: tous les tests passent

---

## Phase 2 : Projet SSHK

### Task 2.1: Enrichir project.json

**Files:**
- Modify: `content/projects/sshk/project.json`

- [ ] **Step 1: Mettre à jour le fichier**

Remplacer le contenu de `content/projects/sshk/project.json` par :

```json
{
  "id": "sshk",
  "name": "sshk",
  "categories": ["tooling", "devops"],
  "featured": true,
  "techs": [
    { "label": "Bash", "tech": "bash" },
    { "label": "OpenSSH", "tech": "linux" },
    { "label": "Git", "tech": "git" }
  ],
  "role": "Solo",
  "period": "2026",
  "duration": "En cours",
  "description": "CLI Bash zéro dépendance pour créer, organiser et révoquer des clés SSH. Une identité par usage, une commande par action — fini le plat de spaghettis ~/.ssh.",
  "highlights": [
    "Arborescence prévisible : ~/.ssh/keys/, config.d/, authorized_keys.d/",
    "5 commandes intuitives — create, list, grant, revoke, copy",
    "Installation curl | bash, compatible Linux/macOS sans runtime externe"
  ],
  "demoUrl": "https://sofian-bll.github.io/sshk/",
  "repoUrl": "https://github.com/Sofian-bll/sshk",
  "image": "sshk-mockup.svg"
}
```

- [ ] **Step 2: Vérifier**

Run: `bun run test`
Expected: PASS

---

### Task 2.2: Écrire case-study.md

**Files:**
- Modify: `content/projects/sshk/case-study.md`

- [ ] **Step 1: Remplacer le contenu**

```markdown
## Contexte

Je gérais mes clés SSH comme tout le monde : un `~/.ssh/id_rsa` fourre-tout, des clés qui traînent sans savoir à quoi elles servent, et des `ssh-copy-id` à l'arrache. Quand j'ai commencé à avoir 5+ serveurs et plusieurs projets, c'est devenu ingérable.

J'ai conçu `sshk` pour apporter de l'ordre avec une arborescence prévisible : une identité par usage, un fichier de config par hôte, et des commandes simples qui font chacune une chose.

## Points clés

- **Arborescence namespacée** — `~/.ssh/keys/<nom>/`, `~/.ssh/config.d/<nom>.conf`, `~/.ssh/authorized_keys.d/<nom>` : chaque identité a sa place
- **5 commandes qui couvrent tout** — `create` (wizard interactif), `list` (identités + accès), `grant` (push clé publique vers serveur), `revoke` (révoquer accès), `copy` (copier clé dans le presse-papier)
- **Zéro dépendance** — Bash pur + OpenSSH, pas de Python, pas de Node, pas de runtime
- **Installation one-liner** — `curl -fsSL https://raw.githubusercontent.com/Sofian-bll/sshk/main/install.sh | bash` installe dans `~/.local/bin/`
- **Configuration persistante** — `~/.config/sshk/config` pour personnaliser type de clé, user SSH, chemins

## Architecture

```
~/.ssh/
├── keys/                  # Identités (qui je suis)
│   ├── github/
│   │   └── id_ed25519
│   └── vela/
│       └── id_ed25519
├── config.d/              # Snippets SSH (ssh <nom>)
│   ├── github.conf
│   └── vela.conf
└── authorized_keys.d/     # Qui peut se connecter à moi
    └── macbook
```

Le script principal fait ~550 lignes de Bash, découpé en fonctions : `cmd_create`, `cmd_list`, `cmd_show`, `cmd_copy`, `cmd_delete`, `cmd_grant`, `cmd_revoke`. Chaque commande lit/écrit dans les trois répertoires de manière atomique.

## Stack

- Bash
- OpenSSH
- Git / GitHub Pages pour la landing

## Leçons apprises

- **Bash suffit pour 90% des CLIs** — pas besoin de Python ou Go pour un outil qui orchestre des commandes système
- **L'arborescence est la feature** — une convention de nommage claire évite des centaines de flags et d'options
- **Le wizard interactif fait l'adoption** — `sshk create` pose 3 questions et génère tout, c'est ça qui rend l'outil agréable

![sshk demo](media/projects/sshk/sshk-mockup.svg)
```

---

## Phase 3 : Projet Rage UI

### Task 3.1: Enrichir project.json

**Files:**
- Modify: `content/projects/rage-ui/project.json`

- [ ] **Step 1: Mettre à jour le fichier**

Remplacer le contenu par :

```json
{
  "id": "rage-ui",
  "name": "Rage-UI",
  "categories": ["tooling", "devops"],
  "featured": true,
  "techs": [
    { "label": "React", "tech": "js" },
    { "label": "Bun", "tech": "node" },
    { "label": "SOPS", "tech": "sops" },
    { "label": "Age", "tech": "linux" },
    { "label": "Docker", "tech": "docker" }
  ],
  "role": "Solo",
  "period": "2026",
  "duration": "En cours",
  "description": "Secrets Manager local-first avec dashboard web. Chiffrement SOPS + Age, injection GitOps des .env, et synchronisation Git depuis l'interface.",
  "highlights": [
    "Coffre-fort central : secrets globaux + par projet, chiffrés en Age",
    "Injection automatique : .env.template + {{PLACEHOLDERS}} → .env généré",
    "Interface React pour gérer, injecter et versionner ses secrets sans terminal"
  ],
  "demoUrl": "https://sofian-bll.github.io/Rage-UI/",
  "repoUrl": "https://github.com/Sofian-bll/Rage-UI",
  "image": "media/projects/rage-ui/1781879615927.png"
}
```

- [ ] **Step 2: Vérifier**

Run: `bun run test`
Expected: PASS

---

### Task 3.2: Écrire case-study.md

**Files:**
- Modify: `content/projects/rage-ui/case-study.md`

- [ ] **Step 1: Remplacer le contenu**

```markdown
## Contexte

Avec mon homelab qui grossit (15+ services Docker), je copiais-collais mes tokens API et mots de passe DB à la main dans chaque `.env`. Une rotation de clé ? Il fallait traquer 10 fichiers. Pire : impossible de versionner proprement sans exposer des secrets en clair.

Rage UI résout ça avec un pattern simple : un coffre-fort chiffré, des templates avec placeholders, et une injection automatique. Le tout pilotable depuis un dashboard web React, sans toucher au terminal.

## Points clés

- **Stockage chiffré** — SOPS + Age. Les secrets sont dans des `.enc.json`, versionnables dans Git sans risque
- **Deux niveaux de secrets** — `global/` pour les tokens partagés (CF_API_TOKEN, GitHub PAT…), `projet/` pour les secrets spécifiques
- **Injection par template** — un `.env.template` avec `{{GLOBAL.CF_API_TOKEN}}` et `{{DB_PASSWORD}}` → `POST /api/inject/:project` génère le `.env` final
- **API REST** — Bun + Express en backend. Routes publiques (lecture), routes protégées par API key (écriture, injection, sync Git)
- **Interface web React** — dashboard pour visualiser, éditer, injecter et `git push` depuis le navigateur
- **Docker-ready** — Dockerfile et docker-compose.yml fournis, volumes pour la clé Age et le répertoire projets

## Architecture

```
POST /api/secrets/:project ──→ Écrit le .enc.json ──→ SOPS/Age chiffre
POST /api/inject/:project ──→ Lit global + projet ──→ Remplit .env.template → .env
POST /api/git/sync      ──→ git add -A && git commit && git push
```

```
PROJECTS_DIR/
├── global/secrets.enc.json
├── pokedex/.env.template + secrets.enc.json
└── api_meteo/.env.template
```

Le backend (Bun + Express) expose 6 routes. Le frontend (Vite + React) consomme l'API et affiche un dashboard avec la liste des projets, l'éditeur de secrets, et les actions (inject, sync).

## Stack

- React (frontend)
- Bun + Express (backend API)
- SOPS + Age (chiffrement)
- Docker (déploiement)
- Git (versionnement des secrets chiffrés)

## Leçons apprises

- **SOPS + Age c'est sous-coté** — plus simple que Vault, plus secure que `.env` en clair, le meilleur ratio simplicité/sécurité pour un homelab
- **Séparer secrets globaux et locaux évite la duplication** — un token CF_API_TOKEN dans `global/` est injecté dans 6 projets sans le dupliquer
- **L'API key protège l'écriture** — les routes GET sont open (utile en local), les POST nécessitent un header `x-api-key`. Suffisant pour du local-first.

![Logo Rage UI](media/projects/rage-ui/1781879615927.png)
```

---

## Phase 4+ : Projets suivants

Pour chaque projet restant, même processus :

1. L'utilisateur raconte le projet (contexte, stack réelle, galères, fiertés)
2. Écriture de `project.json` enrichi (categories, techs réelles, description, highlights, demoUrl si existant, image)
3. Écriture de `case-study.md` complet (Contexte, Points clés, Architecture, Stack, Leçons apprises)
4. Ajout des URLs de landing page (GitHub Pages ou démo)
5. Ajout d'une image (screenshot, mockup ou logo)
6. Vérification : `bun run test`

Projets restants dans l'ordre actuel du `order.json` :
- connect-in
- connect-in-java
- my-cinema
- piscine-java
- freelance-web
- klivio
- epitalk
- jeuvideops
- appstore-scraper
- soundcloud-downloader
- sidecar-patcher
- seahorse-3d
- nojs-ui
- media-pipeline

---

## Self-Review

1. **Spec coverage** — toutes les tâches couvrent les deux phases demandées : expériences CSV → config.json, projets SSHK/Rage UI enrichis. Le format `project.json` respecte le schéma existant. Les `case-study.md` suivent les conventions (## Contexte, ## Points clés…).

2. **Placeholder scan** — aucun placeholder. Chaque tâche a son contenu complet (JSON et Markdown).

3. **Type consistency** — les champs `project.json` (id, name, categories, featured, techs, role, period, duration, description, highlights, demoUrl, repoUrl, image) sont cohérents avec le schéma existant.
