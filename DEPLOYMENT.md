# Déploiement

myQurandeen est composé de deux services indépendants (frontend statique +
API stateful) et d'une base PostgreSQL. Ce document couvre les options de
déploiement et répond en détail à la question : **peut-on tout déployer sur
Vercel ?**

## Réponse courte : partiellement

| Composant | Sur Vercel ? |
|---|---|
| **Frontend** (`apps/web`) | **Oui, sans réserve.** SPA statique Vite/React — c'est exactement le cas d'usage principal de Vercel. |
| **API** (`apps/api`) | **Non, pas telle quelle.** Voir les raisons ci-dessous. Possible avec une réécriture significative, mais pas recommandé. |
| **PostgreSQL** | Vercel n'héberge pas de PostgreSQL lui-même ; il faudrait de toute façon un fournisseur externe (Vercel Postgres/Neon, Supabase, Railway...). |

### Pourquoi l'API ne va pas sur Vercel telle quelle

Vercel exécute le code serveur comme des **fonctions serverless** :
processus éphémères, avec une **limite d'exécution stricte** par requête
(10 s sur le plan gratuit, jusqu'à 300 s sur Pro avec configuration
explicite, 900 s max même sur Enterprise).

1. **L'indexation IA (`POST /ai/index`, `/ai/index/:type`) dépasse ces
   limites de plusieurs ordres de grandeur.** Vérifié empiriquement pendant
   le développement : même un petit lot peut prendre plusieurs minutes, et
   une réindexation complète du corpus (~77 000 fragments) peut demander
   plusieurs **jours** avec le palier gratuit de l'API Gemini (1000
   requêtes d'embedding/jour). Aucune limite Vercel, même la plus généreuse,
   ne couvre ça. Ce n'est pas un problème d'hébergement — c'est
   fondamentalement incompatible avec un modèle serverless à durée bornée,
   quel que soit le fournisseur serverless choisi.
2. **Connexions PostgreSQL.** L'API utilise un pool de connexions
   classique (`pg` via Drizzle), pensé pour un processus long-running. Un
   déploiement serverless multiplie les instances de fonction sous charge,
   ce qui épuise vite les connexions PostgreSQL (limite par défaut ~100)
   sans un pooler dédié (PgBouncer, ou le pooler intégré de Neon/Supabase).
   Ce n'est pas bloquant en soi, mais ça impose de changer de fournisseur
   de base de données et d'adapter la configuration de connexion.
3. **NestJS n'est pas pensé pour le serverless par défaut.** C'est
   possible via un adaptateur (`@vendia/serverless-express` ou équivalent)
   qui enveloppe toute l'app dans un handler unique, mais ça ajoute de la
   latence au démarrage à froid (cold start) et une réécriture du
   bootstrap (`main.ts`) — pas juste un changement de configuration.
4. **Docker non supporté.** Le `Dockerfile` de l'API ne s'exécute pas tel
   quel sur Vercel (qui a son propre système de build) ; il faudrait un
   `vercel.json` avec des fonctions serverless dédiées à la place.

Aucun de ces points n'est infranchissable un par un, mais mis ensemble ils
représentent un vrai projet de réécriture, pas une bascule de
configuration — et le point 1 (durée de l'indexation IA) resterait un
problème même après tout le reste, à moins de sortir cette opération dans
une queue/un worker séparé, hébergé ailleurs de toute façon.

## Déploiement recommandé (hybride, sans réécriture)

Chaque service sur la plateforme adaptée à son besoin :

- **Frontend → Vercel** (gratuit, CDN global, previews par PR).
- **API → Railway, Render ou Fly.io** (process Node long-running,
  build à partir du `Dockerfile` existant tel quel, sans réécriture).
- **PostgreSQL → base managée** (Railway/Render/Fly proposent chacun un
  addon Postgres ; Neon ou Supabase fonctionnent aussi et ont un palier
  gratuit généreux).

### 1. Frontend sur Vercel

Un [vercel.json](vercel.json) est déjà présent à la racine du dépôt.

1. Importer le dépôt dans Vercel, **laisser le Root Directory à la racine
   du monorepo** (pas `apps/web`) — `vercel.json` s'occupe de pointer vers
   le bon dossier de build via `outputDirectory`.
2. Définir la variable d'environnement `VITE_API_URL` dans les réglages du
   projet Vercel : l'URL publique de l'API déployée à l'étape 2
   (ex. `https://qurandeen-api.up.railway.app`). C'est une variable
   *build-time* (Vite la fige dans le bundle) : tout changement demande un
   redéploiement.
3. Déployer. Le `postinstall` du monorepo (`npm run build -w
   packages/shared`) s'exécute automatiquement à l'installation.

### 2. API sur Railway (ou Render / Fly.io)

Exemple avec Railway (le principe est identique sur Render/Fly, seule
l'interface change) :

1. Nouveau projet Railway → déployer depuis le dépôt GitHub, en pointant
   le Dockerfile sur `apps/api/Dockerfile` avec le **contexte de build à
   la racine du monorepo** (nécessaire : le Dockerfile copie
   `packages/shared`).
2. Ajouter un addon PostgreSQL (Railway en propose un en un clic) et
   récupérer son `DATABASE_URL`.
3. Définir les variables d'environnement (voir [Variables
   d'environnement](#variables-denvironnement) ci-dessous) — au minimum
   `DATABASE_URL`, `WEB_URL` (l'URL Vercel de l'étape 1), `JWT_ACCESS_SECRET`,
   `JWT_REFRESH_SECRET`, et `GEMINI_API_KEY` si l'assistant IA est activé.
4. Une fois déployé, exécuter les migrations et le seed RBAC (voir
   [Après le premier déploiement](#après-le-premier-déploiement)).

### 3. Alternative : tout sur une seule VPS

Le [docker-compose.yml](docker-compose.yml) à la racine fonctionne tel
quel sur n'importe quelle VPS avec Docker installé (2 Go de RAM suffisent
sans Ollama) :

```bash
git clone <votre-fork> && cd myqurandeen
cp .env.example .env   # editer avec de vrais secrets + la bonne WEB_URL/VITE_API_URL
docker compose up -d --build
```

Ajouter un reverse proxy (Caddy ou nginx + Let's Encrypt) devant pour le
TLS et un nom de domaine — non inclus dans ce compose, volontairement,
pour rester simple. C'est l'option la plus simple si vous préférez un seul
endroit à gérer plutôt que trois comptes différents (Vercel + Railway +
DB).

## Variables d'environnement

Voir [.env.example](.env.example) pour la liste complète et les valeurs
par défaut de développement. En production, à minima :

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL de production. |
| `WEB_URL` | Origine exacte du frontend déployé (utilisée pour le CORS — une valeur incorrecte bloque silencieusement toutes les requêtes du frontend). |
| `VITE_API_URL` | URL publique de l'API (build-time, côté frontend). |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Générer avec `openssl rand -base64 48` — ne jamais garder les valeurs `change-me-*` par défaut en production. |
| `AI_BACKEND` | `gemini` par défaut. Laisser `ollama` seulement si un backend Ollama est réellement joignable depuis l'API déployée. |
| `GEMINI_API_KEY` | Nécessaire si `AI_BACKEND=gemini`. |

## Après le premier déploiement

```bash
# Depuis un environnement ayant acces a DATABASE_URL de production
npm run db:migrate -w apps/api
npm run db:seed -w apps/api            # roles/permissions RBAC
npm run db:seed:quran -w apps/api      # puis les autres db:seed:* selon apps/README.md
```

Puis, une fois du contenu importé, déclencher l'indexation de l'assistant
IA (`POST /ai/index`, réservé à un rôle disposant de la permission
`ai:index`) — en gardant à l'esprit la contrainte de quota décrite plus
haut si `AI_BACKEND=gemini` est utilisé sur le palier gratuit : voir
[apps/api/src/modules/ai/README.md](apps/api/src/modules/ai/README.md).
