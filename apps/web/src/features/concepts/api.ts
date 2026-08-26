import { apiClient } from "@/lib/api-client";
import type { ConceptDetail, ConceptSummary } from "./types";

export const conceptsApi = {
  listConcepts: () => apiClient.get<ConceptSummary[]>("/concepts", { skipAuth: true }),
  getConcept: (slug: string) => apiClient.get<ConceptDetail>(`/concepts/${slug}`, { skipAuth: true }),
};
