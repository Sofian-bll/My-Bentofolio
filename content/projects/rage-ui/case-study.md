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
