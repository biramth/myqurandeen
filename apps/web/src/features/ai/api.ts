import { apiClient } from "@/lib/api-client";
import type { AiContentType, AiHealth, AiQueryResult, AiStats } from "./types";

export const aiApi = {
  health: () => apiClient.get<AiHealth>("/ai/health", { skipAuth: true }),
  stats: () => apiClient.get<AiStats>("/ai/stats", { skipAuth: true }),
  query: (question: string) => apiClient.post<AiQueryResult>("/ai/query", { question }),
  indexAll: () => apiClient.post<{ total: number }>("/ai/index"),
  indexType: (type: AiContentType) => apiClient.post<{ count: number }>(`/ai/index/${type}`),
};
