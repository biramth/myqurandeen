import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { EmbeddingService } from "./embedding.service";
import { RagService } from "./rag.service";
import { OllamaProvider } from "./ollama.provider";

@Module({
  controllers: [AiController],
  providers: [
    { provide: "AI_PROVIDER", useClass: OllamaProvider },
    EmbeddingService,
    RagService,
  ],
  exports: [EmbeddingService, RagService],
})
export class AiModule {}
