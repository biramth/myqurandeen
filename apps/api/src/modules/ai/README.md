# Module IA — RAG Local (Ollama + pgvector)

Module d'IA integré utilisant **Ollama** (LLM local gratuit) et **pgvector**
(recherche vectorielle dans PostgreSQL) pour du RAG (Retrieval-Augmented Generation)
sur le contenu islamique de la base de données.

## Architecture

```
AiModule
├── ai.controller.ts        → Endpoints API (query, search, index, health, stats)
├── rag.service.ts           → Orchestration RAG (query + search semantique)
├── embedding.service.ts     → Indexation (chunking + generation embeddings)
├── ollama.provider.ts       → Client HTTP pour Ollama (LLM + embeddings)
├── ai-provider.interface.ts → Interface abstraite (remplacable)
└── ai.module.ts             → Module NestJS
```

## Prerequis

1. **Ollama** tourne en local (ou via Docker Compose)
2. Le modele d'embeddings est telecharge : `ollama pull nomic-embed-text`
3. Le modele LLM est telecharge : `ollama pull llama3.1:8b`
4. L'extension **pgvector** est activee sur PostgreSQL

## Endpoints API

| Methode | Route | Description |
|---------|-------|-------------|
| `GET` | `/ai/health` | Verifie Ollama + nb d'embeddings |
| `GET` | `/ai/stats` | Statistiques de l'index |
| `POST` | `/ai/query` | Question RAG (reponse + sources) |
| `POST` | `/ai/search` | Recherche semantique (sans LLM) |
| `POST` | `/ai/index` | Indexer tout le contenu |
| `POST` | `/ai/index/:type` | Indexer un type specifique |

## Types de contenu indexables

`verse` | `hadith` | `tafsir` | `concept` | `scholar` | `prophet` | `event` | `school` | `fiqh_position`

## Regles absolues

- Ce module ne JAMAIS etre une source de verite religieuse.
- Il s'appuie TOUJOURS sur le contenu deja source dans la base.
- Toute reponse cite les sources (verset, hadith, auteur, ouvrage).
- Le provider LLM est injecte via `AI_PROVIDER` et peut etre remplace.
