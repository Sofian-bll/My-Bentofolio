# Sshk — CLI Bash pour gestion SSH multi-serveurs

## Contexte

La gestion des clés SSH sur plusieurs serveurs et projets devient rapidement un cauchemar : clés dispersées, configurations manuelles, rotation risquée. Les outils existants (Ansible, Terraform) sont surdimensionnés pour un besoin simple de provisionnement quotidien.

## Problème

- Pas de convention d'arborescence entre projets
- Rotation de clés manuelle et propice aux erreurs
- Aucun outil léger ne couvre le cycle create → grant → revoke sans dépendance externe

## Solution

Sshk est une CLI Bash zéro dépendance qui standardise la gestion SSH autour d'une arborescence prévisible `~/.sshk/{projet}/{serveur}/`. Chaque commande est idempotente et réversible.

### Commandes principales

| Commande | Action |
|----------|--------|
| `sshk create <projet>` | Génère une paire de clés dédiée au projet |
| `sshk list` | Affiche tous les projets et leurs serveurs associés |
| `sshk grant <projet> <serveur>` | Copie la clé publique vers le serveur cible |
| `sshk revoke <projet> <serveur>` | Retire la clé du serveur autorisé |

## Architecture

```
~/.sshk/
├── sshk.conf              # Configuration globale
├── mon-projet/
│   ├── id_ed25519         # Clé privée projet
│   ├── id_ed25519.pub     # Clé publique projet
│   └── servers.list       # Liste des serveurs autorisés
└── autre-projet/
    └── ...
```

## Résultats

- **Zéro dépendance** : fonctionne sur tout système Linux/macOS avec Bash 4+
- **Installation en une ligne** : `curl -fsSL https://sshk.dev/install | bash`
- **Rotation sécurisée** : une seule commande pour révoquer et régénérer
- **Adoption interne** : utilisé quotidiennement par 3 développeurs sur 12 serveurs

## Stack technique

- Bash 4+ (compatibilité macOS/Linux)
- OpenSSH (ed25519 par défaut)
- Git pour le versionning de la configuration (optionnel)

## Liens

- [GitHub](https://github.com/baptiste-arnaud/sshk)
- [Documentation](https://sshk.dev/docs)
