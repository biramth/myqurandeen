import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentUserActions } from "@/components/shared/ContentUserActions";
import { quranApi } from "@/features/quran/api";
import { AudioRecitation } from "@/features/quran/AudioRecitation";
import { splitBasmala } from "@/features/quran/basmala";
import { getOfflineVerse } from "@/features/quran/offline-quran";
import { useOffline } from "@/features/offline/OfflineContext";
import { useStreakPing } from "@/features/streaks/useStreak";
import { useGamificationEvent } from "@/features/gamification/useGamification";
import { PageMeta, SITE_URL, buildOgImage, withShareUtm } from "@/components/shared/PageMeta";

export function VersePage() {
  const { surah: surahParam, verse: verseParam } = useParams<{ surah: string; verse: string }>();
  const surahNumber = Number(surahParam);
  const verseNumber = Number(verseParam);
  const { t } = useTranslation();
  useStreakPing();
  const track = useGamificationEvent();
  const { offline } = useOffline();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quran", "verse", surahNumber, verseNumber, offline],
    queryFn: async () => {
      if (offline) {
        const verse = await getOfflineVerse(surahNumber, verseNumber);
        if (!verse) throw new Error("offline.missing");
        return {
          surah: { number: surahNumber, nameArabic: "", nameTransliterated: "" },
          verse: {
            id: verse.id,
            numberInSurah: verse.numberInSurah,
            textArabic: verse.textArabic,
            textTransliterated: verse.textTransliterated,
          },
          translations: [],
        };
      }
      return quranApi.getVerse(surahNumber, verseNumber);
    },
    enabled: Number.isInteger(surahNumber) && Number.isInteger(verseNumber),
    networkMode: offline ? "always" : undefined,
  });
  useEffect(() => {
    if (data) track("verse_read");
  }, [data, track]);

  if (!Number.isInteger(surahNumber) || !Number.isInteger(verseNumber)) {
    return <Navigate to="/quran" replace />;
  }

  // Le verset 1 de chaque sourate (sauf Al-Fatiha et At-Tawba) porte la
  // basmala concatenee dans son texte source - on la separe pour l'affichage.
  const { basmala, text: verseArabic } = data
    ? splitBasmala(data.surah.number, data.verse.numberInSurah, data.verse.textArabic)
    : { basmala: null, text: "" };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageMeta
        title={data ? `${data.surah.nameTransliterated} ${data.verse.numberInSurah}` : undefined}
        description={data?.translations[0]?.text}
        image={
          data
            ? buildOgImage({
                title: `${data.surah.nameTransliterated} ${data.verse.numberInSurah}`,
                arabicText: verseArabic,
                transliteration: data.verse.textTransliterated ?? undefined,
                body: data.translations[0]?.text,
                source: `${data.surah.nameTransliterated} — ${t("quran.verses")} ${data.verse.numberInSurah}`,
              })
            : undefined
        }
      />
      <Breadcrumbs
        items={[
          { label: t("quran.title"), href: "/quran" },
          ...(data ? [{ label: data.surah.nameTransliterated, href: `/quran/${surahNumber}` }] : []),
          ...(data ? [{ label: `${t("quran.verses")} ${data.verse.numberInSurah}` }] : []),
        ]}
      />

      {isError && <p className="text-sm text-destructive">{t("quran.errorVerse")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <p className="mb-2 text-sm text-muted-foreground">
            {data.surah.nameTransliterated} - {t("quran.verses")} {data.verse.numberInSurah}
          </p>
          <div className="rounded-lg border bg-reading p-6 text-reading-foreground">
            {basmala && (
              <p dir="rtl" lang="ar" className="mb-4 border-b pb-4 text-center font-arabic text-2xl leading-loose text-primary">
                {basmala}
              </p>
            )}
            <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-loose">
              {verseArabic}
            </p>
            {data.verse.textTransliterated && (
              <p className="mt-3 text-sm italic leading-relaxed text-muted-foreground">{data.verse.textTransliterated}</p>
            )}
          </div>

          <AudioRecitation surahNumber={surahNumber} verseNumber={verseNumber} className="mt-4" />

          <ContentUserActions
            targetType="verse"
            targetId={data.verse.id}
            className="mt-4"
            shareContent={{
              title: `${data.surah.nameTransliterated} ${data.verse.numberInSurah}`,
              arabicText: data.verse.textArabic,
              transliteration: data.verse.textTransliterated ?? undefined,
              body: data.translations[0]?.text,
              source: `${data.surah.nameTransliterated} — ${t("quran.verses")} ${data.verse.numberInSurah}`,
              url: withShareUtm(`${SITE_URL}/quran/${surahNumber}/${verseNumber}`, "content"),
            }}
          />

          <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("quran.comparisonTitle")}
          </h2>
          {data.translations.length === 0 && <p className="text-sm text-muted-foreground">{t("quran.noTranslation")}</p>}
          <div className="space-y-3">
            {data.translations.map((translation) => (
              <Card key={translation.translationId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {translation.translationName}
                    {translation.translatorName ? ` - ${translation.translatorName}` : ""}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm leading-relaxed">{translation.text}</CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
