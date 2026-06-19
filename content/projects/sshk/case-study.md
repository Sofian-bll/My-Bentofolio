## Contexte

J'ai un TDAH, ce qui rend l'organisation compliquée au quotidien. Les fichiers qui s'accumulent, les configurations qui dérivent — très vite, c'est le chaos.

Récemment, j'ai converti deux vieux PC en serveurs maison (un NAS et un serveur applicatif). Entre les ratés, les conflits et les réinstallations successives, je me retrouvais à devoir recréer et redéployer mes clés SSH à chaque fois. Quelle clé pour quelle machine ? L'empreinte est-elle la bonne ? L'accès tient-il encore ? Autant de vérifications manuelles qui me sortaient du flow.

`~/.ssh` était devenu un fourre-tout incompréhensible. Il me fallait un outil minimal, qui range sans casser ce qui existe déjà.

![sshk list](media/projects/sshk/sshk-list.png)

## Process

Ma méthode actuelle : je fournis l'idée et une première version, je m'appuie sur l'IA pour accélérer l'implémentation, puis j'itère. Pour sshk, je suis parti d'une contrainte forte — ne pas imposer une nouvelle architecture, mais se glisser proprement dans ce qui existe déjà (`~/.ssh/config`, `authorized_keys`). Pas de daemon, pas de format propriétaire, pas de runtime exotique. Uniquement Bash et OpenSSH, déjà présents sur n'importe quelle machine Unix.

## Difficultés rencontrées

- **Compatibilité multiplateforme** — le script doit tourner sur macOS et Linux sans ajustement. Les commandes `stat` diffèrent entre BSD et GNU, `pbcopy` côtoie `wl-copy` et `xclip` pour le presse-papier. Autant de micro-différences à gérer.
- **Intégration non destructive** — le vrai défi, c'est de ne rien casser. Le script ne modifie jamais le `~/.ssh/config` existant : il ajoute des snippets dans `config.d/`, charge à l'utilisateur de les inclure s'il le veut.
- **Résister à la surcouche** — en Bash, chaque nouvelle fonctionnalité devient vite un nid à bugs. J'ai tenu la ligne : 7 commandes, 549 lignes, pas plus.

![sshk show](media/projects/sshk/sshk-show.png)

## Stack

- Bash pur — zéro dépendance, un fichier auditable en dix minutes
- OpenSSH — `ssh-keygen`, `ssh`, `ssh-copy-id`
- GitHub Pages — landing page en un seul fichier HTML, Tailwind en CDN

![sshk help](media/projects/sshk/sshk-help.png)

## Ce dont je suis fier

- **`sshk copy`** — copier une clé publique dans le presse-papier en une commande, quel que soit l'OS. Tellement évident que je ne comprends pas pourquoi ça n'existait pas.
- **`sshk grant`** — automatise le `ssh-copy-id` et range proprement la clé dans `authorized_keys.d/` sur la machine distante. Avant, c'était cinq commandes manuelles.
- **L'absence totale de dépendances** — un seul script Bash de 549 lignes, lisible, modifiable, forkable en deux clics.

## Si c'était à refaire

Même approche. Le projet est fonctionnel et propre, mais il mériterait plus de rodage pour traquer les cas limites avant d'être qualifié « production ready ». Peut-être une suite de tests automatisés avec des conteneurs SSH jetables.
