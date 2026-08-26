import { apiClient } from "@/lib/api-client";
import type { FiqhTopicComparison, FiqhTopicSummary, School } from "./types";

export const schoolsApi = {
  listSchools: () => apiClient.get<School[]>("/schools", { skipAuth: true }),
  getSchool: (slug: string) => apiClient.get<School>(`/schools/${slug}`, { skipAuth: true }),
  listFiqhTopics: () => apiClient.get<FiqhTopicSummary[]>("/schools/fiqh-topics", { skipAuth: true }),
  getFiqhTopicComparison: (slug: string) =>
    apiClient.get<FiqhTopicComparison>(`/schools/fiqh-topics/${slug}`, { skipAuth: true }),
};
