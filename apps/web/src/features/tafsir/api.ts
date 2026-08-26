import { apiClient } from "@/lib/api-client";
import type { SurahTafsirRow, TafsirWork, VerseTafsir } from "./types";

export const tafsirApi = {
  listWorks: () => apiClient.get<TafsirWork[]>("/tafsir/works", { skipAuth: true }),
  getVerseTafsirs: (surahNumber: number, verseNumber: number) =>
    apiClient.get<VerseTafsir[]>(`/tafsir/verse/${surahNumber}/${verseNumber}`, { skipAuth: true }),
  getSurahTafsir: (surahNumber: number, tafsirSourceId: string) =>
    apiClient.get<SurahTafsirRow[]>(`/tafsir/surahs/${surahNumber}/${tafsirSourceId}`, { skipAuth: true }),
};
