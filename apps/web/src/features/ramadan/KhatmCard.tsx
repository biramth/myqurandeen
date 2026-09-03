import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpenCheck, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButton } from "@/components/shared/ShareButton";
import { StatShareCard } from "@/components/shared/StatShareCard";
import { SITE_URL, withShareUtm } from "@/components/shared/PageMeta";
import { quranApi } from "@/features/quran/api";
import { ramadanApi } from "./api";
import { daysRemainingInRamadan, TOTAL_QURAN_VERSES } from "./hijri-calendar";
import type { RamadanModeState } from "./useRamadanMode";

interface KhatmCardProps {
  ramadan: RamadanModeState;
}

/**
 * Suivi de khatm (lecture complete du Coran sur le Ramadan, ROADMAP.md phase
 * 4). L'objectif quotidien (versets restants / jours restants) est calcule
 * ici, cote client - le serveur ne fait que stocker la position marquee
 * (meme geste que "reprendre ou j'en etais", 1.2).
 */
export function KhatmCard({ ramadan }: KhatmCardProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [surahNumber, setSurahNumber] = React.useState("");
  const [verseNumber, setVerseNumber] = React.useState("");

  const { data: progress, isLoading } = useQuery({
    queryKey: ["ramadan", "khatm"],
    queryFn: ramadanApi.getKhatmProgress,
  });
  const { data: surahs } = useQuery({ queryKey: ["quran", "surahs"], queryFn: quranApi.listSurahs });

  const isCurrentCycle = progress != null && progress.hijriYear === ramadan.hijriYear;
  const versesCompleted = isCurrentCycle ? progress.versesCompleted : 0;
  const isCompleted = isCurrentCycle && progress.completedAt != null;

  const daysLeft = daysRemainingInRamadan() ?? 1;
  const versesRemaining = Math.max(0, TOTAL_QURAN_VERSES - versesCompleted);
  const dailyTarget = Math.ceil(versesRemaining / daysLeft);
  const percent = Math.min(100, Math.round((versesCompleted / TOTAL_QURAN_VERSES) * 100));

  const upsertMutation = useMutation({
    mutationFn: () => ramadanApi.upsertKhatmProgress({ surahNumber: Number(surahNumber), verseNumber: Number(verseNumber) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ramadan", "khatm"] });
      toast.success(t("ramadan.khatmUpdated"));
      setSurahNumber("");
      setVerseNumber("");
    },
    onError: () => toast.error(t("ramadan.khatmError")),
  });

  const selectedSurah = surahs?.find((s) => String(s.number) === surahNumber);

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div className="flex items-center gap-2">
          <BookOpenCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <p className="font-medium">{t("ramadan.khatmTitle")}</p>
        </div>

        {isCompleted ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <PartyPopper className="h-10 w-10 text-amber-400" aria-hidden="true" />
            <p className="font-medium">{t("ramadan.khatmCompleted")}</p>
            <ShareButton
              content={{ title: t("ramadan.khatmShareTitle"), url: withShareUtm(SITE_URL, "khatm") }}
              renderCard={(ref) => (
                <StatShareCard
                  ref={ref}
                  icon={PartyPopper}
                  headline={t("ramadan.khatmShareTitle")}
                  description={t("ramadan.khatmShareDescription", { year: progress?.hijriYear })}
                />
              )}
            />
          </div>
        ) : (
          <>
            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t("ramadan.khatmProgress", { completed: versesCompleted, total: TOTAL_QURAN_VERSES, percent })}
              </p>
            </div>

            {ramadan.active && (
              <p className="rounded-md bg-accent/40 px-3 py-2 text-sm">
                {t("ramadan.khatmDailyTarget", { count: dailyTarget })}
              </p>
            )}

            {isCurrentCycle && (
              <p className="text-xs text-muted-foreground">
                {t("ramadan.khatmCurrentPosition", {
                  surah: progress.lastSurahNumber,
                  verse: progress.lastVerseNumber,
                })}
              </p>
            )}

            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[10rem] flex-1">
                <Select value={surahNumber || undefined} onValueChange={(v) => { setSurahNumber(v); setVerseNumber(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("ramadan.khatmSurahPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {surahs?.map((s) => (
                      <SelectItem key={s.id} value={String(s.number)}>
                        {s.number}. {s.nameTransliterated}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min={1}
                max={selectedSurah?.versesCount ?? 286}
                placeholder={t("ramadan.khatmVersePlaceholder")}
                value={verseNumber}
                onChange={(e) => setVerseNumber(e.target.value)}
                className="w-24"
                disabled={!surahNumber}
              />
              <Button
                type="button"
                size="sm"
                disabled={!surahNumber || !verseNumber || upsertMutation.isPending}
                onClick={() => upsertMutation.mutate()}
              >
                {t("ramadan.khatmUpdateButton")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
