import { offlineDb, type OfflineSurah, type OfflineVerse } from "@/database/offline-db";
import type { SurahDetail, VerseSummary } from "./types";

export type OfflineSurahDetail = SurahDetail;

export async function getOfflineSurahs(): Promise<OfflineSurah[]> {
  return offlineDb.surahs.orderBy("number").toArray();
}

export async function getOfflineSurahDetail(number: number): Promise<OfflineSurahDetail | null> {
  const surah = await offlineDb.surahs.get(number);
  if (!surah) return null;
  const verses = await offlineDb.verses
    .where("surahNumber")
    .equals(number)
    .sortBy("numberInSurah");
  const verseSummaries: VerseSummary[] = verses.map((v) => ({
    id: v.id,
    numberInSurah: v.numberInSurah,
    textArabic: v.textArabic,
    textTransliterated: v.textTransliterated,
  }));
  return { ...surah, verses: verseSummaries };
}

export async function getOfflineVerse(surahNumber: number, verseNumber: number): Promise<OfflineVerse | null> {
  const verse = await offlineDb.verses.get({ surahNumber, numberInSurah: verseNumber });
  return verse ?? null;
}

export async function isOfflineQuranReady(): Promise<boolean> {
  return offlineDb.isQuranDownloaded();
}

export async function getOfflineSurahTranslation(
  surahNumber: number,
  translationId: string,
): Promise<Array<{ numberInSurah: number; text: string }>> {
  const rows = await offlineDb.translations
    .where("surahNumber")
    .equals(surahNumber)
    .filter((row) => row.translationId === translationId)
    .sortBy("numberInSurah");
  return rows.map((row) => ({ numberInSurah: row.numberInSurah, text: row.text }));
}

export async function getOfflineDownloadedTranslationIds(): Promise<string[]> {
  const rows = await offlineDb.translations.orderBy("translationId").toArray();
  return Array.from(new Set(rows.map((row) => row.translationId)));
}
