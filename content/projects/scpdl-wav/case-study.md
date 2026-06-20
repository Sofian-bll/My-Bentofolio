## Contexte

Producteur et DJ, je joue régulièrement sur SoundCloud. Problème récurrent : j'oubliais mon ordi ou ma clé USB, et je les perdais. Refaire mes playlists à la main prenait une heure. Des outils existaient mais trop chers. Je me suis dit : je vais le coder moi-même.

## Process

D'abord, recherche sur comment télécharger depuis SoundCloud → découverte de SCDL, outil open-source qui récupère les pistes en M4A/MP3/OPUS. Ensuite, en tant que DJ, besoin de WAV pour compatibilité maximale sur platines CDJ. FFmpeg décode le flux compressé via le codec natif (AAC, MP3, Opus) et le ré-encode en PCM 16-bit 44.1 kHz stéréo — format standard non compressé. Mutagen préserve ensuite toutes les métadonnées (titre, artiste, cover...) du fichier source.

## Difficultés

La conversion lossless a été un peu galère à mettre en place correctement.

## Fiertés

Le résultat est méga propre. Ça marche, c'est fiable, c'est rapide.

## Si c'était à refaire

Honnêtement pas grand-chose à changer. Peut-être ajouter un vrai site avec backend pour une utilisation en ligne. Mais pour l'instant c'est déjà cool.