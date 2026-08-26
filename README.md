# Qurandeen

Plateforme web **open-source et gratuite** pour l'etude et la decouverte de
l'Islam : Coran, traductions, tafsirs, hadiths, vie du Prophete ﷺ, histoire
islamique, ecoles juridiques, theologie, savants, bibliotheque et concepts.

Pensee d'abord comme une bibliotheque numerique moderne a sources
verifiables. Un module IA optionnel (RAG local via Ollama + pgvector, voir
[apps/api/src/modules/ai/README.md](apps/api/src/modules/ai/README.md))
s'appuie exclusivement sur ce contenu deja source : il ne repond qu'a partir
des extraits retrouves dans la base, cite systematiquement ses sources, et
n'invente jamais de contenu religieux. Aucune API payante n'est utilisee.

## Principe fondamental : sources verifiables

Aucun verset, hadith, citation, reference, position juridique ou evenement
historique n'est invente. Chaque contenu significatif est relie a une
`source` tracable (auteur, ouvrage, edition). Quand plusieurs avis existent
(ecoles de fiqh, tafsirs, courants theologiques), ils sont tous presentes,
sans hierarchie de "verite". Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack technique

**Backend** : NestJS, TypeScript, PostgreSQL, Drizzle ORM — monolithe
modulaire (un module par domaine), API REST documentee en OpenAPI,
recherche via PostgreSQL Full-Text Search.

**Frontend** : React, TypeScript, Vite, Tailwind CSS, shadcn/ui,
Lucide React, React Router, TanStack Query, React Hook Form + Zod.

**Infra** : Docker Compose (Postgres + API + Web), aucune dependance a un
service payant, deployable sur une seule VPS modeste.

## Architecture

Monorepo npm workspaces :

```
qurandeen/
├── apps/
│   ├── api/     NestJS — un module par domaine (quran, hadith, tafsir,
│   │            fiqh/schools, history, scholars, library, concepts,
│   │            learning, search, auth, users, rbac, reports, admin,
│   │            audit-log, sources, ai[inerte])
│   └── web/     React + Vite, organise par feature
├── packages/
│   └── shared/  types et schemas Zod partages front/back
└── docker-compose.yml
```

Le schema de base de donnees complet (RBAC, provenance, Coran, hadith,
tafsir, ecoles/fiqh, savants, histoire, concepts, bibliotheque, parcours
d'apprentissage, notes/favoris, moderation/audit) est defini sous
`apps/api/src/database/schema/`.

## Demarrage rapide

Prerequis : Node.js 20+, Docker (pour PostgreSQL).

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run db:migrate
npm run db:seed      # seed RBAC uniquement (roles/permissions), aucun contenu religieux
npm run dev
```

- Frontend : http://localhost:5173
- API : http://localhost:3000
- Documentation OpenAPI : http://localhost:3000/docs

## Etat d'avancement

Le projet avance par phases (voir le detail dans le plan de developpement).
**Phase 1 (en cours)** : architecture, schema de base de donnees, design
system, squelette des modules. Aucun contenu religieux n'est encore
present — l'infrastructure d'import sera utilisee au fil des phases
suivantes (Coran, hadith, tafsir, histoire, ecoles, bibliotheque, savants,
concepts, recherche avancee, parcours, administration, durcissement
securite/tests).

## Licence

Code sous licence [MIT](LICENSE). Le contenu religieux importe conserve sa
propre licence/statut (domaine public, licence compatible ou lien vers une
source autorisee) — voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Merci de lire en priorite le
principe des sources verifiables avant toute contribution de contenu.
