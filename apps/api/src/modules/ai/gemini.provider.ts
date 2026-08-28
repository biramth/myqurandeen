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
const MAX_RETRY_ATTEMPTS = 6;
// Palier gratuit observe : 100 requetes/min sur embed_content (429 sinon).
// On espace donc proactivement les appels au lieu de foncer et de retomber
// systematiquement sur des 429 pendant une indexation en masse.
const MIN_REQUEST_GAP_MS = 700;

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
    this.llmModel = config.get<string>("GEMINI_LLM_MODEL", "gemini-3.6-flash");
    this.embeddingModel = config.get<string>("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001");
    this.embeddingDim = config.get<number>("AI_EMBEDDING_DIM", 768);

    if (!this.apiKey) {
      this.logger.warn(
        "GEMINI_API_KEY manquant : le provider Gemini repondra en echec tant que la cle n'est pas definie (voir .env.example).",
      );
    }
    this.logger.log(`Gemini provider initialise (LLM: ${this.llmModel}, Embeddings: ${this.embeddingModel})`);
  }

  private lastRequestAt = 0;

  private headers(): Record<string, string> {
    return { "Content-Type": "application/json", "x-goog-api-key": this.apiKey };
  }

  /** Extrait le delai suggere par l'API dans le corps d'une erreur 429 (champ RetryInfo.retryDelay, ex. "58s"). */
  private parseRetryDelayMs(errorBody: string): number | null {
    try {
      const parsed = JSON.parse(errorBody) as {
        error?: { details?: { ["@type"]?: string; retryDelay?: string }[] };
      };
      const retryInfo = parsed.error?.details?.find((d) => d["@type"]?.includes("RetryInfo"));
      const match = retryInfo?.retryDelay?.match(/^(\d+(?:\.\d+)?)s$/);
      return match ? Math.ceil(parseFloat(match[1]) * 1000) : null;
    } catch {
      return null;
    }
  }

  /**
   * Espace proactivement les appels (MIN_REQUEST_GAP_MS) et retente sur 429
   * (quota) / 5xx, en respectant le delai que l'API elle-meme indique dans
   * sa reponse quand il est present plutot qu'un backoff devine.
   */
  private async postWithRetry(url: string, body: unknown): Promise<Response> {
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
      const wait = MIN_REQUEST_GAP_MS - (Date.now() - this.lastRequestAt);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      this.lastRequestAt = Date.now();

      const res = await fetch(url, { method: "POST", headers: this.headers(), body: JSON.stringify(body) });
      if (res.ok) return res;

      const text = await res.text();
      if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRY_ATTEMPTS - 1) {
        const delayMs = this.parseRetryDelayMs(text) ?? 1000 * 2 ** attempt;
        this.logger.warn(`Gemini API ${res.status}, nouvelle tentative dans ${delayMs}ms (${attempt + 1}/${MAX_RETRY_ATTEMPTS})`);
        lastError = new Error(`Gemini API ${res.status}: ${text}`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw new Error(`Gemini API ${res.status}: ${text}`);
    }
    throw lastError instanceof Error ? lastError : new Error("Gemini API : echec apres plusieurs tentatives");
  }

  // NB : `taskType` et `outputDimensionality` doivent etre des champs de
  // premier niveau de la requete (verifie empiriquement contre l'API reelle
  // le 2026-08-28) - les nicher sous `embedContentConfig` comme suggere par
  // certaines pages de doc fait que l'API IGNORE silencieusement
  // outputDimensionality et renvoie le vecteur complet (3072 dims au lieu
  // des 768 demandes), ce qui cassait toute comparaison de similarite avec
  // les embeddings deja stockes (tailles differentes -> NaN).

  async embed(text: string): Promise<number[]> {
    const res = await this.postWithRetry(`${API_BASE}/models/${this.embeddingModel}:embedContent`, {
      content: { parts: [{ text }] },
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: this.embeddingDim,
    });
    const data = (await res.json()) as GeminiEmbedResponse;
    return data.embedding.values;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const res = await this.postWithRetry(`${API_BASE}/models/${this.embeddingModel}:batchEmbedContents`, {
      requests: texts.map((text) => ({
        model: `models/${this.embeddingModel}`,
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: this.embeddingDim,
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
      //
      // Pas de thinkingConfig ici : gemini-3.6-flash refuse (400) toute
      // tentative de desactiver le raisonnement (thinkingBudget), a la
      // difference de generations precedentes. Le modele consomme donc
      // toujours une part du budget de tokens en raisonnement invisible
      // (~100-200 tokens observes meme sur un prompt trivial) avant de
      // produire la reponse visible - d'ou une marge confortable ici pour
      // ne pas tronquer la reponse elle-meme.
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
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
