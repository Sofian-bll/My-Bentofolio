## Contexte

Projet DevOps/DevSecOps réalisé en binôme dans le cadre W-DOP-200 (Epitech Paris). L'objectif : industrialiser la livraison de deux jeux rétro JavaScript via une pipeline CI/CD complète. GitHub Actions imposé, GitHub Pages pour le déploiement. Automatiser plus pour travailler moins.

## Process

Le projet a été structuré en 8 phases itératives sur 2 semaines :

1. **Bootstrap** — setup du repo, premier workflow `test.yml`, vérification Node.js
2. **Analyse des jeux** — fork des repos js13kgames, ESLint config, structure npm
3. **CI Linter ESLint** — Google JavaScript Style Guide, annotations inline sur les PR
4. **CI Tests unitaires** — Vitest, tests fournis + tests maison, coverage nyc
5. **CI Tests fonctionnels** — Playwright pour les tests E2E, screenshots sur échec
6. **Annotations & Résumés** — workflow commands, `GITHUB_STEP_SUMMARY`, badges dynamiques
7. **CD Docker & GitHub Pages** — Dockerfiles, déploiement automatisé après CI verte
8. **Keynote & Finalisation** — cross-training, démonstration, livraison

La CI est architecturée avec des templates réutilisables (`_ci-game.yml`, `_cd-game.yml`) que chaque jeu hérite, évitant la duplication.

## Difficultés rencontrées

- **Montée en gamme de la pipeline** — passer d'un workflow basique à une vraie usine CI/CD avec templates réutilisables, PR Gates conditionnelles, et release automatisée. Plusieurs resets nécessaires pour trouver la bonne architecture.
- **Migration submodule → subtree** — les jeux étaient initialement en git submodule, mais les workflows GitHub Actions géraient mal cette configuration. Migration complète vers `git subtree` pour que la CI puisse builder chaque jeu indépendamment.
- **Déploiement GitHub Pages propre** — faire cohabiter le dashboard central, les rapports Allure, Playwright, et la coverage dans une arborescence GitHub Pages cohérente, avec un rendu propre pour chaque rapport.

## Stack

- **CI/CD** — GitHub Actions (workflows manuels + automatiques, PR Gate, CD)
- **Tests** — Vitest (unitaires), Playwright (E2E), Allure (rapports combinés)
- **Qualité** — ESLint (Google Style Guide), npm audit (DevSecOps)
- **Déploiement** — Docker, GitHub Pages, release automatisée (semver + changelog)
- **Dashboard** — HTML/CSS vanilla, Tailwind, Font Awesome

## Ce dont je suis fier

- **L'archi CI/CD réutilisable** — des templates YAML que chaque jeu hérite, zéro duplication. Ajouter un 3e jeu prendrait 10 minutes.
- **Le dashboard central** — une SPA qui rassemble les jeux jouables ET tous les rapports (Allure, Playwright, coverage, audit) dans une interface unique.
- **Les rapports Allure unifiés** — tests unitaires et E2E fusionnés dans un seul rapport avec `parentSuite`, groupés par couche (Unit/E2E), généré en single-file HTML.
- **Le pipeline complet est propre** — PR Gate, annotations inline, badges dynamiques, release semver automatique. Tout ce que le sujet demandait, fait proprement.

## Si c'était à refaire

Rien. Le projet a atteint tous ses objectifs avec une architecture propre et maintenable. Peut-être activer Dependabot plus tôt pour l'audit de sécurité continu.
