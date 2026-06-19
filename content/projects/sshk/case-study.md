## Contexte

Je gérais mes clés SSH comme tout le monde : un `~/.ssh/id_rsa` fourre-tout, des clés qui traînent sans savoir à quoi elles servent, et des `ssh-copy-id` à l'arrache. Quand j'ai commencé à avoir 5+ serveurs et plusieurs projets, c'est devenu ingérable.

J'ai conçu `sshk` pour apporter de l'ordre avec une arborescence prévisible : une identité par usage, un fichier de config par hôte, et des commandes simples qui font chacune une chose.

## Points clés

- **Arborescence namespacée** — `~/.ssh/keys/<nom>/`, `~/.ssh/config.d/<nom>.conf`, `~/.ssh/authorized_keys.d/<nom>` : chaque identité a sa place
- **5 commandes qui couvrent tout** — `create` (wizard interactif), `list` (identités + accès), `grant` (push clé publique vers serveur), `revoke` (révoquer accès), `copy` (copier clé dans le presse-papier)
- **Zéro dépendance** — Bash pur + OpenSSH, pas de Python, pas de Node, pas de runtime
- **Installation one-liner** — `curl -fsSL https://raw.githubusercontent.com/Sofian-bll/sshk/main/install.sh | bash` installe dans `~/.local/bin/`
- **Configuration persistante** — `~/.config/sshk/config` pour personnaliser type de clé, user SSH, chemins

## Architecture

```
~/.ssh/
├── keys/                  # Identités (qui je suis)
│   ├── github/
│   │   └── id_ed25519
│   └── vela/
│       └── id_ed25519
├── config.d/              # Snippets SSH (ssh <nom>)
│   ├── github.conf
│   └── vela.conf
└── authorized_keys.d/     # Qui peut se connecter à moi
    └── macbook
```

Le script principal fait ~550 lignes de Bash, découpé en fonctions : `cmd_create`, `cmd_list`, `cmd_show`, `cmd_copy`, `cmd_delete`, `cmd_grant`, `cmd_revoke`. Chaque commande lit/écrit dans les trois répertoires de manière atomique.

## Stack

- Bash
- OpenSSH
- Git / GitHub Pages pour la landing

## Leçons apprises

- **Bash suffit pour 90% des CLIs** — pas besoin de Python ou Go pour un outil qui orchestre des commandes système
- **L'arborescence est la feature** — une convention de nommage claire évite des centaines de flags et d'options
- **Le wizard interactif fait l'adoption** — `sshk create` pose 3 questions et génère tout, c'est ça qui rend l'outil agréable

![sshk demo](media/projects/sshk/sshk-mockup.svg)
