import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { sql } from "drizzle-orm";
import { DRIZZLE } from "../../database/database.constants";
import type { Database } from "../../database/database.module";
import { aiEmbeddings } from "../../database/schema";
import type { AiProvider } from "./ai-provider.interface";
import { EmbeddingService } from "./embedding.service";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

const SYSTEM_PROMPT = `Tu es un assistant specialise dans l'etude islamique. Tu réponds a des questions sur le Coran, les hadiths, le tafsir, l'histoire islamique, les ecoles juridiques (fiqh), les savants, et les concepts islamiques.

REGLES ABSOLUES :
1. Tu dois TOUJOURS te baser UNIQUEMENT sur les sources fournies dans le contexte.
2. Tu ne dois JAMAIS inventer de contenu religieux non present dans les sources.
3. Tu dois TOUJOURS citer tes sources quand tu reponds (verset, hadith, savant, ouvrage).
4. Si le contexte ne contient pas assez d'informations pour repondre, dis-le clairement.
5. Reponds de maniere concise et precise.
6. Tu peux repondre en francais, arabe, ou dans la langue de la question.`;

const MAX_CONTEXT_CHUNKS = 5;

export interface RagQueryResult {
  answer: string;
  sources: {
    contentType: string;
    contextText: string | null;
    metadata: Record<string, unknown>;
    similarity: number;
  }[];
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    @Inject("AI_PROVIDER") private readonly aiProvider: AiProvider,
    private readonly embeddingService: EmbeddingService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Repond a une question en utilisant le RAG (Retrieval-Augmented Generation).
   */
  async query(question: string): Promise<RagQueryResult> {
    this.logger.log(`Question RAG: "${question}"`);

    // 1. Embed la question
    const questionEmbedding = await this.aiProvider.embed(question);

    // 2. Recherche vectorielle par similarite cosinus en JS
    const allChunks = await this.db
      .select({
        contentText: aiEmbeddings.contentText,
        contextText: aiEmbeddings.contextText,
        contentType: aiEmbeddings.contentType,
        metadata: aiEmbeddings.metadata,
        embedding: aiEmbeddings.embedding,
      })
      .from(aiEmbeddings);

    const scoredChunks = allChunks
      .map((chunk) => ({
        ...chunk,
        similarity: cosineSimilarity(questionEmbedding, this.embeddingService.parseEmbedding(chunk.embedding)),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, MAX_CONTEXT_CHUNKS);

    // 3. Construire le contexte
    const contextParts = scoredChunks.map(
      (chunk, i) => `[Source ${i + 1}] (${chunk.contentType}) ${chunk.contextText ?? ""}\n${chunk.contentText}`,
    );
    const context = contextParts.join("\n\n---\n\n");

    // 4. Generer la reponse
    const userPrompt = `Contexte issues des sources islamiques :\n\n${context}\n\n---\n\nQuestion : ${question}`;

    const answer = await this.aiProvider.generate(userPrompt, SYSTEM_PROMPT);

    // 5. Retourner la reponse avec les sources
    const sources = scoredChunks.map((chunk) => ({
      contentType: chunk.contentType,
      contextText: chunk.contextText,
      metadata: JSON.parse(chunk.metadata ?? "{}") as Record<string, unknown>,
      similarity: chunk.similarity,
    }));

    return { answer, sources };
  }

  /**
   * Recherche semantique simple sans generation de texte.
   */
  async searchSimilar(query: string, limit = 5) {
    const queryEmbedding = await this.aiProvider.embed(query);

    const allChunks = await this.db
      .select({
        contentText: aiEmbeddings.contentText,
        contextText: aiEmbeddings.contextText,
        contentType: aiEmbeddings.contentType,
        metadata: aiEmbeddings.metadata,
        embedding: aiEmbeddings.embedding,
      })
      .from(aiEmbeddings);

    return allChunks
      .map((chunk) => ({
        contentText: chunk.contentText,
        contextText: chunk.contextText,
        contentType: chunk.contentType,
        metadata: chunk.metadata,
        similarity: cosineSimilarity(queryEmbedding, this.embeddingService.parseEmbedding(chunk.embedding)),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Statistiques sur l'index RAG.
   */
  async getStats() {
    const total = await this.db.select({ count: sql<number>`count(*)::int` }).from(aiEmbeddings);
    const byType = await this.db
      .select({ contentType: aiEmbeddings.contentType, count: sql<number>`count(*)::int` })
      .from(aiEmbeddings)
      .groupBy(aiEmbeddings.contentType);

    return {
      totalChunks: total[0]?.count ?? 0,
      byType: Object.fromEntries(byType.map((r) => [r.contentType, r.count])),
    };
  }

  /**
   * Health check : verifie qu'Ollama est joignable et qu'il y a des embeddings.
   */
  async healthCheck() {
    const ollamaOk = await this.aiProvider.healthCheck();
    const stats = await this.getStats();
    return {
      ollama: ollamaOk,
      embeddingsIndexed: stats.totalChunks,
      ready: ollamaOk && stats.totalChunks > 0,
    };
  }
}
