import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Check, Download, Pause, Play, SkipBack, SkipForward, Trash2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { quranApi } from "@/features/quran/api";
import { offlineDb } from "@/database/offline-db";
import { useOffline } from "@/features/offline/OfflineContext";
import { useOfflineAudioDownload } from "@/features/quran/useOfflineAudioDownload";
import { cn } from "@/lib/utils";

const RECITER_STORAGE_KEY = "qurandeen:reciter-slug";

function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const minutes = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function loadStoredReciter(): string | null {
  try {
    return localStorage.getItem(RECITER_STORAGE_KEY);
  } catch {
    return null;
  }
}

interface AudioRecitationProps {
  surahNumber: number;
  verseNumber: number;
  totalVerses?: number;
  onNavigate?: (verseNumber: number) => void;
  autoPlaySignal?: number;
  className?: string;
}

/**
 * Lecteur de recitation audio pour un verset. Mode "verset seul"
 * (VersePage) si `onNavigate` est absent ; mode "continu" (SurahDetailPage)
 * sinon : boutons precedent/suivant et enchainement automatique a la fin du
 * verset. Controles natifs `<audio>` caches, boutons clavier/lecteur
 * d'ecran, recitateur persisté dans localStorage.
 */
export function AudioRecitation({
  surahNumber,
  verseNumber,
  totalVerses,
  onNavigate,
  autoPlaySignal = 0,
  className,
}: AudioRecitationProps) {
  const { t } = useTranslation();
  const { offline } = useOffline();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const shouldPlayRef = React.useRef(false);
  const [reciterSlug, setReciterSlug] = React.useState<string | null>(loadStoredReciter);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quran", "audio", surahNumber, verseNumber],
    queryFn: () => quranApi.getVerseAudio(surahNumber, verseNumber),
    enabled: !offline,
  });

  const items = React.useMemo(() => data?.items ?? [], [data]);
  const active = items.find((item) => item.slug === reciterSlug) ?? items[0];

  // Hors-ligne : la liste des recitateurs n'est pas connue (pas de reseau),
  // on lit directement la piste stockee pour le recitateur deja choisi
  // (localStorage) - voir useOfflineAudioDownload.ts pour le telechargement.
  const [offlineTrack, setOfflineTrack] = React.useState<{ url: string; reciterName: string } | null>(null);
  React.useEffect(() => {
    if (!offline || !reciterSlug) {
      setOfflineTrack(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    offlineDb.getAudioTrack(reciterSlug, surahNumber, verseNumber).then((track) => {
      if (cancelled) return;
      if (track) {
        objectUrl = URL.createObjectURL(track.blob);
        setOfflineTrack({ url: objectUrl, reciterName: track.reciterName });
      } else {
        setOfflineTrack(null);
      }
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [offline, reciterSlug, surahNumber, verseNumber]);

  const activeUrl = offline ? offlineTrack?.url ?? null : active?.url ?? null;
  const activeReciterName = offline ? offlineTrack?.reciterName : active?.nameTransliterated;

  const audioDownload = useOfflineAudioDownload(surahNumber, totalVerses ?? 0, reciterSlug, active?.nameTransliterated);

  React.useEffect(() => {
    if (items.length === 0) return;
    if (!reciterSlug || !items.some((item) => item.slug === reciterSlug)) {
      const first = items[0];
      setReciterSlug(first.slug);
      try {
        localStorage.setItem(RECITER_STORAGE_KEY, first.slug);
      } catch {
        // Stockage indisponible - le choix reste actif pour cette session.
      }
    }
  }, [items, reciterSlug]);

  React.useEffect(() => {
    if (autoPlaySignal > 0) shouldPlayRef.current = true;
  }, [autoPlaySignal]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeUrl) return;
    audio.src = activeUrl;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    if (shouldPlayRef.current) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        shouldPlayRef.current = false;
      });
    }
  }, [activeUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      shouldPlayRef.current = true;
      audio.play().then(() => setIsPlaying(true)).catch(() => undefined);
    } else {
      audio.pause();
    }
  };

  const selectReciter = (slug: string) => {
    setReciterSlug(slug);
    try {
      localStorage.setItem(RECITER_STORAGE_KEY, slug);
    } catch {
      // Stockage indisponible.
    }
  };

  const navigateTo = (next: number) => {
    if (!onNavigate || next < 1) return;
    if (totalVerses !== undefined && next > totalVerses) return;
    onNavigate(next);
  };

  if (!offline) {
    if (isError) {
      return <p className="text-sm text-destructive">{t("quran.audioError")}</p>;
    }
    if (isLoading) {
      return <Skeleton className="h-12 w-full" />;
    }
    if (items.length === 0) {
      return <p className="text-sm text-muted-foreground">{t("quran.audioEmpty")}</p>;
    }
  }

  if (offline && !offlineTrack) {
    return <p className="text-sm text-muted-foreground">{t("quran.audioOfflineUnavailable")}</p>;
  }

  const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(event.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => navigateTo(verseNumber + 1)}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">{activeReciterName}</p>
        {!offline && active && (
          <Select value={active.slug} onValueChange={selectReciter}>
            <SelectTrigger className="h-8 w-auto gap-1.5 border-none px-2 text-xs shadow-none hover:bg-accent" aria-label={t("quran.audioReciter")}>
              <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            </SelectTrigger>
            <SelectContent align="end">
              {items.map((item) => (
                <SelectItem key={item.id} value={item.slug}>
                  {item.nameTransliterated}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="mt-2">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={seek}
          disabled={duration === 0}
          aria-label={t("quran.audioSeek")}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary disabled:cursor-default"
        />
        <div className="mt-1 flex justify-between text-xs tabular-nums text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="mt-1 flex items-center justify-center gap-4">
        {onNavigate && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("quran.audioPrevious")}
            title={t("quran.audioPrevious")}
            disabled={verseNumber <= 1}
            onClick={() => navigateTo(verseNumber - 1)}
          >
            <SkipBack className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}

        <Button
          type="button"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={togglePlay}
          aria-label={isPlaying ? t("quran.audioPause") : t("quran.audioListen")}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
          )}
        </Button>

        {onNavigate && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("quran.audioNext")}
            title={t("quran.audioNext")}
            disabled={totalVerses !== undefined && verseNumber >= totalVerses}
            onClick={() => navigateTo(verseNumber + 1)}
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {onNavigate && !offline && active && (
        <div className="mt-3 border-t pt-3">
          {audioDownload.downloaded ? (
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" aria-hidden="true" />
                {t("quran.audioDownloadedOffline")}
              </span>
              <Button type="button" variant="outline" size="sm" onClick={() => void audioDownload.remove()}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {t("offline.remove")}
              </Button>
            </div>
          ) : audioDownload.stage === "downloading" ? (
            <p className="text-center text-sm text-muted-foreground">
              {t("quran.audioDownloadingOffline", { progress: audioDownload.progress })}
            </p>
          ) : (
            <Button type="button" size="sm" className="w-full" onClick={() => void audioDownload.download()}>
              <Download className="h-4 w-4" aria-hidden="true" />
              {t("quran.audioDownloadOffline")}
            </Button>
          )}
          {audioDownload.error && <p className="mt-1.5 text-center text-xs text-destructive">{t(audioDownload.error)}</p>}
        </div>
      )}
    </div>
  );
}