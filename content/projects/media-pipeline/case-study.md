## Contexte

J'ai récupéré un vieux PC (dual core Celeron, 4 Go de RAM) pour monter un serveur Jellyfin. Problème : impossible de faire du transcodage en temps réel — le PC crashait. Il me fallait déporter le compute, soit sur mon MacBook M1 Pro, soit sur un VPS cloud.

## Process

D'abord le worker Mac : watcher → webhook n8n → vérification disponibilité Mac → transcodage via SSH + FFmpeg. Ensuite, abstraction multi-providers pour le fallback cloud (DigitalOcean aujourd'hui, AWS/GCP demain). Si le Mac est hors ligne, un droplet CPU-optimisé est provisionné à la volée, le fichier est envoyé, encodé, récupéré, puis l'instance est immédiatement détruite — du compute-as-a-service éphémère inspiré de Netflix, pour quelques centimes par encodage.

## Difficultés

Pas de blocage technique majeur, plutôt un manque de connaissances au départ sur le compute-as-a-service et l'optimisation. Je me serais renseigné davantage en amont pour éviter les frictions.

## Fiertés

La partie Mac fonctionne vraiment bien, c'est clean. Le concept de compute éphémère à la demande est élégant et économique.

## Si c'était à refaire

Je commencerais par le droplet DigitalOcean plutôt que par le MacBook, qui n'était pas assez optimisé au départ.
