export type AiContentType =
  | "verse"
  | "hadith"
  | "tafsir"
  | "concept"
  | "scholar"
  | "prophet"
  | "event"
  | "school"
  | "fiqh_position";

export interface AiSource {
  contentType: AiContentType;
  contextText: string | null;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface AiQueryResult {
  answer: string;
  sources: AiSource[];
}

export interface AiHealth {
  ollama: boolean;
  embeddingsIndexed: number;
  ready: boolean;
}

export interface AiStats {
  totalChunks: number;
  byType: Partial<Record<AiContentType, number>>;
}
