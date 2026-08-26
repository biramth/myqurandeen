import { apiClient } from "@/lib/api-client";
import type { Surah, SurahDetail, SurahTranslationRow, TranslationEdition, VerseDetail } from "./types";

export const quranApi = {
  listSurahs: () => apiClient.get<Surah[]>("/quran/surahs", { skipAuth: true }),
  getSurah: (number: number) => apiClient.get<SurahDetail>(`/quran/surahs/${number}`, { skipAuth: true }),
  getVerse: (surahNumber: number, verseNumber: number) =>
    apiClient.get<VerseDetail>(`/quran/surahs/${surahNumber}/verses/${verseNumber}`, { skipAuth: true }),
  getSurahTranslation: (surahNumber: number, translationId: string) =>
    apiClient.get<SurahTranslationRow[]>(`/quran/surahs/${surahNumber}/translations/${translationId}`, {
      skipAuth: true,
    }),
  listTranslations: () => apiClient.get<TranslationEdition[]>("/quran/translations", { skipAuth: true }),
};
