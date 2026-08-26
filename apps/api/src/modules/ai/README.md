# Module IA (inerte, hors MVP)

Ce dossier documente le contrat d'extension pour une future version avec IA.
**Aucun code ici n'est importe dans `app.module.ts`.** Ce module n'existe pas
dans le MVP : pas de chatbot, pas de RAG, pas d'appel a une API LLM payante.

## Pourquoi ce dossier existe deja

Pour que l'ajout d'une IA plus tard n'oblige pas a reecrire l'application :
le reste du code (modules de contenu, systeme de sources, RBAC) est concu
pour etre consomme par un futur `AiModule` sans modification.

## Contrat prevu pour une version future

- `AiModule` serait importe explicitement dans `app.module.ts` (opt-in).
- Il consommerait les services de domaine existants (`QuranService`,
  `HadithService`, etc.) en lecture seule - jamais l'inverse : les modules
  de contenu ne doivent jamais dependre du module IA.
- Toute reponse generee devrait citer les sources structurees existantes
  (`sources`, `authors`, `books`) plutot que d'inventer du contenu.
- Le provider LLM (local ou API) serait injecte via une interface
  (`AiProvider`) definie ici, pour rester remplacable.
- Fonctionnalites envisagees : questions sur les sources deja en base,
  explication de versets a partir des tafsirs existants, comparaison
  d'ecoles a partir des positions deja structurees, recherche semantique,
  resumes, parcours personnalises.

## Regle absolue

Si ce module est active un jour, il ne doit jamais devenir une source de
verite religieuse : il doit toujours s'appuyer sur le contenu deja sourcee
dans la base, jamais generer une affirmation religieuse non tracable.
