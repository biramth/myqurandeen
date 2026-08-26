import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AiProvider } from "./ai-provider.interface";

interface OllamaEmbedResponse {
  embeddings: number[][];
}

interface OllamaGenerateResponse {
  response: string;
}

@Injectable()
export class OllamaProvider implements AiProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly baseUrl: string;
  private readonly llmModel: string;
  private readonly embeddingModel: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>("OLLAMA_URL", "http://localhost:11434");
    this.llmModel = this.config.get<string>("OLLAMA_LLM_MODEL", "qwen2.5:3b");
    this.embeddingModel = this.config.get<string>("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text");
    this.logger.log(`Ollama provider initialise : ${this.baseUrl} (LLM: ${this.llmModel}, Embeddings: ${this.embeddingModel})`);
  }

  async embed(text: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.embeddingModel, input: text }),
    });

    if (!res.ok) {
      throw new Error(`Ollama embed error: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as OllamaEmbedResponse;
    return data.embeddings[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const res = await fetch(`${this.baseUrl}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.embeddingModel, input: texts }),
    });

    if (!res.ok) {
      throw new Error(`Ollama embedBatch error: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as OllamaEmbedResponse;
    return data.embeddings;
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.llmModel,
        system: systemPrompt,
        prompt,
        stream: false,
        options: { num_predict: 512, temperature: 0.7 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama generate error: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as OllamaGenerateResponse;
    return data.response;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
