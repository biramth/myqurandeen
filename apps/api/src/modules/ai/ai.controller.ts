import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { RagService } from "./rag.service";
import { EmbeddingService, type ContentType } from "./embedding.service";

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

  @Public()
  @Post("query")
  @ApiOperation({ summary: "Poser une question avec RAG" })
  async query(@Body() body: { question: string }) {
    return this.ragService.query(body.question);
  }

  @Public()
  @Post("search")
  @ApiOperation({ summary: "Recherche semantique (sans generation)" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async search(@Body() body: { query: string }, @Query("limit") limit?: number) {
    return this.ragService.searchSimilar(body.query, limit ?? 5);
  }

  @Public()
  @Post("index")
  @ApiOperation({ summary: "Indexer tout le contenu dans l'embeddings store" })
  async indexAll() {
    return this.embeddingService.indexAll();
  }

  @Public()
  @Post("index/:type")
  @ApiOperation({ summary: "Indexer un type de contenu specifique" })
  @ApiQuery({ name: "type", enum: ["verse", "hadith", "tafsir", "concept", "scholar", "prophet", "event", "school", "fiqh_position"] })
  async indexByType(@Query("type") type: ContentType) {
    return this.embeddingService.indexByType(type);
  }
}
