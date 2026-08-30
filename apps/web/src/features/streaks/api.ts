import { apiClient } from "@/lib/api-client";
import { getLocalDateString } from "@/lib/local-date";
import type { StreakStatus } from "./types";

export const streaksApi = {
  me: () => apiClient.get<StreakStatus>(`/streaks/me?localDate=${getLocalDateString()}`),
  ping: () => apiClient.post<StreakStatus>("/streaks/ping", { localDate: getLocalDateString() }),
};
