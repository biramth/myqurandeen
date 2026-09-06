import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { offlineDb } from "@/database/offline-db";
import { API_BASE } from "@/lib/api-client";
import { quranApi } from "./api";

export type AudioDownloadStage = "idle" | "downloading" | "done" | "error";

export interface UseOfflineAudioDownloadResult {
  downloaded: boolean;
  stage: AudioDownloadStage;
  progress: number;
  error: string | null;
  download: () => Promise<void>;
  remove: () => Promise<void>;
}

/**
 * Telechargement hors-ligne de l'audio d'une sourate entiere, pour un
 * recitateur donne (phase 5, point "telechargement hors-ligne de l'audio" -
 * volontairement separe du cache texte de 3.2, l'audio etant nettement plus
 * lourd). Un seul appel reseau pour les metadonnees (`getSurahAudio`), puis
 * un fetch par verset dont le resultat (Blob) est stocke dans IndexedDB via
 * `offlineDb.audioTracks`.
 */
export function useOfflineAudioDownload(
  surahNumber: number,
  versesCount: number,
  reciterSlug: string | null,
  reciterName: string | undefined,
): UseOfflineAudioDownloadResult {
  const queryClient = useQueryClient();
  const [downloaded, setDownloaded] = React.useState(false);
  const [stage, setStage] = React.useState<AudioDownloadStage>("idle");
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(() => {
    if (!reciterSlug) {
      setDownloaded(false);
      return;
    }
    offlineDb
      .isSurahAudioDownloaded(reciterSlug, surahNumber, versesCount)
      .then(setDownloaded)
      .catch(() => setDownloaded(false));
  }, [reciterSlug, surahNumber, versesCount]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const download = async () => {
    if (!reciterSlug) return;
    setStage("downloading");
    setProgress(0);
    setError(null);
    try {
      const meta = await quranApi.getSurahAudio(surahNumber, reciterSlug);
      const items = meta.items;
      if (items.length === 0) throw new Error("empty");
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // Passe par le proxy API (meme origine) - le CDN audio n'envoie pas
        // d'en-tete CORS, un fetch direct vers son URL echoue depuis le
        // navigateur (voir QuranAudioProxyController cote API).
        const response = await fetch(`${API_BASE}${item.downloadUrl}`, { credentials: "include" });
        if (!response.ok) throw new Error("fetch-failed");
        const blob = await response.blob();
        await offlineDb.putAudioTrack({
          id: `${reciterSlug}:${surahNumber}:${item.numberInSurah}`,
          reciterSlug,
          reciterName: reciterName ?? reciterSlug,
          surahNumber,
          numberInSurah: item.numberInSurah,
          durationSec: item.durationSec,
          blob,
        });
        setProgress(Math.round(((i + 1) / items.length) * 100));
      }
      setStage("done");
      setDownloaded(true);
      queryClient.invalidateQueries({ queryKey: ["offline", "audio"] });
    } catch {
      setStage("error");
      setError("quran.audioOfflineDownloadError");
    }
  };

  const remove = async () => {
    if (!reciterSlug) return;
    await offlineDb.removeSurahAudio(reciterSlug, surahNumber);
    setDownloaded(false);
    setStage("idle");
    setProgress(0);
    queryClient.invalidateQueries({ queryKey: ["offline", "audio"] });
  };

  return { downloaded, stage, progress, error, download, remove };
}
