import { apiClient } from "@/lib/api-client";
import type { HistoricalEventDetail, HistoricalPeriod, HistoricalPeriodDetail } from "./types";

export const historyApi = {
  listPeriods: () => apiClient.get<HistoricalPeriod[]>("/history/periods", { skipAuth: true }),
  getPeriod: (slug: string) => apiClient.get<HistoricalPeriodDetail>(`/history/periods/${slug}`, { skipAuth: true }),
  getEvent: (slug: string) => apiClient.get<HistoricalEventDetail>(`/history/events/${slug}`, { skipAuth: true }),
};
