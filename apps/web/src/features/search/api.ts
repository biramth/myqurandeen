import { apiClient } from "@/lib/api-client";
import type { SearchResults } from "./types";

export const searchApi = {
  search: (query: string) => apiClient.get<SearchResults>(`/search?q=${encodeURIComponent(query)}`, { skipAuth: true }),
};
