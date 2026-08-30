import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ContentUserActions } from "@/components/shared/ContentUserActions";
import { hadithApi } from "@/features/hadith/api";
import { useStreakPing } from "@/features/streaks/useStreak";
import { useGamificationEvent } from "@/features/gamification/useGamification";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function HadithDetailPage() {
  const { collection: slug, number } = useParams<{ collection: string; number: string }>();
  const { t } = useTranslation();
  useStreakPing();
  const track = useGamificationEvent();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hadith", "detail", slug, number],
    queryFn: () => hadithApi.getHadith(slug!, number!),
    enabled: Boolean(slug) && Boolean(number),
  });
  useEffect(() => {
    if (data) track("hadith_read");
  }, [data, track]);
  useDocumentTitle(data ? `${data.collection.name} ${data.hadith.number}` : undefined);

  if (!slug || !number) return <Navigate to="/hadith" replace />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t("hadith.title"), href: "/hadith" },
          ...(data ? [{ label: data.collection.name, href: `/hadith/${slug}` }] : []),
          ...(data?.book ? [{ label: data.book.title, href: `/hadith/${slug}/book/${data.book.number}` }] : []),
          ...(data ? [{ label: `${t("hadith.hadithLabel")} ${data.hadith.number}` }] : []),
        ]}
      />

      {isError && <p className="text-sm text-destructive">{t("hadith.errorHadith")}</p>}
      {isLoading && <Skeleton className="h-64 w-full" />}

      {data && (
        <>
          <p className="mb-1 text-sm text-muted-foreground">
            {data.collection.name}
            {data.book && ` - ${data.book.title}`}
          </p>
          <h1 className="mb-4 text-lg font-semibold">
            {t("hadith.hadithLabel")} {data.hadith.number}
          </h1>

          {data.hadith.textArabic && (
            <p
              dir="rtl"
              lang="ar"
              className="mb-4 rounded-lg border bg-reading p-5 font-arabic text-xl leading-loose text-reading-foreground"
            >
              {data.hadith.textArabic}
            </p>
          )}

          <p className="rounded-lg border p-5 text-sm leading-relaxed">{data.hadith.textTranslation}</p>

          <ContentUserActions targetType="hadith" targetId={data.hadith.id} className="mt-4" />

          {data.translations.length > 0 && (
            <div className="mt-6 space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("hadith.otherTranslations")}
              </h2>
              {data.translations.map((t2) => (
                <div key={t2.translationId} className="rounded-lg border p-4">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">{t2.translationName}</p>
                  <p className="text-sm leading-relaxed">{t2.text}</p>
                </div>
              ))}
            </div>
          )}

          {data.grades.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("hadith.authenticity")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.grades.map((g) => (
                  <Badge key={g.graderName} variant="secondary">
                    {g.graderName} : {g.grade}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
