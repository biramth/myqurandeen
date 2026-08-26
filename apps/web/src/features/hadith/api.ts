import { apiClient } from "@/lib/api-client";
import type {
  HadithBookPage,
  HadithBookTranslationRow,
  HadithCollection,
  HadithCollectionDetail,
  HadithDetail,
  HadithTranslationEdition,
} from "./types";

export const hadithApi = {
  listCollections: () => apiClient.get<HadithCollection[]>("/hadith/collections", { skipAuth: true }),
  getCollection: (slug: string) =>
    apiClient.get<HadithCollectionDetail>(`/hadith/collections/${slug}`, { skipAuth: true }),
  getBookHadiths: (slug: string, bookNumber: number, page = 1) =>
    apiClient.get<HadithBookPage>(`/hadith/collections/${slug}/books/${bookNumber}?page=${page}`, {
      skipAuth: true,
    }),
  getHadith: (slug: string, number: string) =>
    apiClient.get<HadithDetail>(`/hadith/collections/${slug}/hadiths/${number}`, { skipAuth: true }),
  listTranslations: (slug: string) =>
    apiClient.get<HadithTranslationEdition[]>(`/hadith/collections/${slug}/translations`, { skipAuth: true }),
  getBookTranslation: (slug: string, bookNumber: number, translationId: string) =>
    apiClient.get<HadithBookTranslationRow[]>(
      `/hadith/collections/${slug}/books/${bookNumber}/translations/${translationId}`,
      { skipAuth: true },
    ),
};
