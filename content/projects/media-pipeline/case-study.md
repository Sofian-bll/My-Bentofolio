## Contexte

Pipeline de transcodage video automatise — surveillance d'un dossier NAS, API REST Bun avec file d'attente SQLite, worker SSH sur Mac et fallback cloud DigitalOcean, orchestration n8n et notifications Discord.

## Points cles

- Dispatch multi-cible : worker Mac via SSH, fallback automatique sur droplet DigitalOcean
- Detection de fichiers dedupliquee par hash MD5 avec logique de retry structuree
- Workflow n8n orchestrant watcher, API worker pool et notifications Discord

## Stack

- TypeScript
- Bun
- Docker
- n8n
- ffmpeg
- SQLite
- DigitalOcean
