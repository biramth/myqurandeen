import { apiClient } from "@/lib/api-client";
import type { ExportBulkResponse, ExportTranslationResponse, Reciter, Surah, SurahDetail, SurahTranslationRow, TranslationEdition, VerseAudioResponse, VerseDetail } from "./types";

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
  listReciters: () => apiClient.get<Reciter[]>("/quran/reciters", { skipAuth: true }),
  getVerseAudio: (surahNumber: number, verseNumber: number) =>
    apiClient.get<VerseAudioResponse>(`/quran/surahs/${surahNumber}/verses/${verseNumber}/audio`, { skipAuth: true }),
  exportBulk: () => apiClient.get<ExportBulkResponse>("/quran/export", { skipAuth: true }),
  exportTranslation: (translationId: string) =>
    apiClient.get<ExportTranslationResponse>(`/quran/export/translations/${translationId}`, { skipAuth: true }),
};
