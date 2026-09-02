import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { offlineDb } from "@/database/offline-db";
import { quranApi } from "@/features/quran/api";

export type DownloadStage = "idle" | "quran" | "translations" | "done" | "error";

export interface UseOfflineDownloadResult {
  isQuranDownloaded: boolean;
  started: boolean;
  stage: DownloadStage;
  quranLoaded: boolean;
  progress: number;
  error: string | null;
  download: (translationIds?: string[]) => Promise<void>;
  remove: () => Promise<void>;
}

export function useOfflineDownload(): UseOfflineDownloadResult {
  const queryClient = useQueryClient();
  const [isQuranDownloaded, setIsQuranDownloaded] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const [stage, setStage] = React.useState<DownloadStage>("idle");
  const [quranLoaded, setQuranLoaded] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    offlineDb.isQuranDownloaded().then(setIsQuranDownloaded).catch(() => undefined);
  }, []);

  const download = async (translationIds: string[] = []) => {
    setStarted(true);
    setError(null);
    setProgress(0);
    try {
      // 1. Texte coranique (surates + versets)
      setStage("quran");
      const bulk = await quranApi.exportBulk();

      const surahRows = bulk.surahs.map((s) => ({
        id: s.id,
        number: s.number,
        nameArabic: s.nameArabic,
        nameTransliterated: s.nameTransliterated,
        nameTranslated: s.nameTranslated,
        versesCount: s.versesCount,
        revelationPlace: s.revelationPlace,
        generalInfo: s.generalInfo,
        themes: s.themes,
      }));
      const verseRows = bulk.verses.map((v) => ({
        id: `${v.surahNumber}:${v.numberInSurah}`,
        surahNumber: v.surahNumber,
        numberInSurah: v.numberInSurah,
        textArabic: v.textArabic,
        textTransliterated: v.textTransliterated,
      }));

      const quranStart = performance.now();
      await offlineDb.transaction("rw", offlineDb.surahs, offlineDb.verses, async () => {
        await offlineDb.surahs.bulkPut(surahRows);
        await offlineDb.verses.bulkPut(verseRows);
      });
      const quranMs = performance.now() - quranStart;
      void quranMs;

      setQuranLoaded(true);
      setStage("translations");

      // 2. Traductions selectionnees
      if (translationIds.length > 0) {
        await offlineDb.translations.clear();
        const translationInserts: Array<{
          id: string;
          surahNumber: number;
          numberInSurah: number;
          translationId: string;
          text: string;
        }> = [];
        for (let i = 0; i < translationIds.length; i++) {
          const translationId = translationIds[i];
          const res = await quranApi.exportTranslation(translationId);
          for (const row of res.items) {
            translationInserts.push({
              id: `${translationId}:${row.surahNumber}:${row.numberInSurah}`,
              surahNumber: row.surahNumber,
              numberInSurah: row.numberInSurah,
              translationId,
              text: row.text,
            });
          }
          setProgress(Math.round(((i + 1) / translationIds.length) * 100));
        }
        setProgress(90);
        await offlineDb.translations.bulkPut(translationInserts);
      } else {
        await offlineDb.translations.clear();
      }

      await offlineDb.setQuranVersion("1");
      setProgress(100);
      setStage("done");
      setIsQuranDownloaded(true);
      queryClient.invalidateQueries({ queryKey: ["offline"] });
    } catch {
      setStage("error");
      setError("offline.downloadError");
      setStarted(false);
    }
  };

  const remove = async () => {
    await offlineDb.clearQuran();
    setIsQuranDownloaded(false);
    setQuranLoaded(false);
    setStage("idle");
    setStarted(false);
    setProgress(0);
    queryClient.invalidateQueries({ queryKey: ["offline"] });
  };

  return { isQuranDownloaded, started, stage, quranLoaded, progress, error, download, remove };
}
