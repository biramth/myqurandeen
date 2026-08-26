import { apiClient } from "@/lib/api-client";
import type { ScholarDetail, ScholarSummary } from "./types";

export const scholarsApi = {
  listScholars: () => apiClient.get<ScholarSummary[]>("/scholars", { skipAuth: true }),
  getScholar: (slug: string) => apiClient.get<ScholarDetail>(`/scholars/${slug}`, { skipAuth: true }),
};
