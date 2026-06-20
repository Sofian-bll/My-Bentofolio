## Contexte

J'étais abonné à Perplexity Pro, qui incluait 10$ de crédits API chaque mois. Je les utilisais avec OpenCode pour toutes mes recherches — c'était fluide et efficace. Puis Perplexity a supprimé ces crédits sans préavis. Résultat : retour au navigateur manuel pour chaque recherche, un vrai retour en arrière. À ce moment-là j'étais à Bordeaux, en train de structurer mon architecture personnelle, et j'avais besoin de recherches fréquentes — le workflow manuel n'était tout simplement pas viable.

Quelques semaines plus tôt, j'avais découvert Playwright à la Web@cadémie, dans le cadre du projet DevOps [Jeux Vidéops](./#/projet/jeuvideops) où on avait monté une pipeline CLI complète. J'avais été marqué par le fait que Playwright peut enregistrer des actions humaines via `npx playwright codegen` et les transformer en script. Le déclic : et si je pouvais automatiser une session Perplexity complète ?

## Process

J'ai construit le skill en deux temps. D'abord, enregistrement du flux avec `codegen` : navigation, soumission de query, attente de réponse, clic sur "Copy". Ensuite, scriptage du polling intelligent : une boucle vérifie régulièrement l'apparition du bouton "Copy", avec un cooldown entre l'apparition et la copie (le bouton apparaît visuellement avant que la réponse soit finalisée dans le DOM). Une fois la réponse dans le clipboard : export Markdown + sortie stdout + fermeture Chromium.

J'ai ajouté 3 retries automatiques (clipboard vide, réponse trop lente), et isolé proprement stderr pour les logs / stdout pour l'output, pour que le skill soit pipe-friendly avec n'importe quel agent.

## Difficultés

- **Cloudflare anti-bot** : dès que Playwright touchait le site, Cloudflare détectait l'automatisation et bloquait l'accès au compte Pro. J'ai testé cookies, user agents, headers — rien n'a marché
- **Timing du bouton Copy** : il apparaît avant que Perplexity ait fini de streamer la réponse → fallait un délai post-apparition calibré
- **Intervalles de polling** : trouver le bon équilibre entre réactivité et risque de rate-limiting

## Fiertés

- Zéro API key, zéro compte Pro — juste un navigateur Chromium
- Compatible OpenCode, Claude Code, Codex CLI avec le même skill
- Sortie propre (stderr/stdout), intégrable dans n'importe quel pipeline
- Retry logic qui couvre les edge cases (clipboard vide, timeout)

## Si c'était à refaire

- Ne pas perdre une heure sur le problème Cloudflare — accepter la contrainte plus tôt
- Poser le mécanisme de polling de façon plus propre dès le départ
- Globalement : itérer plus vite sur le MVP plutôt que de m'éparpiller
