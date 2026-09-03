import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BookMarked, Copy, Languages, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArabicFontSizeControl } from "@/components/shared/ArabicFontSizeControl";
import { arabicFontSizeStyle } from "@/components/shared/arabic-font-size-provider";
import { quranApi } from "@/features/quran/api";
import { TajweedControl } from "@/features/quran/TajweedControl";
import { TajweedText } from "@/features/quran/TajweedText";
import { useTajweedToggle } from "@/features/quran/useTajweedToggle";
import { AudioRecitation } from "@/features/quran/AudioRecitation";
import { translatedSurahName } from "@/features/quran/surah-names";
import { splitBasmala } from "@/features/quran/basmala";
import { tafsirApi } from "@/features/tafsir/api";
import { QuickReminderButton } from "@/features/reminders/QuickReminderButton";
import { useStreakPing } from "@/features/streaks/useStreak";
import { useGamificationEvent } from "@/features/gamification/useGamification";
import { useOffline } from "@/features/offline/OfflineContext";
import { getOfflineSurahDetail, getOfflineSurahTranslation, getOfflineDownloadedTranslationIds } from "@/features/quran/offline-quran";
import { isRtlLanguage } from "@/lib/rtl";
import { cn } from "@/lib/utils";
import { PageMeta } from "@/components/shared/PageMeta";

export function SurahDetailPage() {
  const { surah: surahParam } = useParams<{ surah: string }>();
  const surahNumber = Number(surahParam);
  const { t, i18n } = useTranslation();
  const [tajweedEnabled] = useTajweedToggle();
  useStreakPing();
  const track = useGamificationEvent();
  const { offline } = useOffline();
  const [copiedVerse, setCopiedVerse] = React.useState<number | null>(null);
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [selectedTafsirId, setSelectedTafsirId] = React.useState<string | null>(null);
  // Verset lu par le lecteur audio (lecture continue) + signal pour lancer
  // la lecture quand on choisit un verset dans la liste.
  const [activeVerse, setActiveVerse] = React.useState(1);
  const [autoPlaySignal, setAutoPlaySignal] = React.useState(0);
  // Versets dont le tafsir est deplie - affichage direct sous le verset
  // plutot que dans un panneau lateral (Sheet) separe du texte.
  const [expandedTafsirVerses, setExpandedTafsirVerses] = React.useState<Set<number>>(new Set());
  const toggleTafsir = (numberInSurah: number) =>
    setExpandedTafsirVerses((prev) => {
      const next = new Set(prev);
      if (next.has(numberInSurah)) next.delete(numberInSurah);
      else next.add(numberInSurah);
      return next;
    });

  const { data: surah, isLoading, isError } = useQuery({
    queryKey: ["quran", "surah", surahNumber, offline],
    queryFn: offline ? () => getOfflineSurahDetail(surahNumber) : () => quranApi.getSurah(surahNumber),
    enabled: Number.isInteger(surahNumber) && surahNumber > 0,
    networkMode: offline ? "always" : undefined,
  });
  React.useEffect(() => {
    if (surah) track("verse_read");
  }, [surah, track]);

  const { data: translations } = useQuery({
    queryKey: ["quran", "translations"],
    queryFn: quranApi.listTranslations,
  });

  const [offlineTranslationIds, setOfflineTranslationIds] = React.useState<string[]>([]);
  React.useEffect(() => {
    if (!offline) return;
    getOfflineDownloadedTranslationIds()
      .then(setOfflineTranslationIds)
      .catch(() => setOfflineTranslationIds([]));
  }, [offline]);

  // La traduction affichee suit automatiquement la langue de l'interface -
  // pas de selecteur local (voir Header : selecteur de langue global).
  // Hors-ligne, on reutilise la langue stockee si elle fait partie des
  // traductions telechargees, sinon la premiere traduction hors-ligne.
  const activeTranslation = React.useMemo(() => {
    if (!offline) {
      return translations?.find((t2) => t2.language === i18n.language);
    }
    if (offlineTranslationIds.length === 0) return undefined;
    const byLang = translations?.find((t2) => t2.language === i18n.language);
    if (byLang && offlineTranslationIds.includes(byLang.id)) return byLang;
    const stored = translations?.find((t2) => offlineTranslationIds.includes(t2.id));
    return stored ?? translations?.[0];
  }, [offline, translations, offlineTranslationIds, i18n.language]);

  const { data: translationRows, isFetching: isTranslationLoading } = useQuery({
    queryKey: ["quran", "surah-translation", surahNumber, activeTranslation?.id, offline],
    queryFn: () => {
      if (offline && activeTranslation) {
        return getOfflineSurahTranslation(surahNumber, activeTranslation.id);
      }
      return quranApi.getSurahTranslation(surahNumber, activeTranslation!.id);
    },
    enabled: Number.isInteger(surahNumber) && Boolean(activeTranslation) && showTranslation,
    networkMode: offline ? "always" : undefined,
  });

  const translationByVerseNumber = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const row of translationRows ?? []) {
      map.set(row.numberInSurah, row.text);
    }
    return map;
  }, [translationRows]);

  const translationIsRtl = isRtlLanguage(i18n.language);

  const { data: tafsirWorks } = useQuery({
    queryKey: ["tafsir", "works"],
    queryFn: tafsirApi.listWorks,
  });

  React.useEffect(() => {
    if (!tafsirWorks || tafsirWorks.length === 0 || selectedTafsirId) return;
    const preferred = tafsirWorks.find((w) => w.language === i18n.language) ?? tafsirWorks[0];
    setSelectedTafsirId(preferred.id);
  }, [tafsirWorks, i18n.language, selectedTafsirId]);

  const selectedTafsirWork = tafsirWorks?.find((w) => w.id === selectedTafsirId);

  const { data: tafsirRows, isFetching: isTafsirLoading } = useQuery({
    queryKey: ["tafsir", "surah", surahNumber, selectedTafsirId],
    queryFn: () => tafsirApi.getSurahTafsir(surahNumber, selectedTafsirId!),
    enabled: Number.isInteger(surahNumber) && Boolean(selectedTafsirId),
  });

  const tafsirByVerseNumber = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const row of tafsirRows ?? []) {
      map.set(row.numberInSurah, row.content);
    }
    return map;
  }, [tafsirRows]);

  if (!surahParam || !Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return <Navigate to="/quran" replace />;
  }

  const handleCopy = async (numberInSurah: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVerse(numberInSurah);
      setTimeout(() => setCopiedVerse((v) => (v === numberInSurah ? null : v)), 1500);
    } catch {
      // Le presse-papiers peut etre indisponible (permissions navigateur) - echec silencieux.
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageMeta
        title={surah?.nameTransliterated}
        description={surah ? translatedSurahName(t, surah.number, surah.nameTranslated) : undefined}
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2 self-start">
          <Link to="/quran">
            <ArrowLeft className="h-4 w-4" />
            {t("quran.backToList")}
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <ArabicFontSizeControl />
          <TajweedControl />

          {activeTranslation && (
            <Button
              variant={showTranslation ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowTranslation((v) => !v)}
            >
              <Languages className="h-4 w-4" />
              {showTranslation ? t("common.hideTranslation") : t("common.showTranslation")}
            </Button>
          )}

          {tafsirWorks && tafsirWorks.length > 0 && (
            <Select value={selectedTafsirId ?? undefined} onValueChange={setSelectedTafsirId}>
              <SelectTrigger className="h-9 w-[calc(100vw-2rem)] max-w-xs text-xs sm:w-[16rem] sm:text-sm">
                <BookMarked className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tafsirWorks.map((work) => (
                  <SelectItem key={work.id} value={work.id}>
                    {work.title}
                    {work.authorName ? ` - ${work.authorName}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("quran.errorSurah")}</p>}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {surah && (
        <>
          <header className="mb-8 text-center">
            <p dir="rtl" className="font-arabic text-3xl">
              {surah.nameArabic}
            </p>
            <h1 className="mt-2 text-xl font-semibold">{surah.nameTransliterated}</h1>
            <p className="text-sm text-muted-foreground">
              {translatedSurahName(t, surah.number, surah.nameTranslated)}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Badge variant="secondary">
                {surah.versesCount} {t("quran.verses")}
              </Badge>
              {surah.revelationPlace && (
                <Badge variant="secondary">
                  {surah.revelationPlace === "mecca" ? t("quran.mecca") : t("quran.medina")}
                </Badge>
              )}
            </div>
            <div className="mt-2 flex justify-center">
              <QuickReminderButton targetType="surah" surahNumber={surah.number} />
            </div>
          </header>

          <AudioRecitation
            surahNumber={surah.number}
            verseNumber={activeVerse}
            totalVerses={surah.versesCount}
            onNavigate={setActiveVerse}
            autoPlaySignal={autoPlaySignal}
            className="mb-6"
          />

          <div className="space-y-1 rounded-lg border bg-reading text-reading-foreground">
            {surah.verses.map((verse, i) => {
              const { basmala, text: verseArabic } = splitBasmala(surah.number, verse.numberInSurah, verse.textArabic);
              return (
              <React.Fragment key={verse.id}>
                {i > 0 && <Separator className="opacity-50" />}
                {basmala && (
                  <p
                    dir="rtl"
                    lang="ar"
                    className="border-b px-5 py-4 text-center font-arabic leading-loose text-primary"
                    style={arabicFontSizeStyle(1.5)}
                  >
                    {basmala}
                  </p>
                )}
                <div
                  className={cn(
                    "flex items-start gap-4 p-5",
                    activeVerse === verse.numberInSurah && "bg-primary/5",
                  )}
                >
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                    {verse.numberInSurah}
                  </span>
                  <div className="flex-1">
                    <p dir="rtl" lang="ar" className="font-arabic leading-loose" style={arabicFontSizeStyle(1.5)}>
                      {tajweedEnabled ? <TajweedText text={verseArabic} /> : verseArabic}
                    </p>

                    {verse.textTransliterated && (
                      <p className="mt-1.5 text-sm italic leading-relaxed text-muted-foreground">
                        {verse.textTransliterated}
                      </p>
                    )}

                    {showTranslation && activeTranslation && (
                      <p
                        dir={translationIsRtl ? "rtl" : "ltr"}
                        className="mt-3 border-t pt-3 text-sm leading-relaxed text-muted-foreground"
                      >
                        {isTranslationLoading && !translationByVerseNumber.size
                          ? "..."
                          : (translationByVerseNumber.get(verse.numberInSurah) ?? "")}
                      </p>
                    )}

                    {expandedTafsirVerses.has(verse.numberInSurah) && selectedTafsirId && (
                      <div className="mt-3 rounded-md border-t bg-accent/30 pt-3">
                        {isTafsirLoading && !tafsirRows?.length ? (
                          <Skeleton className="h-12 w-full" />
                        ) : tafsirByVerseNumber.has(verse.numberInSurah) ? (
                          <>
                            {selectedTafsirWork && (
                              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {selectedTafsirWork.title}
                                {selectedTafsirWork.authorName ? ` - ${selectedTafsirWork.authorName}` : ""}
                              </p>
                            )}
                            <p
                              dir={selectedTafsirWork && isRtlLanguage(selectedTafsirWork.language) ? "rtl" : "ltr"}
                              className="text-sm leading-relaxed"
                            >
                              {tafsirByVerseNumber.get(verse.numberInSurah)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t("quran.noTafsir")}</p>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        variant={activeVerse === verse.numberInSurah ? "secondary" : "ghost"}
                        size="sm"
                        aria-label={t("quran.audioListen", { verse: verse.numberInSurah })}
                        onClick={() => {
                          setActiveVerse(verse.numberInSurah);
                          setAutoPlaySignal((signal) => signal + 1);
                        }}
                      >
                        <Play className="h-3.5 w-3.5" />
                        {t("quran.audioListen")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(verse.numberInSurah, verseArabic)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedVerse === verse.numberInSurah ? t("quran.copied") : t("quran.copy")}
                      </Button>
                      {selectedTafsirId && (
                        <Button
                          variant={expandedTafsirVerses.has(verse.numberInSurah) ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => toggleTafsir(verse.numberInSurah)}
                        >
                          <BookMarked className="h-3.5 w-3.5" />
                          {t("quran.tafsirTitle")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
