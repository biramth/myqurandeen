import { apiClient } from "@/lib/api-client";
import type { BookCategory, LibraryBookDetail, LibraryBookSummary } from "./types";

export const libraryApi = {
  listCategories: () => apiClient.get<BookCategory[]>("/library/categories", { skipAuth: true }),
  listBooks: () => apiClient.get<LibraryBookSummary[]>("/library/books", { skipAuth: true }),
  getBook: (slug: string) => apiClient.get<LibraryBookDetail>(`/library/books/${slug}`, { skipAuth: true }),
};
