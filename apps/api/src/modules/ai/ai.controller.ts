import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { RequirePermission } from "../../common/decorators/require-permission.decorator";
import { RagService } from "./rag.service";
import { EmbeddingService, type ContentType } from "./embedding.service";

/**
 * `health`/`stats` restent publiques (statut en lecture seule, sans cout).
 * `query`/`search` demandent d'etre connecte (JwtAuthGuard global, pas de
 * @Public()) et sont throttlees a part car elles declenchent de vrais appels
 * LLM/embedding factures sur un quota limite (voir README.md). `index`/
 * `index/:type` sont en plus reservees a un role disposant de la permission
 * `ai:index` : ce sont des operations couteuses qui purgent puis
 * reconstruisent tout l'index.
 */
@ApiTags("ai")
@Controller("ai")
export class AiController {
  constructor(
    private readonly ragService: RagService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  @Public()
  @Get("health")
  @ApiOperation({ summary: "Verifier l'etat du systeme IA / RAG" })
  health() {
    return this.ragService.healthCheck();
  }

  @Public()
  @Get("stats")
  @ApiOperation({ summary: "Statistiques de l'index RAG" })
  stats() {
    return this.ragService.getStats();
  }

  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post("query")
  @ApiOperation({ summary: "Poser une question avec RAG (authentifie)" })
  async query(@Body() body: { question: string }) {
    return this.ragService.query(body.question);
  }

  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @Post("search")
  @ApiOperation({ summary: "Recherche semantique, sans generation (authentifie)" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async search(@Body() body: { query: string }, @Query("limit") limit?: number) {
    return this.ragService.searchSimilar(body.query, limit ?? 5);
  }

  @RequirePermission("ai:index")
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("index")
  @ApiOperation({ summary: "Indexer tout le contenu dans l'embeddings store (reserve admin)" })
  async indexAll() {
    return this.embeddingService.indexAll();
  }

  @RequirePermission("ai:index")
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post("index/:type")
  @ApiOperation({ summary: "Indexer un type de contenu specifique (reserve admin)" })
  @ApiParam({ name: "type", enum: ["verse", "hadith", "tafsir", "concept", "scholar", "prophet", "event", "school", "fiqh_position"] })
  async indexByType(@Param("type") type: ContentType) {
    return this.embeddingService.indexByType(type);
  }
}
