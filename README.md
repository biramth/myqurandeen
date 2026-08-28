# myQurandeen

Plateforme web **open-source et gratuite** pour l'étude et la découverte de
l'Islam : Coran, traductions, tafsirs, hadiths, vie du Prophète ﷺ, histoire
islamique, écoles juridiques, théologie, savants, bibliothèque, encyclopédie
de concepts et parcours d'apprentissage guidés.

Pensée d'abord comme une bibliothèque numérique moderne à sources
vérifiables. Un assistant IA (RAG, voir
[apps/api/src/modules/ai/README.md](apps/api/src/modules/ai/README.md))
s'appuie exclusivement sur ce contenu déjà sourcé : il ne répond qu'à partir
des extraits retrouvés dans la base et cite systématiquement ses sources —
il n'invente jamais de contenu religieux.

## Principe fondamental : sources vérifiables

Aucun verset, hadith, citation, référence, position juridique ou événement
historique n'est inventé. Chaque contenu significatif est relié à une
`source` traçable (auteur, ouvrage, édition). Quand plusieurs avis existent
(écoles de fiqh, tafsirs, courants théologiques), ils sont tous présentés,
sans hiérarchie de « vérité ». Voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Fonctionnalités

- **Coran** : 114 sourates, texte arabe et plusieurs traductions par verset,
  comparateur de traductions.
- **Hadith** : les six recueils canoniques (Kutub as-Sittah — Bukhari,
  Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah), classification
  d'authenticité par savant, plus Al-Muwatta et Riyad as-Salihin dans la
  bibliothèque.
- **Tafsir** : plusieurs éditions (arabe, français, anglais) consultables
  verset par verset.
- **Fiqh comparé** : comparateur de positions des quatre écoles sunnites
  (hanafite, malikite, shafi'ite, hanbalite) sujet par sujet, avec
  explication sourcée de l'origine de chaque divergence.
- **Histoire** : chronologie par période, vie détaillée du Prophète ﷺ,
  chaque événement daté et sourcé.
- **Savants**, **Prophètes**, **Concepts** : fiches encyclopédiques reliées
  entre elles.
- **Bibliothèque** : catalogue d'ouvrages de référence classiques
  (domaine public), organisés par catégorie et par auteur.
- **Parcours d'apprentissage** : plusieurs parcours guidés, du débutant à
  l'avancé, avec leçons rédigées, points clés et quiz d'auto-évaluation.
- **Recherche** : recherche plein texte (PostgreSQL Full-Text Search) sur
  l'ensemble du contenu.
- **Espace personnel** : favoris, notes privées et collections, sur
  n'importe quel contenu du site.
- **Assistant IA (RAG)** : pose une question en langage naturel, réponse
  générée uniquement à partir du contenu déjà présent et sourcé sur la
  plateforme, avec citations cliquables. Backend swappable (Gemini par
  défaut, Ollama en local en option) — voir
  [apps/api/src/modules/ai/README.md](apps/api/src/modules/ai/README.md).
- **Modération & administration** : signalements, gestion des rôles et
  utilisateurs, journal d'audit, RBAC granulaire par permission.
- **8 langues d'interface** : français, anglais, espagnol, allemand, turc,
  ourdou, indonésien, russe.

## Stack technique

**Backend** : NestJS, TypeScript, PostgreSQL, Drizzle ORM — monolithe
modulaire (un module par domaine), API REST documentée en OpenAPI
(`/docs`), recherche via PostgreSQL Full-Text Search, RBAC par permission.

**Frontend** : React, TypeScript, Vite, Tailwind CSS, shadcn/ui + Radix
UI (accessibilité native : focus trap, navigation clavier, ARIA),
Lucide React, React Router, TanStack Query, React Hook Form + Zod,
react-i18next, notifications via Sonner.

**IA / RAG** : backend swappable — Gemini (API distante, gratuite en
usage modéré, par défaut) ou Ollama (100% local, optionnel). Embeddings
stockés en base, similarité calculée applicativement.

**Infra** : Docker Compose (PostgreSQL + API + Web), déployable sur une
seule VPS modeste. Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour les options de
déploiement (dont la question « peut-on tout déployer sur Vercel ? »).

## Architecture

Monorepo npm workspaces :

```
qurandeen/
├── apps/
│   ├── api/     NestJS — un module par domaine (quran, hadith, tafsir,
│   │            schools/fiqh, history, scholars, prophets, library,
│   │            concepts, learning, search, auth, users, rbac, reports,
│   │            admin, audit-log, user-data, sources, ai)
│   └── web/     React + Vite, organise par feature
├── packages/
│   └── shared/  types, enums et schemas Zod partages front/back
├── docker-compose.yml
└── DEPLOYMENT.md
```

Le schéma de base de données complet (RBAC, provenance des sources, Coran,
hadith, tafsir, écoles/fiqh, savants, prophètes, histoire, concepts,
bibliothèque, parcours d'apprentissage, notes/favoris/collections,
modération/audit, embeddings IA) est défini sous
`apps/api/src/database/schema/`.

## Démarrage rapide

Prérequis : Node.js 20+, Docker (pour PostgreSQL).

```bash
cp .env.example .env
npm install
docker compose up -d postgres
npm run db:migrate
npm run db:seed              # roles/permissions RBAC (aucun contenu religieux)
npm run dev
```

- Frontend : http://localhost:5173
- API : http://localhost:3000
- Documentation OpenAPI : http://localhost:3000/docs

### Importer le contenu

Chaque type de contenu a son propre script de seed/import, idempotent
(peut être relancé sans dupliquer les données) :

```bash
npm run db:seed:quran     -w apps/api   # 114 sourates, texte arabe + traductions
npm run db:seed:hadith    -w apps/api   # les six recueils canoniques
npm run db:seed:tafsir    -w apps/api   # plusieurs editions de tafsir
npm run db:seed:history   -w apps/api   # chronologie, vie du Prophete ﷺ
npm run db:seed:schools   -w apps/api   # ecoles + comparateur de fiqh
npm run db:seed:prophets  -w apps/api   # fiches des prophetes
npm run db:seed:scholars  -w apps/api   # fiches des savants
npm run db:seed:concepts  -w apps/api   # encyclopedie de concepts
npm run db:seed:library   -w apps/api   # catalogue de la bibliotheque
npm run db:seed:learning  -w apps/api   # parcours d'apprentissage
npm run db:seed:quiz      -w apps/api   # quiz des parcours
```

`db:seed:quran`, `db:seed:hadith` et `db:seed:tafsir` importent depuis des
jeux de données ouverts externes (voir les commentaires en tête de chaque
script) ; les autres sont des seeds de contenu rédigé directement dans le
dépôt, sourcé selon le principe ci-dessus.

L'assistant IA a besoin d'un index séparé une fois le contenu importé —
voir [apps/api/src/modules/ai/README.md](apps/api/src/modules/ai/README.md)
(`POST /ai/index`, réservé aux rôles ADMIN/SUPER_ADMIN).

## Déploiement

Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour le guide complet, y compris la
réponse détaillée à « peut-on déployer entièrement sur Vercel ? » (résumé :
le frontend oui, sans réserve ; l'API non, pas telle quelle — voir pourquoi
dans ce document).

## État d'avancement

Le socle fonctionnel est en place et couvre l'ensemble des domaines listés
plus haut (contenu, comparateur de fiqh, bibliothèque, parcours
d'apprentissage, espace personnel, modération/administration, assistant
IA). Le projet continue d'évoluer : profondeur de contenu, couverture
linguistique complète du contenu religieux (le Coran, le hadith et le
tafsir ne sont pas encore traduits dans les 8 langues), durcissement
sécurité et tests automatisés.

## Licence

Code sous licence [MIT](LICENSE). Le contenu religieux importé conserve sa
propre licence/statut (domaine public, licence compatible ou lien vers une
source autorisée) — voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Merci de lire en priorité le
principe des sources vérifiables avant toute contribution de contenu.
