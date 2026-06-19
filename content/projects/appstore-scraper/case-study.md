## Contexte

Je suis SE, donc chaque euro compte. Les abonnements — ChatGPT, Claude, Raycast — représentent une part significative de mon budget mensuel. J'avais entendu dire que les prix variaient selon les pays sur l'App Store, parfois du simple au double. L'idée était simple : trouver le storefront le moins cher pour chaque app.

Sauf que vérifier manuellement 36 pays, un par un, pour 3 applications, c'est 108 pages à ouvrir. Inimaginable. Et même après, il fallait convertir les devises pour comparer — le réal brésilien, la livre turque, la roupie indienne... rien de comparable sans un taux de change actualisé.

C'était aussi mes deux premières semaines sur Python. Je découvrais le langage, les API HTTP, le parsing de données. Autant dire que rien n'était acquis.

![Scraper en action](media/projects/appstore-scraper/scraper-run.png)

## Process

Le projet a connu trois phases. D'abord un prototype codé à la main — un script basique qui scrapait quelques pays avec `requests` et `BeautifulSoup`. Puis une deuxième itération où j'ai intégré l'Exchange Rate API pour la conversion en temps réel, avec un système de cache pour éviter de saturer les appels API. Enfin, une refonte assistée par IA pour structurer le code en couches (scraping, conversion, export) et ajouter une barre de progression visuelle.

## Difficultés rencontrées

- **Conversion de devises** — l'Exchange Rate API a un quota limité. Pour 36 pays × 3 apps × plusieurs prix par page, ça part vite. J'ai dû implémenter un cache intelligent qui conserve les taux pendant 24h et ne rappelle l'API qu'en cas de devise inconnue.
- **Parsing multi-pages** — chaque app a potentiellement plusieurs dizaines d'achats in-app. Le scraper devait naviguer la pagination Apple sans se faire bloquer. J'ai appris les `User-Agent`, les délais entre requêtes, et la gestion des erreurs HTTP.
- **Apprendre Python en même temps** — deux semaines avant, je n'avais jamais écrit une ligne de Python. Tout était nouveau : les imports, les list comprehensions, le typage dynamique. Le projet m'a forcé à apprendre vite.

## Stack

- Python — requests, BeautifulSoup, CSV
- Exchange Rate API — taux de change en temps réel avec cache
- GitHub Pages — landing page en HTML/Tailwind

## Ce dont je suis fier

- **La couverture** — 36 pays, 30+ devises, en un seul run. Un truc qu'Apple ne propose nulle part.
- **Le cache de conversion** — solution élégante à un vrai problème de quota API, codée en comprenant progressivement les limites des services gratuits.
- **La progression** — passer d'un script linéaire à une architecture en couches, avec barre de progression et gestion d'erreurs, en trois semaines d'apprentissage.

## Si c'était à refaire

J'utiliserais `aiohttp` pour paralléliser les requêtes vers les 36 storefronts — aujourd'hui c'est séquentiel, et 36 × N pages, ça prend du temps. Peut-être aussi un export JSON en plus du CSV, pour intégration directe dans un dashboard.
