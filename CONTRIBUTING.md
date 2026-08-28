# Contribuer a myQurandeen

Merci de l'interet porte a ce projet. myQurandeen est une bibliotheque
numerique open-source sur l'Islam : Coran, hadith, tafsir, fiqh, histoire,
savants, concepts, parcours d'apprentissage, avec des sources verifiables
pour tout contenu religieux. Un module IA optionnel (RAG local) existe et
reste soumis a la meme regle : il ne repond qu'a partir de contenu deja
source dans la base, jamais par invention.

## Principe fondamental : sources verifiables

C'est la regle la plus importante du projet.

- N'inventez **jamais** un verset, un hadith, une citation, une reference,
  une position juridique ou un evenement historique.
- Toute donnee religieuse ajoutee doit etre reliee a une `source` (livre,
  auteur, edition) verifiable dans le schema de provenance.
- Quand plusieurs positions existent (ecoles, tafsirs, courants
  theologiques), presentez-les toutes, sans en designer une comme
  "la verite".
- Respectez le droit d'auteur : n'integrez que du contenu du domaine public
  ou sous licence explicitement compatible ; sinon, ajoutez un lien vers une
  source autorisee plutot que le texte integral.
- Si un contenu manque, ouvrez une issue ou preparez un script d'import
  plutot que de combler le vide avec du texte approximatif.

## Demarrage

```bash
git clone <votre-fork>
cd qurandeen
cp .env.example .env
npm install
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev
```

- API : http://localhost:3000 (docs OpenAPI sur `/docs`)
- Web : http://localhost:5173

## Structure du projet

Voir [README.md](README.md#architecture) pour l'arborescence complete.
Le backend est un monolithe modulaire NestJS (un module par domaine
metier), le frontend une SPA React/Vite organisee par feature.

## Style de code

- TypeScript strict, pas de `any` non justifie.
- `npm run lint` et `npm run typecheck` doivent passer avant toute PR.
- Pas de dependance ajoutee sans raison technique claire (voir principe
  "low-cost" du README).
- Cote frontend : reutiliser les composants shadcn/ui existants avant d'en
  ecrire un nouveau ; icones Lucide uniquement, pas d'emoji dans l'UI.

## Pull requests

1. Une PR = un sujet (evitez de melanger contenu religieux et refactor).
2. Decrivez la source de toute donnee religieuse ajoutee ou modifiee.
3. La CI (lint, typecheck, build) doit etre verte.
4. Un reviewer doit valider avant fusion - aucun deploiement automatique en
   production sans validation humaine.

## Signaler un probleme de contenu

Utilisez le systeme de signalement integre a l'application (erreur,
mauvaise reference, traduction problematique) plutot qu'une modification
directe sans discussion pour tout contenu deja publie.
