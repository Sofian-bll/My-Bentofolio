## Contexte

Projet Epitech en binôme — réseau social interne complet pour ESN. Plateforme full-stack : API REST Laravel avec auth Sanctum, relations many-to-many (follows, likes, comments), et frontend Vue 3 SPA avec composants shadcn-vue et Tailwind CSS. Déploiement Docker, documentation API automatique OpenAPI via Scramble.

## Process

1. Backend Laravel : migrations, modèles Eloquent (User, Post, Comment, Like), contrôleurs RESTful
2. Authentification par tokens Sanctum (register, login, logout, suppression de compte)
3. CRUD Posts avec pagination et upload de médias
4. Commentaires et système de likes (relations many-to-many polymorphiques)
5. Gestion de profil utilisateur avec avatar
6. Suppression de compte avec anonymisation (soft delete)
7. Seeders & Factories pour peupler la BDD de test
8. Documentation API interactive auto-générée par Scramble (OpenAPI)
9. Frontend Vue 3 : composants reka-ui (shadcn-vue), vue-router, intégration API via axios
10. Containerisation Docker + Makefile (install, up, test, fresh en une commande)