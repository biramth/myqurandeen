import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { quranApi } from "@/features/quran/api";

export function VersePage() {
  const { surah: surahParam, verse: verseParam } = useParams<{ surah: string; verse: string }>();
  const surahNumber = Number(surahParam);
  const verseNumber = Number(verseParam);
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quran", "verse", surahNumber, verseNumber],
    queryFn: () => quranApi.getVerse(surahNumber, verseNumber),
    enabled: Number.isInteger(surahNumber) && Number.isInteger(verseNumber),
  });

  if (!Number.isInteger(surahNumber) || !Number.isInteger(verseNumber)) {
    return <Navigate to="/quran" replace />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to={`/quran/${surahNumber}`}>
          <ArrowLeft className="h-4 w-4" />
          {t("quran.backToSurah")}
        </Link>
      </Button>

      {isError && <p className="text-sm text-destructive">{t("quran.errorVerse")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <p className="mb-2 text-sm text-muted-foreground">
            {data.surah.nameTransliterated} - {t("quran.verses")} {data.verse.numberInSurah}
          </p>
          <div className="rounded-lg border bg-reading p-6 text-reading-foreground">
            <p dir="rtl" lang="ar" className="font-arabic text-3xl leading-loose">
              {data.verse.textArabic}
            </p>
          </div>

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
