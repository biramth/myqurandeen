import { apiClient } from "@/lib/api-client";

export interface FiqhSuggestion {
  id: string;
  question: string;
  context: string | null;
  status: "NOUVELLE" | "EN_COURS" | "TRAITEE";
  createdAt: string;
}

export const fiqhSuggestionsApi = {
  create: (question: string, context?: string) =>
    apiClient.post<FiqhSuggestion>("/fiqh/suggestions", { question, context: context || undefined }),
};
