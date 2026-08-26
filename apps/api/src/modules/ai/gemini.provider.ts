import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiProvider } from "./ai-provider.interface";

/**
 * Provider Gemini (API distante Google). Utilise en priorite actuellement
 * car l'hebergement local d'Ollama demande plus de ressources machine que
 * disponible pour l'instant - voir README.md de ce module. Repose
 * uniquement sur `fetch`, sans SDK, pour rester coherent avec
 * OllamaProvider.
 *
 * Reference API : https://ai.google.dev/api
 */

const API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const MAX_RETRY_ATTEMPTS = 3;

interface GeminiEmbedResponse {
  embedding: { values: number[] };
}

interface GeminiBatchEmbedResponse {
  embeddings: { values: number[] }[];
}

interface GeminiGenerateResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

@Injectable()
export class GeminiProvider implements AiProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly apiKey: string;
  private readonly llmModel: string;
  private readonly embeddingModel: string;
  private readonly embeddingDim: number;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>("GEMINI_API_KEY", "");
    this.llmModel = config.get<string>("GEMINI_LLM_MODEL", "gemini-2.5-flash");
    this.embeddingModel = config.get<string>("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001");
    this.embeddingDim = config.get<number>("AI_EMBEDDING_DIM", 768);

    if (!this.apiKey) {
      this.logger.warn(
        "GEMINI_API_KEY manquant : le provider Gemini repondra en echec tant que la cle n'est pas definie (voir .env.example).",
      );
    }
    this.logger.log(`Gemini provider initialise (LLM: ${this.llmModel}, Embeddings: ${this.embeddingModel})`);
  }

  private headers(): Record<string, string> {
    return { "Content-Type": "application/json", "x-goog-api-key": this.apiKey };
  }

  /** Retente sur 429 (quota) et 5xx avec backoff exponentiel - le palier gratuit est rate-limite. */
  private async postWithRetry(url: string, body: unknown): Promise<Response> {
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      const res = await fetch(url, { method: "POST", headers: this.headers(), body: JSON.stringify(body) });
      if (res.ok) return res;

      const text = await res.text();
      if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRY_ATTEMPTS - 1) {
        const delayMs = 1000 * 2 ** attempt;
        this.logger.warn(`Gemini API ${res.status}, nouvelle tentative dans ${delayMs}ms (${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
        lastError = new Error(`Gemini API ${res.status}: ${text}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw new Error(`Gemini API ${res.status}: ${text}`);
    }
    throw lastError instanceof Error ? lastError : new Error("Gemini API : echec apres plusieurs tentatives");
  }

  async embed(text: string): Promise<number[]> {
    const res = await this.postWithRetry(`${API_BASE}/models/${this.embeddingModel}:embedContent`, {
      content: { parts: [{ text }] },
      embedContentConfig: { taskType: "RETRIEVAL_QUERY", outputDimensionality: this.embeddingDim },
    });
    const data = (await res.json()) as GeminiEmbedResponse;
    return data.embedding.values;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const res = await this.postWithRetry(`${API_BASE}/models/${this.embeddingModel}:batchEmbedContents`, {
      requests: texts.map((text) => ({
        model: `models/${this.embeddingModel}`,
        content: { parts: [{ text }] },
        embedContentConfig: { taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: this.embeddingDim },
      })),
    });
    const data = (await res.json()) as GeminiBatchEmbedResponse;
    return data.embeddings.map((e) => e.values);
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const res = await this.postWithRetry(`${API_BASE}/models/${this.llmModel}:generateContent`, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      // Temperature basse : on veut une reponse fidele au contexte fourni,
      // pas de creativite, pour limiter le risque d'invention.
      generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
    });
    const data = (await res.json()) as GeminiGenerateResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini API : reponse vide (filtree ou candidat manquant)");
    }
    return text;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const res = await fetch(`${API_BASE}/models?pageSize=1`, { headers: this.headers() });
      return res.ok;
    } catch {
      return false;
    }
  }
}
