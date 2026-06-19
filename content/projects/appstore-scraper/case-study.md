## Contexte

J'étais fauché, les abonnements commençaient à peser lourd. Certaines apps coûtent 2× moins cher selon le pays de l'App Store, mais vérifier les prix sur 36 storefronts à la main était impensable. J'apprenais Python depuis 2-3 semaines — l'occasion parfaite pour un premier vrai projet.

## Process

Le projet est passé par 3 phases. Phase 1 : un script manuel qui scrapait un seul pays à la fois, 36 runs séparés, casse-pied mais ça marchait. Phase 2 : j'ai branché l'Exchange Rate API pour convertir tous les prix en EUR en temps réel, avec un système de cache pour ne pas saturer l'API. Phase 3 : j'ai fait refactoriser le code par IA pour le rendre plus propre, structuré en couches, avec barre de progression et gestion d'erreurs.

## Difficultés rencontrées

- **Conversion de devises** — 30+ devises, taux qui changent en direct, fallait un cache intelligent pour éviter de re-fetch les mêmes taux 36 fois par run.
- **Parsing multi-pages** — l'API Apple pagine les résultats, fallait itérer proprement sans exploser le rate limit.
- **Apprendre Python en même temps** — chaque feature était une double bataille : comprendre le problème ET comprendre le langage. Lent, mais formateur.

## Stack

- Python — requests, pandas
- Exchange Rate API — conversion EUR temps réel
- GitHub Pages — landing page en un seul fichier HTML

## Ce dont je suis fier

- **36 pays couverts** — tous les storefronts Apple majeurs, d'un seul run.
- **Cache des taux de change** — solution simple qui a divisé le temps d'exécution par 3.
- **Progression réelle** — passer d'un script spaghetti à un outil propre en 3 itérations, tout en apprenant Python from scratch.

## Si c'était à refaire

Je paralléliserais les requêtes vers les différents storefronts pour gagner en vitesse. Et j'ajouterais un export JSON en complément du CSV, pour intégration directe avec d'autres outils.
