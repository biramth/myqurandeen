import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiController } from "./ai.controller";
import { EmbeddingService } from "./embedding.service";
import { RagService } from "./rag.service";
import { OllamaProvider } from "./ollama.provider";
import { GeminiProvider } from "./gemini.provider";

@Module({
  controllers: [AiController],
  providers: [
    OllamaProvider,
    GeminiProvider,
    {
      provide: "AI_PROVIDER",
      useFactory: (config: ConfigService, ollama: OllamaProvider, gemini: GeminiProvider) =>
        config.get<string>("AI_BACKEND", "gemini") === "ollama" ? ollama : gemini,
      inject: [ConfigService, OllamaProvider, GeminiProvider],
    },
    EmbeddingService,
    RagService,
  ],
  exports: [EmbeddingService, RagService],
})
export class AiModule {}
