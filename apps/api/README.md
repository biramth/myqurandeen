# API myQurandeen — Rate limiting

Ce document décrit les limites de débit (rate limiting) appliquées à l'API
NestJS. C'est la référence pour l'équipe qui construira la future API
publique (phase 6 de la roadmap) — toute nouvelle surface publique doit
partir de ces conventions plutôt que d'inventer les siennes.

## Mécanisme

- **`@nestjs/throttler`** est câblé globalement dans `app.module.ts` via
  `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])` et enregistré
  comme `APP_GUARD` (`ThrottlerGuard`).
- Par défaut, **tous** les endpoints sont donc limités à **120 requêtes /
  minute / IP**.
- Les limites par endpoint se surchargent avec le décorateur
  `@Throttle({ default: { limit, ttl } })` (ttl toujours 60 s dans ce
  projet).
- Sur HTTP, le throttler renvoie **429 Too Many Requests**. Il est branché
  sur l'IP du client ; les réponses tournées derrière un proxy inversé
  doivent avoir `X-Forwarded-For` correctement configuré (voir config
  `trust proxy` de la plateforme d'hébergement).

## Tableau des limites

| Route | Méthode | Limite / min | Pourquoi cette valeur |
|---|---|---|---|
| *défaut global — toute route* | *tous* | 120 | Garde-fou général contre l'abus. |
| `/auth/register` | POST | 10 | Création de compte : rendre le spam de comptes coûteux. |
| `/auth/login` | POST | 10 | Anti brute-force. |
| `/auth/verify-email` | POST | 5 | Consomme un token d'email (attention aux récupérations légitimes). |
| `/auth/resend-verification` | POST | 5 | *Demande* un token : génère des emails sortants. |
| `/auth/forgot-password` | POST | 5 | *Demande* un token : génère des emails sortants. |
| `/auth/reset-password` | POST | 5 | Consomme un token de reset. |
| `/search` | GET | 30 | Requête la plus coûteuse de l'API (FTS + trigramme sur ~10 tables, non mise en cache). |
| `/ai/query` | POST | 15 | Requête LLM facturée sur le quota Gemini. |
| `/ai/search` | POST | 15 | Embedding facturé sur le quota Gemini. |
| `/ai/index`, `/ai/index/:type` | POST | 3 | Purge puis reconstruit l'index — coûteux, réservé à `ai:index`. |
| `/notifications/test` | POST | 5 | Envoie un vrai push externe. |
| `/marketing/unsubscribe` | POST | 10 | HMAC, pas de limite agressive. |
| `/user-data/bookmarks/toggle` | POST | 30 | Écriture utilisateur courante. |
| `/user-data/notes` · `/user-data/notes/:id` (PATCH/DELETE) | *écriture* | 30 | Écriture utilisateur courante. |
| `/user-data/collections` · `/user-data/collections/:id` (PATCH/DELETE) · `/user-data/collections/:id/items` (POST/DELETE) | *écriture* | 20 | Création/gestion de collections, moins fréquente que les notes. |
| `/user-data/last-read` | POST | 30 | Déclenché à chaque lecture de contenu. |
| `/streaks/ping` | POST | 60 | Déclenché à chaque lecture de contenu — fréquent, mais idempotent et léger. |
| `/gamification/events` | POST | 60 | Déclenché à chaque action significative — fréquent, mais léger. |

## Principes

- **Limites par endpoint vs globale** : une limite dédiée n'est ajoutée que
  quand l'endpoint le justifie (coût base/LLM/email élevé, ou surface
  d'abus). Tout le reste profite du défaut 120/min.
- **Écritures utilisateur** : limites défensives posées en 2026-09-03 sans
  signal d'abus observé — elles protègent les tables de données
  personnelles d'un éventuel futur spam. À réviser si la production montre
  de faux positifs (utilisateurs légitimes bloqués).
- **Endpoints publics chers** : `/search` porte seul une limite plus basse
  que le défaut car il touche beaucoup de tables ; le contenu de référence
  (Coran, hadith, etc.) est quant à lui mis en cache, donc non limité
  spécifiquement.

## Pour la future API publique (phase 6)

- La surface publique devra avoir sa **propre** délimitation
  (`/v1/...`), avec quotas par **clé API** (pas par IP) — un mécanisme
  différent du throttler IP actuel (`api_keys` + compteur d'usage, voir
  roadmap § 6.2).
- Garder les conventions ci-dessus comme socle : en-têtes de quota
  (`X-RateLimit-Remaining`, `X-RateLimit-Reset`), pagination cohérente,
  enveloppe `{ data, meta }` — à définir avant le premier contrat public.
