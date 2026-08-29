import { apiClient } from "@/lib/api-client";
import type { DuaCategory, DuaCategoryDetail } from "./types";

export const duasApi = {
  listCategories: () => apiClient.get<DuaCategory[]>("/duas/categories", { skipAuth: true }),
  getCategory: (slug: string) => apiClient.get<DuaCategoryDetail>(`/duas/categories/${slug}`, { skipAuth: true }),
};
