import { apiClient } from "@/lib/api-client";
import type { DailyContent } from "./types";

export const dailyApi = {
  get: () => apiClient.get<DailyContent>("/daily"),
};
