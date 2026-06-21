## Contexte
Je voulais utiliser Sidecar entre mon Mac et mon iPad Air 2. Sauf qu'Apple a decide que mon matos etait trop vieux — liste noire integree direct dans `SidecarCore.framework`. Pas dev de formation, je debutais en Python, mais j'avais une IA sous le coude et l'envie de comprendre comment ca marchait *vraiment*.

## Process
J'ai extrait le binaire du cache DYLD avec `dyld-shared-cache-extractor`, puis j'ai passe des heures dans Hopper Disassembler a lire de l'assembleur ARM64 — les blocs d'instructions, les registres, les comparaisons. Une fois la fonction de verification reperee, j'ai ecrit un script Python qui scanne la signature binaire et applique le patch automatiquement.

## Difficultes
Le vrai mur : la signature de code. Sous Sequoia, macOS refuse de charger un framework modifie si la signature est invalide. J'ai tout tente — `codesign` ad-hoc, `ldid` avec des entitlements customs — rien n'a marche. C'etait hyper frustrant parce qu'en theorie le patch etait bon, mais Apple verrouille tout. Le cache partage des frameworks complique encore plus la donne depuis Big Sur.

## Fiertes
J'ai failli briquer mon MacBook plusieurs fois. Il a survecu. Surtout, j'ai appris un truc de dingue : ce que c'est vraiment l'assembleur, comment un CPU execute des instructions, comment on lit du binaire avec Hopper, comment macOS protege ses frameworks. Tout ca en partant de zero, avec une IA comme binome.

## Si c'etait a refaire
Je creuserais plus la piste noyau. J'ai essaye OpenCore Patcher — ca permet d'injecter des extensions kernel et d'avoir un kernel macOS modifie — mais j'ai pas reussi a le faire marcher, surement par manque de connaissances. J'ai aussi regarde FeatureUnlock mais j'ai pas trop capte comment il fonctionnait. Si je devais recommencer, je me formerais d'abord sur l'archi kernel de macOS avant de toucher au binaire.