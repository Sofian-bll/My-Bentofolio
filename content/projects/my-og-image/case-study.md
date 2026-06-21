## Contexte

Je voulais depuis un moment un generateur d'images OG pour avoir des cartes visuelles sur mes vaults Obsidian — ressources, projets, services, tout. Quelque chose d'assez visuel qui rende bien dans les embeds Twitter, Discord et les apercus de liens.

## Process

Je m'y suis mis un soir et j'ai tout fait propre d'un coup. Plusieurs templates (8 au total), chacun avec son layout, ses couleurs, ses icones. J'ai Dockerise le truc avec un Dockerfile multi-stage et un compose. L'ajout d'un nouveau template est hyper simple — il suffit d'ajouter un fichier `.takumi.vue`. Tout passe par une URL GET : pas besoin de faire un curl ou un appel API complique, je colle juste l'URL de l'image dans Obsidian et ca la genere a la volee au moment du chargement.

## Fiertes

C'est mega clean, les templates sont vraiment beaux, c'est complet. Le systeme d'eyebrow qui decoupe automatiquement les titres, les context pills avec icones Lucide, et le fait que tout soit pilote par config. Aucun build a maintenir — juste l'URL et c'est bon.