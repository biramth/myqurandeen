import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { quranApi } from "@/features/quran/api";
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
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const shouldPlayRef = React.useRef(false);
  const [reciterSlug, setReciterSlug] = React.useState<string | null>(loadStoredReciter);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quran", "audio", surahNumber, verseNumber],
    queryFn: () => quranApi.getVerseAudio(surahNumber, verseNumber),
  });

  const items = React.useMemo(() => data?.items ?? [], [data]);
  const active = items.find((item) => item.slug === reciterSlug) ?? items[0];
  const activeUrl = active?.url ?? null;

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

  if (isError) {
    return <p className="text-sm text-destructive">{t("quran.audioError")}</p>;
  }

  if (isLoading) {
    return <Skeleton className="h-12 w-full" />;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("quran.audioEmpty")}</p>;
  }

  return (
    <div className={cn("rounded-lg border bg-card p-3", className)}>
      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onEnded={() => navigateTo(verseNumber + 1)}
      />
      <div className="flex flex-wrap items-center gap-2">
        {onNavigate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t("quran.audioPrevious")}
            title={t("quran.audioPrevious")}
            disabled={verseNumber <= 1}
            onClick={() => navigateTo(verseNumber - 1)}
          >
            <SkipBack className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}

        <Button type="button" variant="outline" onClick={togglePlay} aria-label={isPlaying ? t("quran.audioPause") : t("quran.audioListen")}>
          {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          {isPlaying ? t("quran.audioPause") : t("quran.audioListen")}
        </Button>

        {onNavigate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t("quran.audioNext")}
            title={t("quran.audioNext")}
            disabled={totalVerses !== undefined && verseNumber >= totalVerses}
            onClick={() => navigateTo(verseNumber + 1)}
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {duration > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          )}
          <Select value={active.slug} onValueChange={selectReciter}>
            <SelectTrigger className="h-9 w-44 text-xs sm:w-52 sm:text-sm" aria-label={t("quran.audioReciter")}>
              <Volume2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((item) => (
                <SelectItem key={item.id} value={item.slug}>
                  {item.nameTransliterated}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}