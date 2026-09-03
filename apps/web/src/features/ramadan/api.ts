import { apiClient } from "@/lib/api-client";
import type { KhatmProgress, UpsertKhatmProgressInput } from "./types";

export const ramadanApi = {
  getKhatmProgress: () => apiClient.get<KhatmProgress | null>("/ramadan/khatm"),
  upsertKhatmProgress: (input: UpsertKhatmProgressInput) => apiClient.put<KhatmProgress>("/ramadan/khatm", input),
  deleteKhatmProgress: () => apiClient.delete<{ deleted: boolean }>("/ramadan/khatm"),
};
