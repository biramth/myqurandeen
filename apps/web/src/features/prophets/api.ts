import { apiClient } from "@/lib/api-client";
import type { ProphetDetail, ProphetSummary } from "./types";

export const prophetsApi = {
  listProphets: () => apiClient.get<ProphetSummary[]>("/prophets", { skipAuth: true }),
  getProphet: (slug: string) => apiClient.get<ProphetDetail>(`/prophets/${slug}`, { skipAuth: true }),
};
