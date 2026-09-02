import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { quranApi } from "@/features/quran/api";
import { translatedSurahName } from "@/features/quran/surah-names";
import { getOfflineSurahs } from "@/features/quran/offline-quran";
import { useOffline } from "@/features/offline/OfflineContext";
import { PageMeta } from "@/components/shared/PageMeta";

export function SurahListPage() {
  const { t } = useTranslation();
  const { offline } = useOffline();
  const { data: surahs, isLoading, isError } = useQuery({
    queryKey: ["quran", "surahs"],
    queryFn: offline ? getOfflineSurahs : quranApi.listSurahs,
    networkMode: offline ? "always" : undefined,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <PageMeta title={t("quran.title")} description={t("quran.subtitle")} />
      <div className="mb-8 flex items-center gap-3">
        <BookOpen className="h-7 w-7 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("quran.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("quran.subtitle")}</p>
        </div>
      </div>

      {isError && <p className="text-sm text-destructive">{t("quran.errorList")}</p>}

      {isLoading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {surahs && surahs.length === 0 && <p className="text-sm text-muted-foreground">{t("quran.emptyList")}</p>}

      {surahs && surahs.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {surahs.map((surah) => (
            <Link key={surah.id} to={`/quran/${surah.number}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
                      {surah.number}
                    </span>
                    <div>
                      <p className="font-medium">{surah.nameTransliterated}</p>
                      <p className="text-sm text-muted-foreground">
                        {translatedSurahName(t, surah.number, surah.nameTranslated)} - {surah.versesCount}{" "}
                        {t("quran.verses")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span dir="rtl" className="font-arabic text-lg">
                      {surah.nameArabic}
                    </span>
                    {surah.revelationPlace && (
                      <Badge variant="secondary" className="text-[10px]">
                        {surah.revelationPlace === "mecca" ? t("quran.mecca") : t("quran.medina")}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
