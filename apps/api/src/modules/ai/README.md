# Module IA — RAG (Gemini par defaut, Ollama en option)

Module d'IA integré utilisant du RAG (Retrieval-Augmented Generation) sur le
contenu islamique de la base de données, avec **pgvector** pour la recherche
vectorielle dans PostgreSQL.

Le backend LLM/embeddings est choisi via `AI_BACKEND` (voir `.env.example`) :

- **`gemini`** (defaut) : API distante Google, gratuite en usage modere.
  Utilisee par defaut car l'hebergement local d'Ollama demande plus de
  ressources machine que disponible pour l'instant.
- **`ollama`** : 100% local, sans dependance a un service externe, mais
  demande une machine capable de faire tourner un LLM (GPU recommande).

Passer de l'un a l'autre ne demande aucun changement de code : les deux
providers implementent la meme interface `AiProvider`.

## Architecture

```
AiModule
├── ai.controller.ts        → Endpoints API (query, search, index, health, stats)
├── rag.service.ts           → Orchestration RAG (query + search semantique)
├── embedding.service.ts     → Indexation (chunking + generation embeddings)
├── gemini.provider.ts       → Client HTTP pour l'API Gemini (LLM + embeddings)
├── ollama.provider.ts       → Client HTTP pour Ollama (LLM + embeddings)
├── ai-provider.interface.ts → Interface abstraite (remplacable)
└── ai.module.ts             → Module NestJS - choisit le provider via AI_BACKEND
```

## Prerequis

### Avec Gemini (defaut)

1. Cle API gratuite sur <https://aistudio.google.com/apikey>
2. `GEMINI_API_KEY` renseigne dans `.env`
3. L'extension **pgvector** est activee sur PostgreSQL

### Avec Ollama (`AI_BACKEND=ollama`)

1. **Ollama** tourne en local (`docker compose --profile ollama up ollama`, ou en local hors Docker)
2. Le modele d'embeddings est telecharge : `ollama pull nomic-embed-text`
3. Le modele LLM est telecharge (voir `OLLAMA_LLM_MODEL` dans `.env.example`)
4. L'extension **pgvector** est activee sur PostgreSQL

## Endpoints API

| Methode | Route | Description |
|---------|-------|-------------|
| `GET` | `/ai/health` | Verifie le provider actif + nb d'embeddings |
| `GET` | `/ai/stats` | Statistiques de l'index |
| `POST` | `/ai/query` | Question RAG (reponse + sources) |
| `POST` | `/ai/search` | Recherche semantique (sans LLM) |
| `POST` | `/ai/index` | Indexer tout le contenu |
| `POST` | `/ai/index/:type` | Indexer un type specifique |

## Types de contenu indexables

`verse` | `hadith` | `tafsir` | `concept` | `scholar` | `prophet` | `event` | `school` | `fiqh_position`

Pour `verse`, une traduction verifiee (francais, repli sur l'anglais) est
systematiquement incluse dans le texte embarque en plus de l'arabe : sans
elle, le LLM devait inventer sa propre traduction pour repondre en francais,
ce qui produisait des reponses fausses (contraire a la regle ci-dessous).

## Regles absolues

- Ce module ne doit JAMAIS etre une source de verite religieuse.
- Il s'appuie TOUJOURS sur le contenu deja source dans la base.
- Toute reponse cite les sources (verset, hadith, auteur, ouvrage).
- Le provider LLM est injecte via le token `AI_PROVIDER` (NestJS) et peut
  etre remplace en implementant `AiProvider` - a ne pas confondre avec la
  variable d'environnement `AI_BACKEND` qui choisit lequel utiliser.

## A savoir / limites actuelles

- `health`/`stats` restent `@Public()` (statut en lecture seule, sans cout).
  `query`/`search` demandent d'etre connecte (throttle : 15/min) - vraies
  requetes LLM/embedding facturees sur le quota Gemini. `index`/
  `index/:type` sont reservees a la permission `ai:index` (roles ADMIN/
  SUPER_ADMIN, throttle : 3/min) car elles purgent puis reconstruisent tout
  l'index - operation couteuse et destructive.
- **Le palier gratuit de l'API Gemini pour `gemini-embedding-001` est un
  quota de 1000 requetes/JOUR (pas par minute)** - confirme empiriquement
  le 2026-08-28 (`quotaId:
  "EmbedContentRequestsPerDayPerUserPerProjectPerModel-FreeTier"`).
  `GeminiProvider` retente automatiquement sur 429/5xx en respectant le
  `RetryInfo.retryDelay` renvoye par l'API, mais ca ne peut rien faire
  contre un quota journalier deja epuise - une fois les 1000 requetes du
  jour consommees, toute nouvelle indexation echoue jusqu'au lendemain,
  quel que soit le nombre de tentatives. Le corpus complet (~77k chunks)
  demande environ 4 jours d'indexation au minimum sur le palier gratuit.
- `verse` et `tafsir` embarquent tous les deux une traduction/edition en
  francais ou anglais plutot que le contenu arabe brut (corrige le
  2026-08-28 pour les deux) - sans ca, le LLM devait traduire lui-meme et
  produisait des reponses inventees. `tafsir` n'indexe que les oeuvres
  disponibles en fr/en (`Al-Mukhtasar fi at-Tafsir` fr+en, `Tafsir Ibn
  Kathir (abrege)` en) ; les oeuvres arabophones seules (`At-Tafsir
  al-Muyassar`) sont exclues de l'index RAG.
