import * as React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BookMarked, Copy, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { quranApi } from "@/features/quran/api";
import { translatedSurahName } from "@/features/quran/surah-names";
import { tafsirApi } from "@/features/tafsir/api";
import { isRtlLanguage } from "@/lib/rtl";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function SurahDetailPage() {
  const { surah: surahParam } = useParams<{ surah: string }>();
  const surahNumber = Number(surahParam);
  const { t, i18n } = useTranslation();
  const [copiedVerse, setCopiedVerse] = React.useState<number | null>(null);
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [tafsirOpen, setTafsirOpen] = React.useState(false);
  const [selectedTafsirId, setSelectedTafsirId] = React.useState<string | null>(null);

  const { data: surah, isLoading, isError } = useQuery({
    queryKey: ["quran", "surah", surahNumber],
    queryFn: () => quranApi.getSurah(surahNumber),
    enabled: Number.isInteger(surahNumber) && surahNumber > 0,
  });
  useDocumentTitle(surah?.nameTransliterated);

  const { data: translations } = useQuery({
    queryKey: ["quran", "translations"],
    queryFn: quranApi.listTranslations,
  });

  // La traduction affichee suit automatiquement la langue de l'interface -
  // pas de selecteur local (voir Header : selecteur de langue global).
  const activeTranslation = translations?.find((t2) => t2.language === i18n.language);

  const { data: translationRows, isFetching: isTranslationLoading } = useQuery({
    queryKey: ["quran", "surah-translation", surahNumber, activeTranslation?.id],
    queryFn: () => quranApi.getSurahTranslation(surahNumber, activeTranslation!.id),
    enabled: Number.isInteger(surahNumber) && Boolean(activeTranslation) && showTranslation,
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
    enabled: Number.isInteger(surahNumber) && Boolean(selectedTafsirId) && tafsirOpen,
  });

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
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/quran">
            <ArrowLeft className="h-4 w-4" />
            {t("quran.backToList")}
          </Link>
        </Button>

        <div className="flex items-center gap-2">
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

          <Sheet open={tafsirOpen} onOpenChange={setTafsirOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <BookMarked className="h-4 w-4" />
                {t("quran.tafsirTitle")}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>{t("quran.tafsirTitle")}</SheetTitle>
                {tafsirWorks && tafsirWorks.length > 0 && (
                  <Select value={selectedTafsirId ?? undefined} onValueChange={setSelectedTafsirId}>
                    <SelectTrigger className="w-full">
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
              </SheetHeader>

              <div className="-mx-6 flex-1 overflow-y-auto px-6">
                {isTafsirLoading && !tafsirRows?.length && (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                )}
                {tafsirRows?.length === 0 && !isTafsirLoading && (
                  <p className="text-sm text-muted-foreground">{t("quran.noTafsir")}</p>
                )}
                <div className="space-y-4 pb-6">
                  {tafsirRows?.map((row) => (
                    <div key={row.numberInSurah}>
                      <Badge variant="secondary" className="mb-1.5">
                        {row.numberInSurah}
                      </Badge>
                      <p
                        dir={selectedTafsirWork && isRtlLanguage(selectedTafsirWork.language) ? "rtl" : "ltr"}
                        className="text-sm leading-relaxed"
                      >
                        {row.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
          </header>

          <div className="space-y-1 rounded-lg border bg-reading text-reading-foreground">
            {surah.verses.map((verse, i) => (
              <React.Fragment key={verse.id}>
                {i > 0 && <Separator className="opacity-50" />}
                <div className="flex items-start gap-4 p-5">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                    {verse.numberInSurah}
                  </span>
                  <div className="flex-1">
                    <p dir="rtl" lang="ar" className="font-arabic text-2xl leading-loose">
                      {verse.textArabic}
                    </p>

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

                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(verse.numberInSurah, verse.textArabic)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copiedVerse === verse.numberInSurah ? t("quran.copied") : t("quran.copy")}
                      </Button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
