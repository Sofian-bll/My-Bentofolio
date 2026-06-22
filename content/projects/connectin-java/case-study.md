## Contexte

ConnectIn-Java est la migration du backend Laravel de Connect'IN vers Spring Boot, imposée par le programme Epitech. Le contrat : reproduire exactement l'API REST existante (posts, commentaires, likes, utilisateurs, équipes) que le frontend Vue.js consomme, sans jamais adapter le frontend au backend. Binôme en 3 semaines.

## Process

Architecture modulaire monolith en 8 packages (auth, user, post, comment, like, team + shared/security, shared/exception). Workflow Git : une branche par feature, PR obligatoire, review avant merge. Développement piloté par le contrat API documenté côté frontend — chaque endpoint doit renvoyer exactement les champs attendus (snake_case, bons noms).

## Difficultés

L'écart entre le contrat frontend existant et les premières implémentations a nécessité une phase de "Fix API Contract" corrective. La gestion du stockage des avatars (multipart upload) et l'exposition statique des fichiers ont demandé plusieurs itérations de config. Le snake_case imposé par Jackson a forcé une discipline stricte sur tous les DTOs.

## Fiertés

L'architecture modulaire propre avec zéro duplication. Les 21 endpoints REST documentés et testés. Le cache applicatif sur users/teams pour les perfs. L'intégration Docker complète avec Makefile qui rend le projet exécutable en une commande.