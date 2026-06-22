## Contexte

Projet Epitech : creer un back-office de cinema. Contrainte : architecture MVC obligatoire. Ayant confondu framework et pattern MVC au depart, j'ai commence a coder mon propre moteur au lieu d'utiliser un framework existant. Plutot que de tout recommencer, j'ai assume et transforme ce depart en un mini-framework PHP from scratch. 13 jours pour tout livrer, en solo.

## Process

- Semaine 1 : Moteur MVC maison (Router, Controller, Model, PDO, ErrorHandler)
- Milieu de projet : Pivot — abandon des vues HTML pour une API REST JSON, suppression du code legacy
- Semaine 2 : Frontend Vue 3 SPA independante qui consomme l'API
- Fin : Tests, validation, anti-overlap, soft delete

## Difficultes

- Comprendre la difference entre framework et pattern MVC a froid
- Le pivot API REST a mi-projet : tout refactorer sans casser l'existant
- L'anti-chevauchement des seances (hasOverlap) : logique de creneaux horaires avec duree du film
- Un bug React parasite qui crashait le frontend

## Fiertes

- Avoir code un mini-framework PHP fonctionnel from scratch
- Architecture propre : separation backend API / frontend SPA
- Le trait SoftDelete : suppression logique sans perte de donnees
- 15 endpoints REST couvrant tous les cas (CRUD + contraintes metier)

## Si c'etait a refaire

- Partir directement sur une API REST au lieu de MVC classique avec vues
- Extraire le mini-framework en package reutilisable
- Ajouter une vraie authentification (JWT / Sanctum)