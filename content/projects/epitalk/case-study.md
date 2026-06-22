## Contexte

Epitalk est un projet web interactif réalisé en quatre jours dans le cadre de la SAS Posture Pro. L’objectif était de centraliser et simplifier l’accès aux informations liées à Epitech à travers une interface accessible aux étudiants.

Le projet a été développé en équipe de trois. Dawid s’est occupé de la page d’accueil et du système d’authentification, Muhammad du générateur de carte étudiante, et je me suis principalement occupé du chatbot interactif ainsi que du design system du projet.

Ce projet a été marquant pour moi, parce que c’était la première fois que je construisais un arbre de décision complet. Même si ce n’était pas une vraie intelligence artificielle, j’ai découvert une logique proche de certains systèmes utilisés dans les jeux vidéo pour rendre des personnages ou des interactions plus vivants : prévoir des chemins, des réponses, des retours en arrière et une progression guidée.

## Process

J’ai conçu le chatbot comme une conversation guidée. L’utilisateur ne tape pas librement ses questions : il avance à travers des boutons qui déclenchent différentes branches de réponses. Cela permettait de garder une expérience simple tout en couvrant beaucoup de sujets liés à Epitech et à la Web@cadémie.

Le cœur du travail était donc de structurer l’information sous forme d’arbre de décision. Il fallait penser les questions, les réponses, les embranchements, les retours possibles et la manière dont l’utilisateur pouvait revenir au début sans se perdre.

Cette logique m’a beaucoup plu, parce qu’elle mélangeait à la fois développement, UX et narration interactive. J’ai compris qu’un chatbot ne dépend pas forcément d’un modèle d’IA pour donner une impression d’échange : avec une bonne structure, des choix clairs et des réponses bien organisées, on peut déjà créer une interaction utile et engageante.

Après la présentation initiale, j’ai aussi repris la branche `master` pour améliorer la structure globale du projet. J’ai centralisé le design system, harmonisé les styles, standardisé certains noms de classes et d’identifiants, puis nettoyé les fichiers et assets redondants.

## Difficultés

La principale difficulté venait du fait que le projet avait été développé rapidement par plusieurs personnes, avec des fichiers, styles et conventions qui divergeaient selon les pages.

Pour le chatbot, la difficulté était surtout de garder l’arbre de décision lisible malgré le nombre de sujets couverts. Plus il y avait de branches, plus il fallait faire attention à ne pas créer une expérience confuse ou difficile à maintenir.

Il fallait aussi trouver le bon équilibre entre un chatbot suffisamment riche pour être utile et une structure assez simple pour être comprise, modifiée et présentée dans un délai très court.

## Fiertés

Je suis particulièrement fier du chatbot, parce que c’est la partie sur laquelle j’ai le plus appris. C’était ma première vraie expérience avec une logique d’arbre de décision, et ça m’a donné une première intuition de ce que peut être une interaction “intelligente”, même sans IA générative.

J’ai aimé voir qu’avec du JavaScript simple, une bonne structure et une interface claire, on pouvait créer une expérience qui donne l’impression de dialoguer avec un système dynamique.

Je suis aussi satisfait du design system mis en place après la première livraison. Il a permis d’unifier visuellement les pages, de réduire les styles redondants et de donner au projet une apparence plus professionnelle.

## Si c'était à refaire

Je séparerais dès le début le contenu du chatbot de la logique JavaScript. Par exemple, je mettrais les questions, réponses et branches dans une structure de données dédiée, pour rendre l’arbre plus facile à lire, modifier et enrichir.

Je réfléchirais aussi davantage à l’expérience conversationnelle : comment formuler les réponses, comment guider l’utilisateur, comment rendre les choix plus naturels, et comment éviter qu’il ait l’impression d’être bloqué dans un menu.

Enfin, je définirais une structure commune pour les fichiers, les composants visuels et les conventions de nommage dès le début du projet, afin d’éviter une grosse phase de nettoyage après la première version.
